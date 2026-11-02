import { DEFAULT, measure, validate } from './physics.ts'
import type { Measurement, Setup } from './physics.ts'

export const LESSONS = [
  {
    title: 'Dos sombras, dos verticales',
    question:
      'Con rayos solares paralelos, ¿por qué dos palos verticales pueden dar sombras distintas?',
    choices: [
      'Porque el Sol está mucho más cerca de una ciudad',
      'Porque las verticales locales cambian sobre una superficie curva',
      'Porque el palo de más al norte debe ser más alto',
    ],
    answer: 1,
    hint: 'Medí con «Mismo lugar» y después con «Separar 800 km». Seguí las verticales y los rayos amarillos.',
    steps: ['Medir los dos palos en el mismo lugar', 'Medir con 800 km entre los sitios'],
    meaning:
      'Los rayos llegan paralelos, pero las verticales locales no lo son. En el mismo sitio no hay diferencia angular para inferir el tamaño; al separar los sitios aparece el ángulo entre sus verticales.',
    setup: { ...DEFAULT, latitudeB: DEFAULT.latitudeA },
  },
  {
    title: 'Un pedazo permite medir el todo',
    question:
      'Si duplicamos la distancia entre sitios en este mismo planeta, ¿qué debería pasar con el ángulo y la circunferencia calculada?',
    choices: [
      'El ángulo se duplica y la circunferencia calculada se conserva',
      'La circunferencia se duplica aunque el planeta sea el mismo',
      'El ángulo no cambia',
    ],
    answer: 0,
    hint: 'Medí con «Separar 800 km» y «Separar 1600 km». Compará la proporción d/Δθ en tus dos registros.',
    steps: ['Medir una base de 800 km', 'Medir una base de 1600 km'],
    meaning:
      '800 km son 7,2° y 1600 km son 14,4° en este mundo ideal. En ambos casos, C = 360° × d / Δθ da 40.000 km. Medir un arco y su ángulo permite inferir la vuelta completa.',
    setup: { ...DEFAULT },
  },
  {
    title: '¿Importa el tamaño del palo?',
    question:
      'Sin mover las ciudades ni el Sol, duplicamos la altura de los palos. ¿Qué cambia?',
    choices: [
      'Se duplica el ángulo y cambia el tamaño de la Tierra',
      'No cambia ninguna longitud de sombra',
      'Se duplican las sombras; los ángulos y la circunferencia se conservan',
    ],
    answer: 2,
    hint: 'Con 800 km entre sitios, medí «Palos de 1 m» y «Palos de 2 m». También podés estirar la punta del palo en la vista Sombras.',
    steps: ['Medir con palos de 1 m', 'Medir con palos de 2 m'],
    meaning:
      'El ángulo depende de sombra/altura: θ = arctan(s/h), con dirección norte/sur. Duplicar ambas longitudes conserva la razón. Un palo alto no hace más grande al planeta.',
    setup: { ...DEFAULT },
  },
  {
    title: 'Medir también es equivocarse',
    question:
      'Si la diferencia angular tiene el mismo margen de ±0,2°, ¿qué base permite acotar mejor la circunferencia?',
    choices: [
      '400 km, porque toda distancia menor es más precisa',
      '800 km: el mismo margen pesa menos frente a un ángulo mayor',
      'Ambas dan necesariamente un valor exacto',
    ],
    answer: 1,
    hint: 'Dejá el margen en ±0,2°. Medí «Separar 400 km» y «Separar 800 km» y compará los intervalos posibles.',
    steps: ['Medir 400 km con margen ±0,2°', 'Medir 800 km con margen ±0,2°'],
    meaning:
      'El mismo margen angular produce un intervalo más estrecho con la base de 800 km. Estas cotas suponen distancia exacta: no son una probabilidad ni la precisión histórica de Eratóstenes.',
    setup: { ...DEFAULT, latitudeB: DEFAULT.latitudeA + 3.6, angularError: 0.2 },
  },
] as const

