import { MIN_MASS, MAX_MASS } from './physics.ts'

// The teaching slider spans a useful, linear comparison within a chosen scale.
// Choosing a new scale is deliberate; dragging never traverses 31 orders of magnitude.
export function massWindow(anchor: number) {
  if (!Number.isFinite(anchor) || anchor < MIN_MASS || anchor > MAX_MASS)
    throw new RangeError('Escala inválida')
  return { min: Math.max(MIN_MASS, anchor / 2), max: Math.min(MAX_MASS, anchor * 2) }
}
export function massInWindow(anchor: number, mass: number) {
  if (!Number.isFinite(mass)) throw new RangeError('Masa inválida')
  const { min, max } = massWindow(anchor)
  return Math.max(min, Math.min(max, mass))
}
export interface View {
  zoom: number
  x: number
  y: number
}
export const OVERVIEW: View = { zoom: 1, x: 0, y: 0 }
export const MARKER_SEEDS = new Float32Array(
  Array.from({ length: 40 }, (_, i) => (0.157 + i * 0.61803398875) % 1),
)
export type MapTarget =
  | 'horizon'
  | 'interior'
  | 'emission'
  | 'absorption'
  | 'background'
  | 'reference'
export const visualRadius = (ratio: number) => 0.32 * Math.min(2.2, Math.max(0.22, ratio))
export function boundedView(view: View): View {
  return {
    zoom: Math.max(1, Math.min(2.4, view.zoom)),
    x: Math.max(-0.45, Math.min(0.45, view.x)),
    y: Math.max(-0.35, Math.min(0.35, view.y)),
  }
}
export function worldPoint(nx: number, ny: number, aspect: number, view: View) {
  return { x: (nx * aspect) / view.zoom + view.x, y: ny / view.zoom + view.y }
}
export function markerPosition(
  index: number,
  time: number,
  radius: number,
  signal: number,
  incoming = false,
) {
  const phase = time * (0.025 + signal * 0.16) + MARKER_SEEDS[index] * (incoming ? 0.73 : 1)
  const t = phase - Math.floor(phase)
  const r = incoming ? radius + 0.04 + (1 - t) * 1.25 : radius + 0.045 + t * 1.15
  const a = ((index + 0.5) / 40) * 2 * Math.PI - Math.PI
  return { x: r * Math.cos(a), y: r * Math.sin(a), visible: Math.sin(t * Math.PI) > 0.12 }
}
export function mapTarget(
  point: { x: number; y: number },
  radius: number,
  time: number,
  emission: number,
  absorption: number,
  tolerance: number,
): MapTarget {
  const r = Math.hypot(point.x, point.y)
  if (Math.abs(r - radius) <= tolerance) return 'horizon'
  if (r < radius) return Math.abs(r - 0.32) <= tolerance ? 'reference' : 'interior'
  let nearest = tolerance,
    target: MapTarget | null = null
  for (let i = 0; i < 40; i++) {
    for (const incoming of [false, true]) {
      if (incoming && absorption === 0) continue
      const p = markerPosition(i, time, radius, incoming ? absorption : emission, incoming)
      const distance = Math.hypot(p.x - point.x, p.y - point.y)
      if (p.visible && distance < nearest) {
        nearest = distance
        target = incoming ? 'absorption' : 'emission'
      }
    }
  }
  if (target) return target
  if (Math.abs(r - 0.32) <= tolerance) return 'reference'
  return 'background'
}
