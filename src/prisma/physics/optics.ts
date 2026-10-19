/**
 * Geometrical optics in the horizontal x,z plane. The same vertices are used
 * by the renderer, so visual and physical prism faces cannot drift apart.
 * Angles are degrees, wavelengths nanometres, lengths scene units.
 */
export type Material = 'glass' | 'quartz' | 'acrylic'
export interface Vec2 { x: number; z: number }

export interface ExperimentConfig {
  material: Material
  prismAngle: number
  apexAngle: number
  lightAngle: number
  lightOffset: number
  lightWidth: number
  screenDistance: number
}

export interface RaySegment {
  from: Vec2
  to: Vec2
  medium: 'air' | 'prism'
}

export interface RayInteraction {
  point: Vec2
  /** Unit normal pointing into the incident medium. */
  normal: Vec2
  incident: Vec2
  outgoing: Vec2
  fromIndex: number
  toIndex: number
  incidenceAngle: number
  refractionAngle: number | null
  type: 'refraction' | 'internal-reflection'
}

export interface TracedRay {
  wavelength: number
  /** Display approximation; it does not affect ray direction. */
  color: string
  offset: number
  points: Vec2[]
  segments: RaySegment[]
  interactions: RayInteraction[]
  status: 'screen' | 'escaped' | 'missed' | 'trapped'
  refractiveIndex: number
  incidenceAngle: number | null
  exitAngle: number | null
  deviationAngle: number | null
  internalReflections: number
  screenHit: Vec2 | null
  /** Remaining power of the principal transmitted ray (0..1). */
  transmission: number
}

export interface ExperimentResult {
  rays: TracedRay[]
  vertices: Vec2[]
  source: Vec2
  screenX: number
  metrics: {
    /** Central 550 nm ray; angles measured from the face normal. */
    incidenceAngle: number | null
    deviationAngle: number | null
    /** Red-to-violet separation on the screen, in scene units. */
    spectralSpread: number | null
    screenHits: number
    totalInternalReflections: number
  }
}

export const DEFAULT_CONFIG: ExperimentConfig = {
  material: 'glass', prismAngle: 0, apexAngle: 60,
  lightAngle: 0, lightOffset: 0, lightWidth: 0.025, screenDistance: 3.2,
}

/** Original repository coefficients, retained as educational approximations.
 * These are not certified optical-glass or crystalline-quartz specifications.
 * Cauchy: n = A + B / lambda² + C / lambda⁴, with lambda in micrometres.
 */
export const MATERIAL_COEFFICIENTS: Readonly<Record<Material, Readonly<{ A: number; B: number; C: number }>>> = {
  glass: { A: 1.5046, B: 0.00420, C: -0.000108 },
  quartz: { A: 1.4580, B: 0.00354, C: -0.000099 },
  acrylic: { A: 1.4870, B: 0.00370, C: -0.000105 },
}

export const WAVELENGTHS: readonly number[] = Array.from({ length: 33 }, (_, index) => 380 + index * 10)
export const PRISM_REFERENCE_ANGLE = 20
export const SOURCE_X = -3.6
const DEG = Math.PI / 180
const EPS = 1e-7
/** Bounded computation for orientations with repeated total reflection. */
export const MAX_INTERNAL_REFLECTIONS = 12

