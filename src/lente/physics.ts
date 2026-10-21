// Schwarzschild null geodesics, u = rs/r. Distances below are areal radii.
// See docs/LENTE_GRAVITACIONAL.md for the metric, observer tetrad and derivation.
export const C = 299792458
export const GM_SUN = 1.3271244e20 // IAU nominal solar mass parameter, m³/s²
export const AU = 149597870700
export const REFERENCE_SOLAR_MASS = 4e6
export const RS_REFERENCE = (2 * GM_SUN * REFERENCE_SOLAR_MASS) / C ** 2
export const OBSERVER_DISTANCE = 24 * RS_REFERENCE
export const SKY_DISTANCE = 90 * RS_REFERENCE
export const CRITICAL_B = (3 * Math.sqrt(3)) / 2 // b_critical / rs
export const MAX_ANGLE = (79 * Math.PI) / 180
export const HALF_FOV = (30 * Math.PI) / 180
export const TABLE_SIZE = 1536
export const radians = (degrees: number) => (degrees * Math.PI) / 180
export const degrees = (radians: number) => (radians * 180) / Math.PI
export function directionForPixel(nx: number, ny: number, aspect: number) {
  return {
    angle: Math.atan(Math.hypot(nx * aspect, ny) * Math.tan(HALF_FOV)),
    azimuth: Math.atan2(ny, nx * aspect),
  }
}
export function backgroundDirection(phi: number, azimuth: number, yaw: number) {
  const radial = Math.cos(phi),
    sideways = Math.sin(phi) * Math.cos(azimuth)
  return {
    x: radial * Math.cos(yaw) - sideways * Math.sin(yaw),
    y: radial * Math.sin(yaw) + sideways * Math.cos(yaw),
    z: Math.sin(phi) * Math.sin(azimuth),
  }
}
export type Outcome = 'sky' | 'captured' | 'unresolved'
export interface Ray {
  outcome: Outcome
  phi: number
  b: number
  minRadius: number
  points: { x: number; y: number }[]
  steps: number
  invariantError: number
}
export interface Model {
  mass: number
  gravity: boolean
}

export function geometry(mass: number) {
  if (!Number.isFinite(mass) || mass <= 0) throw new RangeError('Masa positiva y finita requerida')
  const rs = mass * RS_REFERENCE
  const observer = OBSERVER_DISTANCE / rs
  const sky = SKY_DISTANCE / rs
  if (![rs, observer, sky].every(Number.isFinite) || observer <= 1.5)
    throw new RangeError(
      'Escala fuera del dominio: la cámara debe estar fuera de la esfera de fotones',
    )
  return {
    rs,
    observer,
    sky,
    shadowAngle: Math.asin((CRITICAL_B * Math.sqrt(1 - 1 / observer)) / observer),
  }
}

export function impactParameter(observer: number, angle: number) {
  return (observer * Math.sin(angle)) / Math.sqrt(1 - 1 / observer)
}

