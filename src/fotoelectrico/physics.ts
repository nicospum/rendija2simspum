/** Single-photon, monochromatic photoemission. SI except displayed energies in eV.
 * Work functions are nominal teaching values, not properties of every real surface. */
export const H = 6.62607015e-34
export const E_CHARGE = 1.602176634e-19
export const H_EV = H / E_CHARGE
export const C = 299792458
export const M_E = 9.1093837139e-31
export const MAX_POWER = 1e-6 // W incident on the whole target at 100% brightness
export const YIELD = 0.1 // illustrative constant quantum efficiency, above threshold only
export const MATERIALS = {
  sodio: { name: 'Sodio', symbol: 'Na', work: 2.46, color: '#c1d2da' },
  zinc: { name: 'Zinc', symbol: 'Zn', work: 4.31, color: '#9cafc1' },
  plata: { name: 'Plata', symbol: 'Ag', work: 4.73, color: '#e2e3e5' },
} as const
export type Material = keyof typeof MATERIALS
export interface Setup {
  frequency: number
  brightness: number
  material: Material
}
export const DEFAULT: Setup = {
  frequency: 650,
  brightness: 50,
  material: 'sodio',
}
export function validate(s: Setup) {
  if (
    !Number.isFinite(s.frequency) ||
    s.frequency < 350 ||
    s.frequency > 1600 ||
    !Number.isFinite(s.brightness) ||
    s.brightness < 0 ||
    s.brightness > 100 ||
    !Object.prototype.hasOwnProperty.call(MATERIALS, s.material)
  )
    throw new RangeError('Configuración fotoeléctrica inválida.')
}
export function snapshot(s: Setup) {
  validate(s)
  const material = MATERIALS[s.material],
    frequency = s.frequency * 1e12,
    photonEv = H_EV * frequency,
    threshold = material.work / H_EV / 1e12
  // Computing the excess from frequency - threshold makes the exact threshold unambiguous.
  const surplus = H_EV * 1e12 * (s.frequency - threshold),
    power = (MAX_POWER * s.brightness) / 100
  const canEmit = s.frequency > threshold,
    emitting = canEmit && power > 0,
    kineticMax = emitting ? surplus : 0
  const photonRate = power / (H * frequency),
    emissionRate = emitting ? YIELD * photonRate : 0
  return {
    material,
    photonEv,
    threshold,
    wavelength: (C / frequency) * 1e9,
    power,
    photonRate,
    surplus,
    canEmit,
    emitting,
    kineticMax,
    emissionRate,
    current: E_CHARGE * emissionRate,
    speed: Math.sqrt((2 * kineticMax * E_CHARGE) / M_E),
    stopping: kineticMax,
  }
}
/** Approximate visible hue; UV/IR use explicitly identified false colours. */
export function spectrum(frequency: number) {
  if (!Number.isFinite(frequency) || frequency < 350 || frequency > 1600)
    throw new RangeError('Frecuencia visual inválida.')
  const wavelength = (C / (frequency * 1e12)) * 1e9
  if (wavelength < 380)
    return { color: '#c7a0ff', band: 'Ultravioleta · color simbólico' }
  if (wavelength > 750)
    return { color: '#e79578', band: 'Infrarrojo · color simbólico' }
  const stops = [
    [380, 174, 95, 255],
    [440, 95, 115, 255],
    [490, 75, 218, 255],
    [510, 89, 231, 174],
    [580, 249, 226, 94],
    [645, 255, 107, 88],
    [750, 233, 93, 82],
  ]
  const i = stops.findIndex(
      (p, j) =>
        j < stops.length - 1 &&
        wavelength >= p[0] &&
        wavelength <= stops[j + 1][0],
    ),
    a = stops[i],
    b = stops[i + 1],
    t = (wavelength - a[0]) / (b[0] - a[0])
  const rgb = [1, 2, 3].map((k) => Math.round(a[k] + (b[k] - a[k]) * t))
  return {
    color: `rgb(${rgb.join(',')})`,
    band: 'Luz visible · color aproximado',
  }
}
export interface Representative {
  x: number
  y: number
}
/** Stationary stream of representatives. Positions follow constant-speed free flight.
 * Rates are reduced and flight times enlarged independently, not a common spacetime scale. */
export function stream(
  rate: number,
  duration: number,
  time: number,
  maxCount = 64,
): Representative[] {
  if (
    ![rate, duration, time].every(Number.isFinite) ||
    rate < 0 ||
    duration <= 0 ||
    time < 0 ||
    !Number.isInteger(maxCount) ||
    maxCount < 1 ||
    maxCount > 128
  )
    throw new RangeError('Flujo visual inválido.')
  if (rate === 0) return []
  const latest = Math.floor(time * rate),
    count = Math.min(maxCount, Math.ceil(rate * duration))
  return Array.from({ length: count }, (_, i) => {
    const birth = latest - i,
      age = time - birth / rate
    return { x: age / duration, y: (((birth % 7) + 7) % 7) / 6 }
  }).filter((p) => p.x >= 0 && p.x <= 1)
}
