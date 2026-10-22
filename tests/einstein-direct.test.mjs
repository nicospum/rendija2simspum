import test from 'node:test'
import assert from 'node:assert/strict'
import { passengerOffset } from '../src/tren/interaction.ts'
import {
  tripProgress,
  diagramProgress,
} from '../src/gemelos/interaction.ts'
import { DEFAULT as TRAIN, signals } from '../src/tren/physics.ts'
import {
  DEFAULT as TWINS,
  itinerary,
  snapshot,
} from '../src/gemelos/physics.ts'
import {
  initialState as trainState,
  reducer as trainReducer,
  observed,
} from '../src/tren/learning.ts'
import {
  initialState as twinsState,
  reducer as twinsReducer,
  observations as twinsChecks,
} from '../src/gemelos/learning.ts'
import {
  initialState as liftState,
  reducer as liftReducer,
  observations as liftChecks,
} from '../src/ascensor/learning.ts'

test('Wagon-relative input snaps to useful comparisons and clamps without leaving the train', () => {
  for (const [left, width] of [
    [60, 480],
    [210, 180],
  ]) {
    assert.equal(passengerOffset(left + width / 2, left, width), 0)
    assert.equal(passengerOffset(left + width * 0.751, left, width), 0.25)
    assert.equal(passengerOffset(left - 1e6, left, width), -0.3)
    assert.equal(passengerOffset(left + 1e6, left, width), 0.3)
  }
  assert.equal(passengerOffset(NaN, 0, 100), null)
  assert.equal(passengerOffset(1, 0, 0), null)
})
test('Moving a passenger changes arrival events while keeping both source events intact', () => {
  const a = signals({ ...TRAIN, beta: 0, sync: 'tren', offset: 0 })
  const b = signals({
    ...TRAIN,
    beta: 0,
    sync: 'tren',
    offset: passengerOffset(450, 0, 600),
  })
  assert.deepEqual(
    a.map((p) => p.emission),
    b.map((p) => p.emission),
  )
  assert.equal(a[0].passenger.t, a[1].passenger.t)
  assert.ok(b[1].passenger.t < b[0].passenger.t)
})
test('Both lanes recover their physical travel times for unequal speeds and a wait', () => {
  for (const s of [
    TWINS,
    { ...TWINS, outbound: 0.6, inbound: 0.9, wait: 0.2 },
  ]) {
    const p = itinerary(s),
      end = 75 + (p.distance / (s.duration * 0.5)) * 400
    for (const f of [0, 0.25, 0.5, 0.75, 1]) {
      const x = 75 + (end - 75) * f
      assert.ok(
        Math.abs(tripProgress(s, x, 145) - (p.out * f) / s.duration) <
          1e-12,
      )
      assert.ok(
        Math.abs(
          tripProgress(s, x, 210) -
            (p.leave + p.back * (1 - f)) / s.duration,
        ) < 1e-12,
      )
    }
  }
  assert.equal(tripProgress(TWINS, NaN, 0), null)
})
test('Diagram input reaches exact turns and reunion without changing the itinerary', () => {
  const s = { ...TWINS, outbound: 0.6, inbound: 0.9, wait: 0.2 },
    p = itinerary(s)
  for (const f of [0, p.out / s.duration, p.leave / s.duration, 1]) {
    assert.equal(diagramProgress(s, 345 - f * 270 + 0.5), f)
  }
  assert.equal(diagramProgress(s, -1e6), 1)
  assert.equal(diagramProgress(s, 1e6), 0)
  assert.equal(diagramProgress(s, NaN), null)
})
test('The turn changes remote simultaneity, not the local accumulated clock', () => {
  const progress = diagramProgress(TWINS, 210)
  const before = snapshot({ ...TWINS, progress, side: 'before' })
  const after = snapshot({ ...TWINS, progress, side: 'after' })
  assert.equal(before.own, after.own)
  assert.ok(Math.abs(before.assignedEarth - 1.8) < 1e-10)
  assert.ok(Math.abs(after.assignedEarth - 8.2) < 1e-10)
})
test('Direct train comparisons use the same learning criteria and never award an unexplained stamp', () => {
  let s = trainState(1)
  s = trainReducer(s, { type: 'time', value: 1.7 })
  s = trainReducer(s, {
    type: 'tune',
    patch: { offset: passengerOffset(450, 0, 600) },
  })
  assert.equal(s.setup.time, -0.6)
  s = trainReducer(s, { type: 'time', value: 1.7 })
  assert.equal(observed(s), true)
  assert.deepEqual(s.completed, [])
})
test('Scrubbing both sides of the twins turn completes observation without skipping explanation', () => {
  let s = twinsState(2),
    progress = diagramProgress(s.setup, 210)
  s = twinsReducer(s, { type: 'time', progress, side: 'before' })
  s = twinsReducer(s, { type: 'time', progress, side: 'after' })
  assert.ok(twinsChecks(s).every(Boolean))
  assert.deepEqual(s.completed, [])
})
test('Object release restarts a completed elevator trial instead of toggling an unrelated playback state', () => {
  let s = liftReducer(liftState(), { type: 'time', value: 1 })
  s = liftReducer(s, { type: 'time', value: 0 })
  s = liftReducer(s, { type: 'play' })
  assert.equal(s.setup.progress, 0)
  assert.equal(s.playing, true)
  s = liftReducer(s, { type: 'tune', patch: { scenario: 'cohete' } })
  s = liftReducer(s, { type: 'time', value: 1 })
  assert.ok(liftChecks(s).every(Boolean))
  assert.deepEqual(s.completed, [])
})
