import { degrees, radians, directionForPixel } from './physics.ts'
export function pickedDirection(x: number, y: number, aspect: number) {
  if (![x, y, aspect].every(Number.isFinite) || aspect <= 0) return null
  const p = directionForPixel(
    2 * Math.max(0, Math.min(1, x)) - 1,
    1 - 2 * Math.max(0, Math.min(1, y)),
    aspect,
  )
  return { angle: degrees(p.angle), azimuth: p.azimuth }
}
/** Invert the projected source on the diagram's fixed background sphere. */
export function sourceAtY(y: number, yaw: number, azimuth: number) {
  if (
    ![y, yaw, azimuth].every(Number.isFinite) ||
    Math.abs(Math.cos(azimuth)) < 0.25
  )
    return null
  const sine = Math.max(
    -1,
    Math.min(1, (320 - y) / (90 * 3.15 * Math.cos(azimuth))),
  )
  let value = Math.max(-18, Math.min(18, degrees(Math.asin(sine)) - yaw))
  if (Math.abs(value + yaw) < 0.2) value = -yaw
  return Math.round(value * 10) / 10 || 0
}
export function sourceMapY(source: number, yaw: number, azimuth: number) {
  return (
    320 - 90 * 3.15 * Math.sin(radians(source + yaw)) * Math.cos(azimuth)
  )
}
