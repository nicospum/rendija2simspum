import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createState,
  curveFor,
  reducedSpectrum,
  entropyAt,
  densityPurity,
  singleRadiationEntropy,
  sumSingles,
  pageAverage,
} from '../src/maldacena/page/physics.ts'

const near = (a, b, eps = 1e-10) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`)
function vector(n, entries) {
  const real = new Float64Array(2 ** n),
    imag = new Float64Array(2 ** n)
  for (const [i, re, im = 0] of entries) {
    real[i] = re
    imag[i] = im
  }
  return { n, real, imag }
}

test('complex Gaussian state is normalized, reproducible and seed dependent', () => {
  const a = createState(8, 42),
    b = createState(8, 42),
    c = createState(8, 43)
  near(
    a.real.reduce((s, r, i) => s + r * r + a.imag[i] ** 2, 0),
    1,
  )
  assert.deepEqual(a, b)
  assert.notDeepEqual(a.real, c.real)
  assert.ok(a.imag.some((v) => Math.abs(v) > 0.05))
  assert.equal(createState(NaN, 0).n, 6)
  assert.equal(createState(100, 0).n, 8)
  assert.equal(createState(-100, 0).n, 4)
})

test('product states and a complex local phase remain pure after partial trace', () => {
  const product = vector(4, [[0, 1]])
  const y = vector(4, [
    [0, Math.SQRT1_2],
    [8, 0, Math.SQRT1_2],
  ])
  for (const state of [product, y])
    for (let k = 0; k <= 4; k++) {
      near(entropyAt(state, k), 0)
      near(densityPurity(state, k), 1)
    }
  near(singleRadiationEntropy(y, 4, 0), 0)
  near(sumSingles(y, 4), 0)
})

test('Schmidt eigenvalues and entropy agree with independent binary formula', () => {
  const p = 0.2
  const state = vector(4, [
    [0, Math.sqrt(p)],
    [12, 0, Math.sqrt(1 - p)],
  ])
  const expected = -p * Math.log2(p) - (1 - p) * Math.log2(1 - p)
  const values = reducedSpectrum(state, 1)
  near(values[0], p)
  near(values[1], 1 - p)
  near(entropyAt(state, 1), expected)
  near(entropyAt(state, 2), 0)
  near(singleRadiationEntropy(state, 4, 0), expected)
  near(singleRadiationEntropy(state, 4, 1), expected)
  near(singleRadiationEntropy(state, 4, 2), 0)
})

test('two crossed Bell pairs attain the dimension bound and GHZ does not follow a prefabricated triangle', () => {
  const bells = vector(4, [
    [0, 0.5],
    [6, 0.5],
    [9, 0.5],
    [15, 0.5],
  ])
  const ghz = vector(4, [
    [0, Math.SQRT1_2],
    [15, 0, Math.SQRT1_2],
  ])
  for (let k = 0; k <= 4; k++) {
    near(entropyAt(bells, k), Math.min(k, 4 - k))
    near(entropyAt(ghz, k), k === 0 || k === 4 ? 0 : 1)
  }
  near(densityPurity(bells, 2), 0.25)
  near(sumSingles(bells, 4), 4)
  near(sumSingles(ghz, 4), 4)
  assert.equal(entropyAt(bells, 4), 0)
})

// Direct full-R partial trace, without choosing the smaller complement or eigenvalues.
function directRadiationPurity(state, k) {
  const dR = 2 ** k,
    dB = 2 ** (state.n - k)
  let result = 0
  for (let a = 0; a < dR; a++)
    for (let b = 0; b < dR; b++) {
      let re = 0,
        im = 0
      for (let j = 0; j < dB; j++) {
        const x = a * dB + j,
          y = b * dB + j
        re += state.real[x] * state.real[y] + state.imag[x] * state.imag[y]
        im += state.imag[x] * state.real[y] - state.real[x] * state.imag[y]
      }
      result += re * re + im * im
    }
  return result
}
test('eigenspectrum purity agrees with independent full radiation partial trace on both sides', () => {
  for (const seed of [1, 17, 943]) {
    const state = createState(6, seed)
    for (let k = 0; k <= 6; k++) {
      const eigenvalues = reducedSpectrum(state, k)
      near(
        eigenvalues.reduce((a, b) => a + b, 0),
        1,
      )
      assert.ok(eigenvalues.every((v) => v >= 0 && v <= 1))
      near(densityPurity(state, k), directRadiationPurity(state, k), 2e-10)
      assert.ok(entropyAt(state, k) <= Math.min(k, 6 - k) + 1e-10)
      assert.ok(sumSingles(state, k) >= entropyAt(state, k) - 1e-10)
    }
  }
})

test('Page mean is the harmonic ensemble expression, symmetric and below its dimensional bound', () => {
  // For m=2,n=8: sum_{j=9}^{16} 1/j - 1/16, converted to bits.
  let independent = -1 / 16
  for (let j = 9; j <= 16; j++) independent += 1 / j
  near(pageAverage(4, 1), independent / Math.LN2)
  for (const n of [4, 5, 6, 7, 8])
    for (let k = 0; k <= n; k++) {
      near(pageAverage(n, k), pageAverage(n, n - k))
      assert.ok(pageAverage(n, k) <= Math.min(k, n - k) + 1e-12)
      assert.ok(pageAverage(n, k) >= 0)
    }
  near(pageAverage(8, 0), 0)
  near(pageAverage(8, 8), 0)
})

test('fixed ensemble sample approaches complex Page mean, without equating an individual seed to it', () => {
  const count = 192
  let sum = 0
  for (let seed = 1; seed <= count; seed++) sum += entropyAt(createState(4, seed), 2)
  near(sum / count, pageAverage(4, 2), 0.045)
  assert.ok(Math.abs(entropyAt(createState(4, 1), 2) - pageAverage(4, 2)) > 1e-5)
})

test('curves calculate each partition and keep thermal hypothesis separate from exact pure state', () => {
  const a = curveFor(8, 42),
    b = curveFor(8, 43)
  assert.equal(a.points.length, 9)
  assert.notDeepEqual(
    a.points.map((p) => p.entropy),
    b.points.map((p) => p.entropy),
  )
  for (const [k, p] of a.points.entries()) {
    near(p.entropy, entropyAt(a.state, k))
    assert.equal(p.thermal, k)
    assert.equal(p.remaining, 8 - k)
    assert.equal(p.bound, Math.min(k, 8 - k))
  }
  assert.equal(a.points[8].entropy, 0)
  assert.equal(a.points[8].thermal, 8)
  assert.ok(sumSingles(a.state, 8) > 7)
})

test('invalid custom states fail explicitly; partition count stays within the system', () => {
  assert.throws(() => entropyAt(vector(4, []), 2), RangeError)
  assert.throws(() => entropyAt(vector(4, [[0, NaN]]), 2), RangeError)
  assert.throws(
    () => entropyAt({ n: 4, real: new Float64Array(3), imag: new Float64Array(3) }, 2),
    RangeError,
  )
  const state = createState(4, 1)
  assert.equal(entropyAt(state, -10), 0)
  assert.equal(entropyAt(state, 100), 0)
  assert.equal(entropyAt(state, NaN), 0)
  assert.throws(() => singleRadiationEntropy(state, 2, 3), RangeError)
})
