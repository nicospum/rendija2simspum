import {
  DEFAULT_CONFIG,
  fringeSpacing,
  normalizeConfig,
  type Config,
} from '../physics/interference.ts'

export type LessonId = 'accumulation' | 'separation' | 'detector' | 'single'

export const LESSONS: ReadonlyArray<{
  id: LessonId
  number: string
  title: string
  question: string
  instruction: string
  controlId: string
}> = [
  {
    id: 'accumulation',
    number: '01',
    title: 'De un punto a un patrón',
    question: '¿Un solo impacto alcanza para descubrir las franjas?',
    instruction: 'Emití una partícula y después acumulá muchas, sin cambiar el montaje.',
    controlId: 'emission-controls',
  },
  {
    id: 'separation',
    number: '02',
    title: 'Separar las rendijas',
    question: '¿Rendijas más separadas producen franjas más separadas?',
    instruction: 'Cambiá solo la separación d de 0,30 a 0,45 u y compará dos corridas.',
    controlId: 'slit-separation',
  },
  {
    id: 'detector',
    number: '03',
    title: 'Registrar el camino',
    question: '¿Qué cambia si el aparato distingue por cuál rendija pasó?',
    instruction: 'Cambiá solo el detector de 0 a 100 % y acumulá una nueva corrida.',
    controlId: 'detector-strength',
  },
  {
    id: 'single',
    number: '04',
    title: 'Una rendija también difracta',
    question: '¿Una abertura más ancha dispersa más o menos el patrón?',
    instruction: 'Con una rendija, cambiá solo su ancho a de 0,065 a 0,100 u.',
    controlId: 'slit-width',
  },
]

/** A teaching prompt, not a statistical significance or convergence test. */
export const MIN_COMPARISON_SAMPLES = 800

export function lessonConfig(lesson: LessonId): Config {
  return { ...DEFAULT_CONFIG, ...(lesson === 'single' ? { slitCount: 1 } : {}) }
}

/** Suggested one-variable change. The caller samples actual detections separately. */
export function proposedConfig(lesson: LessonId): Config {
  const config = lessonConfig(lesson)
  if (lesson === 'separation') return { ...config, slitSeparation: 0.45 }
  if (lesson === 'detector') return { ...config, detectorStrength: 1 }
  if (lesson === 'single') return { ...config, slitWidth: 0.1 }
  return config
}

export interface Reading {
  config: Config
  histogram: number[]
  detected: number
  configValid: boolean
  dataValid: boolean
  /** Predicted spacing of principal interference orders; absent without cross terms. */
  fringeSpacing: number | null
  /** Predicted distance between the two first single-slit diffraction zeros. */
  centralLobeWidth: number
  /** Fraction of this ideal ensemble whose path amplitudes still interfere. */
  coherentFraction: number
}

const configKeys = Object.keys(DEFAULT_CONFIG) as (keyof Config)[]
const close = (a: number, b: number) => Math.abs(a - b) < 1e-9
const sameValue = (a: Config[keyof Config], b: Config[keyof Config]) =>
  typeof a === 'number' && typeof b === 'number' ? close(a, b) : a === b
const fixed = (value: number, digits = 3) => value.toFixed(digits).replace('.', ',')

/**
 * Copy a run before controls clear it. Model metrics are kept separate from the
 * sampled counts: a theoretical zero is never presented as a measured minimum.
 */
export function makeReading(
  config: Config,
  histogram: readonly number[],
  detected: number,
): Reading {
  const normalized = normalizeConfig(config)
  const configValid = configKeys.every((key) => sameValue(config[key], normalized[key]))
  const dataValid =
    Number.isSafeInteger(detected) &&
    detected >= 0 &&
    histogram.length > 0 &&
    histogram.every((count) => Number.isSafeInteger(count) && count >= 0) &&
    histogram.reduce((sum, count) => sum + count, 0) === detected
  return {
    config: { ...config },
    histogram: [...histogram],
    detected,
    configValid,
    dataValid,
    fringeSpacing:
      normalized.slitCount > 1 && normalized.detectorStrength < 1
        ? fringeSpacing(normalized)
        : null,
    centralLobeWidth:
      (2 * normalized.wavelength * normalized.screenDistance) / normalized.slitWidth,
    coherentFraction: 1 - normalized.detectorStrength,
  }
}

export interface LessonFeedback {
  status: 'ready' | 'predicted' | 'sampled' | 'blocked' | 'changed'
  heading: string
  text: string
}

const allowedKey: Record<LessonId, keyof Config | null> = {
  accumulation: null,
  separation: 'slitSeparation',
  detector: 'detectorStrength',
  single: 'slitWidth',
}

/**
 * The sample threshold only invites comparison. Even an arbitrary histogram can
 * pass that threshold: feedback must not claim that the observed data agree.
 */
