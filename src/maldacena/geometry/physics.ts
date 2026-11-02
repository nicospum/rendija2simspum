/** A constant-time Poincaré slice of AdS3. Natural units: L = ℏ = c_light = 1. */
export const ADS_LENGTH = 1
export const CENTRAL_CHARGE = 60
export const G3 = (3 * ADS_LENGTH) / (2 * CENTRAL_CHARGE)
export const ENTROPY_AXIS_MAX = 110
export const MIN_INTERVAL = 1.4
export const MAX_INTERVAL = 4
export const MIN_CUTOFF = 0.02
export const MAX_CUTOFF = 0.4
export interface GeometrySettings {
  interval: number
  center: number
  cutoff: number
}
export const DEFAULT: GeometrySettings = {
  interval: 2,
  center: 0,
  cutoff: 0.2,
}

function finiteClamp(
  value: number,
  min: number,
  max: number,
  fallback: number,
) {
  return Number.isFinite(value)
    ? Math.max(min, Math.min(max, value))
    : fallback
}
export function settings(
  input: Partial<GeometrySettings> = {},
): GeometrySettings {
  return {
    interval: finiteClamp(
      input.interval ?? DEFAULT.interval,
      MIN_INTERVAL,
      MAX_INTERVAL,
      DEFAULT.interval,
    ),
    center: finiteClamp(
      input.center ?? DEFAULT.center,
      -1,
      1,
      DEFAULT.center,
    ),
    cutoff: finiteClamp(
      input.cutoff ?? DEFAULT.cutoff,
      MIN_CUTOFF,
      MAX_CUTOFF,
      DEFAULT.cutoff,
    ),
  }
}

/** Both endpoints are at finite z=epsilon. This is not a truncated ideal-boundary arc. */
export function geodesic(
  interval: number,
  cutoff: number,
  curvature = ADS_LENGTH,
) {
  if (
    ![interval, cutoff, curvature].every(Number.isFinite) ||
    interval <= 0 ||
    cutoff <= 0 ||
    curvature <= 0
  )
    throw new RangeError(
      'Interval, cutoff and AdS length must be positive and finite',
    )
  const radius = Math.hypot(interval / 2, cutoff)
  const angle = Math.atan2(cutoff, interval / 2)
  return {
    radius,
    angle,
    length: 2 * curvature * Math.asinh(interval / (2 * cutoff)),
    straightLength: (curvature * interval) / cutoff,
  }
}

/** Independent quadrature of ds=L dθ/sinθ along the regulated circle. */
export function numericalLength(
  interval: number,
  cutoff: number,
  curvature = ADS_LENGTH,
  segments = 8192,
) {
  const { angle } = geodesic(interval, cutoff, curvature)
  const count = Math.ceil(finiteClamp(segments, 4, 16384, 8192) / 2) * 2
  const h = (Math.PI - 2 * angle) / count
  let sum = 0
  for (let i = 0; i <= count; i++) {
    const theta = angle + i * h
    sum +=
      ((i === 0 || i === count ? 1 : i % 2 ? 4 : 2) * curvature) /
      Math.sin(theta)
  }
  return (h * sum) / 3
}

export function model(raw: GeometrySettings) {
  const s = settings(raw)
  const curve = geodesic(s.interval, s.cutoff)
  const lengthNumeric = numericalLength(s.interval, s.cutoff)
  const cft = (CENTRAL_CHARGE / 3) * Math.log(s.interval / s.cutoff)
  const bulk = curve.length / (4 * G3)
  return {
    ...s,
    ...curve,
    left: s.center - s.interval / 2,
    right: s.center + s.interval / 2,
    lengthNumeric,
    numericalError: Math.abs(lengthNumeric - curve.length),
    cft,
    bulk,
    difference: bulk - cft,
    relativeDifference: (bulk - cft) / cft,
    // Same regulator and additive convention for the two intervals.
    deltaCft:
      (CENTRAL_CHARGE / 3) * Math.log(s.interval / DEFAULT.interval),
    deltaBulk:
      (geodesic(s.interval, s.cutoff).length -
        geodesic(DEFAULT.interval, s.cutoff).length) /
      (4 * G3),
  }
}

/** Sample in the angle parameter, not in proper distance or elapsed time. */
export function curvePoints(raw: GeometrySettings, count = 100) {
  const s = settings(raw),
    curve = geodesic(s.interval, s.cutoff)
  return Array.from({ length: count + 1 }, (_, index) => {
    const progress = index / count
    const theta =
      Math.PI - curve.angle - progress * (Math.PI - 2 * curve.angle)
    return {
      x: s.center + curve.radius * Math.cos(theta),
      z: curve.radius * Math.sin(theta),
      length:
        ADS_LENGTH *
        Math.log(
          Math.tan((Math.PI - curve.angle) / 2) / Math.tan(theta / 2),
        ),
      progress,
    }
  })
}

export function intervalFromEndpoint(
  raw: GeometrySettings,
  side: 'left' | 'right',
  x: number,
) {
  if (!Number.isFinite(x)) return settings(raw)
  // Opposite endpoint stays fixed whenever the allowed bounds permit it.
  const s = settings(raw),
    opposite = s.center + ((side === 'left' ? 1 : -1) * s.interval) / 2
  const interval = finiteClamp(
    side === 'left' ? opposite - x : x - opposite,
    MIN_INTERVAL,
    MAX_INTERVAL,
    s.interval,
  )
  return settings({
    ...s,
    interval,
    center: opposite + ((side === 'left' ? -1 : 1) * interval) / 2,
  })
}
