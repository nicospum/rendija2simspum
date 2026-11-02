import test from 'node:test'
import assert from 'node:assert/strict'
import { observerRegionAt, observerRegionEntry } from '../src/lente/sceneHelp.ts'
import { diskRadiusAt, diskRegionAt, diskRegionEntry } from '../src/acrecion/sceneHelp.ts'
import { DEFAULT, MAX_ANGLE, MAX_PHI, OBSERVER } from '../src/acrecion/physics.ts'
import { mapTarget, markerPosition } from '../src/hawking/exploration.ts'

const transfer = (phi, valid = 1) =>
  new Float32Array([phi, valid, 0, 0, phi, valid, 0, 0])
const flatMap = (u) => ({ data: new Float32Array([u, u, u, u]), width: 2, height: 2 })

test('Hawking markers with zero rendered signal cannot be picked as emitted or absorbed light', () => {
  for (const incoming of [false, true]) {
    const point = markerPosition(7, 2.5, 0.32, 0, incoming)
    assert.ok(point.visible)
    assert.equal(mapTarget(point, 0.32, 2.5, 0, 0, 1e-6), 'background')
  }
})

test('lens picking distinguishes captured directions, numerical gaps and actual source direction', () => {
  const state = { critical: 0.1, data: transfer(Math.PI), yaw: 0, source: 0 }
  const shadow = observerRegionAt(0, 0, 1.8, state)
  assert.equal(shadow.kind, 'shadow')
  assert.match(observerRegionEntry(shadow, true).body, /sombra aparente/)
  assert.match(observerRegionEntry(shadow, true).body, /no una fotografía/)
  assert.equal(observerRegionAt(0.5, 0, 1.8, state).kind, 'source')
  assert.equal(observerRegionAt(0.5, 0, 1.8, { ...state, yaw: 90 }).kind, 'background')
  assert.equal(
    observerRegionAt(0.5, 0, 1.8, { ...state, yaw: 90, source: -90 }).kind,
    'source',
  )
  const gap = observerRegionAt(0.5, 0, 1.8, { ...state, data: transfer(Math.PI, 0) })
  assert.equal(gap.kind, 'unresolved')
  assert.match(
    observerRegionEntry(gap, true).body,
    /No se la identifica automáticamente con el horizonte/,
  )
})

test('a flat control image without gravity has no central black-hole shadow', () => {
  const region = observerRegionAt(0, 0, 0.7, {
    critical: 0,
    data: transfer(Math.PI),
    yaw: 0,
    source: 0,
  })
  assert.equal(region.kind, 'source')
  assert.match(observerRegionEntry(region, false).title, /sin lente/)
})

test('disk lookup reproduces bilinear texel interpolation and clamps to the rendered map', () => {
  const map = { data: new Float32Array([0.1, 0.2, 0.3, 0.4]), width: 2, height: 2 }
  assert.ok(Math.abs(diskRadiusAt(map, MAX_ANGLE / 2, MAX_PHI / 2) - 4) < 1e-6)
  assert.ok(Math.abs(diskRadiusAt(map, 99, 99) - 2.5) < 1e-6)
})

test('disk emission wins over shadow masking only when gas actually emits', () => {
  // Deliberately synthetic map isolates the fragment's compositing priority.
  const map = flatMap(1 / 6)
  const luminous = diskRegionAt(0, 0, 1.5, map, DEFAULT)
  assert.equal(luminous.kind, 'disk')
  const dark = diskRegionAt(0, 0, 1.5, map, { ...DEFAULT, gas: 0 })
  assert.equal(dark.kind, 'shadow')
  assert.match(
    diskRegionEntry(dark, { ...DEFAULT, gas: 0 }).body,
    /suministro está en cero/,
  )
})

test('straight face-on disk picking recovers analytic ray-plane radius and frequency ratio', () => {
  for (const aspect of [0.65, 1.6, 2]) {
    const tanFov = 0.7 / Math.min(aspect, 1.5)
    const nx = 6 / OBSERVER / (tanFov * aspect)
    const region = diskRegionAt(nx, 0, aspect, flatMap(0), {
      ...DEFAULT,
      lens: false,
      inclination: 0,
    })
    assert.equal(region.kind, 'disk')
    assert.ok(Math.abs(region.radius - 6) < 1e-10)
    const expected = Math.sqrt((1 - 1.5 / 6) / (1 - 1 / OBSERVER))
    assert.ok(Math.abs(region.g - expected) < 1e-12)
    assert.match(diskRegionEntry(region, DEFAULT).body, /no radiación de Hawking/)
  }
})
