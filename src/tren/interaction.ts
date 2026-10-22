/** Pointer position as a fraction of the displayed wagon: same mapping in either frame. */
export function passengerOffset(x: number, left: number, width: number) {
  if (![x, left, width].every(Number.isFinite) || width <= 0) return null
  const value = Math.max(-0.3, Math.min(0.3, (x - left) / width - 0.5))
  for (const mark of [-0.25, 0, 0.25])
    if (Math.abs(value - mark) < 0.025) return mark
  return Math.round(value * 100) / 100
}
