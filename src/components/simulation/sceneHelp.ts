import type { BufferGeometry } from 'three'

/** R3F can replace position attributes while retaining the geometry instance. */
export function invalidatePickingBounds(geometry: BufferGeometry | null) {
  if (!geometry) return
  geometry.boundingBox = null
  geometry.boundingSphere = null
}

export const SLIT_SCENE_HELP = {
  emitter: {
    id: 'rendija-emisor',
    title: 'Emisor de partículas',
    body: 'Prepara las emisiones del modelo. Cada detección posterior será localizada, aunque el patrón de muchas emisiones depende de las amplitudes de las rendijas. No dibujamos una partícula siguiendo un camino secreto entre la fuente y la pantalla.',
  },
  barrier: {
    id: 'rendija-barrera',
    title: 'Barrera y aberturas',
    body: 'Las aberturas dejan pasar amplitudes. Su ancho controla la envolvente de difracción; la distancia entre centros controla la separación de las franjas de interferencia. Una sola rendija también difracta: perder interferencia entre rendijas no elimina ese efecto.',
  },
  aperture: {
    id: 'rendija-aberturas',
    title: 'Borde de una rendija',
    body: 'Estos bordes delimitan el ancho de la abertura. En modo juego, estrecharla ensancha la difracción. Con varias aberturas, sus amplitudes interfieren cuando no queda información del camino. El dibujo no indica por qué rendija pasó una detección individual.',
  },
  screen: {
    id: 'rendija-pantalla',
    title: 'Pantalla de detección',
    body: 'Aquí se registran impactos individuales. El patrón aparece al acumular muchos eventos. Alejar la pantalla cambia la escala espacial de la distribución; no convierte un impacto individual en una franja. Los puntos registrados y la probabilidad teórica se muestran por separado.',
  },
  detections: {
    id: 'rendija-impactos',
    title: 'Un punto: una detección',
    body: 'Cada punto claro representa una detección muestreada de la distribución calculada. No es una partícula todavía viajando ni revela su camino por las rendijas. El modelo predice la distribución horizontal; la altura del punto es decorativa. El visor conserva hasta 2000 impactos recientes, mientras el histograma incluye todos los de la corrida.',
  },
  theory: {
    id: 'rendija-probabilidad',
    title: 'Probabilidad teórica, no impactos',
    body: 'El fondo azul y la curva describen la distribución ideal del modelo de Fraunhofer. Son una predicción, no detecciones acumuladas ni una fotografía de ondas de materia. Comparalos con el histograma cuando haya muchos impactos, usando frecuencias relativas.',
  },
  waveGuide: {
    id: 'rendija-guia-ondas',
    title: 'Guía de frentes de onda',
    body: 'Las líneas violetas ayudan a imaginar las amplitudes que parten de las aberturas. Su separación está ampliada ocho veces para que se vea; no es el campo numérico con el que se muestrean impactos, ni un dibujo de trayectorias ocultas de las partículas.',
  },
} as const

export function pathDetectorHelp(active: boolean, strength: number) {
  return {
    id: 'rendija-detector-camino',
    title: active ? 'Registro del camino activo' : 'Registro del camino inactivo',
    body: active
      ? `El detector representa información física sobre la abertura atravesada. La fracción ideal del conjunto con registro de camino es ${Math.round(strength * 100)} %. Esa parte suma probabilidades en vez de amplitudes entre rendijas, reduciendo su interferencia; la difracción de cada abertura sigue presente. No depende de que una persona mire la pantalla.`
      : 'Este indicador está inactivo: el montaje no está registrando por qué abertura pasa cada evento. Con varias rendijas pueden interferir sus amplitudes. Activar información del camino modifica el patrón del conjunto, no el tamaño de cada punto detectado ni la conciencia de un observador.',
  }
}
