export type Angles = [number, number, number, number]
export type Counts = [number, number, number, number]
export type Pair = 0 | 1 | 2 | 3
export const PAIRS = [
  [0, 2],
  [0, 3],
  [1, 2],
  [1, 3],
] as const
export const PAIR_LABELS = ['A₀B₀', 'A₀B₁', 'A₁B₀', 'A₁B₁'] as const
export const BELL_ANGLES: Angles = [0, 45, 22.5, -22.5]
export const SAME_ANGLES: Angles = [0, 45, 0, -22.5]
export const ALPHA = 0.05
export function validateAngles(angles: readonly number[]): asserts angles is Angles {
  if (angles.length !== 4 || angles.some((v) => !Number.isFinite(v) || v < -90 || v > 90))
    throw new RangeError('Cuatro orientaciones entre −90° y 90°.')
}
export function probabilities(a: number, b: number): Counts {
  if (![a, b].every(Number.isFinite)) throw new RangeError('Orientación no finita.')
  const same = Math.cos((((a % 180) - (b % 180)) * Math.PI) / 180) ** 2 / 2
  return [same, 0.5 - same, 0.5 - same, same]
}
export function quantum(angles: Angles) {
  validateAngles(angles)
  const correlations = PAIRS.map(([i, j]) =>
    Math.cos((2 * (angles[i] - angles[j]) * Math.PI) / 180),
  )
  return {
    correlations,
    S: correlations[0] + correlations[1] + correlations[2] - correlations[3],
  }
}
export function card(index: number) {
  if (!Number.isInteger(index) || index < 0 || index > 15)
    throw new RangeError('Tarjeta inválida.')
  const answers = [0, 1, 2, 3].map((i) => (index & (1 << i) ? 1 : -1))
  const correlations = PAIRS.map(([i, j]) => answers[i] * answers[j])
  return {
    answers,
    correlations,
    brackets: [answers[2] + answers[3], answers[2] - answers[3]],
    S: correlations[0] + correlations[1] + correlations[2] - correlations[3],
  }
}
/** Card and global complement, mixed equally and independently of settings. */
export function localProbabilities(index: number, pair: Pair): Counts {
  if (!PAIRS[pair]) throw new RangeError('Combinación inválida.')
  const c = card(index),
    [i, j] = PAIRS[pair]
  const counts: Counts = [0, 0, 0, 0]
  for (const sign of [-1, 1]) {
    const a = c.answers[i] * sign,
      b = c.answers[j] * sign
    counts[(a === 1 ? 0 : 2) + (b === 1 ? 0 : 1)] += 0.5
  }
  return counts
}
export function stats(counts: Counts) {
  if (counts.length !== 4 || counts.some((v) => !Number.isSafeInteger(v) || v < 0))
    throw new RangeError('Conteos inválidos.')
  const N = counts.reduce((a, b) => a + b, 0)
  if (!Number.isSafeInteger(N)) throw new RangeError('Demasiados conteos.')
  const same = counts[0] + counts[3],
    different = counts[1] + counts[2]
  return {
    N,
    same,
    different,
    E: N ? (same - different) / N : null,
    aPlus: N ? (counts[0] + counts[1]) / N : null,
    bPlus: N ? (counts[0] + counts[2]) / N : null,
  }
}
export function randomFromSeed(seed: number) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295)
    throw new RangeError('Semilla inválida.')
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), state | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export function sampleLot(a: number, b: number, N: number, seed: number) {
  if (!Number.isInteger(N) || N < 1 || N > 4096)
    throw new RangeError('Lote de 1 a 4096 pares.')
  const p = probabilities(a, b),
    rng = randomFromSeed(seed),
    counts: Counts = [0, 0, 0, 0]
  let last = 0
  for (let k = 0; k < N; k++) {
    const r = rng()
    let cumulative = 0,
      outcome = 3
    for (let i = 0; i < 4; i++) {
      cumulative += p[i]
      if (r < cumulative) {
        outcome = i
        break
      }
    }
    counts[outcome]++
    last = outcome
  }
  return { counts, last }
}
export const sample = (a: number, b: number, N: number, seed: number): Counts =>
  sampleLot(a, b, N, seed).counts
export function interval(rows: readonly Counts[], alpha = ALPHA) {
  if (rows.length !== 4 || !Number.isFinite(alpha) || alpha <= 0 || alpha >= 1)
    throw new RangeError('Ensayo o nivel inválido.')
  const values = rows.map(stats)
  if (values.some((v) => !v.N)) return null
  const es = values.map((v) => v.E!)
  const estimate = es[0] + es[1] + es[2] - es[3]
  // Simultaneous, two-sided Hoeffding bounds on four fixed-size batches.
  const bounds = es.map((e, i) => {
    const radius = Math.sqrt((2 * Math.log(8 / alpha)) / values[i].N)
    return [Math.max(-1, e - radius), Math.min(1, e + radius)]
  })
  return {
    estimate,
    lower: Math.max(-4, bounds[0][0] + bounds[1][0] + bounds[2][0] - bounds[3][1]),
    upper: Math.min(4, bounds[0][1] + bounds[1][1] + bounds[2][1] - bounds[3][0]),
    alpha,
  }
}
export interface Sweep {
  angles: Angles
  n: 50 | 1000
  rows: Counts[]
}
export function sweep(angles: Angles, n: 50 | 1000, seed: number): Sweep {
  validateAngles(angles)
  if (n !== 50 && n !== 1000) throw new RangeError('Tamaño de ensayo inválido.')
  const rng = randomFromSeed(seed)
  return {
    angles: [...angles],
    n,
    rows: PAIRS.map(([i, j]) =>
      sample(angles[i], angles[j], n, Math.floor(rng() * 4294967296)),
    ),
  }
}
