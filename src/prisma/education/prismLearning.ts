import { refractiveIndex, type ExperimentConfig, type ExperimentResult } from '../physics/optics.ts'

export type LessonId = 'split' | 'brightness' | 'distance' | 'material'

export const LESSONS: ReadonlyArray<{
  id: LessonId
  number: string
  title: string
  question: string
  instruction: string
  controlId: string
}> = [
  {
    id: 'split',
    number: '01',
    title: 'De la luz blanca al espectro',
    question: '¿Qué pasa cuando la luz blanca atraviesa el prisma?',
    instruction: 'Cambiá solo la dirección de 16° a 0° para que el haz atraviese el prisma.',
    controlId: 'light-angle',
  },
  {
    id: 'brightness',
    number: '02',
    title: 'Brillo y trayectoria',
    question: '¿Más brillo significa más desviación?',
    instruction: 'Cambiá solo la intensidad y compará el brillo con la desviación medida.',
    controlId: 'intensity',
  },
  {
    id: 'distance',
    number: '03',
    title: 'Una pantalla más lejos',
    question: '¿Se separan más los colores o cambia su dirección?',
    instruction: 'Cambiá solo la distancia de la pantalla de 3,2 a 4,2 u y compará Δz.',
    controlId: 'screen-distance',
  },
  {
    id: 'material',
    number: '04',
    title: 'Un material diferente',
    question: '¿Todos los materiales separan igual la luz?',
    instruction: 'Cambiá solo el material de vidrio a cuarzo y compará la separación.',
    controlId: 'prism-material',
  },
]

export interface Reading {
  config: ExperimentConfig
  intensity: number
  lightEnabled: boolean
  /** Geometrical result; feedback separately checks whether it is visible. */
  spread: number | null
  deviation: number | null
  /** n(380 nm) − n(700 nm), not the index at one wavelength. */
  dispersionIndex: number
  centralSpectrum: { wavelength: number; z: number; color: string }[]
  visibleRefractedHits: number
  whiteHits: number
  outsideHits: number
  mixed: boolean
  hasFullSpectrum: boolean
  reflections: number
}

const VISIBLE_LIMIT = 12
const close = (a: number, b: number) => Math.abs(a - b) < 1e-8
const finiteOrNull = (value: number | null) =>
  value !== null && Number.isFinite(value) ? value : null
const fixed = (value: number, digits: number) => value.toFixed(digits).replace('.', ',')
const distance = (value: number) => `${fixed(value, 3)} u`
const angle = (value: number) => `${fixed(value, 2)}°`

export function makeReading(
  config: ExperimentConfig,
  experiment: ExperimentResult,
  intensity: number,
  lightEnabled: boolean,
): Reading {
  const visibleHit = (z: number) => Number.isFinite(z) && Math.abs(z) <= VISIBLE_LIMIT
  const visibleRefracted = experiment.rays.filter(
    (ray) => ray.status === 'screen' && ray.screenHit && visibleHit(ray.screenHit.z),
  )
  const centralSpectrum = visibleRefracted
    .filter((ray) => ray.offset === 0)
    .map((ray) => ({ wavelength: ray.wavelength, z: ray.screenHit!.z, color: ray.color }))
  const whiteHits = experiment.rays.filter(
    (ray) => ray.status === 'missed' && ray.screenHit && visibleHit(ray.screenHit.z),
  ).length
  return {
    config: { ...config },
    intensity,
    lightEnabled,
    spread: finiteOrNull(experiment.metrics.spectralSpread),
    deviation: finiteOrNull(experiment.metrics.deviationAngle),
    dispersionIndex: refractiveIndex(380, config.material) - refractiveIndex(700, config.material),
    centralSpectrum,
    visibleRefractedHits: visibleRefracted.length,
    whiteHits,
    outsideHits: experiment.rays.filter(
      (ray) => ray.screenHit && Math.abs(ray.screenHit.z) > VISIBLE_LIMIT,
    ).length,
    mixed: whiteHits > 0 && visibleRefracted.length > 0,
    hasFullSpectrum:
      centralSpectrum.some((ray) => ray.wavelength === 380) &&
      centralSpectrum.some((ray) => ray.wavelength === 700),
    reflections: experiment.metrics.totalInternalReflections,
  }
}

export interface LessonFeedback {
  status: 'ready' | 'observed' | 'blocked' | 'changed'
  heading: string
  text: string
}

const configKeys: readonly (keyof ExperimentConfig)[] = [
  'material',
  'prismAngle',
  'apexAngle',
  'lightAngle',
  'lightOffset',
  'lightWidth',
  'screenDistance',
]
const materialLabels = { glass: 'vidrio', quartz: 'cuarzo', acrylic: 'acrílico' }

