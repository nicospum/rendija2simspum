/** Exterior Schwarzschild test-particle geodesic, SI; Darwin radial anomaly χ.
 * See docs/ORBITA_MERCURIO.md. The display gain never enters the integration. */
export const C = 299_792_458
export const GM_SUN = 1.3271244004127942e20
export const AU = 149_597_870_700
export const ARCSEC = (180 * 3600) / Math.PI
export const CENTURY = 36525 * 86400
export const TAU = 2 * Math.PI
export const CYCLES = 10
export interface Setup {
  a: number // AU; (r_aphelion + r_perihelion)/2, also for Schwarzschild
  e: number
  mass: number // solar masses, through GM
  expanded: boolean
  progress: number // radial anomaly / (2π * CYCLES), not elapsed time
}
export const MERCURY: Setup = {
  a: 0.38709893,
  e: 0.20563069,
  mass: 1,
  expanded: true,
  progress: 0,
}
export const DEFAULT: Setup = { ...MERCURY }
export function validate(s: Setup) {
  if (
    ![s.a, s.e, s.mass, s.progress].every(Number.isFinite) ||
    s.a < 0.25 ||
    s.a > 1 ||
    s.e < 0.05 ||
    s.e > 0.7 ||
    s.mass < 0.5 ||
    s.mass > 2 ||
    s.progress < 0 ||
    s.progress > 1 ||
    typeof s.expanded !== 'boolean'
  )
    throw new RangeError('Configuración orbital inválida.')
}
export function parameters(s: Setup) {
  validate(s)
  const a = s.a * AU,
    gm = GM_SUN * s.mass,
    p = a * (1 - s.e * s.e),
    q = gm / (p * C * C)
  return {
    a,
    gm,
    p,
    q,
    perihelion: a * (1 - s.e),
    aphelion: a * (1 + s.e),
    leading: 6 * Math.PI * q,
  }
}
export interface Orbit {
  setup: Setup
  extra: number[]
  delta: number
  period: number
  leading: number
  perihelion: number
  aphelion: number
}
export function integrate(s: Setup, steps = 512): Orbit {
  const { gm, p, q, leading, perihelion, aphelion } = parameters(s)
  if (!Number.isInteger(steps) || steps < 16 || steps > 8192)
    throw new RangeError('Resolución inválida.')
  const extra = [0],
    h = TAU / steps
  // Rationalize (1-z)^(-1/2)-1 to preserve Mercury's tiny advance.
  const derivative = (chi: number) => {
    const cos = Math.cos(chi),
      z = q * (6 + 2 * s.e * cos),
      root = Math.sqrt(1 - z)
    return z / (root * (1 + root))
  }
  const timeDerivative = (chi: number) => {
    const radial = 1 + s.e * Math.cos(chi)
    return (
      ((Math.sqrt(p ** 3 / gm) / radial ** 2) *
        Math.sqrt((1 - 2 * q) ** 2 - 4 * q * q * s.e * s.e)) /
      ((1 - 2 * q * radial) * Math.sqrt(1 - q * (6 + 2 * s.e * Math.cos(chi))))
    )
  }
  let period = 0
  for (let i = 0; i < steps; i++) {
    const x = i * h
    extra.push(
      extra[i] +
        (h / 6) *
          (derivative(x) + 4 * derivative(x + h / 2) + derivative(x + h)),
    )
    period +=
      (h / 6) *
      (timeDerivative(x) +
        4 * timeDerivative(x + h / 2) +
        timeDerivative(x + h))
  }
  return {
    setup: { ...s },
    extra,
    delta: extra[steps],
    period,
    leading,
    perihelion,
    aphelion,
  }
}
export function point(
  orbit: Orbit,
  cycles: number,
  relativistic: boolean,
  gain = 1,
) {
  if (
    !Number.isFinite(cycles) ||
    cycles < 0 ||
    cycles > CYCLES ||
    !Number.isFinite(gain) ||
    gain < 1 ||
    gain > 100000
  )
    throw new RangeError('Fase o ampliación inválida.')
  const { setup: s, extra, delta } = orbit,
    whole = Math.floor(cycles),
    fraction = cycles - whole
  const cell = fraction * (extra.length - 1),
    i = Math.floor(cell)
  const advance = relativistic
    ? whole * delta +
      extra[i] +
      (extra[Math.min(i + 1, extra.length - 1)] - extra[i]) * (cell - i)
    : 0
  const chi = cycles * TAU,
    radius = (s.a * AU * (1 - s.e * s.e)) / (1 + s.e * Math.cos(chi)),
    angle = chi + advance * gain
  return {
    radius,
    angle,
    advance,
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  }
}
export const gainFor = (s: Setup) => (s.expanded ? 100000 : 1)
