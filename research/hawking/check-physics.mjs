// Reproducible research calculations, not a gravitational-field solver.
// Sources and the limits of the ideal photon model: docs/HAWKING_INVESTIGACION.md.
import assert from 'node:assert/strict'

const c = 299792458 // m/s, exact SI
const G = 6.6743e-11 // m^3 kg^-1 s^-2, CODATA 2022; uncertainty 0.00015e-11
const h = 6.62607015e-34 // J s, exact SI
const k = 1.380649e-23 // J/K, exact SI
const hbar = h / (2 * Math.PI)
const solarGM = 1.3271244e20 // m^3/s^2, nominal IAU 2015 conversion parameter
const solarMass = solarGM / G // kg; derived, not an exact solar mass in kg
const year = 365.25 * 86400 // Julian year, s
const cmbTemperature = 2.7255 // K; illustrative present CMB reference
const sigma = (2 * Math.PI ** 5 * k ** 4) / (15 * h ** 3 * c ** 2)
const planckLengthSquared = (hbar * G) / c ** 3

function blackHole(massKg) {
  if (!Number.isFinite(massKg) || massKg <= 0)
    throw new RangeError('Mass must be finite and positive')
  const radiusM = (2 * G * massKg) / c ** 2
  const areaM2 = 4 * Math.PI * radiusM ** 2
  const temperatureK = (hbar * c ** 3) / (8 * Math.PI * G * massKg * k)
  const entropyOverK = areaM2 / (4 * planckLengthSquared)
  // Deliberately idealized: photons, horizon area, no greybody factors or other species.
  const idealPhotonPowerW = sigma * areaM2 * temperatureK ** 4
  const idealVacuumLifetimeS = (massKg * c ** 2) / (3 * idealPhotonPowerW)
  const values = {
    massKg,
    radiusM,
    areaM2,
    temperatureK,
    entropyOverK,
    idealPhotonPowerW,
    idealVacuumLifetimeS,
  }
  if (!Object.values(values).every(Number.isFinite))
    throw new RangeError('Result exceeds numerical range')
  return values
}

function close(actual, expected, relative = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) <= Math.abs(expected) * relative,
    `${actual} differs from ${expected} by more than ${relative}`,
  )
}

// Independent dimensional/thermodynamic checks and known reference values.
let checks = 0
function check(name, run) {
  run()
  checks++
  if (!process.argv.includes('--json')) console.log(`✓ ${name}`)
}

check('SI Stefan-Boltzmann constant agrees with NIST', () => close(sigma, 5.670374419e-8, 5e-10))
check('Nominal solar-mass Schwarzschild radius and temperature', () => {
  const bh = blackHole(solarMass)
  close(bh.radiusM, 2953.250076, 1e-9)
  close(bh.temperatureK, 6.17e-8, 1e-4) // reference rounded to three significant figures
})
check('Mass scaling of radius, temperature, area, entropy, power and time', () => {
  for (const mass of [1e9, 1e12, 1e22, solarMass, 1e39]) {
    const one = blackHole(mass),
      two = blackHole(2 * mass)
    close(two.radiusM / one.radiusM, 2)
    close(two.temperatureK / one.temperatureK, 0.5)
    close(two.areaM2 / one.areaM2, 4)
    close(two.entropyOverK / one.entropyOverK, 4)
    close(two.idealPhotonPowerW / one.idealPhotonPowerW, 0.25)
    close(two.idealVacuumLifetimeS / one.idealVacuumLifetimeS, 8)
  }
})
check('First law T dS = c² dM using an independent finite derivative', () => {
  const mass = solarMass,
    step = mass * 1e-5
  const dSdM =
    (k * (blackHole(mass + step).entropyOverK - blackHole(mass - step).entropyOverK)) / (2 * step)
  close(blackHole(mass).temperatureK * dSdM, c ** 2, 1e-8)
})
check('Stefan-Boltzmann derivation agrees with the 15360π coefficient', () => {
  const mass = 1e12
  close(blackHole(mass).idealPhotonPowerW, (hbar * c ** 6) / (15360 * Math.PI * G ** 2 * mass ** 2))
  close(
    blackHole(mass).idealVacuumLifetimeS,
    (5120 * Math.PI * G ** 2 * mass ** 3) / (hbar * c ** 4),
  )
})
check('Integrated photon spectral energy distribution is normalized', () => {
  // Simpson quadrature of x³/(exp(x)−1), independently compared with π⁴/15.
  const n = 20000,
    dx = 80 / n
  const f = (x) => (x === 0 ? 0 : x ** 3 / Math.expm1(x))
  let sum = f(0) + f(80)
  for (let i = 1; i < n; i++) sum += (i % 2 ? 4 : 2) * f(i * dx)
  close((((sum * dx) / 3) * 15) / Math.PI ** 4, 1, 1e-9)
})

