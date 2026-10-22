import test from 'node:test'
import assert from 'node:assert/strict'
import { pathFraction, scrubKey } from '../src/shared/sceneInteraction.ts'
import { snapshot } from '../src/reloj/physics.ts'
import { initialState, reducer, observed } from '../src/reloj/learning.ts'
import { mapRadius, radiusAtMapX } from '../src/horizonte/interaction.ts'

test('Dragging on actual relativistic light paths recovers the same event in both frames', () => {
  for (const beta of [0, 0.6, 0.8, 0.95])
    for (const follow of ['nave', 'estacion'])
      for (const frame of ['nave', 'estacion'])
        for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
          const m = snapshot({ beta, follow, fraction }, frame)
          const selected = pathFraction(m.point, m.events, fraction >= 0.5)
          assert.ok(Math.abs(selected - fraction) < 1e-10)
        }
})
test('An overlapping vertical path distinguishes outgoing and returning halves explicitly', () => {
  const path = [
    { x: 0, y: 0 },
    { x: 0, y: 150 },
    { x: 0, y: 0 },
  ]
  assert.equal(pathFraction({ x: 0, y: 75 }, path, false), 0.25)
  assert.equal(pathFraction({ x: 0, y: 75 }, path, true), 0.75)
  assert.equal(pathFraction({ x: 1, y: 149 }, path, false), 0.5)
  assert.equal(pathFraction({ x: 1, y: 1 }, path, true), 1)
})
test('Off-path, invalid and extreme pointer positions cannot corrupt a trial', () => {
  const path = [
    { x: 0, y: 0 },
    { x: 150, y: 150 },
    { x: 300, y: 0 },
  ]
  for (const point of [
    { x: -1e9, y: 0 },
    { x: 1e9, y: 1e9 },
    { x: 300, y: -1e9 },
  ]) {
    const fraction = pathFraction(point, path, false)
    assert.ok(Number.isFinite(fraction) && fraction >= 0 && fraction <= 1)
  }
  assert.equal(pathFraction({ x: NaN, y: 2 }, path, false), null)
  assert.equal(pathFraction({ x: 0, y: 0 }, [], false), null)
})
test('Keyboard alternatives use limits, return native navigation keys unhandled, and reach exact endpoints', () => {
  assert.equal(scrubKey('Home', 0.5, 0, 1, 0.05), 0)
  assert.equal(scrubKey('End', 0.5, 0, 1, 0.05), 1)
  assert.equal(scrubKey('ArrowRight', 0.98, 0, 1, 0.05), 1)
  assert.equal(scrubKey('ArrowDown', 0.01, 0, 1, 0.05), 0)
  assert.equal(scrubKey('PageDown', 3, 1.2, 4, 0.05), 2.5)
  assert.equal(scrubKey('Tab', 0.5, 0, 1, 0.05), undefined)
})
test('Touch endpoint snapping can complete a tic using the existing learning reducer', () => {
  let s = reducer(initialState(0), { type: 'beta', value: 0 })
  const m = snapshot(s.setup, 'estacion')
  const fraction = pathFraction(
    { x: m.events[2].x + 2, y: m.events[2].y + 2 },
    m.events,
    true,
  )
  s = reducer(s, { type: 'fraction', value: fraction })
  assert.equal(s.setup.fraction, 1)
  assert.equal(observed(s), true)
  assert.deepEqual(s.completed, []) // Playing alone must not award an explained discovery.
})
test('The radial gesture inverts the plotted scale on both sides of the horizon', () => {
  for (const radius of [0.6, 0.8, 1, 1.2, 2, 3, 4]) {
    assert.ok(
      Math.abs(radiusAtMapX(205 + mapRadius(radius), false) - radius) <
        1e-12,
    )
  }
  assert.equal(radiusAtMapX(205 + 86 + 3, false), 1)
  assert.equal(radiusAtMapX(NaN, false), null)
})
test('The probe cannot be held at or inside the horizon; free-fall scrubbing stays in the computed interval', () => {
  assert.equal(radiusAtMapX(-1e9, true), 1.2)
  assert.equal(radiusAtMapX(205 + 86, true), 1.2)
  assert.equal(radiusAtMapX(-1e9, false), 0.6)
  assert.equal(radiusAtMapX(1e9, false), 4)
})
