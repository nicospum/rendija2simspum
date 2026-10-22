import { MIN_MASS, MAX_MASS, MAX_EMITTED } from './physics.ts'
/** Fixed map scale: radius=70*(M0/10)*(1-f). */
export function massAtEdge(x: number, emitted: number) {
  if (
    ![x, emitted].every(Number.isFinite) ||
    emitted < 0 ||
    emitted > MAX_EMITTED
  )
    return null
  const mass = Math.max(
    MIN_MASS,
    Math.min(MAX_MASS, ((x - 245) * 10) / (70 * (1 - emitted))),
  )
  for (const mark of [5, 10, 20])
    if (Math.abs(mass - mark) < 0.15) return mark
  return Math.round(mass * 10) / 10
}
/** The example square uses side=100*(M0/10)*(1-f), not a count of microscopic cells. */
export function emittedAtCorner(x: number, mass: number) {
  if (
    ![x, mass].every(Number.isFinite) ||
    mass < MIN_MASS ||
    mass > MAX_MASS
  )
    return null
  const f = Math.max(
    0,
    Math.min(MAX_EMITTED, 1 - ((x - 550) * 2) / ((100 * mass) / 10)),
  )
  for (const mark of [0, 0.25, 0.5])
    if (Math.abs(f - mark) < 0.012) return mark
  return Math.round(f * 1000) / 1000
}
