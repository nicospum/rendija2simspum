import { heightFromPosition, heightPosition, snapshot } from './physics.ts'
import type { Setup } from './physics.ts'
export function towerHeight(y: number) {
  if (!Number.isFinite(y)) return null
  const position = Math.max(0, Math.min(100, (310 - y) / 2.6))
  for (const h of [0, 0.33, 100, 4000])
    if (Math.abs(position - heightPosition(h)) < 1.2) return h
  return Math.max(0, Math.min(4000, heightFromPosition(position)))
}
/** Select the nearest instant on the existing circular worldline, not a new orbit. */
export function satelliteProgress(s: Setup, x: number, y: number) {
  if (
    ![x, y].every(Number.isFinite) ||
    s.motion !== 'circular' ||
    Math.hypot(x - 280, y - 205) < 20
  )
    return null
  const full = snapshot({ ...s, progress: 1 }).angle
  const angle = Math.atan2(y - 205, x - 280),
    current = full * s.progress - 0.8
  const delta = Math.atan2(
    Math.sin(angle - current),
    Math.cos(angle - current),
  )
  return Math.max(0, Math.min(1, s.progress + delta / full))
}
export function chartProgress(x: number) {
  if (!Number.isFinite(x)) return null
  const f = Math.max(0, Math.min(1, (x - 85) / 445))
  return f < 0.015 ? 0 : f > 0.985 ? 1 : f
}
