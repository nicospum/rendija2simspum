import test from 'node:test'
import assert from 'node:assert/strict'
import {
  binaryEntropy,
  quantumModel,
  samplePairs,
  countingModel,
  observationKeys,
} from '../src/maldacena/quantum/physics.ts'
const near = (a, b, tolerance = 1e-12) =>
  assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`)

test('binary entropy handles pure endpoints, uniform probabilities and symmetry', () => {
  assert.equal(binaryEntropy(0), 0)
  assert.equal(binaryEntropy(1), 0)
  near(binaryEntropy(0.5), 1)
  for (const p of [0.1, 0.2, 0.7, 0.9]) near(binaryEntropy(p), binaryEntropy(1 - p))
  near(binaryEntropy(0.9), 0.4689955935892812)
})
test('product state is definite in Z but uncertain measurement in X is not entanglement', () => {
  const z = quantumModel(0, 'pure', 'Z', 'Z'),
    x = quantumModel(0, 'pure', 'X', 'X')
  assert.deepEqual(z.probabilities, [1, 0, 0, 0])
  x.probabilities.forEach((p) => near(p, 0.25))
  assert.equal(x.localEntropy, 0)
  assert.equal(x.totalEntropy, 0)
})
test('Bell and classical mixture agree in Z and on local states but differ in X', () => {
  for (const preparation of ['pure', 'mixture']) {
    const m = quantumModel(45, preparation, 'Z', 'Z')
    near(m.probabilities[0], 0.5)
    near(m.probabilities[3], 0.5)
    near(m.same, 1)
    near(m.localEntropy, 1)
    near(m.totalEntropy, preparation === 'pure' ? 0 : 1)
  }
  const bell = quantumModel(45, 'pure', 'X', 'X'),
    mixture = quantumModel(45, 'mixture', 'X', 'X')
  near(bell.same, 1)
  near(bell.probabilities[1], 0)
  near(bell.probabilities[2], 0)
  mixture.probabilities.forEach((p) => near(p, 0.25))
  near(mixture.same, 0.5)
})
test('Born probabilities are normalized positive and remote basis does not change local statistics', () => {
  for (const theta of [0, 1, 12, 22.5, 37, 45])
    for (const preparation of ['pure', 'mixture'])
      for (const a of ['Z', 'X']) {
        const z = quantumModel(theta, preparation, a, 'Z'),
          x = quantumModel(theta, preparation, a, 'X')
        for (const m of [z, x]) {
          near(
            m.probabilities.reduce((a, b) => a + b, 0),
            1,
          )
          assert.ok(m.probabilities.every((p) => p >= 0 && p <= 1 + 1e-12))
        }
        near(z.probabilityA0, x.probabilityA0)
      }
})
test('Born calculation at nonmaximal angle matches independent X correlation expression', () => {
  for (const theta of [5, 15, 30, 40]) {
    const expected = (1 + Math.sin((2 * theta * Math.PI) / 180)) / 2
    near(quantumModel(theta, 'pure', 'X', 'X').same, expected)
    near(quantumModel(theta, 'mixture', 'X', 'X').same, 0.5)
  }
})

test('local probabilities and complements stay in the physical interval at certain outcomes', () => {
  const zx = quantumModel(0, 'pure', 'Z', 'X'),
    xz = quantumModel(0, 'pure', 'X', 'Z')
  assert.equal(zx.probabilityA0, 1)
  assert.equal(1 - zx.probabilityA0, 0)
  assert.equal(xz.probabilityB0, 1)
  assert.equal(1 - xz.probabilityB0, 0)
  for (const m of [zx, xz])
    for (const p of [m.probabilityA0, m.probabilityB0]) assert.ok(p >= 0 && p <= 1)
})
test('sampling uses probabilities for fresh pairs with deterministic boundary checks', () => {
  let i = 0
  const draws = [0.1, 0.3, 0.6, 0.9]
  assert.deepEqual(
    samplePairs([0.25, 0.25, 0.25, 0.25], 4, () => draws[i++]),
    [1, 1, 1, 1],
  )
  assert.deepEqual(
    samplePairs([1, 0, 0, 0], 200, () => 0.99999),
    [200, 0, 0, 0],
  )
  assert.deepEqual(
    samplePairs(
      [0.5, 0, 0, 0.5],
      2,
      (() => {
        let j = 0
        return () => [0.49, 0.5][j++]
      })(),
    ),
    [1, 0, 0, 1],
  )
})
test('counting revealed bits conditions the ensemble and unequal probabilities reduce entropy without reducing support', () => {
  for (const bits of [2, 4])
    for (let revealed = 0; revealed <= bits; revealed++) {
      const m = countingModel(bits, revealed, 0.5)
      assert.equal(m.possibilities, 2 ** (bits - revealed))
      near(m.entropyBits, bits - revealed)
      near(
        m.rows.reduce((a, b) => a + b.probability, 0),
        1,
      )
      near(m.entropyNats, Math.log(m.possibilities))
    }
  const biased = countingModel(2, 0, 0.9)
  assert.equal(biased.possibilities, 4)
  near(biased.entropyBits, 2 * binaryEntropy(0.9))
  const known = countingModel(4, 4, 0.9)
  assert.equal(known.possibilities, 1)
  assert.equal(known.entropyBits, 0)
  for (const p of [0, 1]) {
    const m = countingModel(4, 0, p)
    assert.equal(m.possibilities, 1)
    assert.equal(m.entropyBits, 0)
  }
})
test('observation keys require appropriate state and action, not a preset alone', () => {
  const bell = { theta: 45, preparation: 'pure', basisA: 'Z', basisB: 'Z' }
  assert.deepEqual(observationKeys(0, bell, 'sample'), [])
  assert.deepEqual(observationKeys(1, bell, 'sample'), ['bell'])
  assert.deepEqual(observationKeys(2, { ...bell, basisA: 'X' }, 'sample'), [])
  assert.deepEqual(observationKeys(2, { ...bell, basisA: 'X', basisB: 'X' }, 'sample'), [
    'pure-X',
  ])
  assert.deepEqual(observationKeys(3, bell, 'sample'), [])
  assert.deepEqual(observationKeys(3, bell, 'local'), ['local'])
  assert.deepEqual(observationKeys(3, { ...bell, preparation: 'mixture' }, 'whole'), [])
})

test('a degenerate classical preparation at theta zero is also the product state for observations', () => {
  const product = { theta: 0, preparation: 'mixture', basisA: 'Z', basisB: 'Z' }
  assert.deepEqual(observationKeys(0, product, 'sample'), ['product'])
  assert.deepEqual(observationKeys(1, product, 'sample'), ['product'])
  assert.deepEqual(observationKeys(1, { ...product, theta: 45 }, 'sample'), [])
})
