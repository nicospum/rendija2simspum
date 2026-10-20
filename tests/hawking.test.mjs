import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  blackHole,
  evaporatedMass,
  spectrumFraction,
  BALANCE_MASS,
  K,
  C,
  G,
  HBAR,
  SOLAR_MASS,
  MAX_AGE,
  MIN_MASS,
  MAX_MASS,
  LOG_PEAK,
  scientific,
} from '../src/hawking/physics.ts'
import { initialState, reducer, reading, lessonStatus, LESSONS } from '../src/hawking/learning.ts'

function close(actual, expected, tolerance = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) <= Math.abs(expected) * tolerance,
    `${actual} != ${expected}`,
  )
}
test('production calculations agree with independently researched numerical references', () => {
  const references = JSON.parse(
    readFileSync(new URL('../research/hawking/reference-results.json', import.meta.url)),
  )
  for (const ref of references.cases) {
    const current = blackHole(ref.massKg)
    for (const field of ['radiusM', 'areaM2', 'temperatureK', 'entropyOverK'])
      close(current[field], ref[field])
    close(current.powerW, ref.idealPhotonPowerW)
    close(current.lifetimeS, ref.idealVacuumLifetimeS)
  }
})
test('mass scaling and the first law hold across the entire control range', () => {
  for (const mass of [MIN_MASS, 1e12, BALANCE_MASS, SOLAR_MASS, MAX_MASS / 2]) {
    const one = blackHole(mass),
      two = blackHole(2 * mass)
    close(two.radiusM / one.radiusM, 2)
    close(two.temperatureK / one.temperatureK, 0.5)
    close(two.areaM2 / one.areaM2, 4)
    close(two.entropyOverK / one.entropyOverK, 4)
    close(two.powerW / one.powerW, 0.25)
    close(two.lifetimeS / one.lifetimeS, 8)
    const dm = mass * 1e-5
    const dS =
      (K * (blackHole(mass + dm).entropyOverK - blackHole(mass - dm).entropyOverK)) / (2 * dm)
    close(one.temperatureK * dS, C ** 2, 1e-8)
  }
})
test('ideal power agrees with Stefan-Boltzmann independently of its coded coefficient', () => {
  const sigma = 5.6703744191844314e-8
  const bh = blackHole(SOLAR_MASS)
  close(bh.powerW, sigma * bh.areaM2 * bh.temperatureK ** 4)
  close(bh.lifetimeS, (5120 * Math.PI * G ** 2 * SOLAR_MASS ** 3) / (HBAR * C ** 4))
})
test('evaporation conserves integrated energy and keeps working at the lowest initial mass', () => {
  for (const mass of [MIN_MASS, 1e12, MAX_MASS]) {
    const initial = blackHole(mass),
      age = 0.75
    const final = blackHole(evaporatedMass(mass, age))
    close(final.lifetimeS / initial.lifetimeS, 1 - age)
    close(final.massKg / mass, Math.cbrt(0.25))
    const n = 10000,
      dt = (age * initial.lifetimeS) / n
    let energy = 0
    for (let i = 0; i < n; i++)
      energy += blackHole(evaporatedMass(mass, (age * (i + 0.5)) / n)).powerW * dt
    close(energy, (mass - final.massKg) * C ** 2, 2e-8)
    assert.ok(Number.isFinite(blackHole(evaporatedMass(mass, MAX_AGE)).temperatureK))
  }
})
test('log-energy spectral density integrates to total ideal power and peaks at the correct energy', () => {
  const temp = 127,
    low = -16,
    high = 5,
    n = 20000,
    step = (high - low) / n
  let total = 0
  for (let i = 0; i < n; i++)
    total += spectrumFraction(Math.exp(low + (i + 0.5) * step) * K * temp, temp) * step
  close(total, 1, 1e-8)
  const peak = LOG_PEAK * K * temp
  assert.ok(spectrumFraction(peak, temp) > spectrumFraction(peak * 0.99, temp))
  assert.ok(spectrumFraction(peak, temp) > spectrumFraction(peak * 1.01, temp))
  assert.equal(spectrumFraction(0, temp), 0)
  assert.equal(spectrumFraction(1e200, temp), 0)
})
test('the thermal bath changes net power without switching off emitted radiation', () => {
  const cold = blackHole(SOLAR_MASS, 'cmb'),
    vacuum = blackHole(SOLAR_MASS)
  close(cold.powerW, vacuum.powerW)
  assert.ok(cold.absorbedW > cold.powerW)
  assert.ok(cold.netW < 0)
  assert.ok(blackHole(BALANCE_MASS * 0.5, 'cmb').netW > 0)
  assert.ok(blackHole(BALANCE_MASS * 2, 'cmb').netW < 0)
  close(blackHole(BALANCE_MASS, 'cmb').absorbedW / blackHole(BALANCE_MASS).powerW, 1)
})
test('invalid physical inputs fail explicitly instead of producing NaN or infinity', () => {
  for (const mass of [0, -1, NaN, Infinity, 1e-300, 1e300])
    assert.throws(() => blackHole(mass), RangeError)
  for (const age of [-0.01, 1, Infinity, NaN])
    assert.throws(() => evaporatedMass(1e12, age), RangeError)
  assert.throws(() => spectrumFraction(-1, 10), RangeError)
  assert.throws(() => spectrumFraction(1, 0), RangeError)
})
test('four guided changes isolate their intended variable and preserve immutable references', () => {
  const allowed = { mass: ['mass'], bath: ['environment'], time: ['age'], entropy: ['mass'] }
  for (const { id } of LESSONS) {
    const before = initialState(id),
      snapshot = structuredClone(before.reference)
    const after = reducer(before, { type: 'try' })
    assert.deepEqual(
      Object.keys(snapshot).filter((key) => after[key] !== snapshot[key]),
      allowed[id],
    )
    assert.deepEqual(after.reference, snapshot)
    assert.deepEqual(before.reference, snapshot)
    assert.equal(lessonStatus(after), 'observed')
    assert.deepEqual(after.completed, [id])
    const restored = reducer(after, { type: 'restore' })
    assert.equal(lessonStatus(restored), 'ready')
    assert.deepEqual(restored.completed, [id])
  }
})
test('lesson feedback rejects confounded comparisons and all four lessons can be explored', () => {
  let state = initialState()
  for (const { id } of LESSONS) {
    state = reducer(state, { type: 'lesson', id })
    const changed =
      id === 'bath'
        ? reducer(state, { type: 'mass', mass: 1e12 })
        : reducer(state, { type: 'environment', environment: 'cmb' })
    assert.equal(lessonStatus(changed), 'changed')
    assert.ok(!changed.completed.includes(id))
    state = reducer(state, { type: 'try' })
    assert.equal(lessonStatus(state), 'observed')
  }
  assert.equal(state.completed.length, 4)
  state = reducer(state, { type: 'try' })
  assert.equal(state.completed.length, 4)
})
test('manual slider steps also complete meaningful comparisons without requiring the shortcut', () => {
  const mass = reducer(initialState('mass'), { type: 'mass', mass: 10 ** 12.3 })
  assert.equal(lessonStatus(mass), 'observed')
  const time = reducer(initialState('time'), { type: 'age', age: 0.005 })
  assert.equal(lessonStatus(time), 'observed')
  assert.equal(
    lessonStatus(reducer(initialState('mass'), { type: 'mass', mass: 1.5e12 })),
    'changed',
  )
})
test('thermal-bath mode resets age and prevents isolated evolution through all clock actions', () => {
  let state = reducer(initialState('time'), { type: 'try' })
  state = reducer(state, { type: 'environment', environment: 'cmb' })
  assert.equal(state.age, 0)
  for (const action of [
    { type: 'running' },
    { type: 'age', age: 0.5 },
    { type: 'step', seconds: 0.2 },
  ])
    state = reducer(state, action)
  assert.equal(state.age, 0)
  assert.equal(state.running, false)
  close(reading({ ...state, age: 0.8 }).massKg, state.mass)
})
test('pause, terminal limit, changing initial mass and invalid actions keep the clock consistent', () => {
  let state = initialState('time')
  assert.equal(reducer(state, { type: 'step', seconds: 0.1 }), state)
  state = reducer(state, { type: 'age', age: 0.949 })
  state = reducer(state, { type: 'running' })
  state = reducer(state, { type: 'step', seconds: 300 })
  assert.equal(state.age, MAX_AGE)
  assert.equal(state.running, false)
  assert.equal(reducer(state, { type: 'running' }), state)
  state = reducer(state, { type: 'mass', mass: MIN_MASS })
  assert.equal(state.age, 0)
  assert.equal(state.running, false)
  assert.equal(reducer(state, { type: 'mass', mass: NaN }), state)
  assert.equal(reducer(state, { type: 'age', age: NaN }), state)
})
test('science labels retain small temperatures, huge lifetimes, signs and SI units', () => {
  assert.equal(scientific(0, 'W'), '0 W')
  assert.equal(scientific(6.17e-8, 'K'), '6,17 × 10⁻⁸ K')
  assert.equal(scientific(-1e30, 'W'), '-1,00 × 10³⁰ W')
  assert.ok(scientific(1e67, 'años').includes('10⁶⁷'))
})
