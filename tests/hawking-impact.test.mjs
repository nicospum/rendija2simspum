import test from 'node:test'
import assert from 'node:assert/strict'
import { impact, flowSignal, factor } from '../src/hawking/impact.ts'
import { initialState, reducer } from '../src/hawking/learning.ts'
import { MAX_MASS, MIN_MASS } from '../src/hawking/physics.ts'

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-10, `${a} != ${b}`)

test('a half-mass comparison makes the opposite thermal and geometric changes visible', () => {
  const state = initialState()
  const before = impact(state, state.reference)
  const after = impact(reducer(state, { type: 'mass', mass: state.mass / 2 }), state.reference)
  close(after.mass, 0.5)
  close(after.temperature, 2)
  close(after.power, 4)
  close(after.entropy, 0.25)
  close(after.areaSideRatio, 0.5)
  assert.ok(after.emissionSignal > before.emissionSignal)
  assert.ok(after.isolated)
})

test('doubling mass gives a fourfold area, not a fourfold side length', () => {
  const state = initialState('entropy')
  const after = impact(reducer(state, { type: 'try' }), state.reference)
  close(after.entropy, 4)
  close(after.areaSideRatio, 2)
  close(after.temperature, 0.5)
  assert.ok(after.emissionSignal < impact(state, state.reference).emissionSignal)
})

test('turning on the cosmic bath changes incoming energy without changing Hawking emission', () => {
  const state = initialState('bath')
  const after = impact(reducer(state, { type: 'try' }), state.reference)
  close(after.temperature, 1)
  close(after.power, 1)
  close(after.mass, 1)
  assert.ok(after.current.netW < 0)
  assert.ok(after.absorptionSignal > after.emissionSignal)
  assert.match(after.title, /gana energía/)
})

test('time feedback retains the isolated analytic mass and energy scaling', () => {
  const state = initialState('time')
  const after = impact(reducer(state, { type: 'try' }), state.reference)
  close(after.mass, Math.cbrt(0.25))
  close(after.temperature * after.mass, 1)
  close(after.power * after.mass ** 2, 1)
  assert.ok(after.isolated)
  assert.ok(after.emissionSignal > impact(state, state.reference).emissionSignal)
})

test('mixed controls do not attribute a combined change to a single cause', () => {
  const state = initialState()
  const next = reducer(reducer(state, { type: 'mass', mass: state.mass * 2 }), {
    type: 'environment',
    environment: 'cmb',
  })
  const result = impact(next, state.reference)
  assert.equal(result.isolated, false)
  assert.match(result.title, /más de una/)
})

test('visual signals and factors stay finite and bounded over the entire mass range', () => {
  const state = initialState()
  let previous = Infinity
  for (let log = Math.log10(MIN_MASS); log <= Math.log10(MAX_MASS); log++) {
    const result = impact({ ...state, mass: 10 ** log }, state.reference)
    assert.ok(result.emissionSignal <= previous)
    previous = result.emissionSignal
    assert.ok(Number.isFinite(result.emissionSignal))
    assert.ok(result.emissionSignal >= 0.04 && result.emissionSignal <= 1)
    assert.ok(!/NaN|Infinity/.test(factor(result.entropy)))
    assert.equal(result.absorptionSignal, 0)
  }
  assert.ok(flowSignal(4) > flowSignal(1))
  assert.ok(flowSignal(1) > flowSignal(0.25))
  assert.match(factor(1e56), /^×\(.+\)$/)
})
