export const mapRadius = (x: number) =>
  x <= 1 ? 86 * x : 86 + 98 * Math.log(x)

/** Inverse of the existing compressed map scale, not a new geodesic equation. */
export function radiusAtMapX(x: number, held: boolean) {
  if (!Number.isFinite(x)) return null
  const distance = x - 205
  const radius =
    distance <= 86 ? distance / 86 : Math.exp((distance - 86) / 98)
  if (!held && Math.abs(distance - 86) <= 7) return 1
  return Math.max(held ? 1.2 : 0.6, Math.min(4, radius))
}
