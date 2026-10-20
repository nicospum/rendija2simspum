// SI, Schwarzschild, observer at infinity. See docs/HAWKING_INVESTIGACION.md.
export const C = 299792458
export const G = 6.6743e-11
export const HBAR = 6.62607015e-34 / (2 * Math.PI)
export const K = 1.380649e-23
export const YEAR = 31557600
export const SOLAR_MASS = 1.3271244e20 / G // IAU nominal GM / measured G
export const CMB = 2.7255
export const MIN_MASS = 1e9
export const MAX_MASS = 1e40
export const MAX_AGE = 0.95 // Do not extrapolate to the unknown end of evaporation.
export const LOG_PEAK = 3.920690394872886
export type Environment = 'vacuum' | 'cmb'

export function blackHole(massKg: number, environment: Environment = 'vacuum') {
  if (!Number.isFinite(massKg) || massKg <= 0)
    throw new RangeError('La masa debe ser positiva y finita')
  const radiusM = (2 * G * massKg) / C ** 2
  const areaM2 = 4 * Math.PI * radiusM ** 2
  const temperatureK = (HBAR * C ** 3) / (8 * Math.PI * G * massKg * K)
  const entropyOverK = (areaM2 * C ** 3) / (4 * HBAR * G)
  // Horizon-area blackbody, photons only. Not the full greybody/species spectrum.
  const powerW = (HBAR * C ** 6) / (15360 * Math.PI * G ** 2 * massKg ** 2)
  const lifetimeS = (massKg * C ** 2) / (3 * powerW)
  const bathK = environment === 'cmb' ? CMB : 0
  const absorbedW = powerW * (bathK / temperatureK) ** 4
  const netW = powerW - absorbedW // positive = mass loss; negative = gain
  const result = {
    massKg,
    radiusM,
    areaM2,
    temperatureK,
    entropyOverK,
    powerW,
    lifetimeS,
    bathK,
    absorbedW,
    netW,
  }
  if (!Object.values(result).every(Number.isFinite))
    throw new RangeError('Resultado fuera del rango numérico')
  return result
}

export const BALANCE_MASS = (HBAR * C ** 3) / (8 * Math.PI * G * K * CMB)

export function evaporatedMass(initialMass: number, age: number) {
  blackHole(initialMass)
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE)
    throw new RangeError('Tiempo fuera del intervalo semiclásico mostrado')
  return initialMass * Math.cbrt(1 - age)
}

// dP/dlnE divided by P: a density per natural logarithm of energy.
export function spectrumFraction(energyJ: number, temperatureK: number) {
  if (
    !Number.isFinite(energyJ) ||
    energyJ < 0 ||
    !Number.isFinite(temperatureK) ||
    temperatureK <= 0
  )
    throw new RangeError('Energía o temperatura no válida')
  const x = energyJ / (K * temperatureK)
  if (x === 0 || x > 700) return 0
  return ((15 / Math.PI ** 4) * x ** 4) / Math.expm1(x)
}

export function scientific(value: number, unit = '') {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return `0${unit ? ` ${unit}` : ''}`
  const [mantissa, exponent] = value.toExponential(2).split('e')
  const power = Number(exponent)
  const number =
    power >= -2 && power <= 3
      ? Number(value.toPrecision(3)).toLocaleString('es-AR', { maximumFractionDigits: 5 })
      : `${mantissa.replace('.', ',')} × 10${String(power).replace(/[-\d]/g, (c) => '⁻⁰¹²³⁴⁵⁶⁷⁸⁹'['-0123456789'.indexOf(c)])}`
  return `${number}${unit ? ` ${unit}` : ''}`
}