function finite(value: number, name: string): void {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`)
}
function dot(a: Vec2, b: Vec2): number { return a.x * b.x + a.z * b.z }
function cross(a: Vec2, b: Vec2): number { return a.x * b.z - a.z * b.x }
function scale(a: Vec2, factor: number): Vec2 { return { x: a.x * factor, z: a.z * factor } }
function add(a: Vec2, b: Vec2): Vec2 { return { x: a.x + b.x, z: a.z + b.z } }
function subtract(a: Vec2, b: Vec2): Vec2 { return { x: a.x - b.x, z: a.z - b.z } }
function clamp(value: number, min: number, max: number): number { return Math.max(min, Math.min(max, value)) }
function unit(vector: Vec2): Vec2 {
  finite(vector.x, 'vector.x'); finite(vector.z, 'vector.z')
  const length = Math.hypot(vector.x, vector.z)
  if (length === 0) throw new RangeError('A direction cannot be zero')
  return scale(vector, 1 / length)
}
function incidence(direction: Vec2, normal: Vec2): number {
  return Math.acos(clamp(-dot(direction, normal), 0, 1)) / DEG
}

export function refractiveIndex(wavelength: number, material: Material): number {
  finite(wavelength, 'wavelength')
  if (wavelength < 380 || wavelength > 700) throw new RangeError('Wavelength must be in the model range 380–700 nm')
  if (!Object.prototype.hasOwnProperty.call(MATERIAL_COEFFICIENTS, material)) throw new RangeError('Unknown prism material')
  const { A, B, C } = MATERIAL_COEFFICIENTS[material]
  const lambda2 = (wavelength / 1000) ** 2
  return A + B / lambda2 + C / lambda2 ** 2
}

/** Vector Snell law. Null means total internal reflection. */
export function refractDirection(incident: Vec2, normal: Vec2, n1: number, n2: number): Vec2 | null {
  finite(n1, 'n1'); finite(n2, 'n2')
  if (n1 <= 0 || n2 <= 0) throw new RangeError('Refractive indices must be positive')
  const direction = unit(incident)
  let surfaceNormal = unit(normal)
  if (dot(direction, surfaceNormal) > 0) surfaceNormal = scale(surfaceNormal, -1)
  const cosine = clamp(-dot(direction, surfaceNormal), 0, 1)
  const ratio = n1 / n2
  const sineSquared = ratio ** 2 * Math.max(0, 1 - cosine ** 2)
  // Tolerance keeps the exactly critical ray tangent instead of NaN.
  if (sineSquared > 1 + 1e-12) return null
  const normalFactor = ratio * cosine - Math.sqrt(Math.max(0, 1 - sineSquared))
  return unit(add(scale(direction, ratio), scale(surfaceNormal, normalFactor)))
}

export function reflectDirection(incident: Vec2, normal: Vec2): Vec2 {
  const direction = unit(incident)
  const surfaceNormal = unit(normal)
  return unit(subtract(direction, scale(surfaceNormal, 2 * dot(direction, surfaceNormal))))
}

/** Fresnel power reflectance for unpolarized light at a lossless interface. */
function reflectance(n1: number, n2: number, cosIncident: number, cosTransmitted: number): number {
  const rs = (n1 * cosIncident - n2 * cosTransmitted) / (n1 * cosIncident + n2 * cosTransmitted)
  const rp = (n1 * cosTransmitted - n2 * cosIncident) / (n1 * cosTransmitted + n2 * cosIncident)
  return clamp((rs ** 2 + rp ** 2) / 2, 0, 1)
}

/** CCW triangle, centroid at (0,0), with an adjustable physical apex angle.
 * Zero on the rotation dial is a fixed 20° reference orientation near minimum
 * deviation, so the initial horizontal beam transmits through both faces.
 */
export function createPrismVertices(apexAngle: number, prismAngle: number): Vec2[] {
  finite(apexAngle, 'apexAngle'); finite(prismAngle, 'prismAngle')
  if (apexAngle < 30 || apexAngle > 85) throw new RangeError('Apex angle must be between 30° and 85°')
  const height = 1.35
  const halfBase = height * Math.tan(apexAngle * DEG / 2)
  const angle = (prismAngle + PRISM_REFERENCE_ANGLE) * DEG
  const cosine = Math.cos(angle), sine = Math.sin(angle)
  return [{ x: 0, z: -height * 2 / 3 }, { x: halfBase, z: height / 3 }, { x: -halfBase, z: height / 3 }]
    .map(({ x, z }) => ({ x: x * cosine - z * sine, z: x * sine + z * cosine }))
}

interface FaceHit { point: Vec2; outward: Vec2; distance: number }

function intersectPrism(origin: Vec2, direction: Vec2, vertices: Vec2[], entering: boolean): FaceHit | null {
  let nearest: FaceHit | null = null
  for (let index = 0; index < vertices.length; index++) {
    const a = vertices[index], b = vertices[(index + 1) % vertices.length]
    const edge = subtract(b, a)
    const outward = unit({ x: edge.z, z: -edge.x })
    if (entering && dot(direction, outward) >= -EPS) continue
    const denominator = cross(direction, edge)
    if (Math.abs(denominator) < EPS) continue
    const difference = subtract(a, origin)
    const distance = cross(difference, edge) / denominator
    const edgeFraction = cross(difference, direction) / denominator
    if (distance <= EPS || edgeFraction < -EPS || edgeFraction > 1 + EPS) continue
    // An ideal vertex has no unique normal: use the most frontal face if tied.
    const closer = !nearest || distance < nearest.distance - EPS
    const tied = nearest && Math.abs(distance - nearest.distance) <= EPS
      && Math.abs(dot(direction, outward)) > Math.abs(dot(direction, nearest.outward))
    if (closer || tied) nearest = { point: add(origin, scale(direction, distance)), outward, distance }
  }
  return nearest
}

/** Approximate spectral display RGB, not a calibrated colorimetric transform. */
export function wavelengthToColor(wavelength: number): string {
  finite(wavelength, 'wavelength')
  let red = 0, green = 0, blue = 0
  if (wavelength >= 380 && wavelength < 440) { red = (440 - wavelength) / 60; blue = 1 }
  else if (wavelength < 490 && wavelength >= 440) { green = (wavelength - 440) / 50; blue = 1 }
  else if (wavelength < 510 && wavelength >= 490) { green = 1; blue = (510 - wavelength) / 20 }
  else if (wavelength < 580 && wavelength >= 510) { red = (wavelength - 510) / 70; green = 1 }
  else if (wavelength < 645 && wavelength >= 580) { red = 1; green = (645 - wavelength) / 65 }
  else if (wavelength <= 700 && wavelength >= 645) { red = 1 }
  const edgeSensitivity = wavelength < 420 ? 0.35 + 0.65 * (wavelength - 380) / 40 : 1
  const channel = (value: number) => Math.round(255 * clamp(value * edgeSensitivity, 0, 1) ** 0.8).toString(16).padStart(2, '0')
  return `#${channel(red)}${channel(green)}${channel(blue)}`
}

