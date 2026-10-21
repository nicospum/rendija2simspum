import { blackHole, C, G, HBAR, K, SOLAR_MASS } from '../hawking/physics.ts'

export { C, G, HBAR, K, SOLAR_MASS }
export const PLANCK_AREA = (HBAR * G) / C ** 3
export const REFERENCE_MASS = 10 // nominal solar masses; fixed visual reference
export const MIN_MASS = 5
export const MAX_MASS = 20
export const MAX_EMITTED = 0.5

/** Quasi-static Schwarzschild states, ideal photons into empty space.
 * Radiation entropy is coarse-grained thermal entropy, NOT a Page curve.
 * dS_rad = (4/3) dE/T, dS_BH = -dE/T => S_rad = (4/3)(S_initial-S_BH).
 */
export function entropyModel(initialSolar: number, emittedFraction = 0) {
  if (!Number.isFinite(initialSolar) || initialSolar < MIN_MASS || initialSolar > MAX_MASS)
    throw new RangeError('Masa inicial fuera de 5–20 masas solares')
  if (!Number.isFinite(emittedFraction) || emittedFraction < 0 || emittedFraction > MAX_EMITTED)
    throw new RangeError('Fracción emitida fuera de 0–50 %')
  const initial = blackHole(initialSolar * SOLAR_MASS)
  const current = blackHole(initial.massKg * (1 - emittedFraction))
  const reference = blackHole(REFERENCE_MASS * SOLAR_MASS)
  // Stable at tiny fractions: avoid subtracting almost equal large entropies.
  const lostFraction = emittedFraction * (2 - emittedFraction)
  const radiationOverK = (4 / 3) * initial.entropyOverK * lostFraction
  return {
    initial,
    current,
    reference,
    radiusRatio: current.radiusM / reference.radiusM,
    areaRatio: current.areaM2 / reference.areaM2,
    entropyRatio: current.entropyOverK / reference.entropyOverK,
    // Euclidean sphere with this areal radius; not a unique BH interior volume.
    associatedVolumeRatio: (current.radiusM / reference.radiusM) ** 3,
    planckAreas: current.areaM2 / PLANCK_AREA,
    entropyJK: K * current.entropyOverK,
    entropyBits: current.entropyOverK / Math.LN2,
    lostFraction,
    radiationOverK,
    totalOverK: current.entropyOverK + radiationOverK,
    totalGainOverK: (initial.entropyOverK * lostFraction) / 3,
    emittedEnergyJ: initial.massKg * C ** 2 * emittedFraction,
    // Same ideal photon blackbody model as the Hawking lab. No final-stage extrapolation.
    ageFraction: emittedFraction * (3 - 3 * emittedFraction + emittedFraction ** 2),
  }
}

/** Algebra exercise, not a Planck-sized black hole or measured horizon lattice. */
export function patchEntropy(planckAreas: number) {
  if (!Number.isInteger(planckAreas) || planckAreas < 4 || planckAreas > 64 || planckAreas % 4)
    throw new RangeError('El ejemplo usa múltiplos de 4 entre 4 y 64')
  return planckAreas / 4
}

export function entropyFromArea(areaM2: number) {
  if (!Number.isFinite(areaM2) || areaM2 < 0) throw new RangeError('Área no válida')
  const result = areaM2 / (4 * PLANCK_AREA)
  if (!Number.isFinite(result)) throw new RangeError('Entropía fuera del rango numérico')
  return result
}
