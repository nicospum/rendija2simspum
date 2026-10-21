import { C, gamma, boost } from '../reloj/physics.ts'
import type { Event } from '../reloj/physics.ts'
export { C, gamma }
export type Frame = 'anden' | 'tren'
export type Protocol = 'simultaneo' | 'tren'
export const MIN_TIME = -0.6
export const MAX_TIME = 1.7
export interface Setup {
  beta: number
  length: number
  sync: Frame
  offset: number
  time: number
  protocol: Protocol
}
export const DEFAULT: Setup = {
  beta: 0.6,
  length: 300,
  sync: 'anden',
  offset: 0,
  time: MIN_TIME,
  protocol: 'simultaneo',
}
export function validate(s: Setup) {
  if (
    ![s.beta, s.length, s.offset, s.time].every(Number.isFinite) ||
    Math.abs(s.beta) > 0.9 ||
    s.length < 100 ||
    s.length > 400 ||
    Math.abs(s.offset) > 0.3 ||
    s.time < MIN_TIME ||
    s.time > MAX_TIME ||
    !['anden', 'tren'].includes(s.sync) ||
    !['simultaneo', 'tren'].includes(s.protocol)
  )
    throw new RangeError('Ensayo del tren fuera de rango.')
}
/** All source events are specified in train coordinates, then transformed. */
export function inFrame(event: Event, frame: Frame, beta: number) {
  if (!['anden', 'tren'].includes(frame))
    throw new RangeError('Sistema inválido.')
  return frame === 'tren' ? { ...event } : boost(event, beta)
}
export function signals(s: Setup) {
  validate(s)
  return ([-1, 1] as const).map((side) => {
    const x = (side * s.length) / 2
    const emission = { x, y: 0, t: s.sync === 'tren' ? 0 : (-s.beta * x) / C }
    const passenger = {
      x: s.offset * s.length,
      y: 0,
      t: emission.t + Math.abs(x - s.offset * s.length) / C,
    }
    const e = boost(emission, s.beta)
    const platform = boost({ x: 0, y: 0, t: e.t + Math.abs(e.x) / C }, -s.beta)
    return {
      side,
      label: side === -1 ? 'A' : 'B',
      emission,
      passenger,
      platform,
    }
  })
}
export function snapshot(s: Setup, frame: Frame) {
  validate(s)
  const g = gamma(s.beta),
    unit = s.length / C
  const time = (frame === 'anden' ? g : 1) * s.time * unit
  const trainCenter = frame === 'anden' ? s.beta * C * time : 0
  const platformCenter = frame === 'anden' ? 0 : -s.beta * C * time
  const length = frame === 'anden' ? s.length / g : s.length
  const passengerCenter =
    frame === 'anden'
      ? trainCenter + (s.offset * s.length) / g
      : s.offset * s.length
  const pulses = signals(s).map((signal) => {
    const emission = inFrame(signal.emission, frame, s.beta)
    const passenger = inFrame(signal.passenger, frame, s.beta)
    const platform = inFrame(signal.platform, frame, s.beta)
    const arrival = frame === 'anden' ? platform : passenger
    return {
      ...signal,
      emission,
      passenger,
      platform,
      arrival,
      emitted: time >= emission.t - 1e-15,
      received: time >= arrival.t - 1e-15,
      active:
        time >= emission.t &&
        time <= Math.max(passenger.t, platform.t) + 0.08 * unit,
      x: emission.x - signal.side * C * (time - emission.t),
    }
  })
  return {
    frame,
    time,
    trainCenter,
    platformCenter,
    passengerCenter,
    length,
    pulses,
    emissionGap: pulses[1].emission.t - pulses[0].emission.t,
    arrivalGap: pulses[1].arrival.t - pulses[0].arrival.t,
  }
}
/** Endpoint records, not an optical photograph. Stored as an independent trial in the reducer. */
export function measurement(s: Setup, frame: Frame) {
  validate(s)
  const g = gamma(s.beta),
    t = (s.time * s.length) / C
  const events = ([-1, 1] as const).map((side) => {
    const x = (side * s.length) / 2
    // For a platform-simultaneous pair, t' differs at the two ends.
    const event = {
      x,
      y: 0,
      t:
        frame === 'anden' && s.protocol === 'simultaneo'
          ? t - (s.beta * x) / C
          : t,
    }
    return inFrame(event, frame, s.beta)
  })
  const deltaT = events[1].t - events[0].t
  return {
    events,
    deltaT,
    distance: events[1].x - events[0].x,
    valid: Math.abs(deltaT) < 1e-14,
    expected: frame === 'anden' ? s.length / g : s.length,
  }
}
export function order(gap: number) {
  return Math.abs(gap) < 1e-14
    ? 'A y B a la vez'
    : gap < 0
      ? 'Primero B, después A'
      : 'Primero A, después B'
}