// Maximum of dP/dlnE: x = 4(1−exp(−x)). This is NOT the dP/dE maximum.
let low = 3,
  high = 5
for (let i = 0; i < 100; i++) {
  const middle = (low + high) / 2
  if (4 * -Math.expm1(-middle) - middle > 0) low = middle
  else high = middle
}
const logEnergyPeak = (low + high) / 2
check('Spectral peak has the correct Jacobian for a logarithmic energy axis', () => {
  close(logEnergyPeak, 3.9206903948728864)
  const f = (x) => x ** 4 / Math.expm1(x)
  assert.ok(f(logEnergyPeak) > f(logEnergyPeak * 0.99))
  assert.ok(f(logEnergyPeak) > f(logEnergyPeak * 1.01))
})
check('Analytic vacuum evaporation conserves energy and has negative heat capacity', () => {
  const initial = blackHole(1e12)
  const t = initial.idealVacuumLifetimeS * 0.5
  const remaining = blackHole(initial.massKg * Math.cbrt(1 - t / initial.idealVacuumLifetimeS))
  close(remaining.idealVacuumLifetimeS, initial.idealVacuumLifetimeS - t)
  assert.ok(remaining.temperatureK > initial.temperatureK)
  assert.ok(remaining.idealPhotonPowerW > initial.idealPhotonPowerW)
  const energyLost = (initial.massKg - remaining.massKg) * c ** 2
  const alpha = (initial.idealPhotonPowerW * initial.massKg ** 2) / c ** 2
  // Independent midpoint integral of P(t) over the first half lifetime.
  const steps = 10000,
    dt = t / steps
  let radiated = 0
  for (let i = 0; i < steps; i++) {
    const mass = Math.cbrt(initial.massKg ** 3 - 3 * alpha * (i + 0.5) * dt)
    radiated += ((alpha * c ** 2) / mass ** 2) * dt
  }
  close(radiated, energyLost, 1e-8)
})

const cmbBalanceMassKg = (hbar * c ** 3) / (8 * Math.PI * G * k * cmbTemperature)
check('Thermal-bath comparison has the correct sign and balance temperature', () => {
  close(blackHole(cmbBalanceMassKg).temperatureK, cmbTemperature)
  assert.ok(blackHole(cmbBalanceMassKg * 2).temperatureK < cmbTemperature)
  assert.ok(blackHole(cmbBalanceMassKg / 2).temperatureK > cmbTemperature)
})
check('Reject invalid masses instead of emitting NaNs', () => {
  for (const mass of [0, -1, NaN, Infinity, -Infinity, 1e-300, 1e300])
    assert.throws(() => blackHole(mass), RangeError)
})

const cases = [
  { label: 'Una masa solar nominal', mass: solarMass },
  { label: 'Diez masas solares nominales', mass: solarMass * 10 },
  { label: 'Hipotético 10^12 kg', mass: 1e12 },
  { label: 'Balance con CMB 2.7255 K', mass: cmbBalanceMassKg },
].map(({ label, mass }) => {
  const result = blackHole(mass)
  return { label, ...result, idealVacuumLifetimeYears: result.idealVacuumLifetimeS / year }
})
const result = {
  description:
    'Theoretical Schwarzschild values; power and lifetime use the ideal photon horizon-area model, not full Hawking emission.',
  constants: { c, G, h, hbar, k, sigma, solarGM, solarMass, year, cmbTemperature },
  checks,
  logEnergyPeak,
  cmbBalanceMassKg,
  cases,
}
if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2))
else {
  console.table(
    cases.map(({ label, radiusM, temperatureK, idealPhotonPowerW, idealVacuumLifetimeYears }) => ({
      case: label,
      radius_m: radiusM.toExponential(6),
      temperature_K: temperatureK.toExponential(6),
      ideal_photon_power_W: idealPhotonPowerW.toExponential(6),
      ideal_vacuum_lifetime_years: idealVacuumLifetimeYears.toExponential(6),
    })),
  )
  console.log(`${checks} research checks passed; this is not an observational validation.`)
}
