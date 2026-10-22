/** A frequency dial: the visual rail is calibrated in THz, including invisible light. */
export function frequencyAtX(x: number, energy: boolean) {
  if (!Number.isFinite(x)) return null
  const min = energy ? 60 : 45,
    width = energy ? 480 : 255
  const value = Math.max(
    350,
    Math.min(1600, 350 + ((x - min) / width) * 1250),
  )
  for (const mark of [450, 650, 1000])
    if (Math.abs(value - mark) < 20) return mark
  return Math.round(value)
}