export function describeLesson(
  lesson: LessonId,
  baseline: Reading,
  current: Reading,
  paused: boolean,
): LessonFeedback {
  if (!baseline.configValid || !current.configValid || !baseline.dataValid || !current.dataValid) {
    return {
      status: 'blocked',
      heading: 'Falta una corrida válida',
      text: 'Reiniciá el reto. La configuración y los conteos deben pertenecer a una misma corrida antes de comparar.',
    }
  }
  if (paused) {
    return {
      status: 'blocked',
      heading: 'La emisión está pausada',
      text: 'Los controles actualizan el modelo, pero no se registran nuevos impactos. Reanudá para acumular detecciones.',
    }
  }

  const wrongSetup =
    baseline.config.slitCount !== (lesson === 'single' ? 1 : 2) ||
    baseline.config.detectorStrength !== 0
  const unrelatedChange = configKeys.some(
    (key) => key !== allowedKey[lesson] && !sameValue(baseline.config[key], current.config[key]),
  )
  if (wrongSetup || unrelatedChange) {
    return {
      status: 'changed',
      heading: 'La comparación perdió su referencia',
      text: 'Reiniciá el reto y cambiá solo el control indicado. Así podés relacionar lo que cambia en el patrón con una sola causa.',
    }
  }

  if (lesson === 'accumulation') {
    if (current.detected === 0) {
      return {
        status: 'ready',
        heading: 'Todavía no hay impactos',
        text: 'Emití una partícula. La curva es una predicción del modelo; la pantalla todavía no aporta una muestra.',
      }
    }
    if (current.detected < MIN_COMPARISON_SAMPLES) {
      return {
        status: 'ready',
        heading:
          current.detected === 1
            ? 'Un punto no revela el patrón'
            : 'La muestra todavía fluctúa mucho',
        text: `Hay ${current.detected === 1 ? '1 detección' : `${current.detected} detecciones`}. Acumulá más sin cambiar el montaje: los eventos son localizados y aleatorios; la distribución aparece al comparar sus frecuencias.`,
      }
    }
    return {
      status: 'sampled',
      heading: 'Muchos puntos: contrastá la distribución',
      text: `Hay ${current.detected} detecciones del mismo montaje. Compará las barras con la probabilidad calculada: buscá zonas frecuentes y poco frecuentes. Una cantidad grande de puntos no garantiza coincidencia exacta ni revela por dónde pasó cada partícula.`,
    }
  }

  const key = allowedKey[lesson]!
  if (sameValue(baseline.config[key], current.config[key])) {
    return {
      status: 'ready',
      heading: 'Predecí antes de cambiar el control',
      text: LESSONS.find((item) => item.id === lesson)!.instruction,
    }
  }

  let prediction: string
  if (lesson === 'separation') {
    prediction = `La separación de franjas calculada pasa de ${fixed(baseline.fringeSpacing!)} a ${fixed(current.fringeSpacing!)} u: Δz = λL/d. La envolvente de difracción conserva su ancho porque a, λ y L siguen iguales.`
  } else if (lesson === 'detector') {
    const marked = Math.round(current.config.detectorStrength * 100)
    prediction =
      current.config.detectorStrength === 1
        ? 'Al 100 %, el modelo suma probabilidades de caminos distinguibles y elimina los términos de interferencia. Conserva la difracción de cada abertura: no predice dos líneas finas. Registrar información es una interacción física; no requiere una persona mirando.'
        : `El detector marca el ${marked} % del conjunto ideal. El resto todavía aporta interferencia; la difracción de cada abertura permanece. Ese porcentaje representa una mezcla del modelo, no una medida universal de cuánto se conoce el camino.`
  } else {
    prediction = `Con una sola rendija no hay interferencia entre dos aberturas. El ancho central calculado entre los primeros mínimos pasa de ${fixed(baseline.centralLobeWidth)} a ${fixed(current.centralLobeWidth)} u: 2λL/a. Una abertura más ancha produce una distribución de difracción más estrecha.`
  }

  const enoughSamples =
    baseline.detected >= MIN_COMPARISON_SAMPLES && current.detected >= MIN_COMPARISON_SAMPLES
  if (!enoughSamples) {
    const missing =
      baseline.detected < MIN_COMPARISON_SAMPLES
        ? 'Falta una referencia con suficientes detecciones: reiniciá el reto y acumulá antes de cambiar el control.'
        : `La nueva corrida tiene ${current.detected} impactos. Acumulá más para comparar sus frecuencias con la referencia guardada.`
    return {
      status: 'predicted',
      heading: 'Cambió la predicción; faltan datos para contrastar',
      text: `${prediction} ${missing} La curva calculada no es una medición.`,
    }
  }
  return {
    status: 'sampled',
    heading: 'Dos corridas: compará la evidencia',
    text: `${prediction} Tenés ${baseline.detected} y ${current.detected} detecciones. Compará las frecuencias normalizadas: el número de impactos por sí solo no demuestra que la muestra coincida con la predicción.`,
  }
}
