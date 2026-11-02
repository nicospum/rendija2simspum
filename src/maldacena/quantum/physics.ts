export type Preparation = 'pure' | 'mixture'
export type Basis = 'Z' | 'X'
const bounded = (v: number, min: number, max: number, fallback: number) =>
  Number.isFinite(v) ? Math.max(min, Math.min(max, v)) : fallback

/** Shannon/von Neumann binary entropy, in bits, with 0 log 0 = 0. */
export function binaryEntropy(p: number) {
  p = bounded(p, 0, 1, 0.5)
  if (p === 0 || p === 1) return 0
  return -(p === 0 ? 0 : p * Math.log2(p)) - (p === 1 ? 0 : (1 - p) * Math.log2(1 - p))
}
export function quantumModel(
  thetaDegrees: number,
  preparation: Preparation,
  basisA: Basis,
  basisB: Basis,
) {
  const theta = (bounded(thetaDegrees, 0, 45, 45) * Math.PI) / 180
  const p = Math.cos(theta) ** 2
  const vectors = (basis: Basis) =>
    basis === 'Z'
      ? [
          [1, 0],
          [0, 1],
        ]
      : [
          [Math.SQRT1_2, Math.SQRT1_2],
          [-Math.SQRT1_2, Math.SQRT1_2],
        ]
  const a = vectors(basisA),
    b = vectors(basisB)
  const probabilities = [0, 1, 2, 3].map((i) => {
    const u = a[Math.floor(i / 2)],
      v = b[i % 2]
    const x = Math.sqrt(p) * u[0] * v[0],
      y = Math.sqrt(1 - p) * u[1] * v[1]
    return preparation === 'pure' ? (x + y) ** 2 : x * x + y * y
  })
  const localEntropy = binaryEntropy(p)
  return {
    p,
    probabilities,
    localEntropy,
    totalEntropy: preparation === 'pure' ? 0 : localEntropy,
    // Marginal sums can exceed one by roundoff (for example |00> in Z/X).
    // Keep physical probabilities bounded before displaying their complements.
    probabilityA0: bounded(probabilities[0] + probabilities[1], 0, 1, 0),
    probabilityB0: bounded(probabilities[0] + probabilities[2], 0, 1, 0),
    same: probabilities[0] + probabilities[3],
  }
}

/** A new pair is prepared for each draw; this is not repeated measurement of one pair. */
export function samplePairs(
  probabilities: readonly number[],
  count: number,
  random: () => number = Math.random,
) {
  const counts = [0, 0, 0, 0]
  for (let i = 0; i < Math.max(0, Math.min(4096, Math.floor(count))); i++) {
    const r = bounded(random(), 0, 1 - Number.EPSILON, 0)
    let cumulative = 0,
      outcome = 3
    for (let j = 0; j < 4; j++) {
      cumulative += probabilities[j]
      if (r < cumulative) {
        outcome = j
        break
      }
    }
    counts[outcome]++
  }
  return counts
}
export function countingModel(bits: number, revealed: number, probabilityOne: number) {
  bits = Math.round(bounded(bits, 2, 4, 4))
  revealed = Math.round(bounded(revealed, 0, bits, 0))
  const p = bounded(probabilityOne, 0, 1, 0.5),
    hidden = bits - revealed
  const rows = Array.from({ length: 2 ** hidden }, (_, i) => {
    const value = i.toString(2).padStart(hidden, '0')
    const ones = hidden === 0 ? 0 : [...value].filter((x) => x === '1').length
    const probability = p ** ones * (1 - p) ** (hidden - ones)
    return { value: hidden === 0 ? '—' : value, probability }
  })
  return {
    hidden,
    rows,
    possibilities: rows.filter((row) => row.probability > 0).length,
    entropyBits: hidden * binaryEntropy(p),
    entropyNats: hidden * binaryEntropy(p) * Math.LN2,
  }
}
export interface QuantumState {
  theta: number
  preparation: Preparation
  basisA: Basis
  basisB: Basis
}
export function observationKeys(
  lesson: number,
  state: QuantumState,
  action: 'sample' | 'local' | 'whole',
) {
  const bell = Math.abs(state.theta - 45) < 1e-9
  if (action === 'sample') {
    if (
      lesson === 0 &&
      state.theta === 0 &&
      state.basisA === 'Z' &&
      state.basisB === 'Z'
    )
      return ['product']
    if (
      lesson === 1 &&
      state.basisA === 'Z' &&
      state.basisB === 'Z'
    )
      return state.theta === 0
        ? ['product']
        : bell && state.preparation === 'pure'
          ? ['bell']
          : []
    if (lesson === 2 && bell && state.basisA === state.basisB)
      return [`${state.preparation}-${state.basisA}`]
  }
  if (lesson === 3 && bell && state.preparation === 'pure' && action !== 'sample')
    return [action]
  return []
}
