import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { chapters, passport } from '../src/maldacena/catalog.ts'
import { experiments } from '../src/portal/catalog.ts'
import {
  CENTRAL_CHARGE as vacuumC,
  G3 as vacuumG,
} from '../src/maldacena/geometry/physics.ts'
import {
  CENTRAL_CHARGE as thermalC,
  G3 as thermalG,
} from '../src/maldacena/thermal/physics.ts'
test('all Maldacena chapters are distinct, available and catalogued once', () => {
  assert.equal(chapters.length, 5)
  assert.equal(new Set(experiments.map((c) => c.id)).size, experiments.length)
  for (const chapter of chapters) {
    assert.equal(experiments.filter((c) => c.id === chapter.id).length, 1)
    assert.ok(existsSync(new URL(`../${chapter.id}/index.html`, import.meta.url)))
  }
  assert.ok(existsSync(new URL('../maldacena/index.html', import.meta.url)))
})
test('vacuum and thermal chapters use the same central charge and Newton constant', () => {
  assert.equal(thermalC, vacuumC)
  assert.equal(thermalG, vacuumG)
  assert.equal(thermalC, 3 / (2 * thermalG))
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
