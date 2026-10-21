/** Flat spacetime. Years and light-years, so c = 1 ly/year. */
export interface Setup {
  outbound: number
  inbound: number
  duration: number
  wait: number
  progress: number
  side: 'before' | 'after'
}
export const DEFAULT: Setup = {
  outbound: 0.8,
  inbound: 0.8,
  duration: 10,
  wait: 0,
  progress: 0,
  side: 'after',
}
export function validate(s: Setup) {
  if (
    ![s.outbound, s.inbound, s.duration, s.wait, s.progress].every(
      Number.isFinite,
    ) ||
    s.outbound < 0.1 ||
    s.outbound > 0.95 ||
    s.inbound < 0.1 ||
    s.inbound > 0.95 ||
    s.duration < 2 ||
    s.duration > 20 ||
    s.wait < 0 ||
    s.wait > 0.4 ||
    s.progress < 0 ||
    s.progress > 1 ||
    !['before', 'after'].includes(s.side)
  )
    throw new RangeError('Viaje fuera de rango.')
}
export const rate = (beta: number) => {
  if (!Number.isFinite(beta) || Math.abs(beta) >= 1)
    throw new RangeError('Se requiere |v| < c.')
  return Math.sqrt((1 - beta) * (1 + beta))
}
export function itinerary(s: Setup) {
  validate(s)
  const moving = s.duration * (1 - s.wait),
    stop = s.duration * s.wait
  const out = (moving * s.inbound) / (s.outbound + s.inbound),
    back = moving - out,
    distance = s.outbound * out
  const ownOut = out * rate(s.outbound),
    ownBack = back * rate(s.inbound)
  return {
    out,
    back,
    stop,
    distance,
    leave: out + stop,
    total: s.duration,
    ownOut,
    ownBack,
    ownTotal: ownOut + stop + ownBack,
  }
}
export function eventAt(s: Setup, t: number, side: Setup['side'] = s.side) {
  const p = itinerary(s)
  if (!Number.isFinite(t) || t < 0 || t > p.total)
    throw new RangeError('Fecha fuera del viaje.')
  const before = side === 'before',
    eps = 1e-10
  if (t < p.out - eps || (Math.abs(t - p.out) <= eps && before))
    return {
      t,
      x: s.outbound * t,
      own: t * rate(s.outbound),
      velocity: s.outbound,
      phase: 'Ida',
    }
  if (
    p.stop > 0 &&
    (t < p.leave - eps || (Math.abs(t - p.leave) <= eps && before))
  )
    return {
      t,
      x: p.distance,
      own: p.ownOut + t - p.out,
      velocity: 0,
      phase: 'Espera',
    }
  if (t < p.total)
    return {
      t,
      x: Math.max(0, p.distance - s.inbound * (t - p.leave)),
      own: p.ownOut + p.stop + (t - p.leave) * rate(s.inbound),
      velocity: -s.inbound,
      phase: 'Vuelta',
    }
  return { t, x: 0, own: p.ownTotal, velocity: 0, phase: 'Reencuentro' }
}
/** Earth event simultaneous in the current comoving inertial system. Not an optical image. */
export function snapshot(s: Setup) {
  const p = itinerary(s),
    now = eventAt(s, s.duration * s.progress)
  const assignedEarth = now.t - now.velocity * now.x
  // Retarded emission whose inward light ray reaches Earth at coordinate time now.t.
  const segments = [
    { t: 0, x: 0, v: s.outbound, end: p.out },
    { t: p.out, x: p.distance, v: 0, end: p.leave },
    { t: p.leave, x: p.distance, v: -s.inbound, end: p.total },
  ]
  let emission = 0
  for (const leg of segments) {
    const candidate = (now.t - leg.x + leg.v * leg.t) / (1 + leg.v)
    if (candidate >= leg.t - 1e-10 && candidate <= leg.end + 1e-10) {
      emission = Math.max(leg.t, Math.min(leg.end, candidate))
      break
    }
  }
  const received = eventAt(s, emission)
  return {
    ...p,
    ...now,
    assignedEarth,
    gap: now.t - now.own,
    received,
    turnBefore: p.out - s.outbound * p.distance,
    turnAfter: p.out + (p.stop === 0 ? s.inbound * p.distance : 0),
  }
}
