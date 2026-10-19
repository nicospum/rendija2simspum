import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_CONFIG, refractiveIndex, traceExperiment } from '../src/prisma/physics/optics.ts'
import { describeLesson, LESSONS, makeReading } from '../src/prisma/education/prismLearning.ts'

const reading = (patch = {}, intensity = 0.8, enabled = true) => {
  const config = { ...DEFAULT_CONFIG, ...patch }
  return makeReading(config, traceExperiment(config), intensity, enabled)
}
const close = (actual, expected, tolerance = 1e-10) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`)

test('guided lessons have unique controls and reading snapshots do not share mutable config', () => {
  assert.deepEqual(
    LESSONS.map((lesson) => lesson.id),
    ['split', 'brightness', 'distance', 'material'],
  )
  assert.equal(new Set(LESSONS.map((lesson) => lesson.controlId)).size, 4)
  const config = { ...DEFAULT_CONFIG }
  const snapshot = makeReading(config, traceExperiment(config), 0.8, true)
  config.material = 'quartz'
  assert.equal(snapshot.config.material, 'glass')
  assert.equal(snapshot.centralSpectrum.length, 33)
  assert.equal(snapshot.visibleRefractedHits, 99)
  assert.equal(snapshot.hasFullSpectrum, true)
  close(snapshot.dispersionIndex, refractiveIndex(380, 'glass') - refractiveIndex(700, 'glass'))
})

test('the split lesson compares unrefracted white light to a computed full spectrum', () => {
  const white = reading({ lightAngle: 16 })
  const spectrum = reading()
  assert.equal(white.whiteHits, 99)
  assert.equal(white.visibleRefractedHits, 0)
  assert.equal(white.hasFullSpectrum, false)
  assert.equal(describeLesson('split', white, white, false).status, 'ready')
  const feedback = describeLesson('split', white, spectrum, false)
  assert.equal(feedback.status, 'observed')
  assert.match(feedback.text, /0,114 u/)
  assert.match(feedback.text, /no reúne todas las pruebas/)
  assert.equal(
    describeLesson('split', spectrum, reading({ lightAngle: -1 }), false).status,
    'changed',
  )
})

test('brightness is compared without changing the calculated directions or spread', () => {
  const dim = reading({}, 0.35)
  const bright = reading({}, 0.8)
  close(dim.spread, bright.spread)
  close(dim.deviation, bright.deviation)
  assert.deepEqual(dim.centralSpectrum, bright.centralSpectrum)
  assert.equal(describeLesson('brightness', dim, dim, false).status, 'ready')
  const feedback = describeLesson('brightness', dim, bright, false)
  assert.equal(feedback.status, 'observed')
  assert.match(feedback.text, /35 a 80 %/)
  assert.match(feedback.text, /38,70°/)
  assert.equal(
    describeLesson('brightness', dim, reading({ prismAngle: 1 }, 0.8), false).status,
    'changed',
  )
})

test('moving only the screen increases measured separation by 35 percent without changing outgoing angles', () => {
  const near = reading()
  const far = reading({ screenDistance: 4.2 })
  close(near.spread, 0.11412608660059931)
  close(far.spread, 0.15405327920924972)
  close(near.deviation, far.deviation)
  close((far.spread / near.spread - 1) * 100, 34.98515878177913)
  const feedback = describeLesson('distance', near, far, false)
  assert.equal(feedback.status, 'observed')
  assert.match(feedback.text, /0,114 u a 0,154 u/)
  assert.match(feedback.text, /\+35,0 %/)
  assert.match(feedback.text, /no cambia los ángulos ni agrega colores/)
  assert.equal(describeLesson('distance', near, near, false).status, 'ready')
  assert.equal(
    describeLesson('distance', near, reading({ screenDistance: 4.2, apexAngle: 50 }), false).status,
    'changed',
  )
  assert.equal(
    describeLesson('distance', near, reading({ screenDistance: 4.2 }, 0.4), false).status,
    'changed',
  )
})

test('the material comparison uses wavelength dependence and identifies its idealized model', () => {
  const glass = reading()
  const quartz = reading({ material: 'quartz' })
  assert.ok(quartz.dispersionIndex < glass.dispersionIndex)
  close(quartz.spread, 0.08025358371135782)
  const feedback = describeLesson('material', glass, quartz, false)
  assert.equal(feedback.status, 'observed')
  assert.match(feedback.text, /0,0158 a 0,0130/)
  assert.match(feedback.text, /materiales idealizados/)
  assert.equal(describeLesson('material', glass, glass, false).status, 'ready')
})

test('frozen readings, switched off light and zero intensity cannot announce an observation', () => {
  const baseline = reading()
  const far = reading({ screenDistance: 4.2 })
  assert.match(describeLesson('distance', baseline, far, true).heading, /congelada/)
  for (const current of [
    reading({ screenDistance: 4.2 }, 0.8, false),
    reading({ screenDistance: 4.2 }, 0),
  ]) {
    assert.equal(describeLesson('distance', baseline, current, false).status, 'blocked')
    assert.equal(
      current.hasFullSpectrum,
      true,
      'geometrical measurements still exist with the lamp off',
    )
  }
})

test('a partially missed beam is identified as a mixture rather than a successful spectrum comparison', () => {
  const mixed = reading({ lightOffset: 0.7 })
  assert.equal(mixed.whiteHits, 66)
  assert.equal(mixed.visibleRefractedHits, 33)
  assert.equal(mixed.mixed, true)
  assert.equal(mixed.hasFullSpectrum, false)
  const feedback = describeLesson('split', reading({ lightAngle: 16 }), mixed, false)
  assert.equal(feedback.status, 'blocked')
  assert.match(feedback.heading, /Parte del haz/)
})

test('screen-plane hits beyond the visible bank cannot validate a lesson even with a finite spread', () => {
  const outside = reading({ prismAngle: 55.5, screenDistance: 4.2 })
  assert.ok(Number.isFinite(outside.spread))
  assert.equal(outside.outsideHits, 99)
  assert.equal(outside.visibleRefractedHits, 0)
  assert.equal(outside.hasFullSpectrum, false)
  assert.equal(outside.centralSpectrum.length, 0)
  const feedback = describeLesson('distance', reading(), outside, false)
  assert.equal(feedback.status, 'blocked')
  assert.match(feedback.heading, /fuera del banco/)
})

test('internal reflection without a complete visible spectrum gives trajectory feedback', () => {
  const reflected = reading({ prismAngle: -35 })
  assert.equal(reflected.reflections, 99)
  assert.equal(reflected.visibleRefractedHits, 0)
  assert.equal(reflected.hasFullSpectrum, false)
  const feedback = describeLesson('material', reading(), reflected, false)
  assert.equal(feedback.status, 'blocked')
  assert.match(feedback.text, /reflexión interna/)
})

test('a baseline without observable light is rejected rather than used for a comparison', () => {
  const feedback = describeLesson(
    'distance',
    reading({}, 0),
    reading({ screenDistance: 4.2 }),
    false,
  )
  assert.equal(feedback.status, 'changed')
})
