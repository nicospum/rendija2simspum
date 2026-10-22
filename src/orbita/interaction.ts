import { CYCLES, point } from './physics.ts'
import type { Orbit } from './physics.ts'
import type { Point2 } from '../shared/sceneInteraction.ts'
/** Unwrap the pointer angle near the current event, then invert the actual monotonic
 * Schwarzschild angle. Nearest-curve projection would jump between crossing loops. */
export function orbitProgress(
  orbit: Orbit,
  p: Point2,
  current: number,
  relativistic: boolean,
  gain: number,
) {
  if (
    ![p.x, p.y, current].every(Number.isFinite) ||
    current < 0 ||
    current > 1 ||
    Math.hypot(p.x - 300, p.y - 252) < 20
  )
    return null
  const now = point(orbit, current * CYCLES, relativistic, gain).angle
  const angle = Math.atan2(252 - p.y, p.x - 300)
  const delta = Math.atan2(Math.sin(angle - now), Math.cos(angle - now))
  const end = point(orbit, CYCLES, relativistic, gain).angle
  const target = Math.max(0, Math.min(end, now + delta))
  if (target === 0) return 0
  if (target === end) return 1
  let low = 0,
    high = CYCLES
  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2
    if (point(orbit, mid, relativistic, gain).angle < target) low = mid
    else high = mid
  }
  const value = (low + high) / (2 * CYCLES),
    joint = Math.round(value * CYCLES) / CYCLES
  return Math.abs(value - joint) < 1e-6 ? joint : value
}