const REQUIRED = [
  ['same', 'apart'],
  ['short', 'long'],
  ['one', 'two'],
  ['short', 'long'],
]
export interface State {
  setup: Setup
  index: number
  prediction: number | null
  marks: string[]
  records: (Measurement & { key: string })[]
  completed: number[]
  feedback: string
  verified: boolean
}
export type Action =
  | { type: 'lesson'; index: number }
  | { type: 'tune'; patch: Partial<Setup> }
  | { type: 'measure' }
  | { type: 'predict'; choice: number }
  | { type: 'check' }
export function initialState(index = 0): State {
  if (!Number.isInteger(index) || !LESSONS[index]) throw new RangeError('Reto inválido.')
  return {
    setup: { ...LESSONS[index].setup },
    index,
    prediction: null,
    marks: [],
    records: [],
    completed: [],
    feedback: '',
    verified: false,
  }
}
export const observations = (s: State) =>
  REQUIRED[s.index].map((k) => s.marks.includes(k))
const close = (a: number, b: number, tolerance = 1e-6) => Math.abs(a - b) <= tolerance
function record(s: State): State {
  const m = measure(s.setup),
    marks = new Set(s.marks)
  let key = 'explore'
  const base =
    close(s.setup.latitudeA, DEFAULT.latitudeA) &&
    close(s.setup.declination, DEFAULT.declination)
  const height = close(s.setup.height, 1)
  const noError = close(s.setup.angularError, 0)
  const distance = (d: number) => close(m.distance, d, 6)
  if (base && height && noError) {
    if (s.index === 0) {
      if (close(m.distance, 0)) key = 'same'
      if (distance(800)) key = 'apart'
    }
    if (s.index === 1) {
      if (distance(800)) key = 'short'
      if (distance(1600)) key = 'long'
    }
  }
  if (s.index === 2 && base && noError && distance(800)) {
    if (close(s.setup.height, 1)) key = 'one'
    if (close(s.setup.height, 2)) key = 'two'
  }
  if (s.index === 3 && base && height && close(s.setup.angularError, 0.2)) {
    if (distance(400)) key = 'short'
    if (distance(800)) key = 'long'
  }
  if (key !== 'explore') marks.add(key)
  // Keep both required comparisons even after an unrelated exploratory measurement.
  const records = [...s.records.filter((r) => r.key !== key), { ...m, key }]
  const feedback =
    key === 'explore'
      ? 'Medición exploratoria guardada; no coincide con un paso pedido. Para comparar una sola variable, usá «Volver al montaje del reto»: fija el sitio A y el Sol en 23,44°, con la altura y margen iniciales, sin borrar registros. Después elegí la distancia o altura solicitada.'
      : 'Medición guardada. Compará los registros y los pasos del reto.'
  return { ...s, records, marks: [...marks], verified: false, feedback }
}
export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'lesson':
      return Number.isInteger(a.index) && LESSONS[a.index]
        ? { ...initialState(a.index), completed: s.completed }
        : s
    case 'tune': {
      const setup = { ...s.setup, ...a.patch }
      try {
        validate(setup)
      } catch {
        return s
      }
      return { ...s, setup, feedback: '', verified: false }
    }
    case 'measure':
      return record(s)
    case 'predict':
      return Number.isInteger(a.choice) && a.choice >= 0 && a.choice < 3
        ? { ...s, prediction: a.choice, feedback: '', verified: false }
        : s
    case 'check':
      if (s.prediction === null)
        return {
          ...s,
          feedback: 'Elegí una predicción antes de comprobar.',
          verified: false,
        }
      if (!observations(s).every(Boolean))
        return {
          ...s,
          feedback:
            'Falta una medición del reto. Mové una variable, usá «Medir y guardar» y revisá los pasos.',
          verified: false,
        }
      if (s.prediction !== LESSONS[s.index].answer)
        return {
          ...s,
          feedback:
            'Todavía no coincide con lo observado. Compará distancia, ángulos y sombras en los registros; podés cambiar tu predicción.',
          verified: false,
        }
      return {
        ...s,
        verified: true,
        feedback: `¡Descubrimiento completo! ${LESSONS[s.index].meaning}`,
        completed: [...new Set([...s.completed, s.index])],
      }
  }
}
