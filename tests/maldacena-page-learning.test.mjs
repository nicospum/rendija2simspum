import test from 'node:test'
import assert from 'node:assert/strict'
import {
  initialTrial,
  observe,
  prepare,
  setEmitted,
  steps,
  LESSONS,
} from '../src/maldacena/page/learning.ts'
const ready = (t) =>
  steps(t).every((s) => s.done) && t.prediction === LESSONS[t.lesson].answer
test('four Page discoveries require observations and a correct prediction', () => {
  let t = initialTrial()
  assert.equal(ready(t), false)
  t = { ...t, prediction: 1 }
  t = setEmitted(t, 0)
  t = setEmitted(t, 1)
  assert.equal(ready(t), true)
  assert.equal(ready({ ...t, prediction: 0 }), false)
  t = { ...initialTrial(1), prediction: 1 }
  t = setEmitted(t, 3)
  t = setEmitted(t, 6)
  assert.equal(ready(t), false)
  t = observe({ ...t, average: true })
  assert.equal(ready(t), true)
  t = { ...initialTrial(2), prediction: 0 }
  t = setEmitted(t, 6)
  assert.equal(ready(t), false)
  t = observe({ ...t, thermal: true })
  assert.equal(ready(t), true)
  t = { ...initialTrial(3), prediction: 0 }
  t = setEmitted(t, 6)
  assert.equal(ready(t), false)
  t = observe({ ...t, inspection: 'separate' })
  assert.equal(ready(t), true)
})
test('changing preparation cannot combine observations from incompatible states', () => {
  let t = { ...initialTrial(3), prediction: 0 }
  t = setEmitted(t, 6)
  t = observe({ ...t, inspection: 'separate' })
  assert.equal(ready(t), true)
  t = prepare(t, 6, 18)
  assert.equal(t.prediction, 0)
  assert.equal(t.emitted, 0)
  assert.equal(t.revealedUntil, 0)
  assert.deepEqual(t.marks, [])
  assert.equal(ready(t), false)
  t = prepare(t, 4, 18)
  t = setEmitted(t, 4)
  t = observe({ ...t, inspection: 'separate' })
  assert.equal(ready(t), false)
})
test('rewinding preserves revealed curve, clamps inputs and never advances physical time', () => {
  let t = setEmitted(initialTrial(), 6)
  t = setEmitted(t, 2)
  assert.equal(t.revealedUntil, 6)
  assert.equal(t.emitted, 2)
  assert.strictEqual(setEmitted(t, NaN), t)
  assert.equal(setEmitted(t, -10).emitted, 0)
  assert.equal(setEmitted(t, 900).emitted, 6)
  assert.equal(setEmitted(t, 2.3).emitted, 2)
  assert.strictEqual(prepare(t, NaN, 1), t)
})
