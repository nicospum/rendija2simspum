export interface OpticalHelpEntry {
  id: string
  title: string
  body: string
}

export const PRISM_SCENE_HELP = {
  lamp: {
    id: 'prisma-lampara',
    title: 'Lámpara de luz blanca',
    body: 'La fuente prepara una mezcla de longitudes de onda. Girarla o desplazarla cambia dónde incide el haz; el brillo cambia su intensidad, no los ángulos de refracción. En modo juego podés orientar la lámpara para que la luz atraviese el prisma.',
  },
  prism: {
    id: 'prisma-vidrio',
    title: 'Prisma: refracción y dispersión',
    body: 'Este sólido tiene las mismas caras que usa el cálculo óptico. Al pasar entre aire y material, la luz cambia de dirección según Snell. Como el índice depende de la longitud de onda, las componentes se separan: el prisma no crea los colores de la luz blanca.',
  },
  screen: {
    id: 'prisma-pantalla',
    title: 'Pantalla de observación',
    body: 'Recibe las componentes que llegan hasta ella. Alejarla amplía su separación sobre la pantalla sin cambiar las direcciones de salida del prisma. La banda de colores se calcula con los puntos de llegada; no es una textura fija del arcoíris.',
  },
  spectrum: {
    id: 'prisma-espectro',
    title: 'Colores que llegan a la pantalla',
    body: 'La banda suma las componentes que alcanzan cada posición: donde se superponen, sus colores se mezclan. El modelo muestrea 33 longitudes de onda entre 380 y 700 nm. La pantalla muestra el resultado de la refracción, no colores que el vidrio fabrique.',
  },
  incident: {
    id: 'prisma-haz-blanco',
    title: 'Haz blanco que llega al prisma',
    body: 'El trazo blanco reúne las componentes de la fuente antes de separarse. Representa direcciones de propagación, no una fila de fotones en vuelo. El grosor y el brillo se amplifican para verlo; cambiar la intensidad no cambia su trayectoria geométrica.',
  },
  spectral: {
    id: 'prisma-rayos-espectrales',
    title: 'Rayos de distintas longitudes de onda',
    body: 'Cada componente se calcula con el índice del material para su longitud de onda y la ley de Snell. Las líneas de color son muestras del espectro continuo: consultá un trazo concreto para leer su longitud de onda y si está dentro o fuera del prisma.',
  },
} as const satisfies Record<string, OpticalHelpEntry>

export interface OpticalSegmentHelp {
  incident: boolean
  wavelength: number
  medium: 'air' | 'prism'
  internalReflections: number
}

/** One record per rendered line segment/quad; indices come from the real geometry. */
export function opticalSegmentHelp(
  segments: readonly OpticalSegmentHelp[],
  segmentIndex: number,
): OpticalHelpEntry | null {
  if (
    !Number.isInteger(segmentIndex) ||
    segmentIndex < 0 ||
    segmentIndex >= segments.length
  )
    return null
  const segment = segments[segmentIndex]
  if (segment.incident) return PRISM_SCENE_HELP.incident
  const location = segment.medium === 'prism' ? 'dentro del prisma' : 'en el aire'
  const reflections = segment.internalReflections
    ? ` Esta trayectoria incluye ${segment.internalReflections} ${segment.internalReflections === 1 ? 'reflexión interna' : 'reflexiones internas'}.`
    : ''
  return {
    id: `prisma-rayo-${segment.wavelength}-${segment.medium}`,
    title: `Rayo de ${segment.wavelength} nm · ${location}`,
    body: `Este trazo representa una componente de ${segment.wavelength} nanómetros ${location}. Su dirección se calcula al cruzar las caras con el índice n(λ) y la ley de Snell; el color es una aproximación para distinguirla de las demás. No representa un fotón individual ni una velocidad medida.${reflections}`,
  }
}