/** Conclusions compare the displayed snapshot, never controls awaiting resume. */
export function describeLesson(
  lesson: LessonId,
  baseline: Reading,
  current: Reading,
  frozen: boolean,
): LessonFeedback {
  const blocked = (heading: string, text: string): LessonFeedback => ({
    status: 'blocked',
    heading,
    text,
  })
  if (frozen)
    return blocked(
      'La lectura está congelada',
      'Aplicá y reanudá para observar los ajustes nuevos. La escena todavía muestra la configuración anterior.',
    )
  if (!current.lightEnabled || current.intensity <= 0)
    return blocked(
      'Primero necesitás luz',
      'Encendé la fuente y subí la intensidad. Sin luz visible todavía no podés comparar el resultado.',
    )
  if (current.outsideHits > 0)
    return blocked(
      'Hay impactos fuera del banco visible',
      'El cálculo llega al plano de pantalla, pero parte del haz queda fuera del visor. Volvé al inicio del reto para comparar lo que se ve.',
    )
  if (current.mixed)
    return blocked(
      'Parte del haz evita el prisma',
      'Se mezclan luz blanca y rayos refractados. Volvé al inicio del reto para comparar un haz que atraviese completo el prisma.',
    )

  const whiteOnly = current.whiteHits > 0 && current.visibleRefractedHits === 0
  if (!current.hasFullSpectrum && !(lesson === 'split' && whiteOnly)) {
    return current.reflections > 0
      ? blocked(
          'La luz tomó otra trayectoria',
          'Hay reflexión interna y no llega el espectro completo a la pantalla visible. Volvé al inicio del reto para hacer la comparación.',
        )
      : blocked(
          'Todavía no llega el espectro completo',
          'Revisá la dirección del haz o volvé al inicio del reto. Necesitás ver tanto 380 como 700 nm en la pantalla.',
        )
  }

  const allowedKey: keyof ExperimentConfig | null =
    lesson === 'split'
      ? 'lightAngle'
      : lesson === 'distance'
        ? 'screenDistance'
        : lesson === 'material'
          ? 'material'
          : null
  const otherConfigChanged = configKeys.some(
    (key) =>
      key !== allowedKey &&
      (typeof baseline.config[key] === 'number'
        ? !close(baseline.config[key] as number, current.config[key] as number)
        : baseline.config[key] !== current.config[key]),
  )
  const otherSourceChanged =
    lesson !== 'brightness' && !close(baseline.intensity, current.intensity)
  if (otherConfigChanged || otherSourceChanged || baseline.lightEnabled !== current.lightEnabled) {
    return {
      status: 'changed',
      heading: 'Cambió más de una variable',
      text: 'La comparación ya no aísla una causa. Volvé al inicio del reto y cambiá solo el control indicado.',
    }
  }

  const ready = (): LessonFeedback => ({
    status: 'ready',
    heading: 'Hacé una predicción y probá',
    text: LESSONS.find((item) => item.id === lesson)!.instruction,
  })
  if (lesson === 'split') {
    if (whiteOnly || close(baseline.config.lightAngle, current.config.lightAngle)) return ready()
    if (baseline.whiteHits === 0 || baseline.visibleRefractedHits > 0) {
      return {
        status: 'changed',
        heading: 'Falta la referencia de luz blanca',
        text: 'Volvé al inicio del reto para comparar el haz que evita el prisma con el que lo atraviesa.',
      }
    }
    return {
      status: 'observed',
      heading: 'Una entrada blanca, distintas direcciones',
      text: `Ahora el prisma separa las longitudes de onda: 380 y 700 nm llegan a ${distance(current.spread!)} de distancia entre sí. El modelo reproduce la dispersión; esta comparación sola no reúne todas las pruebas que hizo Newton.`,
    }
  }

  if (
    !baseline.lightEnabled ||
    baseline.intensity <= 0 ||
    !baseline.hasFullSpectrum ||
    baseline.mixed ||
    baseline.outsideHits > 0 ||
    baseline.spread === null ||
    baseline.deviation === null
  ) {
    return {
      status: 'changed',
      heading: 'Necesitás una referencia comparable',
      text: 'Volvé al inicio del reto para guardar un espectro completo y visible antes de cambiar una variable.',
    }
  }
  if (current.spread === null || current.deviation === null)
    return blocked(
      'Falta una medición completa',
      'Volvé al inicio del reto para obtener la separación y la desviación del haz.',
    )

  if (lesson === 'brightness') {
    if (close(baseline.intensity, current.intensity)) return ready()
    return {
      status: 'observed',
      heading: 'El brillo cambió; la trayectoria, igual',
      text: `La intensidad pasó de ${Math.round(baseline.intensity * 100)} a ${Math.round(current.intensity * 100)} %. La separación sigue en ${distance(current.spread)} y la desviación en ${angle(current.deviation)}. En este modelo, cambiar el brillo no cambia la refracción.`,
    }
  }
  if (lesson === 'distance') {
    if (close(baseline.config.screenDistance, current.config.screenDistance)) return ready()
    const percentage = (current.spread / baseline.spread - 1) * 100
    const change = `${percentage >= 0 ? '+' : '−'}${fixed(Math.abs(percentage), 1)} %`
    return {
      status: 'observed',
      heading: 'La separación depende de dónde medís',
      text: `Δz pasó de ${distance(baseline.spread)} a ${distance(current.spread)} (${change}). La desviación sigue en ${angle(current.deviation)}: mover la pantalla no cambia los ángulos ni agrega colores. Compará Δz, porque el dibujo del espectro ajusta su escala.`,
    }
  }
  if (baseline.config.material === current.config.material) return ready()
  return {
    status: 'observed',
    heading: 'El material cambia la dispersión',
    text: `De ${materialLabels[baseline.config.material]} a ${materialLabels[current.config.material]}, Δn entre 380 y 700 nm pasa de ${fixed(baseline.dispersionIndex, 4)} a ${fixed(current.dispersionIndex, 4)}; Δz de ${distance(baseline.spread)} a ${distance(current.spread)}. Cada material tiene su dependencia n(λ). Son materiales idealizados del modelo.`,
  }
}
