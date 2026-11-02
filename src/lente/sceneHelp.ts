import {
  backgroundDirection,
  degrees,
  directionForPixel,
  interpolateTransfer,
  radians,
} from './physics.ts'

interface ImageState {
  critical: number
  data: Float32Array
  source: number
  yaw: number
}

/** The same angular coordinate and transfer lookup as ObserverView's fragment. */
export function observerRegionAt(
  nx: number,
  ny: number,
  aspect: number,
  state: ImageState,
) {
  const { angle, azimuth } = directionForPixel(nx, ny, aspect)
  if (angle < state.critical) return { kind: 'shadow' as const, angle, azimuth }
  const phi = interpolateTransfer(state.data, state.critical, angle)
  if (phi === null) return { kind: 'unresolved' as const, angle, azimuth }
  const direction = backgroundDirection(phi, azimuth, radians(state.yaw))
  const source = radians(state.source)
  const separation = Math.max(
    0,
    1 - (-direction.x * Math.cos(source) + direction.y * Math.sin(source)),
  )
  return {
    kind: separation <= 0.0015 ? ('source' as const) : ('background' as const),
    angle,
    azimuth,
    phi,
  }
}

export function observerRegionEntry(
  region: ReturnType<typeof observerRegionAt>,
  gravity: boolean,
) {
  const angle = degrees(region.angle).toLocaleString('es-AR', {
    maximumFractionDigits: 2,
  })
  switch (region.kind) {
    case 'shadow':
      return {
        title: 'Sombra: una dirección de captura',
        body: `Esta dirección está a ${angle}° del centro de la imagen. Al rastrearla hacia atrás no conecta con la esfera de fondo: pertenece a la región de captura. La mancha oscura es una sombra aparente, no una fotografía de la superficie del horizonte ni una esfera sólida. Su tamaño angular depende de la masa y de la distancia.`,
      }
    case 'unresolved':
      return {
        title: 'Dirección sin resolver en la tabla',
        body: 'Esta franja oscura está fuera del dominio de fondo resuelto por la tabla numérica actual. No se la identifica automáticamente con el horizonte: cerca de la dirección crítica las trayectorias pueden dar muchas vueltas y superar el límite de integración.',
      }
    case 'source':
      return {
        title: gravity ? 'Una imagen de la fuente dorada' : 'La fuente dorada sin lente',
        body: `La luz que llega desde esta dirección (${angle}°) proviene de la fuente dorada del fondo. ${gravity ? 'La trayectoria calculada se curva: distintas direcciones pueden corresponder a la misma fuente y, al alinearla, formar un anillo. No son estrellas nuevas ni radiación de Hawking.' : 'Con la desviación gravitatoria apagada sirve como control para comparar la posición aparente. No aparece una lente gravitacional en este control.'}`,
      }
    default:
      return {
        title: gravity ? 'Luz del fondo desviada' : 'Luz del fondo sin lente',
        body: `Esta dirección de observación está a ${angle}°. ${gravity ? 'La tabla de geodésicas conecta el píxel con un origen del fondo; por eso las estrellas pueden verse desplazadas o repetidas. El dibujo de estrellas es una fuente ilustrativa; la transformación de sus direcciones sí se calcula.' : 'La desviación gravitatoria está apagada. Compará esta dirección con el control activado para distinguir el fondo de su distorsión aparente.'} Tocá la imagen al salir de la ayuda para seguir ese rayo en el diagrama.`,
      }
  }
}
