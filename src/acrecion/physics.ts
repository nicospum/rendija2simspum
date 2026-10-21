import { traceNormalized, C, GM_SUN, AU } from '../lente/physics.ts'

export { C, GM_SUN, AU }
export const G = 6.6743e-11
export const SIGMA = 5.670374419e-8
export const YEAR = 31557600
export const SOLAR_MASS = GM_SUN / G
export const OBSERVER = 28 // areal radius / rs
export const INNER = 3 // Schwarzschild ISCO, not the horizon
export const OUTER = 14
export const MAX_ANGLE = 1.05
export const MAX_PHI = 3 * Math.PI
export const MAP_WIDTH = 768
export const MAP_HEIGHT = 768
export const PEAK_RADIUS = (49 / 36) * INNER

export interface Setup {
  mass: number // million solar masses
  gas: number // 0..100; linear mass supply, 100 = 10^-3 solar masses/year
  inclination: number // degrees from disk normal
  doppler: boolean
  lens: boolean
  view: 'disk' | 'star'
}
export const DEFAULT: Setup = {
  mass: 4,
  gas: 55,
  inclination: 68,
  doppler: true,
  lens: true,
  view: 'disk',
}

export function validate(s: Setup) {
  if (
    !Number.isFinite(s.mass) ||
    s.mass < 1 ||
    s.mass > 8 ||
    !Number.isFinite(s.gas) ||
    s.gas < 0 ||
    s.gas > 100 ||
    !Number.isFinite(s.inclination) ||
    s.inclination < 0 ||
    s.inclination > 82 ||
    typeof s.doppler !== 'boolean' ||
    typeof s.lens !== 'boolean' ||
    !['disk', 'star'].includes(s.view)
  )
    throw new RangeError('Configuración fuera del modelo')
}

// Newtonian, steady, optically thick, zero-torque thin disk. One-face flux.
// Photon paths and frequency transfer are relativistic; this emissivity is an approximation.
export function diskFlux(radiusRs: number, massMillions: number, gas: number) {
  if (
    ![radiusRs, massMillions, gas].every(Number.isFinite) ||
    radiusRs <= 0 ||
    massMillions <= 0 ||
    gas < 0
  )
    throw new RangeError('Disco fuera del dominio')
  if (radiusRs <= INNER || gas === 0) return 0
  const gm = GM_SUN * massMillions * 1e6
  const rs = (2 * gm) / C ** 2
  const rate = ((gas / 100) * 1e-3 * SOLAR_MASS) / YEAR
  return (
    ((3 * gm * rate) / (8 * Math.PI * (radiusRs * rs) ** 3)) *
    (1 - Math.sqrt(INNER / radiusRs))
  )
}

export function orbitalPeriodYears(massMillions: number, radiusAU = 100) {
  if (
    ![massMillions, radiusAU].every(Number.isFinite) ||
    massMillions <= 0 ||
    radiusAU <= 0
  )
    throw new RangeError('Órbita fuera del dominio')
  return (
    (2 *
      Math.PI *
      Math.sqrt((radiusAU * AU) ** 3 / (GM_SUN * massMillions * 1e6))) /
    YEAR
  )
}

// Local, opposite tangential velocities at 6 rs: diagnostic, not image extrema.
export function localContrast(inclination: number, doppler = true, radius = 6) {
  if (
    !Number.isFinite(inclination) ||
    inclination < 0 ||
    inclination > 82 ||
    !Number.isFinite(radius) ||
    radius < INNER
  )
    throw new RangeError('Contraste fuera del dominio')
  const v =
    Math.sin((inclination * Math.PI) / 180) / Math.sqrt(2 * (radius - 1))
  return doppler ? ((1 + v) / (1 - v)) ** 4 : 1
}

// Exact circular Schwarzschild emitter -> static observer frequency ratio.
// lambda is the forward photon's conserved axial angular momentum / energy, in rs.
export function frequencyShift(radius: number, lambda: number, doppler = true) {
  if (![radius, lambda].every(Number.isFinite) || radius < INNER)
    throw new RangeError('Emisor fuera del disco estable')
  const gravity = Math.sqrt((1 - 1 / radius) / (1 - 1 / OBSERVER))
  if (!doppler) return gravity
  const omega = 1 / Math.sqrt(2 * radius ** 3)
  const denominator = 1 - omega * lambda
  if (denominator <= 0) throw new RangeError('Momento del fotón no físico')
  return Math.sqrt((1 - 1.5 / radius) / (1 - 1 / OBSERVER)) / denominator
}

export function model(s: Setup) {
  validate(s)
  const gm = GM_SUN * s.mass * 1e6
  const rs = (2 * gm) / C ** 2
  const rate = ((s.gas / 100) * 1e-3 * SOLAR_MASS) / YEAR
  // Integrate both faces only to OUTER, consistent with the finite image disk.
  const fraction = 1 - (3 * INNER) / OUTER + 2 * (INNER / OUTER) ** 1.5
  return {
    rs,
    supply: (s.gas / 100) * 1e-3,
    temperature: (diskFlux(PEAK_RADIUS, s.mass, s.gas) / SIGMA) ** 0.25,
    luminosity: ((rate * C ** 2) / 12) * fraction,
    period: orbitalPeriodYears(s.mass),
    contrast: localContrast(s.inclination, s.doppler),
    starRadiusRs: (100 * AU) / rs,
  }
}

// Reuse the lens laboratory's tested RK4 geodesics. Store u=rs/r at fixed phi.
// Spherical symmetry makes this table independent of inclination, gas and mass:
// the camera and disk keep their dimensions in rs. It is built once in a worker.
export function buildDiskMap(width = MAP_WIDTH, height = MAP_HEIGHT) {
  if (
    ![width, height].every((n) => Number.isInteger(n) && n >= 32 && n <= 1024)
  )
    throw new RangeError('Resolución fuera del dominio')
  const data = new Float32Array(width * height)
  for (let x = 0; x < width; x++) {
    const angle = Math.max(1e-8, (x / (width - 1)) * MAX_ANGLE)
    const ray = traceNormalized(OBSERVER, 90, angle, true, {
      step: 0.008,
      maxPhi: MAX_PHI,
      keepPath: true,
    })
    const path = ray.points
    const phis = new Float64Array(path.length)
    for (let j = 1; j < path.length; j++) {
      const a = path[j - 1],
        b = path[j]
      phis[j] =
        phis[j - 1] + Math.atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y)
    }
    let j = 1
    for (let y = 0; y < height; y++) {
      const phi = (y / (height - 1)) * MAX_PHI
      if (phi > ray.phi || path.length < 2) {
        // Keep the horizon opaque beyond capture. Zero would interpolate through
        // emitting radii at the endpoint and create a spurious luminous ring.
        if (ray.outcome === 'captured') data[y * width + x] = 1
        continue
      }
      while (j < path.length - 1 && phis[j] < phi) j++
      const a = path[j - 1],
        b = path[j]
      const t = (phi - phis[j - 1]) / Math.max(1e-12, phis[j] - phis[j - 1])
      data[y * width + x] =
        (1 - t) / Math.hypot(a.x, a.y) + t / Math.hypot(b.x, b.y)
    }
  }
  return { data, width, height }
}
