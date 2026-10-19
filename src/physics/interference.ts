/**
 * Ideal, scaled Fraunhofer model of equally illuminated rectangular slits.
 * Every length uses the same normalized unit u. The transverse coordinate uses
 * the paraxial Fourier-plane relation z/L; this is not a time-dependent
 * Schrödinger solver or a prediction of a particle's hidden trajectory.
 *
 * Each slit contributes sinc(π a z / λL) exp(i 2π z_j z / λL).
 * detectorStrength is the fraction of an ideal ensemble with path information:
 * those events add probabilities; the rest add amplitudes. It is not Englert's
 * distinguishability D. Particle species at equal wavelength have the same
 * ideal spatial distribution.
 */
export type ParticleType = 'electron' | 'photon' | 'neutron'

export interface Config {
  slitCount: number
  slitWidth: number
  slitSeparation: number
  wavelength: number
  screenDistance: number
  detectorStrength: number
  particleType: ParticleType
}

export const DEFAULT_CONFIG: Readonly<Config> = Object.freeze({
  slitCount: 2,
  slitWidth: 0.065,
  slitSeparation: 0.3,
  wavelength: 0.05,
  screenDistance: 3.5,
  detectorStrength: 0,
  particleType: 'electron',
})

export const CONFIG_LIMITS = {
  slitCount: { min: 1, max: 5, step: 1 },
  slitWidth: { min: 0.025, max: 0.16, step: 0.005 },
  slitSeparation: { min: 0.16, max: 0.6, step: 0.01 },
  wavelength: { min: 0.025, max: 0.1, step: 0.005 },
  screenDistance: { min: 2, max: 6, step: 0.1 },
  detectorStrength: { min: 0, max: 1, step: 0.05 },
} as const

type NumericParameter = keyof typeof CONFIG_LIMITS

function numberInRange(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : Math.min(max, Math.max(min, fallback))
}

function isParticleType(value: unknown): value is ParticleType {
  return value === 'electron' || value === 'photon' || value === 'neutron'
}

/** Clamp controls, reject nonfinite values, and keep slit apertures disjoint. */
export function normalizeConfig(
  patch: Partial<Config>,
  base: Readonly<Config> = DEFAULT_CONFIG,
): Config {
  const numeric = (key: NumericParameter) => {
    const { min, max } = CONFIG_LIMITS[key]
    const fallback = numberInRange(base[key], DEFAULT_CONFIG[key], min, max)
    return numberInRange(patch[key], fallback, min, max)
  }
  const slitSeparation = numeric('slitSeparation')
  return {
    slitCount: Math.round(numeric('slitCount')),
    slitWidth: Math.min(numeric('slitWidth'), slitSeparation - 0.02),
    slitSeparation,
    wavelength: numeric('wavelength'),
    screenDistance: numeric('screenDistance'),
    detectorStrength: numeric('detectorStrength'),
    particleType: isParticleType(patch.particleType)
      ? patch.particleType
      : isParticleType(base.particleType)
        ? base.particleType
        : DEFAULT_CONFIG.particleType,
  }
}

export function slitCenters(config: Config): number[] {
  const { slitCount, slitSeparation } = normalizeConfig(config)
  return Array.from(
    { length: slitCount },
    (_, index) => (index - (slitCount - 1) / 2) * slitSeparation,
  )
}

function intensityForConfig(z: number, config: Config): number {
  if (!Number.isFinite(z)) return 0
  const spatialFrequency = z / (config.wavelength * config.screenDistance)
  const beta = Math.PI * config.slitWidth * spatialFrequency
  const sinc = Math.abs(beta) < 1e-8 ? 1 : Math.sin(beta) / beta
  let real = 0
  let imaginary = 0
  for (let index = 0; index < config.slitCount; index++) {
    const center = (index - (config.slitCount - 1) / 2) * config.slitSeparation
    const phase = 2 * Math.PI * center * spatialFrequency
    real += Math.cos(phase)
    imaginary += Math.sin(phase)
  }
  // Division by N gives equal incident flux per transmitted quantum. Coherent
  // central intensity is N; incoherent central intensity is 1. Both retain the
  // single-slit envelope, unlike a switch from waves to ballistic bullets.
  const coherent = (real * real + imaginary * imaginary) / config.slitCount
  return Math.max(
    0,
    sinc * sinc * ((1 - config.detectorStrength) * coherent + config.detectorStrength),
  )
}

/** Relative intensity, not a probability density normalized on a finite screen. */
export function intensityAt(z: number, config: Config): number {
  return intensityForConfig(z, normalizeConfig(config))
}

export interface Distribution {
  positions: number[]
  probabilities: number[]
  cdf: number[]
  halfWidth: number
  binWidth: number
}

export const DISTRIBUTION_BINS = 4096

/**
 * Conditional probabilities for detections on the visible screen. Adaptive
 * midpoint quadrature integrates each bin. Sampling only its centre would
 * alias the narrow peaks of five slits at short wavelengths. This calculation
 * runs when the physical setup changes, never for each detection.
 */
export function buildDistribution(
  config: Config,
  bins = DISTRIBUTION_BINS,
  halfWidth = 3,
): Distribution {
  const normalized = normalizeConfig(config)
  const count = Math.round(numberInRange(bins, DISTRIBUTION_BINS, 1, 16384))
  const extent = numberInRange(halfWidth, 3, 0.01, 100)
  const binWidth = (2 * extent) / count
  const spacing = (normalized.wavelength * normalized.screenDistance) / normalized.slitSeparation
  const subdivisions = Math.max(
    1,
    Math.min(256, Math.ceil(((binWidth * normalized.slitCount) / spacing) * 16)),
  )
  const positions = Array.from({ length: count }, (_, index) => -extent + (index + 0.5) * binWidth)
  const weights = positions.map((z) => {
    let integral = 0
    for (let sample = 0; sample < subdivisions; sample++) {
      integral += intensityForConfig(
        z - binWidth / 2 + ((sample + 0.5) * binWidth) / subdivisions,
        normalized,
      )
    }
    return integral / subdivisions
  })
  const total = weights.reduce((sum, value) => sum + value, 0)
  const probabilities = weights.map((value) => (total > 0 ? value / total : 1 / count))
  let cumulative = 0
  const cdf = probabilities.map((probability) => {
    cumulative += probability
    return Math.min(1, cumulative)
  })
  cdf[count - 1] = 1
  return { positions, probabilities, cdf, halfWidth: extent, binWidth }
}

/** Inverse-CDF sampling, continuous within each screen bin. */
export function sampleImpact(distribution: Distribution, rng: () => number = Math.random): number {
  const random = rng()
  const quantile = Number.isFinite(random) ? Math.min(1 - Number.EPSILON, Math.max(0, random)) : 0.5
  let low = 0
  let high = distribution.cdf.length - 1
  while (low < high) {
    const middle = (low + high) >>> 1
    if (distribution.cdf[middle] <= quantile) low = middle + 1
    else high = middle
  }
  const previous = low === 0 ? 0 : distribution.cdf[low - 1]
  const probability = distribution.probabilities[low]
  const fraction =
    probability > 0 ? Math.min(1, Math.max(0, (quantile - previous) / probability)) : 0.5
  return -distribution.halfWidth + (low + fraction) * distribution.binWidth
}

/** Paraxial spacing between adjacent principal interference orders, in u. */
export function fringeSpacing(config: Config): number {
  const normalized = normalizeConfig(config)
  return (normalized.wavelength * normalized.screenDistance) / normalized.slitSeparation
}