// RK4 in phi avoids the Schwarzschild coordinate-time singularity at the horizon.
// No artificial bending force, fitted lens equation or pre-drawn ring is used.
export function traceNormalized(
  observer: number,
  sky: number,
  angle: number,
  gravity = true,
  { step = 0.004, maxPhi = 12 * Math.PI, keepPath = true } = {},
): Ray {
  if (
    ![observer, sky, angle, step, maxPhi].every(Number.isFinite) ||
    observer <= 1.5 ||
    sky <= observer ||
    angle < 0 ||
    angle >= Math.PI / 2 ||
    step <= 0 ||
    step > 0.05 ||
    maxPhi <= 0 ||
    maxPhi > 24 * Math.PI
  )
    throw new RangeError('Condiciones del rayo fuera del dominio')
  const b = gravity ? impactParameter(observer, angle) : observer * Math.sin(angle)
  const points: Ray['points'] = keepPath ? [{ x: observer, y: 0 }] : []
  if (!gravity) {
    const distance =
      observer * Math.cos(angle) + Math.sqrt(sky ** 2 - observer ** 2 * Math.sin(angle) ** 2)
    const x = observer - distance * Math.cos(angle),
      y = distance * Math.sin(angle)
    if (keepPath) points.push({ x, y })
    return {
      outcome: 'sky',
      phi: Math.atan2(y, x),
      b,
      minRadius: b,
      points,
      steps: 0,
      invariantError: 0,
    }
  }
  if (angle < 1e-10) {
    if (keepPath) points.push({ x: 1, y: 0 })
    return { outcome: 'captured', phi: 0, b, minRadius: 1, points, steps: 0, invariantError: 0 }
  }
  let u = 1 / observer,
    v = Math.cos(angle) / b,
    phi = 0,
    steps = 0,
    maxU = u,
    invariantError = 0
  const target = 1 / sky,
    energy = 1 / b ** 2
  let outcome: Outcome = 'unresolved'
  const acceleration = (q: number) => -q + 1.5 * q * q
  const maxSteps = Math.ceil(maxPhi / step) + 1
  for (; steps < maxSteps && phi < maxPhi; steps++) {
    const h = Math.min(step, maxPhi - phi)
    const k1u = v,
      k1v = acceleration(u)
    const k2u = v + (h * k1v) / 2,
      k2v = acceleration(u + (h * k1u) / 2)
    const k3u = v + (h * k2v) / 2,
      k3v = acceleration(u + (h * k2u) / 2)
    const k4u = v + h * k3v,
      k4v = acceleration(u + h * k3u)
    const nextU = u + (h * (k1u + 2 * k2u + 2 * k3u + k4u)) / 6
    const nextV = v + (h * (k1v + 2 * k2v + 2 * k3v + k4v)) / 6
    let fraction = 1
    if (nextU >= 1) {
      outcome = 'captured'
      fraction = (1 - u) / (nextU - u)
    } else if (nextU <= target && nextV < 0) {
      outcome = 'sky'
      fraction = (target - u) / (nextU - u)
    }
    phi += h * fraction
    u += (nextU - u) * fraction
    v += (nextV - v) * fraction
    maxU = Math.max(maxU, u)
    // Linear endpoint localization is excluded from the RK conservation diagnostic.
    if (keepPath && fraction === 1)
      invariantError = Math.max(
        invariantError,
        Math.abs((v * v + u * u - u ** 3 - energy) / energy),
      )
    if (keepPath) points.push({ x: Math.cos(phi) / u, y: Math.sin(phi) / u })
    if (outcome !== 'unresolved') break
  }
  const stride = Math.max(1, Math.ceil(points.length / 700))
  return {
    outcome,
    phi,
    b,
    minRadius: 1 / maxU,
    points: points.filter((_, i) => i % stride === 0 || i === points.length - 1),
    steps,
    invariantError,
  }
}

export function traceRay(model: Model, angle: number, keepPath = true) {
  const { observer, sky } = geometry(model.mass)
  return traceNormalized(observer, sky, angle, model.gravity, { keepPath })
}

// Radial symmetry lets the worker solve one family of rays, then reuse it for
// every azimuth. Quadratic sampling resolves the steep map near the shadow.
export function buildTransfer(model: Model, size = TABLE_SIZE) {
  if (!Number.isInteger(size) || size < 32 || size > 4096)
    throw new RangeError('Resolución inválida')
  const g = geometry(model.mass),
    critical = model.gravity ? g.shadowAngle : 0
  const data = new Float32Array(size * 4)
  let unresolved = 0
  for (let i = 0; i < size; i++) {
    const t = i / (size - 1)
    const angle = critical + (MAX_ANGLE - critical) * Math.max(t * t, 1e-12)
    const ray = traceRay(model, angle, false)
    data[4 * i] = ray.phi
    data[4 * i + 1] = ray.outcome === 'sky' ? 1 : 0
    if (ray.outcome !== 'sky') unresolved++
  }
  return { data, critical, unresolved }
}

// First (outer, zero-extra-orbit) image of an exactly aligned background source.
export function alignedRingAngle(model: Model) {
  if (!model.gravity) return 0
  const { shadowAngle } = geometry(model.mass)
  let low = shadowAngle + 1e-5,
    high = MAX_ANGLE
  for (let i = 0; i < 32; i++) {
    const middle = (low + high) / 2
    const ray = traceRay(model, middle, false)
    if (ray.outcome !== 'sky' || ray.phi > Math.PI) low = middle
    else high = middle
  }
  return (low + high) / 2
}

export function interpolateTransfer(data: Float32Array, critical: number, angle: number) {
  if (angle < critical) return null
  const index =
    Math.sqrt(Math.min(1, Math.max(0, (angle - critical) / (MAX_ANGLE - critical)))) *
    (data.length / 4 - 1)
  const low = Math.floor(index),
    high = Math.min(data.length / 4 - 1, low + 1),
    t = index - low
  if (data[4 * low + 1] < 0.5 || data[4 * high + 1] < 0.5) return null
  return data[4 * low] * (1 - t) + data[4 * high] * t
}
