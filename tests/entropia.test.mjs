import test from 'node:test'
import assert from 'node:assert/strict'
import {
  entropyModel,
  entropyFromArea,
  patchEntropy,
  PLANCK_AREA,
  C,
  G,
  HBAR,
  K,
  SOLAR_MASS,
} from '../src/entropia/physics.ts'
import { initialState, reducer, lessonStatus, LESSONS } from '../src/entropia/learning.ts'
const near = (a, b, rel = 1e-10) =>
  assert.ok(Math.abs(a - b) <= rel * Math.max(Math.abs(b), 1e-100), `${a} != ${b}`)

test('Planck area uses SI constants and matches CODATA 2022 at displayed precision', () => {
  near(Math.sqrt(PLANCK_AREA), 1.616255e-35, 4e-7)
  near(entropyFromArea(4 * PLANCK_AREA), 1)
  assert.equal(entropyFromArea(0), 0)
})
test('independent mass expression agrees with area formula and solar benchmark', () => {
  for (const mass of [5, 10, 20]) {
    const m = entropyModel(mass)
    const expected = (4 * Math.PI * G * (mass * SOLAR_MASS) ** 2) / (HBAR * C)
    near(m.current.entropyOverK, expected)
    near(m.current.entropyOverK, entropyFromArea(m.current.areaM2))
    // Page 2013 quotes 1.049e77; its rounded coefficient is not an exact constant.
    near(m.current.entropyOverK / mass ** 2, 1.049e77, 2e-4)
    near(m.current.radiusM / mass, 2953.25008, 1e-8)
  }
})
test('fixed visual reference separates radius, area, entropy and associated volume', () => {
  const m = entropyModel(20)
  near(m.radiusRatio, 2)
  near(m.areaRatio, 4)
  near(m.entropyRatio, 4)
  near(m.associatedVolumeRatio, 8)
  const small = entropyModel(5, 0.5)
  near(small.radiusRatio, 0.25)
  near(small.entropyRatio, 0.0625)
})
test('entropy units convert without changing physics; groups are not bits', () => {
  const m = entropyModel(10)
  near(m.entropyJK / K, m.current.entropyOverK)
  near(m.entropyBits * Math.LN2, m.current.entropyOverK)
  near(m.planckAreas / 4, m.current.entropyOverK)
  assert.equal(patchEntropy(16), 4)
  assert.notEqual(patchEntropy(16) / Math.LN2, 4)
})
test('25 percent emitted mass leaves 56.25 percent entropy and raises temperature', () => {
  const m = entropyModel(10, 0.25)
  near(m.current.massKg / m.initial.massKg, 0.75)
  near(m.current.entropyOverK / m.initial.entropyOverK, 0.5625)
  near(m.current.temperatureK / m.initial.temperatureK, 4 / 3)
  near(m.emittedEnergyJ / (m.initial.massKg * C ** 2), 0.25)
  near(m.ageFraction, 0.578125)
})
test('integrating c² dM/T independently reproduces BH entropy loss', () => {
  const m = entropyModel(10, 0.37),
    count = 2000
  const dm = (m.initial.massKg - m.current.massKg) / count
  let integral = 0
  for (let i = 0; i < count; i++) {
    const mass = m.current.massKg + (i + 0.5) * dm
    const temperature = (HBAR * C ** 3) / (8 * Math.PI * G * mass * K)
    integral += (C ** 2 * dm) / temperature
  }
  near(integral / K, m.initial.entropyOverK - m.current.entropyOverK)
})
test('Bose photon entropy integral independently gives the ideal 4/3 ratio', () => {
  let energy = 0,
    entropy = 0
  const dx = 0.001
  for (let i = 0; i < 40000; i++) {
    const x = (i + 0.5) * dx,
      occupation = 1 / Math.expm1(x)
    energy += x ** 3 * occupation * dx
    entropy +=
      x * x * ((1 + occupation) * Math.log1p(occupation) - occupation * Math.log(occupation)) * dx
  }
  near(entropy / energy, 4 / 3, 1e-8)
})
test('thermal entropy ledger starts unchanged and rises over the whole supported range', () => {
  for (const mass of [5, 10, 20]) {
    let previous = entropyModel(mass).totalOverK
    for (let i = 0; i <= 100; i++) {
      const m = entropyModel(mass, i / 200)
      assert.ok(m.totalOverK >= previous * (1 - 1e-14))
      near(m.totalOverK, m.current.entropyOverK + m.radiationOverK)
      near(m.totalOverK / m.initial.entropyOverK, 1 + m.lostFraction / 3)
      previous = m.totalOverK
    }
  }
  const zero = entropyModel(10)
  assert.equal(zero.radiationOverK, 0)
  assert.equal(zero.totalGainOverK, 0)
  assert.ok(entropyModel(10, 1e-12).totalGainOverK > 0)
})
test('unsupported and nonfinite scientific inputs fail explicitly', () => {
  for (const mass of [0, -1, 4.99, 20.01, NaN, Infinity])
    assert.throws(() => entropyModel(mass), RangeError)
  for (const f of [-0.01, 0.51, NaN, Infinity]) assert.throws(() => entropyModel(10, f), RangeError)
  for (const area of [-1, Infinity, NaN, Number.MAX_VALUE])
    assert.throws(() => entropyFromArea(area), RangeError)
  for (const patch of [0, 3, 6, 68, 16.5, NaN]) assert.throws(() => patchEntropy(patch), RangeError)
})
test('all four guided comparisons require prediction and preserve independent references', () => {
  let state = initialState()
  for (const lesson of LESSONS) {
    state = reducer(state, { type: 'lesson', id: lesson.id })
    const reference = { ...state.reference },
      oldCount = state.completed.length
    state = reducer(state, { type: 'try' })
    assert.equal(state.completed.length, oldCount)
    state = reducer(state, { type: 'restore' })
    state = reducer(state, { type: 'predict', value: lesson.answer })
    state = reducer(state, { type: 'try' })
    assert.equal(lessonStatus(state), 'observed')
    assert.deepEqual(state.reference, reference)
    assert.ok(state.completed.includes(lesson.id))
    state = reducer(state, { type: 'restore' })
    assert.equal(state.prediction, null)
    assert.equal(lessonStatus(state), 'ready')
    assert.ok(state.completed.includes(lesson.id))
  }
  assert.equal(state.completed.length, 4)
})
test('manual controls complete comparisons; confounded changes are marked exploration', () => {
  let state = reducer(initialState(), { type: 'mass', value: 20 })
  state = reducer(state, { type: 'predict', value: 0 })
  assert.deepEqual(state.completed, ['area'])
  state = reducer(state, { type: 'emitted', value: 0.1 })
  assert.equal(lessonStatus(state), 'exploring')
  const count = state.completed.length
  state = reducer(state, { type: 'mass', value: 20 })
  assert.equal(state.completed.length, count)
  assert.equal(reducer(state, { type: 'emitted', value: Infinity }), state)
  near(reducer(state, { type: 'mass', value: 100 }).mass, 20)
  assert.equal(reducer(state, { type: 'patch', value: 15 }).patch, 16)
})