function traceRay(config: ExperimentConfig, vertices: Vec2[], wavelength: number, offset: number): TracedRay {
  const direction = { x: Math.cos(config.lightAngle * DEG), z: Math.sin(config.lightAngle * DEG) }
  const source = add({ x: SOURCE_X, z: config.lightOffset }, scale({ x: -direction.z, z: direction.x }, offset))
  const ray: TracedRay = {
    wavelength, color: wavelengthToColor(wavelength), offset,
    points: [source], segments: [], interactions: [], status: 'missed',
    refractiveIndex: refractiveIndex(wavelength, config.material), incidenceAngle: null,
    exitAngle: null, deviationAngle: null, internalReflections: 0, screenHit: null, transmission: 1,
  }
  const append = (to: Vec2, medium: RaySegment['medium']) => {
    const from = ray.points[ray.points.length - 1]
    ray.segments.push({ from, to, medium }); ray.points.push(to)
  }
  const finishAir = (origin: Vec2, outgoing: Vec2) => {
    const distance = outgoing.x > EPS ? (config.screenDistance - origin.x) / outgoing.x : -1
    if (distance > EPS) {
      ray.screenHit = add(origin, scale(outgoing, distance))
      append(ray.screenHit, 'air')
      if (ray.status !== 'missed') ray.status = 'screen'
    } else {
      append(add(origin, scale(outgoing, 6)), 'air')
      if (ray.status !== 'missed') ray.status = 'escaped'
    }
  }
  const entry = intersectPrism(source, direction, vertices, true)
  if (!entry) { finishAir(source, direction); return ray }
  append(entry.point, 'air')
  ray.incidenceAngle = incidence(direction, entry.outward)
  let insideDirection = refractDirection(direction, entry.outward, 1, ray.refractiveIndex)!
  const record = (point: Vec2, normal: Vec2, incident: Vec2, outgoing: Vec2, n1: number, n2: number, reflected: boolean) => {
    const incidenceAngle = incidence(incident, normal)
    const refractionAngle = reflected ? null : incidence(outgoing, normal)
    ray.interactions.push({ point, normal, incident, outgoing, fromIndex: n1, toIndex: n2,
      incidenceAngle, refractionAngle, type: reflected ? 'internal-reflection' : 'refraction' })
    if (!reflected) ray.transmission *= 1 - reflectance(n1, n2, Math.cos(incidenceAngle * DEG), Math.cos(refractionAngle! * DEG))
  }
  record(entry.point, entry.outward, direction, insideDirection, 1, ray.refractiveIndex, false)
  let origin = entry.point
  ray.status = 'trapped'
  for (let bounce = 0; bounce <= MAX_INTERNAL_REFLECTIONS; bounce++) {
    const exit = intersectPrism(origin, insideDirection, vertices, false)
    if (!exit) break
    append(exit.point, 'prism')
    const normal = scale(exit.outward, -1)
    const outsideDirection = refractDirection(insideDirection, normal, ray.refractiveIndex, 1)
    if (outsideDirection) {
      record(exit.point, normal, insideDirection, outsideDirection, ray.refractiveIndex, 1, false)
      ray.exitAngle = incidence(outsideDirection, normal)
      ray.deviationAngle = Math.atan2(cross(direction, outsideDirection), dot(direction, outsideDirection)) / DEG
      finishAir(exit.point, outsideDirection)
      return ray
    }
    if (bounce === MAX_INTERNAL_REFLECTIONS) break
    const reflected = reflectDirection(insideDirection, normal)
    record(exit.point, normal, insideDirection, reflected, ray.refractiveIndex, 1, true)
    ray.internalReflections++
    insideDirection = reflected
    origin = exit.point
  }
  return ray
}

