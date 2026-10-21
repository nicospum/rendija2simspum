import { MAX_EMITTED, MAX_MASS, MIN_MASS } from './physics.ts'

export const LESSONS = [
  {
    id: 'area',
    name: 'El área manda',
    title: 'Doble masa. ¿Doble entropía?',
    question:
      'Sin emitir radiación, duplicá la masa inicial. ¿Por cuánto se multiplica la entropía?',
    choices: [
      'Por 4, igual que el área',
      'Por 2, igual que el radio',
      'Por 8, como el volumen asociado',
    ],
    answer: 0,
    action: 'Duplicar la masa',
    target: '#en-map',
    hint: 'Llevá la masa de 10 a 20 M☉. La cámara y la referencia de 10 M☉ conservan su escala.',
    meaning:
      'El radio crece con M; el área, con M². Por eso duplicar la masa multiplica por cuatro tanto el área como la entropía. El volumen euclídeo de una esfera de ese radio crece por ocho: esa no es la ley de entropía del agujero negro.',
  },
  {
    id: 'quarter',
    name: 'Descifrar el ¼',
    title: 'Contar área no alcanza.',
    question: 'En la lupa algebraica, un área de ejemplo de 16 ℓP² corresponde a…',
    choices: ['16 unidades de S/kB', '4 unidades de S/kB', '4 bits exactos'],
    answer: 1,
    action: 'Probar 16 áreas de Planck',
    target: '#en-formula',
    hint: 'Mové el área de ejemplo de 8 a 16. Cada grupo de cuatro cuadrados representa una unidad de S/kB; no un bit.',
    meaning:
      'S/kB = A/(4ℓP²). El factor ¼ divide la cantidad de áreas de Planck por cuatro. Para expresar esa entropía en bits hay que dividir además por ln 2. La lupa es aritmética: no muestra celdas físicas ni un agujero negro microscópico.',
  },
  {
    id: 'evaporate',
    name: 'Lo que pierde el horizonte',
    title: 'Si pierde masa, ¿pierde entropía?',
    question:
      'Emití el equivalente al 25 % de la masa inicial en el modelo ideal. ¿Qué queda en el agujero negro?',
    choices: [
      'El 75 % de su entropía inicial',
      'El 56,25 % de su entropía inicial',
      'La misma entropía, aunque se achique',
    ],
    answer: 1,
    action: 'Emitir el 25 % de la masa',
    target: '#en-map',
    hint: 'Llevá la fracción emitida a 25 %. Queda M/M₀ = 0,75 y S/S₀ = 0,75².',
    meaning:
      'La entropía del agujero negro disminuye a 0,75² = 0,5625 de la inicial, mientras su temperatura aumenta. Eso no decide qué pasa con la entropía total: la radiación también cuenta. Estamos comparando estados enormemente separados en tiempo, no observando una evaporación rápida real.',
  },
  {
    id: 'total',
    name: 'Contar todo',
    title: '¿La segunda ley se rompió?',
    question:
      'Ya se emitió el 25 % de la masa. Si sumás la entropía térmica de la radiación a la del agujero negro…',
    choices: [
      'La suma disminuye como el horizonte',
      'La suma supera el valor inicial',
      'La entropía total siempre es cero',
    ],
    answer: 1,
    action: 'Contar también la radiación',
    target: '#en-ledger',
    hint: 'Activá “Incluir la radiación”. No cambia el agujero negro: ampliás qué parte del sistema estás contando.',
    meaning:
      'En este modelo de fotones ideales, la radiación lleva 4/3 de la entropía que pierde el agujero negro. Al sumar ambas, la entropía térmica total aumenta. Ilustra la segunda ley generalizada; no calcula la entropía de entrelazamiento ni resuelve la paradoja de la información.',
  },
] as const
export type LessonId = (typeof LESSONS)[number]['id']
export interface Setup {
  mass: number
  emitted: number
  patch: number
  includeRadiation: boolean
}
export interface State extends Setup {
  lesson: LessonId
  reference: Setup
  prediction: number | null
  completed: LessonId[]
}
export function initialState(lesson: LessonId = 'area', completed: LessonId[] = []): State {
  const reference = {
    mass: 10,
    emitted: lesson === 'total' ? 0.25 : 0,
    patch: 8,
    includeRadiation: false,
  }
  return {
    ...reference,
    reference: { ...reference },
    lesson,
    prediction: null,
    completed: [...completed],
  }
}
export function lessonStatus(state: State): 'ready' | 'observed' | 'exploring' {
  const keys = (['mass', 'emitted', 'patch', 'includeRadiation'] as const).filter(
    (key) => state[key] !== state.reference[key],
  )
  if (!keys.length) return 'ready'
  if (keys.length !== 1) return 'exploring'
  const match =
    state.lesson === 'area'
      ? keys[0] === 'mass' && Math.abs(state.mass - 20) < 1e-7
      : state.lesson === 'quarter'
        ? keys[0] === 'patch' && state.patch === 16
        : state.lesson === 'evaporate'
          ? keys[0] === 'emitted' && Math.abs(state.emitted - 0.25) < 1e-7
          : keys[0] === 'includeRadiation' && state.includeRadiation
  return match ? 'observed' : 'exploring'
}
export type Action =
  | { type: 'lesson'; id: LessonId }
  | { type: 'predict'; value: number }
  | { type: 'mass' | 'emitted' | 'patch'; value: number }
  | { type: 'radiation'; value: boolean }
  | { type: 'try' | 'restore' }
export function reducer(state: State, action: Action): State {
  if (action.type === 'lesson') return initialState(action.id, state.completed)
  if (action.type === 'restore') return { ...state, ...state.reference, prediction: null }
  let next = { ...state }
  if (action.type === 'predict') {
    if (!Number.isInteger(action.value) || action.value < 0 || action.value >= 3) return state
    next.prediction = action.value
  }
  if (action.type === 'mass' || action.type === 'emitted' || action.type === 'patch') {
    if (!Number.isFinite(action.value)) return state
    const limits = {
      mass: [MIN_MASS, MAX_MASS],
      emitted: [0, MAX_EMITTED],
      patch: [4, 64],
    }
    const [min, max] = limits[action.type]
    next[action.type] = Math.max(min, Math.min(max, action.value))
    if (action.type === 'patch') next.patch = Math.round(next.patch / 4) * 4
  }
  if (action.type === 'radiation') next.includeRadiation = action.value
  if (action.type === 'try') {
    next = { ...next, ...state.reference }
    if (state.lesson === 'area') next.mass = 20
    if (state.lesson === 'quarter') next.patch = 16
    if (state.lesson === 'evaporate') next.emitted = 0.25
    if (state.lesson === 'total') next.includeRadiation = true
  }
  // Completion requires a prediction and the specified comparison, not an arbitrary click.
  if (
    next.prediction !== null &&
    lessonStatus(next) === 'observed' &&
    !next.completed.includes(next.lesson)
  )
    next.completed = [...next.completed, next.lesson]
  return next
}
