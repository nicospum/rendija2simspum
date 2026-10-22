import test from 'node:test'
import assert from 'node:assert/strict'
import {
  pickedDirection,
  sourceAtY,
  sourceMapY,
} from '../src/lente/interaction.ts'
import {
  initialState as lensState,
  reducer as lensReducer,
  lessonStatus as lensStatus,
} from '../src/lente/learning.ts'
import { traceRay, radians, HALF_FOV } from '../src/lente/physics.ts'
import { dialValue, starYears } from '../src/acrecion/interaction.ts'
import { DEFAULT, orbitalPeriodYears } from '../src/acrecion/physics.ts'
import { observe, observed, checkAnswer } from '../src/acrecion/learning.ts'
import {
  massAtEdge,
  emittedAtCorner,
  exampleAreaAtX,
} from '../src/entropia/interaction.ts'
import { entropyModel } from '../src/entropia/physics.ts'
import {
  initialState as entropyState,
  reducer as entropyReducer,
  lessonStatus as entropyStatus,
} from '../src/entropia/learning.ts'

test('Image handle coordinates recover the physical camera direction at multiple aspect ratios', () => {
  for (const aspect of [0.8, 1.6, 3]) {
    assert.equal(pickedDirection(0.5, 0.5, aspect).angle, 0)
    const right = pickedDirection(0.75, 0.5, aspect)
    assert.ok(
      Math.abs(
        right.angle -
          (Math.atan(0.5 * aspect * Math.tan(HALF_FOV)) * 180) / Math.PI,
      ) < 1e-10,
    )
    assert.equal(right.azimuth, 0)
    assert.ok(pickedDirection(0.5, 0.25, aspect).azimuth > 0)
  }
  assert.equal(pickedDirection(NaN, 0, 1), null)
  assert.equal(pickedDirection(0, 0, 0), null)
})
test('A pointer aimed into the shadow selects a captured ray, while the exterior sample reaches the sky', () => {
  const center = pickedDirection(0.5, 0.5, 1.6),
    s = lensState('capture')
  const moved = lensReducer(s, {
    type: 'pick',
    angle: center.angle,
    azimuth: center.azimuth,
  })
  assert.equal(traceRay(moved, radians(moved.rayAngle)).outcome, 'captured')
  assert.equal(traceRay(s, radians(14)).outcome, 'sky')
  assert.equal(lensStatus(moved), 'observed')
  assert.deepEqual(moved.completed, [])
})
test('Source dragging inverts the displayed projection and disables an edge-on ambiguous projection', () => {
  for (const source of [-18, -8, 0, 8, 18])
    for (const yaw of [-18, 0, 18])
      for (const azimuth of [0, 0.7, Math.PI])
        assert.equal(
          sourceAtY(sourceMapY(source, yaw, azimuth), yaw, azimuth),
          source,
        )
  assert.equal(sourceAtY(320, 0, Math.PI / 2), null)
  assert.equal(sourceAtY(NaN, 0, 0), null)
})
test('Aligning the source leaves mass and camera unchanged and satisfies only the intended comparison', () => {
  let s = lensState('ring')
  s = lensReducer(s, { type: 'source', value: sourceAtY(320, 0, 0) })
  assert.equal(s.source, 0)
  assert.equal(s.mass, 1)
  assert.equal(s.yaw, 0)
  assert.equal(lensStatus(s), 'observed')
  s = lensReducer(s, { type: 'predict', value: 0 })
  assert.deepEqual(s.completed, ['ring'])
})
test('The two image dials keep their own scales, exact learning presets and safe limits', () => {
  for (const maximum of [82, 100])
    for (const value of [0, maximum === 82 ? 70 : 60, maximum])
      assert.equal(dialValue(0.75 - value / maximum / 2, maximum), value)
  assert.equal(dialValue(-1e9, 82), 82)
  assert.equal(dialValue(1e9, 100), 0)
  assert.equal(dialValue(NaN, 82), null)
})
test('Dragging the stellar image follows elapsed orbital time across wraparound without altering mass', () => {
  for (const mass of [1, 4, 8])
    for (const years of [0, 0.3, 2.1]) {
      const period = orbitalPeriodYears(mass),
        expected = years + period / 20,
        phase = (2 * Math.PI * expected) / period
      const actual = starYears(
        360 + 155 * Math.cos(phase),
        235 + 155 * Math.sin(phase),
        years,
        mass,
      )
      assert.ok(Math.abs(actual - expected) < 1e-12)
    }
  assert.equal(starYears(360, 235, 0, 4), null)
  assert.equal(starYears(NaN, 200, 0, 4), null)
})
test('Direct disk gestures still need both observations and the correct scientific explanation', () => {
  const off = { ...DEFAULT, gas: dialValue(0.75, 100) },
    on = { ...DEFAULT, gas: dialValue(0.45, 100) }
  let marks = observe(0, off, [])
  assert.equal(observed(0, marks), false)
  marks = observe(0, on, marks)
  assert.equal(observed(0, marks), true)
  assert.equal(
    checkAnswer({
      index: 0,
      prediction: null,
      observations: marks,
      completed: [],
    }),
    'predict',
  )
  assert.equal(
    checkAnswer({
      index: 0,
      prediction: 1,
      observations: marks,
      completed: [],
    }),
    'complete',
  )
})
test('Fixed-scale horizon resizing recovers initial mass even after partial emission', () => {
  for (const mass of [5, 10, 20])
    for (const emitted of [0, 0.25, 0.5])
      assert.equal(
        massAtEdge(245 + ((70 * mass) / 10) * (1 - emitted), emitted),
        mass,
      )
  assert.equal(massAtEdge(-1e9, 0), 5)
  assert.equal(massAtEdge(1e9, 0), 20)
  assert.equal(massAtEdge(NaN, 0), null)
  assert.equal(massAtEdge(300, 1), null)
  const ten = entropyModel(massAtEdge(315, 0)),
    twenty = entropyModel(massAtEdge(385, 0))
  assert.equal(twenty.radiusRatio / ten.radiusRatio, 2)
  assert.equal(twenty.entropyRatio / ten.entropyRatio, 4)
})
test('The area corner selects emitted fraction without confusing entropy fraction with mass fraction', () => {
  for (const mass of [5, 10, 20])
    for (const f of [0, 0.25, 0.5])
      assert.equal(
        emittedAtCorner(550 + (((100 * mass) / 10) * (1 - f)) / 2, mass),
        f,
      )
  assert.equal(emittedAtCorner(-1e9, 10), 0.5)
  assert.equal(emittedAtCorner(1e9, 10), 0)
  assert.equal(emittedAtCorner(NaN, 10), null)
  assert.equal(emittedAtCorner(600, 0), null)
  const f = emittedAtCorner(587.5, 10),
    m = entropyModel(10, f)
  assert.equal((1 - f) ** 2, 0.5625)
  assert.ok(m.totalOverK > m.initial.entropyOverK)
})
test('The entropy gesture changes one variable and preserves the prediction and existing achievements', () => {
  let s = entropyState('evaporate', ['area'])
  s = entropyReducer(s, { type: 'predict', value: 1 })
  s = entropyReducer(s, {
    type: 'emitted',
    value: emittedAtCorner(587.5, s.mass),
  })
  assert.equal(s.mass, 10)
  assert.equal(s.patch, 8)
  assert.equal(entropyStatus(s), 'observed')
  assert.deepEqual(s.completed, ['area', 'evaporate'])
})

test('The separate algebraic scene changes Planck example area without changing the black-hole geometry', () => {
  assert.equal(exampleAreaAtX(64), 4)
  assert.equal(exampleAreaAtX(64 + (572 * 28) / 60), 32)
  assert.equal(exampleAreaAtX(636), 64)
  assert.equal(exampleAreaAtX(-100), 4)
  assert.equal(exampleAreaAtX(1000), 64)
  assert.equal(exampleAreaAtX(NaN), null)
  const start = entropyState('quarter')
  const moved = entropyReducer(start, {
    type: 'patch',
    value: exampleAreaAtX(64 + (572 * 12) / 60),
  })
  assert.equal(moved.patch, 16)
  assert.equal(moved.mass, start.mass)
  assert.equal(moved.emitted, start.emitted)
  assert.equal(
    entropyModel(moved.mass, moved.emitted).current.areaM2,
    entropyModel(start.mass, start.emitted).current.areaM2,
  )
  assert.equal(entropyStatus(moved), 'observed')
})
