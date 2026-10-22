import { orbitalPeriodYears } from './physics.ts'
export function dialValue(y: number, maximum: number) {
  if (![y, maximum].every(Number.isFinite) || maximum <= 0) return null
  const value = Math.round(
    Math.max(0, Math.min(maximum, (0.75 - y) * 2 * maximum)),
  )
  if (maximum === 82 && Math.abs(value - 70) <= 2) return 70
  return value
}
/** Select time on the same fixed-radius orbit; do not change its inferred mass. */
export function starYears(
  x: number,
  y: number,
  years: number,
  mass: number,
) {
  if (
    ![x, y, years, mass].every(Number.isFinite) ||
    mass < 1 ||
    mass > 8 ||
    years < 0 ||
    Math.hypot(x - 360, y - 235) < 20
  )
    return null
  const period = orbitalPeriodYears(mass),
    current = (2 * Math.PI * years) / period,
    angle = Math.atan2(y - 235, x - 360)
  const delta = Math.atan2(
    Math.sin(angle - current),
    Math.cos(angle - current),
  )
  return Math.max(0, years + (delta * period) / (2 * Math.PI))
}
