import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import {
  chapters,
  laboratories,
  holographySections,
  chapterHref,
  resolveHolographySection,
  passport,
} from '../src/maldacena/catalog.ts'
import { experiments } from '../src/portal/catalog.ts'
import {
  CENTRAL_CHARGE as vacuumC,
  G3 as vacuumG,
} from '../src/maldacena/geometry/physics.ts'
import {
  CENTRAL_CHARGE as thermalC,
  G3 as thermalG,
} from '../src/maldacena/thermal/physics.ts'
test('Maldacena groups five preserved learning units in three distinct available laboratories', () => {
  assert.equal(chapters.length, 5)
  assert.equal(laboratories.length, 3)
  assert.deepEqual(
    laboratories.map((lab) => lab.chapterIds.length * 4),
    [4, 12, 4],
  )
  assert.deepEqual(
    laboratories.flatMap((lab) => lab.chapterIds),
    chapters.map((chapter) => chapter.id),
  )
  assert.equal(new Set(experiments.map((c) => c.id)).size, experiments.length)
  for (const chapter of chapters) {
    assert.ok(existsSync(new URL(`../${chapter.id}/index.html`, import.meta.url)))
  }
  for (const lab of laboratories) {
    assert.equal(experiments.filter((c) => c.id === lab.id).length, 1)
    assert.ok(existsSync(new URL(`../${lab.id}/index.html`, import.meta.url)))
  }
  for (const section of holographySections)
    assert.equal(experiments.filter((c) => c.id === section.id).length, 0)
  assert.ok(existsSync(new URL('../maldacena/index.html', import.meta.url)))
})
test('holography deep links preserve section through scene anchors and legacy routes', () => {
  for (const section of holographySections) {
    assert.equal(resolveHolographySection(`/${section.id}/`, '#md-map'), section.slug)
    assert.equal(
      resolveHolographySection('/holografia/', `#${section.slug}`),
      section.slug,
    )
    for (const hash of ['', '#md-map', '#md-challenges'])
      assert.equal(
        resolveHolographySection('/holografia/', hash, `?seccion=${section.slug}`),
        section.slug,
      )
    assert.equal(chapterHref(section.id), `/holografia/?seccion=${section.slug}`)
  }
  assert.equal(
    resolveHolographySection('/holografia/', '#unknown', '?seccion=invalid'),
    'geometria',
  )
  assert.equal(chapterHref('curva-de-page'), '/curva-de-page/')
})
test('vacuum and thermal chapters use the same central charge and Newton constant', () => {
  assert.equal(thermalC, vacuumC)
  assert.equal(thermalG, vacuumG)
  assert.equal(thermalC, 3 / (2 * thermalG))
})
test('an existing passport retains all twelve holography discoveries after grouping', () => {
  const beforeGrouping = JSON.stringify({
    version: 1,
    chapters: {
      entrelazados: [0, 2],
      'espacio-con-frontera': [0, 1, 2, 3],
      'dos-lenguajes': [0, 1, 2, 3],
      'frontera-caliente': [0, 1, 2, 3],
      'curva-de-page': [1],
    },
  })
  const decoded = passport.decodePassport(beforeGrouping)
  for (const section of holographySections)
    assert.deepEqual(decoded[section.id], [0, 1, 2, 3])
  assert.equal(passport.completedCount(decoded), 15)
  assert.deepEqual(decoded.entrelazados, [0, 2])
  assert.deepEqual(decoded['curva-de-page'], [1])
})
test('new passport merges discoveries, survives corrupt storage, and rejects invalid stamps', () => {
  const values = new Map()
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
  assert.equal(passport.key, 'spum.maldacena.passport.v1')
  assert.ok(passport.saveCompleted('entrelazados', [0, 1], storage))
  assert.ok(passport.saveCompleted('entrelazados', [1, 2], storage))
  assert.ok(passport.saveCompleted('dos-lenguajes', [3], storage))
  assert.deepEqual(passport.readPassport(storage).entrelazados, [0, 1, 2])
  assert.equal(passport.completedCount(passport.readPassport(storage)), 4)
  assert.deepEqual(passport.readPassport(storage)['curva-de-page'], [])
  assert.ok(passport.saveCompleted('curva-de-page', [0], storage))
  assert.equal(passport.completedCount(passport.readPassport(storage)), 5)
  assert.equal(passport.saveCompleted('dos-lenguajes', [4], storage), false)
  assert.equal(passport.saveCompleted('entropia', [0], storage), false)
  storage.setItem(passport.key, '{invalid')
  assert.equal(passport.completedCount(passport.readPassport(storage)), 0)
  assert.equal(
    passport.completedCount(
      passport.readPassport({
        getItem() {
          throw Error('blocked')
        },
      }),
    ),
    0,
  )
})
