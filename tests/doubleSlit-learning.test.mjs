import test from 'node:test'
import assert from 'node:assert/strict'
import {
  LESSONS,
  MIN_COMPARISON_SAMPLES,
  lessonConfig,
  proposedConfig,
  makeReading,
  describeLesson,
} from '../src/education/doubleSlitLearning.ts'
import { intensityAt } from '../src/physics/interference.ts'

function close(actual, expected, tolerance = 1e-10) {
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} differs from ${expected}`)
}

// These arbitrary, valid counts deliberately do NOT resemble the physical
// distribution. A count threshold must never certify agreement with theory.
function reading(config, count = 1600) {
  const histogram = new Array(256).fill(0)
  histogram[0] = count
  return makeReading(config, histogram, count)
}

test('four lesson setups isolate one physical variable and do not share mutable configuration', () => {
  assert.deepEqual(
    LESSONS.map((lesson) => lesson.id),
    ['accumulation', 'separation', 'detector', 'single'],
  )
  const allowed = {
    accumulation: [],
    separation: ['slitSeparation'],
    detector: ['detectorStrength'],
    single: ['slitWidth'],
  }
  for (const { id } of LESSONS) {
    const initial = lessonConfig(id)
    const changed = proposedConfig(id)
    assert.deepEqual(
      Object.keys(initial).filter((key) => initial[key] !== changed[key]),
      allowed[id],
    )
    assert.equal(initial.slitCount, id === 'single' ? 1 : 2)
    assert.equal(initial.detectorStrength, 0)
  }
  const first = lessonConfig('separation')
  first.wavelength = 0.1
  assert.equal(lessonConfig('separation').wavelength, 0.05)
})

test('separating slits by 50% contracts the predicted fringe spacing to two thirds', () => {
  const before = reading(lessonConfig('separation'))
  const after = reading(proposedConfig('separation'))
  close(before.fringeSpacing, 7 / 12)
  close(after.fringeSpacing, 7 / 18)
  close(after.fringeSpacing / before.fringeSpacing, 2 / 3)
  close(after.centralLobeWidth, before.centralLobeWidth)
  const emptyAfter = reading(proposedConfig('separation'), 0)
  const feedback = describeLesson('separation', before, emptyAfter, false)
  assert.equal(feedback.status, 'predicted')
  assert.match(feedback.text, /0,583 a 0,389/)
  assert.match(feedback.text, /no es una medición/)
})

test('the detector removes two-path cross terms while leaving the diffraction zeros fixed', () => {
  const before = reading(lessonConfig('detector'))
  const after = reading(proposedConfig('detector'))
  assert.equal(before.coherentFraction, 1)
  assert.equal(after.coherentFraction, 0)
  assert.equal(after.fringeSpacing, null)
  close(before.centralLobeWidth, after.centralLobeWidth)
  const formerInterferenceMinimum = 7 / 24
  assert.ok(intensityAt(formerInterferenceMinimum, before.config) < 1e-25)
  assert.ok(intensityAt(formerInterferenceMinimum, after.config) > 0.9)
  assert.ok(intensityAt(35 / 13, after.config) < 1e-25)
  const feedback = describeLesson('detector', before, after, false)
  assert.equal(feedback.status, 'sampled')
  assert.match(feedback.text, /Conserva la difracción/)
  assert.match(feedback.text, /no requiere una persona mirando/)
})

test('a partial path record describes an ideal mixture, retaining coherent contributions', () => {
  const before = reading(lessonConfig('detector'))
  const after = reading({ ...before.config, detectorStrength: 0.35 })
  close(after.coherentFraction, 0.65)
  close(after.fringeSpacing, before.fringeSpacing)
  const feedback = describeLesson('detector', before, after, false)
  assert.match(feedback.text, /35 %/)
  assert.match(feedback.text, /resto todavía aporta interferencia/)
})

test('widening a single slit narrows its central diffraction lobe without creating two-slit fringes', () => {
  const before = reading(lessonConfig('single'))
  const after = reading(proposedConfig('single'))
  assert.equal(before.fringeSpacing, null)
  assert.equal(after.fringeSpacing, null)
  close(before.centralLobeWidth, 70 / 13)
  close(after.centralLobeWidth, 3.5)
  close(after.centralLobeWidth / before.centralLobeWidth, 0.65)
  assert.ok(intensityAt(1.75, after.config) < 1e-25)
  assert.ok(intensityAt(1.75, before.config) > 0.1)
  const feedback = describeLesson('single', before, after, false)
  assert.match(feedback.text, /no hay interferencia entre dos aberturas/)
  assert.match(feedback.text, /5,385 a 3,500/)
})

test('accumulation distinguishes an empty screen, a single point, and samples to compare', () => {
  const config = lessonConfig('accumulation')
  const baseline = reading(config, 1)
  assert.match(
    describeLesson('accumulation', baseline, reading(config, 0), false).heading,
    /no hay impactos/,
  )
  const one = describeLesson('accumulation', baseline, reading(config, 1), false)
  assert.equal(one.status, 'ready')
  assert.match(one.heading, /Un punto no revela/)
  assert.equal(
    describeLesson('accumulation', baseline, reading(config, MIN_COMPARISON_SAMPLES - 1), false)
      .status,
    'ready',
  )
  const many = describeLesson('accumulation', baseline, reading(config), false)
  assert.equal(many.status, 'sampled')
  assert.match(many.text, /no garantiza coincidencia/)
  assert.match(many.text, /ni revela por dónde pasó/)
})

test('a saved reading owns its counts and configuration after caller mutation', () => {
  const config = lessonConfig('detector')
  const histogram = [4, 5]
  const saved = makeReading(config, histogram, 9)
  config.detectorStrength = 1
  histogram[0] = 99
  assert.equal(saved.config.detectorStrength, 0)
  assert.deepEqual(saved.histogram, [4, 5])
  assert.equal(saved.dataValid, true)
})

test('extra controls and unsuitable baseline setups cannot produce a one-variable conclusion', () => {
  for (const { id } of LESSONS) {
    const before = reading(lessonConfig(id))
    const after = reading({ ...proposedConfig(id), wavelength: 0.1 })
    assert.equal(describeLesson(id, before, after, false).status, 'changed')
  }
  const invalidBaseline = reading({ ...lessonConfig('single'), slitCount: 2 })
  assert.equal(
    describeLesson('single', invalidBaseline, reading(proposedConfig('single')), false).status,
    'changed',
  )
  const markedBaseline = reading(proposedConfig('detector'))
  assert.equal(
    describeLesson('detector', markedBaseline, reading(lessonConfig('detector')), false).status,
    'changed',
  )
})

test('insufficient old or new data never turns a changed prediction into an observational achievement', () => {
  for (const id of ['separation', 'detector', 'single']) {
    const before = reading(lessonConfig(id))
    const after = reading(proposedConfig(id))
    assert.equal(describeLesson(id, before, before, false).status, 'ready')
    const noNewData = describeLesson(id, before, reading(after.config, 0), false)
    assert.equal(noNewData.status, 'predicted')
    assert.match(noNewData.text, /La nueva corrida tiene 0 impactos/)
    const noReference = describeLesson(id, reading(before.config, 1), after, false)
    assert.equal(noReference.status, 'predicted')
    assert.match(noReference.text, /Falta una referencia/)
    const arbitraryCounts = describeLesson(id, before, after, false)
    assert.equal(arbitraryCounts.status, 'sampled')
    assert.match(arbitraryCounts.text, /no demuestra que la muestra coincida/)
  }
})

test('pausing stops sampling feedback and malformed configurations or counts are blocked', () => {
  const before = reading(lessonConfig('detector'))
  const after = reading(proposedConfig('detector'))
  const paused = describeLesson('detector', before, after, true)
  assert.equal(paused.status, 'blocked')
  assert.match(paused.text, /controles actualizan el modelo/)
  const badReadings = [
    makeReading({ ...after.config, wavelength: NaN }, [1], 1),
    makeReading({ ...after.config, slitCount: 9 }, [1], 1),
    makeReading(after.config, [-1, 2], 1),
    makeReading(after.config, [1.5], 1.5),
    makeReading(after.config, [2], 1),
    makeReading(after.config, [], 0),
    makeReading(after.config, [Infinity], Infinity),
  ]
  for (const bad of badReadings) {
    assert.equal(describeLesson('detector', before, bad, false).status, 'blocked')
    assert.equal(describeLesson('detector', bad, after, false).status, 'blocked')
  }
})
