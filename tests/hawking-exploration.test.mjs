import test from 'node:test'
import assert from 'node:assert/strict'
import {
  massWindow,
  massInWindow,
  boundedView,
  worldPoint,
  mapTarget,
  markerPosition,
  visualRadius,
} from '../src/hawking/exploration.ts'
import { SOLAR_MASS, MIN_MASS, MAX_MASS } from '../src/hawking/physics.ts'

test('the teaching mass range stays within a factor of two at each deliberate scale', () => {
  for (const anchor of [1e12, SOLAR_MASS]) {
    const window = massWindow(anchor)
    assert.equal(window.min, anchor / 2)
    assert.equal(window.max, anchor * 2)
    let mass = anchor
    for (let i = 0; i < 100; i++) mass = massInWindow(anchor, mass * 2)
    assert.equal(mass, 2 * anchor)
    for (let i = 0; i < 100; i++) mass = massInWindow(anchor, mass / 2)
    assert.equal(mass, anchor / 2)
    assert.equal(massInWindow(anchor, anchor * 1.01), anchor * 1.01)
  }
  assert.equal(massWindow(MIN_MASS).min, MIN_MASS)
  assert.equal(massWindow(MAX_MASS).max, MAX_MASS)
  assert.throws(() => massWindow(0))
  assert.throws(() => massInWindow(1e12, NaN))
})

test('map picking remains attached to the horizon under zoom, pan and phone aspect ratios', () => {
  for (const aspect of [0.7, 1, 2])
    for (const zoom of [1, 1.8, 2.4]) {
      const view = { zoom, x: 0.2, y: -0.1 },
        radius = visualRadius(1)
      const screenX = ((radius - view.x) * view.zoom) / aspect
      const screenY = (0 - view.y) * view.zoom
      const point = worldPoint(screenX, screenY, aspect, view)
      assert.equal(mapTarget(point, radius, 0, 0.45, 0, 0.01), 'horizon')
    }
  assert.deepEqual(boundedView({ zoom: 99, x: 99, y: -99 }), { zoom: 2.4, x: 0.45, y: -0.35 })
})

test('outgoing and incoming markers use the same positions as their selectable labels', () => {
  const radius = visualRadius(1),
    time = 2.5
  for (const incoming of [false, true]) {
    const signal = incoming ? 1 : 0.45
    let checked = 0
    for (let i = 0; i < 40; i++) {
      const point = markerPosition(i, time, radius, signal, incoming)
      if (!point.visible) continue
      assert.equal(
        mapTarget(point, radius, time, 0.45, incoming ? 1 : 0, 0.001),
        incoming ? 'absorption' : 'emission',
      )
      checked++
    }
    assert.ok(checked > 20)
  }
})

test('the horizon, interior, reference and background have different explanations', () => {
  const radius = visualRadius(2)
  assert.equal(mapTarget({ x: radius, y: 0 }, radius, 0, 0.45, 0, 0.01), 'horizon')
  assert.equal(mapTarget({ x: 0, y: 0 }, radius, 0, 0.45, 0, 0.01), 'interior')
  assert.equal(mapTarget({ x: 0.32, y: 0 }, radius, 0, 0.45, 0, 0.01), 'reference')
  const smallRadius = visualRadius(0.5)
  assert.equal(mapTarget({ x: 0.32, y: 0 }, smallRadius, 0, 0.45, 0, 0.00001), 'reference')
  assert.equal(mapTarget({ x: 4, y: 4 }, radius, 0, 0.45, 0, 0.01), 'background')
})
