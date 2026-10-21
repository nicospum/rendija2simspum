import test from 'node:test'
import assert from 'node:assert/strict'
import {
  passportStore as holes,
  lessonIndices,
} from '../src/series/progress.ts'
import { passportStore as einstein } from '../src/einstein/progress.ts'
import { BLACK_HOLE_IDS } from '../src/series/catalog.ts'
import { EINSTEIN_IDS } from '../src/einstein/catalog.ts'
import {
  LESSONS as lensLessons,
  initialState as lensState,
  reducer as lensReducer,
} from '../src/lente/learning.ts'
import {
  LESSONS as heatLessons,
  initialState as heatState,
  reducer as heatReducer,
} from '../src/hawking/learning.ts'
import {
  LESSONS as entropyLessons,
  initialState as entropyState,
  reducer as entropyReducer,
} from '../src/entropia/learning.ts'
import { initialState as horizonState } from '../src/horizonte/learning.ts'
import { expeditionScales } from '../src/series/scales.ts'
const close = (a, b, rel = 1e-11) =>
  assert.ok(
    Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b), 1e-30),
    `${a} ≠ ${b}`,
  )
function memory() {
  const data = new Map()
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, v),
  }
}
test('Both specials keep independent v1 passports and interleaved writes preserve all 48 discoveries', () => {
  const store = memory()
  store.setItem('other-app', 'keep')
  for (let i = 0; i < 4; i++) {
    for (const id of BLACK_HOLE_IDS)
      assert.equal(holes.saveCompleted(id, [i], store), true)
    for (const id of EINSTEIN_IDS)
      assert.equal(einstein.saveCompleted(id, [i], store), true)
  }
  assert.notEqual(holes.key, einstein.key)
  assert.notEqual(holes.event, einstein.event)
  assert.equal(holes.completedCount(holes.readPassport(store)), 20)
  assert.equal(einstein.completedCount(einstein.readPassport(store)), 28)
  assert.equal(store.getItem('other-app'), 'keep')
  assert.equal(store.data.size, 3)
})
test('Shared store still decodes existing Einstein v1 data without a migration or lost stamps', () => {
  const chapters = Object.fromEntries(
    EINSTEIN_IDS.map((id) => [id, [0, 3]]),
  )
  assert.deepEqual(
    einstein.decodePassport(JSON.stringify({ version: 1, chapters })),
    chapters,
  )
})
test('Black-hole passport ignores foreign chapters and cannot share mutable stamp arrays', () => {
  const p = holes.decodePassport(
    JSON.stringify({
      version: 1,
      chapters: { hawking: [3, 0, 3], 'reloj-de-luz': [0, 1, 2, 3] },
    }),
  )
  assert.deepEqual(p.hawking, [0, 3])
  assert.deepEqual(Object.keys(p), [...BLACK_HOLE_IDS])
  p.hawking.push(1)
  assert.deepEqual(p.entropia, [])
  assert.deepEqual(holes.readPassport(memory()).hawking, [])
})
test('Lesson adapters map the three named challenge sets and preserve numeric chapters', () => {
  for (const lessons of [lensLessons, heatLessons, entropyLessons]) {
    assert.deepEqual(
      lessonIndices(
        lessons.map((l) => l.id),
        lessons,
      ),
      [0, 1, 2, 3],
    )
    assert.deepEqual(
      lessonIndices([lessons[3].id, lessons[0].id], lessons),
      [3, 0],
    )
    assert.deepEqual(
      lessonIndices(['unknown', -1, 4, NaN, 0.5], lessons),
      [],
    )
  }
  assert.deepEqual(lessonIndices([3, 0, 2]), [3, 0, 2])
  assert.deepEqual(lessonIndices(['mass']), [])
})
test('Restored discoveries do not restore an old trial, prediction or unsafe simulation parameters', () => {
  for (const [lessons, initial] of [
    [lensLessons, lensState],
    [heatLessons, heatState],
    [entropyLessons, entropyState],
  ]) {
    const ids = [0, 3].map((i) => lessons[i].id),
      restored = initial(lessons[0].id, ids)
    assert.deepEqual(restored, { ...initial(), completed: ids })
    assert.equal(restored.prediction, null)
    assert.deepEqual(lessonIndices(restored.completed, lessons), [0, 3])
  }
  const initial = horizonState(0, [0, 3])
  assert.deepEqual(initial, {
    ...horizonState(),
    learning: { ...horizonState().learning, completed: [0, 3] },
  })
})
test('Scale explorer matches independent SI radius, Hawking temperature and area entropy', () => {
  const G = 6.6743e-11,
    c = 299792458,
    k = 1.380649e-23,
    hbar = 6.62607015e-34 / (2 * Math.PI),
    solarGM = 1.3271244e20
  for (const m of [5, 10, 20]) {
    const s = expeditionScales(m),
      kg = (m * solarGM) / G
    close(s.radiusKm, (2 * m * solarGM) / c ** 2 / 1000)
    close(
      s.temperatureNK,
      ((hbar * c ** 3) / (8 * Math.PI * G * kg * k)) * 1e9,
    )
    close(s.entropyOverK, (4 * Math.PI * G * kg ** 2) / (hbar * c))
  }
})
test('Changing mass changes the fixed-scale drawing, numbers and quadratic area together', () => {
  for (let mass = 5; mass <= 20; mass += 0.5) {
    const s = expeditionScales(mass),
      reference = expeditionScales(10)
    close(s.radiusKm / reference.radiusKm, mass / 10)
    close(s.temperatureNK / reference.temperatureNK, 10 / mass)
    close(s.entropyOverK / reference.entropyOverK, (mass / 10) ** 2)
    close(s.drawingRadius / 60, mass / 10)
    close((s.drawingRadius / 60) ** 2, s.entropyRatio)
    assert.ok(Object.values(s).every(Number.isFinite))
  }
})
test('Unsupported mass values fail before reaching a drawing or nonfinite reading', () => {
  for (const m of [NaN, Infinity, -Infinity, -1, 0, 4.99, 20.01, 100])
    assert.throws(() => expeditionScales(m), RangeError)
})
test('Lens, Hawking and entropy stamps require a comparison and the correct explanation in either order', () => {
  for (const [lessons, initial, reducer, predKey] of [
    [lensLessons, lensState, lensReducer, 'value'],
    [heatLessons, heatState, heatReducer, 'choice'],
    [entropyLessons, entropyState, entropyReducer, 'value'],
  ]) {
    for (const lesson of lessons) {
      const start = initial(lesson.id)
      const observed = reducer(start, { type: 'try' })
      assert.equal(observed.completed.length, 0)
      const wrong = reducer(observed, {
        type: 'predict',
        [predKey]: (lesson.answer + 1) % lesson.choices.length,
      })
      assert.equal(wrong.completed.length, 0)
      const corrected = reducer(wrong, {
        type: 'predict',
        [predKey]: lesson.answer,
      })
      assert.deepEqual(corrected.completed, [lesson.id])
      const predicted = reducer(start, {
        type: 'predict',
        [predKey]: lesson.answer,
      })
      assert.deepEqual(predicted.completed, [])
      assert.deepEqual(reducer(predicted, { type: 'try' }).completed, [
        lesson.id,
      ])
    }
  }
})
test('Hawking rejects unsupported predictions without changing the trial or saved marks', () => {
  const state = heatReducer(heatState(), { type: 'try' })
  for (const choice of [-1, 2, NaN, Infinity, 0.5])
    assert.equal(heatReducer(state, { type: 'predict', choice }), state)
})
