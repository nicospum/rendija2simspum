// Schwarzschild in ingoing Painleve-Gullstrand coordinates.
// x = r/rs, T = c tPG/rs. See docs/HORIZONTE_LABORATORIO.md.
import { C, GM_SUN } from '../lente/physics.ts'
export { C, GM_SUN }
export const ENTRY = 4
export const STOP = 0.6
export const RECEIVER = 20
export const MAX_TIME = 48
export const FALL_END = (2 / 3) * (ENTRY ** 1.5 - STOP ** 1.5)
export const HORIZON_TIME = (2 / 3) * (ENTRY ** 1.5 - 1)
export interface Setup {
  mass: number // million nominal solar masses
  mode: 'fall' | 'hover'
  radius: number // held probe only, in rs
  time: number // dimensionless PG coordinate time, not a photograph
  interval: number // pulse separation in emitter proper time, units rs/c
}
export const DEFAULT: Setup = {
  mass: 4,
  mode: 'hover',
  radius: 4,
  time: 2,
  interval: 0.5,
}
export function validate(s: Setup) {
  if (
    !Number.isFinite(s.mass) ||
    s.mass < 1 ||
    s.mass > 8 ||
    !['fall', 'hover'].includes(s.mode) ||
    !Number.isFinite(s.radius) ||
    s.radius < 1.2 ||
    s.radius > 4 ||
    !Number.isFinite(s.time) ||
    s.time < 0 ||
    s.time > MAX_TIME ||
    !Number.isFinite(s.interval) ||
    s.interval < 0.5 ||
    s.interval > 1.5
  )
    throw new RangeError('Configuración fuera del tramo calculado')
}
export function lapse(x: number) {
  if (!Number.isFinite(x) || x <= 1)
    throw new RangeError('Un reloj sostenido debe estar fuera del horizonte')
  return Math.sqrt(1 - 1 / x)
}
export function fallTimeAt(x: number) {
  if (!Number.isFinite(x) || x < STOP || x > ENTRY)
    throw new RangeError('Radio fuera de la caída mostrada')
  return (2 / 3) * (ENTRY ** 1.5 - x ** 1.5)
}
export function fallRadius(t: number): number | null {
  if (!Number.isFinite(t) || t < 0) throw new RangeError('Tiempo no válido')
  if (t > FALL_END + 1e-10) return null // no invented continuation after the model segment
  if (Math.abs(t - HORIZON_TIME) < 1e-12) return 1
  return Math.max(STOP, (ENTRY ** 1.5 - 1.5 * Math.min(t, FALL_END)) ** (2 / 3))
}
export function lightSpeed(x: number, outward = true) {
  if (!Number.isFinite(x) || x <= 0)
    throw new RangeError('Radio positivo requerido')
  return (outward ? 1 : -1) - 1 / Math.sqrt(x)
}
// Primitive of 1/(1-1/sqrt(x)). Separate interior and exterior branches.
export function opticalDistance(x: number) {
  if (!Number.isFinite(x) || x < 0 || x === 1)
    throw new RangeError('Radio fuera de la rama óptica')
  const root = Math.sqrt(x)
  return x + 2 * root + 2 * Math.log(Math.abs(root - 1))
}
export function arrivalTime(emissionTime: number, x: number) {
  if (
    !Number.isFinite(emissionTime) ||
    emissionTime < 0 ||
    !Number.isFinite(x) ||
    x <= 0 ||
    x >= RECEIVER
  )
    throw new RangeError('Emisión fuera del dominio')
  return x <= 1
    ? null
    : emissionTime + opticalDistance(RECEIVER) - opticalDistance(x)
}
export function frequencyRatio(x: number, mode: Setup['mode']) {
  if (
    !Number.isFinite(x) ||
    x <= 0 ||
    x >= RECEIVER ||
    !['fall', 'hover'].includes(mode)
  )
    throw new RangeError('Emisor fuera del dominio')
  if (mode === 'hover') return lapse(x) / lapse(RECEIVER)
  return x <= 1 ? null : (1 - 1 / Math.sqrt(x)) / lapse(RECEIVER)
}
export interface Pulse {
  id: string
  emitted: number
  proper: number
  radius: number
  arrival: number | null
  frequency: number | null
  manual: boolean
}
export function makePulse(s: Setup, id: string, manual = false): Pulse | null {
  validate(s)
  const x = s.mode === 'hover' ? s.radius : fallRadius(s.time)
  if (x === null) return null
  return {
    id,
    emitted: s.time,
    proper: s.mode === 'fall' ? s.time : s.time * lapse(x),
    radius: x,
    arrival: arrivalTime(s.time, x),
    frequency: frequencyRatio(x, s.mode),
    manual,
  }
}
export function pulseTrain(s: Setup): Pulse[] {
  validate(s)
  const rate = s.mode === 'hover' ? lapse(s.radius) : 1
  const until = Math.min(s.time, s.mode === 'fall' ? FALL_END : MAX_TIME)
  const count = Math.min(
    100,
    Math.floor((until * rate) / s.interval + 1e-10) + 1,
  )
  return Array.from(
    { length: count },
    (_, i) => makePulse({ ...s, time: (i * s.interval) / rate }, `auto-${i}`)!,
  )
}
// Radius of an outward-directed ray at a later PG time. No fabricated escape
// from inside: the interior branch moves inward and ends at the singularity.
export function ingoingDistance(x: number) {
  if (!Number.isFinite(x) || x < 0) throw new RangeError('Radio no válido')
  const root = Math.sqrt(x)
  return -x + 2 * root - 2 * Math.log1p(root)
}
export function photonRadius(
  p: Pulse,
  now: number,
  outward = true,
): number | null {
  if (!Number.isFinite(now) || now < p.emitted) return null
  if (!outward) {
    const target = ingoingDistance(p.radius) + now - p.emitted
    if (target >= 0) return null
    let lo = 0,
      hi = p.radius
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2
      if (ingoingDistance(mid) > target) lo = mid
      else hi = mid
    }
    return (lo + hi) / 2
  }
  if (p.radius === 1) return 1
  const target = opticalDistance(p.radius) + now - p.emitted
  if (p.radius > 1 && target >= opticalDistance(RECEIVER)) return RECEIVER
  if (p.radius < 1 && target >= 0) return null
  let lo = p.radius > 1 ? p.radius : 0,
    hi = p.radius > 1 ? RECEIVER : p.radius
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (opticalDistance(mid) < target === p.radius > 1) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}
export function model(s: Setup) {
  validate(s)
  const rs = (2 * GM_SUN * s.mass * 1e6) / C ** 2
  const unit = rs / C
  const radius = s.mode === 'hover' ? s.radius : fallRadius(s.time)
  return {
    rs,
    unit,
    radius,
    receiverClock: s.time * lapse(RECEIVER) * unit,
    probeClock:
      s.mode === 'hover'
        ? s.time * lapse(s.radius) * unit
        : radius === null
          ? null
          : s.time * unit,
    heldRate: lapse(s.radius) / lapse(RECEIVER),
    horizonProper: HORIZON_TIME * unit,
    frequency: radius === null ? null : frequencyRatio(radius, s.mode),
    delay:
      radius === null || radius <= 1
        ? null
        : (opticalDistance(RECEIVER) - opticalDistance(radius)) *
          lapse(RECEIVER) *
          unit,
    acceleration:
      s.mode === 'fall'
        ? 0
        : C ** 2 / (2 * rs * s.radius ** 2 * lapse(s.radius)),
  }
}
