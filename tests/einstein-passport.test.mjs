import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PASSPORT_KEY,
  completedCount,
  decodePassport,
  emptyPassport,
  readPassport,
  saveCompleted,
} from '../src/einstein/progress.ts'
import { EINSTEIN_IDS } from '../src/einstein/catalog.ts'
import {
  LIGHT_SPEED,
  massFromPosition,
  positionFromMass,
  restEnergy,
} from '../src/einstein/energy.ts'
import { initialState as clockState } from '../src/reloj/learning.ts'
import { initialState as trainState } from '../src/tren/learning.ts'
import { initialState as twinsState } from '../src/gemelos/learning.ts'
import { initialState as elevatorState } from '../src/ascensor/learning.ts'
import { initialState as heightState } from '../src/altura/learning.ts'
import { initialState as orbitState } from '../src/orbita/learning.ts'
import { initialState as photoState } from '../src/fotoelectrico/learning.ts'
const close = (a, b, rel = 1e-12) =>
  assert.ok(
    Math.abs(a - b) <= rel * Math.max(Math.abs(a), Math.abs(b), 1e-30),
  )
function memoryStorage() {
  const data = new Map()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    data,
  }
}
test('A fresh passport has independent arrays for exactly seven chapters and no discoveries', () => {
  const p = emptyPassport()
  assert.deepEqual(Object.keys(p), [...EINSTEIN_IDS])
  assert.equal(completedCount(p), 0)
  p[EINSTEIN_IDS[0]].push(0)
  assert.deepEqual(p[EINSTEIN_IDS[1]], [])
})
test('Passport decoding bounds untrusted data and accepts only completed indices 0 to 3', () => {
  for (const text of [
    null,
    'bad',
    '[]',
    'null',
    '{}',
    '{"version":2,"chapters":{}}',
    'x'.repeat(5000),
  ])
    assert.equal(completedCount(decodePassport(text)), 0)
  for (const value of [
    [4],
    [-1],
    ['1'],
    [0, 1, 2, 3, 0],
    true,
    'all',
    null,
  ]) {
    const text = JSON.stringify({
      version: 1,
      chapters: { [EINSTEIN_IDS[0]]: value },
    })
    assert.equal(completedCount(decodePassport(text)), 0)
  }
  const p = decodePassport(
    JSON.stringify({
      version: 1,
      chapters: { [EINSTEIN_IDS[0]]: [3, 1, 1], unexpected: [0, 1, 2, 3] },
    }),
  )
  assert.deepEqual(p[EINSTEIN_IDS[0]], [1, 3])
  assert.equal(completedCount(p), 2)
})
test('Completing each chapter merges discoveries without erasing another chapter or other browser data', () => {
  const storage = memoryStorage()
  storage.setItem('unrelated', 'keep')
  for (const id of EINSTEIN_IDS) {
    assert.ok(saveCompleted(id, [0], storage))
    assert.ok(saveCompleted(id, [1, 2, 3], storage))
  }
  assert.equal(completedCount(readPassport(storage)), 28)
  assert.equal(storage.getItem('unrelated'), 'keep')
  assert.ok(storage.getItem(PASSPORT_KEY).length < 4096)
  saveCompleted(EINSTEIN_IDS[0], [0], storage)
  assert.deepEqual(readPassport(storage)[EINSTEIN_IDS[0]], [0, 1, 2, 3])
})
test('Missing, blocked and full storage cannot stop a laboratory or overwrite unreadable progress', () => {
  const unreadable = {
    getItem() {
      throw new Error('blocked')
    },
    setItem() {
      throw new Error('must not write')
    },
  }
  assert.equal(completedCount(readPassport(unreadable)), 0)
  assert.equal(saveCompleted(EINSTEIN_IDS[0], [0], unreadable), false)
  const full = {
    getItem: () => null,
    setItem() {
      throw new Error('quota')
    },
  }
  assert.equal(saveCompleted(EINSTEIN_IDS[0], [0], full), false)
  assert.equal(completedCount(readPassport()), 0) // No browser globals in this Node process.
})
test('Invalid ids and completion arrays cannot write marks or grow storage', () => {
  const storage = memoryStorage()
  for (const [id, values] of [
    ['__proto__', [0]],
    ['unknown', [0]],
    [EINSTEIN_IDS[0], [4]],
    [EINSTEIN_IDS[0], []],
    [EINSTEIN_IDS[0], null],
    [EINSTEIN_IDS[0], [0, 1, 2, 3, 0]],
  ])
    assert.equal(saveCompleted(id, values, storage), false)
  assert.equal(storage.data.size, 0)
})
test('Every laboratory restores achievements independently of its initial physical trial', () => {
  for (const initial of [
    clockState,
    trainState,
    twinsState,
    elevatorState,
    heightState,
    orbitState,
    photoState,
  ]) {
    const completed = [1, 3],
      s = initial(0, completed)
    assert.deepEqual(s.completed, [1, 3])
    assert.notEqual(s.completed, completed)
    assert.deepEqual(s.marks, [])
    assert.equal(s.prediction, null)
    assert.deepEqual(s.setup, initial().setup)
  }
})
test('Rest-energy notebook independently recovers SI values for a milligram and a gram', () => {
  close(restEnergy(1).kg, 1e-6)
  close(restEnergy(1).joules, 8.987551787368176e10)
  close(restEnergy(1000).joules, 8.987551787368176e13)
  close(restEnergy(1000).kwh, 24965421.631578267)
  close((3.6e6 / LIGHT_SPEED ** 2) * 1e12, 40.0554020179, 1e-10)
})
test('Logarithmic mass slider preserves presets, monotonicity and the full domain', () => {
  close(massFromPosition(0), 0.1)
  close(massFromPosition(100), 1000)
  for (const mass of [0.1, 0.5, 1, 10, 100, 1000])
    close(massFromPosition(positionFromMass(mass)), mass)
  for (let p = 1; p <= 100; p++)
    assert.ok(massFromPosition(p) > massFromPosition(p - 1))
  for (const value of [NaN, Infinity, -1, 101])
    assert.throws(() => massFromPosition(value), RangeError)
  for (const value of [NaN, 0, 1001])
    assert.throws(() => restEnergy(value), RangeError)
})
