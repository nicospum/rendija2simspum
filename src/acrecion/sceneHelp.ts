import { MAX_ANGLE, MAX_PHI, OBSERVER, PEAK_RADIUS } from './physics.ts'
import type { Setup } from './physics.ts'

export interface DiskMap {
  data: Float32Array
  width: number
  height: number
}

/** Match texture2D's texel-centered, clamped linear interpolation in DiskView. */
export function diskRadiusAt(map: DiskMap, angle: number, phi: number) {
  const x = Math.max(0, Math.min(1, angle / MAX_ANGLE)) * (map.width - 1)
  const y = Math.max(0, Math.min(1, phi / MAX_PHI)) * (map.height - 1)
  const x0 = Math.floor(x),
    y0 = Math.floor(y)
  const x1 = Math.min(map.width - 1, x0 + 1),
    y1 = Math.min(map.height - 1, y0 + 1)
  const tx = x - x0,
    ty = y - y0
  const u =
    (1 - ty) *
      ((1 - tx) * map.data[y0 * map.width + x0] + tx * map.data[y0 * map.width + x1]) +
    ty * ((1 - tx) * map.data[y1 * map.width + x0] + tx * map.data[y1 * map.width + x1])
  return u > 0.00001 ? 1 / u : 1000
}

/** Screen-ray intersections repeat the rendered fragment's geometry, not a new model. */
export function diskRegionAt(
  nx: number,
  ny: number,
  aspect: number,
  map: DiskMap,
  setup: Setup,
) {
  const px = nx * aspect,
    py = ny
  const length = Math.hypot(px, py)
  const angle = Math.atan(length * (0.7 / Math.min(aspect, 1.5)))
  const ex = length > 0.000001 ? px / length : 1
  const ey = length > 0.000001 ? py / length : 0
  const inclination = (setup.inclination * Math.PI) / 180
  const si = Math.sin(inclination),
    co = Math.cos(inclination)
  const impact = (OBSERVER * Math.sin(angle)) / Math.sqrt(1 - 1 / OBSERVER)
  let radius = 1000,
    order = 0
  if (setup.lens) {
    let first = Math.atan2(-co, ey * si)
    if (first <= 0) first += Math.PI
    for (let k = 0; k < 3; k++) {
      const candidate = diskRadiusAt(map, angle, first + k * Math.PI)
      if (candidate > 3.002 && candidate < 14) {
        radius = candidate
        order = k
        break
      }
    }
  } else {
    const dz = -Math.cos(angle) * co + Math.sin(angle) * ey * si
    const t = (-OBSERVER * co) / dz
    const hx = t * Math.sin(angle) * ex
    const hy = -OBSERVER * si + t * (Math.cos(angle) * si + Math.sin(angle) * ey * co)
    const hz = OBSERVER * co + t * dz
    const candidate = Math.hypot(hx, hy, hz)
    const closest = OBSERVER * Math.cos(angle)
    const b = OBSERVER * Math.sin(angle)
    const occulted = b < 1 && t > closest - Math.sqrt(Math.max(0, 1 - b * b))
    if (t > 0 && candidate > 3.002 && candidate < 14 && !occulted) radius = candidate
  }
  // The shader paints emitting gas after the shadow mask: foreground disk wins.
  if (radius < 15 && setup.gas > 0) {
    const g = setup.doppler
      ? Math.sqrt((1 - 1.5 / radius) / (1 - 1 / OBSERVER)) /
        (1 + (impact * si * ex) / Math.sqrt(2 * radius ** 3))
      : Math.sqrt((1 - 1 / radius) / (1 - 1 / OBSERVER))
    const flux =
      ((PEAK_RADIUS / radius) ** 3 * (1 - Math.sqrt(3 / radius))) /
      (1 - Math.sqrt(3 / PEAK_RADIUS))
    return {
      kind: 'disk' as const,
      order,
      radius,
      g,
      flux,
      id: `disk-${order > 0 ? 'bent' : 'direct'}-${g >= 1 ? 'blue' : 'warm'}`,
    }
  }
  return impact < (setup.lens ? 2.598076211 : 1)
    ? { kind: 'shadow' as const, id: 'disk-shadow' }
    : { kind: 'background' as const, id: 'disk-background' }
}

export function diskRegionEntry(region: ReturnType<typeof diskRegionAt>, setup: Setup) {
  if (region.kind === 'disk') {
    const radius = region.radius.toLocaleString('es-AR', { maximumFractionDigits: 2 })
    const shift = region.g.toLocaleString('es-AR', { maximumFractionDigits: 3 })
    return {
      title: `${region.order > 0 ? 'Imagen curvada del disco' : 'Gas del disco'} · ${region.g >= 1 ? 'frecuencia mayor' : 'frecuencia menor'}`,
      body: `La dirección seleccionada recibe luz del gas a r≈${radius} rₛ, fuera del borde interno del disco (3 rₛ) y del horizonte (rₛ). ${region.order > 0 ? 'La trayectoria rodea más al agujero negro y vuelve a cruzar el plano del disco: es otra imagen del mismo gas, no un segundo disco.' : 'La primera intersección luminosa del rayo con el plano del disco produce esta parte de la imagen.'} La razón de frecuencias recibida/emitida es g≈${shift}. ${setup.doppler ? 'Combina movimiento orbital y gravedad; los colores son una ayuda de falso color, no un espectro RGB observado.' : 'El contraste por movimiento está apagado; permanece el corrimiento gravitatorio.'} Este brillo es acreción, no radiación de Hawking.`,
    }
  }
  if (region.kind === 'shadow')
    return {
      title: 'La sombra aparente',
      body: `Esta dirección se dibuja oscura porque no recibe luz del disco emisor ni del fondo en la zona de captura del modelo. La sombra no es el horizonte visto como una corteza: la captura de luz cambia su tamaño aparente. ${setup.gas === 0 ? 'El suministro está en cero: no hay emisión del disco que pueda iluminar esta imagen.' : 'La luz brillante que la rodea procede del gas exterior, no del interior del agujero negro.'}`,
    }
  return {
    title: 'Fondo ilustrativo',
    body: `Esta dirección no muestra una intersección luminosa con el disco actual. Las estrellas y la nube de fondo son ilustrativas: este visor calcula la transferencia de luz del disco, no la lente sobre todo ese fondo. ${setup.gas === 0 ? 'Con suministro cero, el disco no emite; podés reconocer que una fuente oscura aún puede influir sobre la estrella testigo.' : 'La textura del gas y su movimiento visible también son ayudas: no se está resolviendo una simulación hidrodinámica de partículas.'}`,
  }
}
