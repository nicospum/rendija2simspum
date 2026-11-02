/** Finite-dimensional information model, not a gravitational evaporation solver.
 * The first k (most significant) qubits form R; the other N-k form B.
 * One pure complex state is held fixed while the bipartition changes.
 */
export interface PureState {
  n: number
  real: Float64Array
  imag: Float64Array
}

export interface PagePoint {
  emitted: number
  entropy: number
  average: number
  bound: number
  thermal: number
  remaining: number
}

const integer = (value: number, min: number, max: number, fallback: number) =>
  Number.isFinite(value) ? Math.max(min, Math.min(max, Math.round(value))) : fallback

/** Reproducible pseudorandom numbers; not intended for cryptographic use. */
function generator(seed: number) {
  let value = (Number.isFinite(seed) ? Math.floor(seed) : 1) >>> 0
  return () => {
    value = (value + 0x6d2b79f5) >>> 0
    let t = value
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Normalized complex Gaussian vectors give the Haar distribution of pure states. */
export function createState(n: number, seed: number): PureState {
  n = integer(n, 4, 8, 6)
  const real = new Float64Array(2 ** n),
    imag = new Float64Array(2 ** n)
  const random = generator(seed)
  let norm = 0
  for (let i = 0; i < real.length; i++) {
    const radius = Math.sqrt(-2 * Math.log(1 - random()))
    const angle = 2 * Math.PI * random()
    real[i] = radius * Math.cos(angle)
    imag[i] = radius * Math.sin(angle)
    norm += radius * radius
  }
  const inverseNorm = 1 / Math.sqrt(norm)
  for (let i = 0; i < real.length; i++) {
    real[i] *= inverseNorm
    imag[i] *= inverseNorm
  }
  return { n, real, imag }
}

function validate(state: PureState) {
  if (
    !Number.isInteger(state.n) ||
    state.n < 1 ||
    state.n > 8 ||
    state.real.length !== 2 ** state.n ||
    state.imag.length !== state.real.length
  )
    throw new RangeError('Expected a normalized state of one to eight qubits')
  let norm = 0
  for (let i = 0; i < state.real.length; i++)
    norm += state.real[i] ** 2 + state.imag[i] ** 2
  if (!Number.isFinite(norm) || Math.abs(norm - 1) > 1e-8)
    throw new RangeError('Pure-state amplitudes must be finite and normalized')
}

/** Eigenvalues of a small real symmetric matrix, by cyclic Jacobi rotations. */
function symmetricEigenvalues(matrix: Float64Array, size: number) {
  const a = matrix.slice()
  for (let sweep = 0; sweep < 64; sweep++) {
    let largest = 0
    for (let p = 0; p < size - 1; p++)
      for (let q = p + 1; q < size; q++) {
        const off = a[p * size + q]
        largest = Math.max(largest, Math.abs(off))
        if (Math.abs(off) < 1e-14) continue
        const tau = (a[q * size + q] - a[p * size + p]) / (2 * off)
        const tangent = (tau >= 0 ? 1 : -1) / (Math.abs(tau) + Math.hypot(1, tau))
        const cosine = 1 / Math.hypot(1, tangent),
          sine = tangent * cosine
        for (let r = 0; r < size; r++) {
          if (r === p || r === q) continue
          const rp = a[r * size + p],
            rq = a[r * size + q]
          a[r * size + p] = a[p * size + r] = cosine * rp - sine * rq
          a[r * size + q] = a[q * size + r] = sine * rp + cosine * rq
        }
        a[p * size + p] -= tangent * off
        a[q * size + q] += tangent * off
        a[p * size + q] = a[q * size + p] = 0
      }
    if (largest < 1e-13)
      return Array.from({ length: size }, (_, i) => a[i * size + i]).sort((x, y) => x - y)
  }
  throw new RangeError('Reduced-state eigensolver did not converge')
}

/** Trace out the complementary basis. `selected` indexes the subsystem basis. */
function spectrumFor(
  state: PureState,
  dimension: number,
  environment: number,
  index: (selected: number, rest: number) => number,
) {
  const size = 2 * dimension
  const embedded = new Float64Array(size * size)
  for (let i = 0; i < dimension; i++)
    for (let j = i; j < dimension; j++) {
      let re = 0,
        im = 0
      for (let rest = 0; rest < environment; rest++) {
        const a = index(i, rest),
          b = index(j, rest)
        re += state.real[a] * state.real[b] + state.imag[a] * state.imag[b]
        im += state.imag[a] * state.real[b] - state.real[a] * state.imag[b]
      }
      // A Hermitian H maps to the real symmetric block matrix [Re H, -Im H; Im H, Re H].
      embedded[i * size + j] = embedded[j * size + i] = re
      embedded[(i + dimension) * size + j + dimension] = embedded[
        (j + dimension) * size + i + dimension
      ] = re
      embedded[(i + dimension) * size + j] = embedded[j * size + i + dimension] = im
      embedded[i * size + j + dimension] = embedded[(j + dimension) * size + i] = -im
    }
  const duplicated = symmetricEigenvalues(embedded, size)
  const eigenvalues = Array.from({ length: dimension }, (_, i) => {
    const value = (duplicated[2 * i] + duplicated[2 * i + 1]) / 2
    if (value < -1e-10) throw new RangeError('Reduced-state spectrum is not positive')
    return Math.max(0, value)
  })
  const trace = eigenvalues.reduce((a, b) => a + b, 0)
  return eigenvalues.map((p) => p / trace)
}

/** Nonzero Schmidt eigenvalues; choosing the smaller side keeps matrices at most 16×16. */
export function reducedSpectrum(state: PureState, emitted: number) {
  validate(state)
  const k = integer(emitted, 0, state.n, 0)
  if (k === 0 || k === state.n) return [1]
  const radiation = 2 ** k,
    interior = 2 ** (state.n - k)
  return radiation <= interior
    ? spectrumFor(state, radiation, interior, (r, b) => r * interior + b)
    : spectrumFor(state, interior, radiation, (b, r) => r * interior + b)
}

function entropy(probabilities: readonly number[]) {
  return Math.max(
    0,
    -probabilities.reduce((sum, p) => sum + (p > 0 ? p * Math.log2(p) : 0), 0),
  )
}
export function entropyAt(state: PureState, emitted: number) {
  return entropy(reducedSpectrum(state, emitted))
}
export function densityPurity(state: PureState, emitted: number) {
  return reducedSpectrum(state, emitted).reduce((sum, p) => sum + p * p, 0)
}

/** Single-qubit reduced entropy. Index zero means the first/most significant qubit. */
export function singleRadiationEntropy(state: PureState, emitted: number, index: number) {
  validate(state)
  const k = integer(emitted, 0, state.n, 0)
  if (!Number.isInteger(index) || index < 0 || index >= k)
    throw new RangeError('Choose a qubit already included in R')
  const shift = state.n - index - 1
  const mask = 2 ** shift
  return entropy(
    spectrumFor(state, 2, 2 ** (state.n - 1), (selected, rest) => {
      const lower = rest % mask,
        upper = Math.floor(rest / mask)
      return upper * mask * 2 + selected * mask + lower
    }),
  )
}
export function sumSingles(state: PureState, emitted: number) {
  validate(state)
  const k = integer(emitted, 0, state.n, 0)
  let sum = 0
  for (let i = 0; i < k; i++) sum += singleRadiationEntropy(state, k, i)
  return sum
}

/** Page's exact Haar-complex mean, converted from nats to bits.
 * This is an ensemble expectation, not a prediction for each individual seed.
 */
export function pageAverage(n: number, emitted: number) {
  n = integer(n, 4, 8, 6)
  const k = integer(emitted, 0, n, 0)
  const m = 2 ** Math.min(k, n - k),
    bigger = 2 ** Math.max(k, n - k)
  let harmonicDifference = 0
  for (let j = bigger + 1; j <= m * bigger; j++) harmonicDifference += 1 / j
  return Math.max(0, (harmonicDifference - (m - 1) / (2 * bigger)) / Math.LN2)
}

export function curveFor(n: number, seed: number) {
  const state = createState(n, seed)
  const points: PagePoint[] = Array.from({ length: state.n + 1 }, (_, k) => ({
    emitted: k,
    entropy: entropyAt(state, k),
    average: pageAverage(state.n, k),
    bound: Math.min(k, state.n - k),
    // Independent maximally mixed emitted qubits: a comparison hypothesis, not S_BH.
    thermal: k,
    remaining: state.n - k,
  }))
  return { state, points }
}