/** Recomputed only when optical controls change, not once per animation frame. */
export function traceExperiment(config: ExperimentConfig): ExperimentResult {
  for (const [name, value] of Object.entries(config)) if (name !== 'material') finite(value as number, name)
  if (config.lightWidth < 0 || config.lightWidth > 0.5) throw new RangeError('Light width must be between 0 and 0.5')
  if (config.screenDistance < 1.6 || config.screenDistance > 8) throw new RangeError('Screen distance must be between 1.6 and 8')
  if (Math.abs(config.lightAngle) > 80) throw new RangeError('Light angle must be between -80° and 80°')
  const vertices = createPrismVertices(config.apexAngle, config.prismAngle)
  const offsets = config.lightWidth > 0 ? [-config.lightWidth / 2, 0, config.lightWidth / 2] : [0]
  const rays = offsets.flatMap(offset => WAVELENGTHS.map(wavelength => traceRay(config, vertices, wavelength, offset)))
  const central = rays.filter(ray => ray.offset === 0)
  const reference = central.find(ray => ray.wavelength === 550)!
  const red = central.find(ray => ray.wavelength === 700)!
  const violet = central.find(ray => ray.wavelength === 380)!
  const spectralSpread = red.status === 'screen' && violet.status === 'screen'
    ? Math.abs(red.screenHit!.z - violet.screenHit!.z) : null
  return { rays, vertices, source: { x: SOURCE_X, z: config.lightOffset }, screenX: config.screenDistance,
    metrics: { incidenceAngle: reference.incidenceAngle, deviationAngle: reference.deviationAngle,
      spectralSpread, screenHits: rays.filter(ray => ray.status === 'screen').length,
      totalInternalReflections: rays.reduce((sum, ray) => sum + ray.internalReflections, 0) } }
}
