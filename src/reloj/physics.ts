/** A transverse light clock in two inertial systems. SI, no gravity or optical delay. */
export const C = 299_792_458
export const MIRROR_DISTANCE = 150
export const OWN_PERIOD = (2 * MIRROR_DISTANCE) / C
export const MAX_BETA = 0.95
export const HALF_RATE_BETA = Math.sqrt(3) / 2
export type Frame = 'nave' | 'estacion'
export interface Setup {
  beta: number
  fraction: number
  follow: Frame
}
export interface Event {
  t: number
  x: number
  y: number
}
export function gamma(beta: number) {
  if (!Number.isFinite(beta) || Math.abs(beta) >= 1)
    throw new RangeError('Se requiere |v| < c.')
  return 1 / Math.sqrt((1 - beta) * (1 + beta))
}
export function validate(s: Setup) {
  if (
    !Number.isFinite(s.beta) ||
    s.beta < 0 ||
    s.beta > MAX_BETA ||
    !Number.isFinite(s.fraction) ||
    s.fraction < 0 ||
    s.fraction > 1 ||
    !['nave', 'estacion'].includes(s.follow)
  )
    throw new RangeError('Estado del reloj fuera de rango.')
}
/** Rest event -> system where the clock moves with signed velocity beta*c. */
export function boost(event: Event, beta: number): Event {
  if (![event.t, event.x, event.y].every(Number.isFinite))
    throw new RangeError('Evento no finito.')
  const g = gamma(beta)
  return {
    t: g * (event.t + (beta * event.x) / C),
    x: g * (event.x + beta * C * event.t),
    y: event.y,
  }
}
export function photonEvent(fraction: number): Event {
  if (!Number.isFinite(fraction) || fraction < 0 || fraction > 1)
    throw new RangeError('Fracción inválida.')
  return {
    t: fraction * OWN_PERIOD,
    x: 0,
    y: 2 * MIRROR_DISTANCE * Math.min(fraction, 1 - fraction),
  }
}
export function snapshot(s: Setup, frame: Frame) {
  validate(s)
  if (!['nave', 'estacion'].includes(frame))
    throw new RangeError('Sistema inválido.')
  const moving = frame !== s.follow
  const beta = moving ? (s.follow === 'nave' ? s.beta : -s.beta) : 0
  const g = gamma(beta)
  const point = boost(photonEvent(s.fraction), beta)
  const events = [0, 0.5, 1].map((f) => boost(photonEvent(f), beta))
  return {
    moving,
    beta,
    gamma: g,
    point,
    events,
    ownTime: s.fraction * OWN_PERIOD,
    period: g * OWN_PERIOD,
    pathLength: 2 * g * MIRROR_DISTANCE,
    vx: beta * C,
    vy: ((s.fraction < 0.5 ? 1 : -1) * C) / g,
    ticks: s.fraction === 1 ? 1 : 0,
  }
}
