/** Spherical, nonrotating Earth; Schwarzschild static frame. SI. Reference clock fixed at R. */
export const C = 299_792_458
export const GM = 3.986004418e14
export const R = 6_378_137
export const DAY = 86_400
export const RS = (2 * GM) / C ** 2
export interface Setup {
  mode: 'torre' | 'gps'
  height: number
  motion: 'quieto' | 'circular' | 'manual'
  speed: number
  days: number
  progress: number
  corrected: boolean
  expanded: boolean
}
export const DEFAULT: Setup = {
  mode: 'torre',
  height: 100,
  motion: 'quieto',
  speed: 0,
  days: 1,
  progress: 0,
  corrected: false,
  expanded: true,
}
export const GPS: Setup = {
  ...DEFAULT,
  mode: 'gps',
  height: 20_200_000,
  motion: 'circular',
}
export function validate(s: Setup) {
  if (
    !['torre', 'gps'].includes(s.mode) ||
    !['quieto', 'circular', 'manual'].includes(s.motion) ||
    ![s.height, s.speed, s.days, s.progress].every(Number.isFinite) ||
    s.height < 0 ||
    s.speed < 0 ||
    s.speed > 8000 ||
    s.days < 1 ||
    s.days > 7 ||
    s.progress < 0 ||
    s.progress > 1 ||
    typeof s.corrected !== 'boolean' ||
    typeof s.expanded !== 'boolean' ||
    (s.mode === 'torre' &&
      (s.height > 4000 || s.motion !== 'quieto' || s.corrected)) ||
    (s.mode === 'gps' && (s.height < 400_000 || s.height > 36_000_000))
  )
    throw new RangeError('Configuración de relojes inválida.')
}
export function rates(s: Setup) {
  validate(s)
  const radius = R + s.height,
    alpha = Math.sqrt(1 - RS / radius),
    referenceAlpha = Math.sqrt(1 - RS / R)
  // Rationalized differences preserve even a micrometre elevation without 1 - 1 cancellation.
  const potential = (RS * s.height) / (R * radius) / (1 - RS / R),
    gravity = potential / (Math.sqrt(1 + potential) + 1)
  const velocity =
    s.motion === 'quieto'
      ? 0
      : s.motion === 'circular'
        ? Math.sqrt(GM / radius) / alpha
        : s.speed
  const beta2 = (velocity / C) ** 2,
    kinematic = beta2 === 0 ? 0 : -beta2 / (Math.sqrt(1 - beta2) + 1),
    motion = (1 + gravity) * kinematic,
    total = gravity + motion
  return {
    radius,
    alpha,
    referenceAlpha,
    velocity,
    gravity,
    motion,
    total,
    frequencyAdjustment: -total / (1 + total),
    period:
      s.motion === 'circular'
        ? 2 * Math.PI * Math.sqrt(radius ** 3 / GM) * referenceAlpha
        : null,
  }
}
export function snapshot(s: Setup) {
  const r = rates(s),
    elapsed = s.days * DAY * s.progress,
    gravityOffset = r.gravity * elapsed,
    motionOffset = r.motion * elapsed,
    physicalOffset = gravityOffset + motionOffset,
    readoutOffset = s.corrected ? 0 : physicalOffset
  return {
    ...r,
    elapsed,
    gravityOffset,
    motionOffset,
    physicalOffset,
    readoutOffset,
    rangeBias: C * readoutOffset,
    angle:
      s.motion === 'circular'
        ? ((r.velocity * r.alpha) / r.radius) * (elapsed / r.referenceAlpha)
        : 0,
  }
}
export const heightPosition = (h: number) =>
  (100 * Math.log1p(h)) / Math.log1p(4000)
export const heightFromPosition = (p: number) =>
  Math.expm1((p / 100) * Math.log1p(4000))
