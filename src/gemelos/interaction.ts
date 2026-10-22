import { itinerary } from './physics.ts'
import type { Setup } from './physics.ts'
/** The two drawing lanes separate outbound and return; neither adds a spatial dimension. */
export function tripProgress(s: Setup, x: number, y: number) {
  if (![x, y].every(Number.isFinite)) return null
  const p = itinerary(s)
  const end = 75 + (p.distance / (s.duration * 0.5)) * 400
  let fraction = Math.max(0, Math.min(1, (x - 75) / (end - 75)))
  if (fraction < 0.02) fraction = 0
  if (fraction > 0.98) fraction = 1
  return (
    (y < 192 ? p.out * fraction : p.leave + p.back * (1 - fraction)) /
    s.duration
  )
}
/** Vertical coordinate is time at home. Snap to joints so both sides of a turn can be compared. */
export function diagramProgress(s: Setup, y: number) {
  if (!Number.isFinite(y)) return null
  const p = itinerary(s)
  const value = Math.max(0, Math.min(1, (345 - y) / 270))
  for (const mark of [0, p.out / s.duration, p.leave / s.duration, 1])
    if (Math.abs(value - mark) < 0.02) return mark
  return value
}
