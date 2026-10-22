import test from 'node:test'
import assert from 'node:assert/strict'
import {
  towerHeight,
  chartProgress,
  satelliteProgress,
} from '../src/altura/interaction.ts'
import {
  GPS,
  heightPosition,
  snapshot as clock,
} from '../src/altura/physics.ts'
import { orbitProgress } from '../src/orbita/interaction.ts'
import {
  MERCURY,
  CYCLES,
  integrate,
  point,
  gainFor,
} from '../src/orbita/physics.ts'
import { frequencyAtX } from '../src/fotoelectrico/interaction.ts'
import {
  DEFAULT as PHOTO,
  snapshot as photo,
} from '../src/fotoelectrico/physics.ts'
import {
  initialState as heightState,
  reducer as heightReducer,
  observations as heightChecks,
} from '../src/altura/learning.ts'
import {
  initialState as photoState,
  reducer as photoReducer,
  observations as photoChecks,
} from '../src/fotoelectrico/learning.ts'

test('Tower gestures invert the plotted logarithmic height and snap to useful physical comparisons', () => {
  for (const h of [0, 0.33, 100, 4000])
    assert.equal(towerHeight(310 - heightPosition(h) * 2.6), h)
  for (const h of [1, 10, 500, 2000])
    assert.ok(
      Math.abs(towerHeight(310 - heightPosition(h) * 2.6) - h) < 1e-8,
    )
  assert.equal(towerHeight(-1e9), 4000)
  assert.equal(towerHeight(1e9), 0)
  assert.equal(towerHeight(NaN), null)
})
test('Chart scrubbing reaches complete trials and never changes their height or duration', () => {
  assert.equal(chartProgress(85), 0)
  assert.equal(chartProgress(530 - 2), 1)
  assert.equal(chartProgress(307.5), 0.5)
  assert.equal(chartProgress(NaN), null)
  let s = heightState(0)
  s = heightReducer(s, { type: 'time', value: chartProgress(530) })
  s = heightReducer(s, {
    type: 'tune',
    patch: { height: towerHeight(310 - heightPosition(100) * 2.6) },
  })
  assert.equal(s.setup.progress, 0)
  assert.equal(s.setup.days, 1)
  s = heightReducer(s, { type: 'time', value: chartProgress(530) })
  assert.ok(heightChecks(s).every(Boolean))
  assert.deepEqual(s.completed, [])
})
test('Satellite dragging follows the same circular solution through angular wraps', () => {
  for (const height of [400000, GPS.height, 36000000])
    for (const progress of [0.01, 0.3, 0.7, 0.98]) {
      const s = { ...GPS, height, progress, days: 7 },
        delta = 0.0001,
        angle = clock({ ...s, progress: progress + delta }).angle - 0.8
      const selected = satelliteProgress(
        s,
        280 + 170 * Math.cos(angle),
        205 + 170 * Math.sin(angle),
      )
      assert.ok(Math.abs(selected - (progress + delta)) < 1e-12)
      assert.equal(
        clock({ ...s, progress: selected }).period,
        clock(s).period,
      )
    }
  assert.equal(
    satelliteProgress({ ...GPS, motion: 'quieto' }, 300, 205),
    null,
  )
  assert.equal(satelliteProgress(GPS, 280, 205), null)
  assert.equal(satelliteProgress(GPS, NaN, 0), null)
})
test('Orbit dragging inverts the displayed Schwarzschild angle, with or without the angular magnifier', () => {
  for (const e of [MERCURY.e, 0.6])
    for (const expanded of [false, true])
      for (const rel of [false, true]) {
        const setup = { ...MERCURY, e, expanded },
          orbit = integrate(setup),
          gain = gainFor(setup),
          scale = 211 / orbit.aphelion
        let current = 0
        for (let i = 1; i <= 400; i++) {
          const target = i / 400,
            p = point(orbit, target * CYCLES, rel, gain)
          current = orbitProgress(
            orbit,
            { x: 300 + p.x * scale, y: 252 - p.y * scale },
            current,
            rel,
            gain,
          )
          assert.ok(
            Math.abs(current - target) < 1e-10,
            `${e},${expanded},${rel},${i}`,
          )
        }
        assert.equal(current, 1)
      }
})
test('Crossing the interior of an orbit cannot jump several revolutions between pointer events', () => {
  const orbit = integrate(MERCURY),
    gain = gainFor(MERCURY),
    scale = 211 / orbit.aphelion
  const a = point(orbit, 0, true, gain),
    b = point(orbit, 0.25, true, gain)
  let current = 0
  for (let i = 0; i <= 30; i++) {
    const f = i / 30
    const next = orbitProgress(
      orbit,
      {
        x: 300 + (a.x + (b.x - a.x) * f) * scale,
        y: 252 - (a.y + (b.y - a.y) * f) * scale,
      },
      current,
      true,
      gain,
    )
    assert.ok(next >= current - 1e-10 && next - current < 0.01)
    current = next
  }
  assert.ok(Math.abs(current - 0.025) < 1e-10)
  assert.equal(
    orbitProgress(orbit, { x: 300, y: 252 }, current, true, gain),
    null,
  )
  assert.equal(
    orbitProgress(orbit, { x: NaN, y: 0 }, current, true, gain),
    null,
  )
})
test('Frequency gestures share one THz calibration in the cell and energy plot', () => {
  for (const energy of [false, true]) {
    const left = energy ? 60 : 45,
      width = energy ? 480 : 255
    for (const f of [350, 450, 650, 1000, 1600])
      assert.equal(
        frequencyAtX(left + ((f - 350) / 1250) * width, energy),
        f,
      )
    assert.equal(frequencyAtX(-1e9, energy), 350)
    assert.equal(frequencyAtX(1e9, energy), 1600)
  }
  assert.equal(frequencyAtX(NaN, false), null)
})
test('The direct frequency control changes energy per photon; brightness changes rate at a fixed frequency', () => {
  const red = photo({
    ...PHOTO,
    frequency: frequencyAtX(65.4, false),
    brightness: 100,
  })
  const blue = photo({
    ...PHOTO,
    frequency: frequencyAtX(106.2, false),
    brightness: 100,
  })
  const dim = photo({ ...PHOTO, frequency: 650, brightness: 25 })
  assert.equal(red.emitting, false)
  assert.equal(blue.emitting, true)
  assert.equal(blue.kineticMax, dim.kineticMax)
  assert.ok(Math.abs(blue.current / dim.current - 4) < 1e-12)
})
test('Changing a direct photoelectric control still requires recording both trials and explaining them', () => {
  let s = photoState(0)
  s = photoReducer(s, { type: 'record' })
  s = photoReducer(s, {
    type: 'tune',
    patch: { frequency: frequencyAtX(106.2, false) },
  })
  assert.equal(photoChecks(s).every(Boolean), false)
  s = photoReducer(s, { type: 'record' })
  assert.ok(photoChecks(s).every(Boolean))
  assert.deepEqual(s.completed, [])
})
