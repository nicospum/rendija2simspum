// Static nonrotating, noncompact BTZ chart; L = hbar = kB = light speed = 1.
// Endpoints are (±ell/2, epsilon), not ideal boundary points z=0.
export const CENTRAL_CHARGE = 60
export const G3 = 3 / (2 * CENTRAL_CHARGE)
export const EPSILON = 0.025
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Number.isFinite(v) ? v : min))
// sinh(v)/v is regular at zero. Its series avoids 0/0 and keeps the cold
// limit stable without subtracting two almost equal, enormous horizon terms.
const sinhc = (v: number) =>
  Math.abs(v) < 1e-4 ? 1 + (v * v) / 6 + v ** 4 / 120 : Math.sinh(v) / v
export function thermalModel(length: number, temperature: number) {
  const ell = clamp(length, 0.5, 6),
    t = clamp(temperature, 0, 0.32),
    eps = EPSILON
  const zh = t > 0 ? 1 / (2 * Math.PI * t) : Infinity
  const inverseZh = 2 * Math.PI * t,
    u = Math.PI * ell * t
  const coshSquared = Math.cosh(u) ** 2
  const zAt = (x: number) => {
    const a = Math.min(ell / 2, Math.abs(x))
    const v = a * inverseZh
    // cosh²u-cosh²v = sinh(u+v)sinh(u-v). Factoring the powers of
    // temperature gives a finite expression even when z_h overflows.
    const shape =
      ((ell / 2 - a) *
        (ell / 2 + a) *
        (1 - (eps * inverseZh) ** 2) *
        sinhc(u + v) *
        sinhc(u - v)) /
      coshSquared
    return Math.sqrt(eps * eps + shape)
  }
  const depth = zAt(0)
  const exactLength = 2 * Math.asinh((ell / (2 * eps)) * sinhc(u))
  const entropy = (CENTRAL_CHARGE / 3) * Math.log((ell / eps) * sinhc(u))
  const vacuumEntropy = (CENTRAL_CHARGE / 3) * Math.log(ell / eps)
  const entropyDensity = (Math.PI * CENTRAL_CHARGE * t) / 3
  return {
    ell,
    t,
    zh,
    eps,
    depth,
    zAt,
    exactLength,
    geometricEntropy: exactLength / (4 * G3),
    entropy,
    vacuumEntropy,
    excess: entropy - vacuumEntropy,
    entropyDensity,
    thermalScale: t === 0 ? Infinity : 1 / (Math.PI * t),
    horizonRadius: 2 * Math.PI * t,
    massParameter: (2 * Math.PI * t) ** 2,
  }
}

/** Adaptive quadrature of ds/dx = L times turningDepth / z(x)^2. */
export function integratedLength(length: number, temperature: number) {
  const m = thermalModel(length, temperature)
  const f = (x: number) => m.depth / m.zAt(x) ** 2
  const simpson = (a: number, b: number) =>
    ((b - a) / 6) * (f(a) + 4 * f((a + b) / 2) + f(b))
  const refine = (
    a: number,
    b: number,
    whole: number,
    tol: number,
    depth: number,
  ): number => {
    const c = (a + b) / 2,
      left = simpson(a, c),
      right = simpson(c, b),
      error = left + right - whole
    if (depth <= 0 || Math.abs(error) <= 15 * tol) return left + right + error / 15
    return (
      refine(a, c, left, tol / 2, depth - 1) + refine(c, b, right, tol / 2, depth - 1)
    )
  }
  return 2 * refine(0, m.ell / 2, simpson(0, m.ell / 2), 1e-7, 22)
}
