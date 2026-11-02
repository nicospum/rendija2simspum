// Spherical teaching world, kilometres/metres/degrees. Not a geodetic Earth model.
export const SPHERE_CIRCUMFERENCE = 40000
export const RADIUS = SPHERE_CIRCUMFERENCE / (2 * Math.PI)
export const radians = (degrees: number) => (degrees * Math.PI) / 180
export const degrees = (angle: number) => (angle * 180) / Math.PI
export interface Setup {
  latitudeA: number
  latitudeB: number
  declination: number
  height: number
  angularError: number
}
export const DEFAULT: Setup = {
  latitudeA: 23.44,
  latitudeB: 30.64,
  declination: 23.44,
  height: 1,
  angularError: 0,
}
export function validate(s: Setup) {
  const ranges = {
    latitudeA: [-35, 55],
    latitudeB: [-35, 55],
    declination: [-23.44, 23.44],
    height: [0.5, 3],
    angularError: [0, 0.5],
  }
  for (const [key, [min, max]] of Object.entries(ranges)) {
    const v = s[key as keyof Setup]
    if (!Number.isFinite(v) || v < min || v > max)
      throw new RangeError(`Valor inválido: ${key}`)
  }
}
export function circumference(distance: number, angle: number): number | null {
  if (!Number.isFinite(distance) || !Number.isFinite(angle) || distance < 0 || angle < 0)
    throw new RangeError('Distancia y ángulo deben ser finitos y no negativos.')
  return distance > 0 && angle > 1e-9 ? (360 * distance) / angle : null
}
export function snapshot(s: Setup) {
  validate(s)
  const signedA = s.latitudeA - s.declination
  const signedB = s.latitudeB - s.declination
  const shadowA = s.height * Math.tan(radians(signedA))
  const shadowB = s.height * Math.tan(radians(signedB))
  // Recover angles from the shadow ratio, preserving north/south direction.
  const separation = Math.abs(
    degrees(Math.atan2(shadowB, s.height)) - degrees(Math.atan2(shadowA, s.height)),
  )
  const distance = RADIUS * radians(Math.abs(s.latitudeB - s.latitudeA))
  const estimatedC = circumference(distance, separation)
  return {
    signedA,
    signedB,
    shadowA,
    shadowB,
    separation,
    distance,
    estimatedC,
    lowerC: circumference(distance, separation + s.angularError),
    upperC:
      separation > s.angularError
        ? circumference(distance, separation - s.angularError)
        : null,
  }
}
export type Measurement = ReturnType<typeof snapshot> & { setup: Setup }
export function measure(s: Setup): Measurement {
  return { ...snapshot(s), setup: { ...s } }
}
export function latitudeAtDistance(s: Setup, distance: number) {
  if (!Number.isFinite(distance)) throw new RangeError('Distancia inválida.')
  return Math.max(-35, Math.min(55, s.latitudeA + degrees(distance / RADIUS)))
}
