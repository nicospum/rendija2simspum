/** Match the native range step so pointer and keyboard can reach challenge values. */
export function roundedInterval(value: number) {
  const finite = Number.isFinite(value) ? value : 2
  return Math.round(Math.max(0.5, Math.min(6, finite)) * 10) / 10
}
export function intervalAtEdgeX(x: number) {
  return roundedInterval(((x - 250) / 44) * 2)
}
export function intervalAtPlotX(x: number) {
  return roundedInterval(((x - 45) / 405) * 6)
}
