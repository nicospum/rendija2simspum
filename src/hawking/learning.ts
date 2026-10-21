import { blackHole, evaporatedMass, MAX_AGE, SOLAR_MASS, MIN_MASS, MAX_MASS } from './physics.ts'
import type { Environment } from './physics.ts'

export const LESSONS = [
  {
    id: 'mass',
    title: 'Más masa, ¿más calor?',
    short: 'Masa y temperatura',
    question: 'Si duplicás la masa, ¿qué le pasa a la temperatura?',
    choices: ['Se reduce a la mitad', 'Se duplica'],
    answer: 0,
    action: 'Duplicar la masa',
    hint: 'Mové Masa o usá el botón. Compará radio y temperatura con la referencia.',
    meaning:
      'Un agujero negro más grande es más frío. La temperatura no es la del gas que puede rodearlo: es la que predice Hawking para un observador lejano.',
  },
  {
    id: 'bath',
    title: 'Emitir no siempre es perder',
    short: 'El entorno importa',
    question:
      'Una masa solar emite radiación. Rodeada por el fondo cósmico actual, ¿pierde masa en este modelo?',
    choices: ['Sí, porque emite', 'No: absorbe más de lo que emite'],
    answer: 1,
    action: 'Activar fondo cósmico',
    hint: 'Cambiá de Vacío ideal a Fondo cósmico, manteniendo la masa. Mirá la potencia neta.',
    meaning:
      'La emisión sigue existiendo, pero el entorno de 2,7255 K es mucho más caliente. En esta aproximación absorbe más energía: la potencia neta cambia de signo. Emitir y evaporarse no son sinónimos.',
  },
  {
    id: 'time',
    title: 'Perder masa lo calienta',
    short: 'Evaporación',
    question: 'Al perder masa en el vacío, ¿la emisión ideal se vuelve más débil o más intensa?',
    choices: ['Más débil: se va apagando', 'Más intensa: aumenta su temperatura'],
    answer: 1,
    action: 'Avanzar al 75 % de τ₀',
    hint: 'Avanzá el reloj o mové Tiempo transcurrido. Masa y temperatura se calculan juntas.',
    meaning:
      'Al emitir energía pierde masa, aumenta su temperatura y crece la potencia. Es una capacidad calorífica negativa. El reloj está acelerado: la vida ideal de este ejemplo es de billones de años.',
  },
  {
    id: 'entropy',
    title: 'La información mira al área',
    short: 'Área y entropía',
    question: 'Si duplicás la masa, ¿por cuánto se multiplica la entropía del agujero negro?',
    choices: ['Por dos, como el radio', 'Por cuatro, como el área'],
    answer: 1,
    action: 'Duplicar la masa',
    hint: 'Duplicá la masa. Compará área y S/kB: ambas crecen con M².',
    meaning:
      'Bekenstein y Hawking vincularon la entropía al área del horizonte. Conectaron gravedad, teoría cuántica y termodinámica. Es una pista sobre la gravedad cuántica; este modelo no resuelve la paradoja de la información.',
  },
] as const
export type LessonId = (typeof LESSONS)[number]['id']
export interface Setup {
  mass: number
  environment: Environment
  age: number
}
export interface LabState extends Setup {
  lesson: LessonId
  reference: Setup
  running: boolean
  speed: number
  prediction: number | null
  completed: LessonId[]
}
export type Action =
  | { type: 'lesson'; id: LessonId }
  | { type: 'mass'; mass: number }
  | { type: 'environment'; environment: Environment }
  | { type: 'age'; age: number }
  | { type: 'step'; seconds: number }
  | { type: 'speed'; speed: number }
  | { type: 'running' }
  | { type: 'predict'; choice: number }
  | { type: 'try' }
  | { type: 'restore' }

export function initialState(lesson: LessonId = 'mass', completed: LessonId[] = []): LabState {
  const setup: Setup = {
    mass: lesson === 'bath' ? SOLAR_MASS : 1e12,
    environment: 'vacuum',
    age: 0,
  }
  return {
    ...setup,
    lesson,
    reference: { ...setup },
    running: false,
    speed: 0.025,
    prediction: null,
    completed,
  }
}
export function reading(setup: Setup) {
  // The analytic isolated solution must never be used for a thermal bath.
  return blackHole(
    setup.environment === 'vacuum' ? evaporatedMass(setup.mass, setup.age) : setup.mass,
    setup.environment,
  )
}
export function lessonStatus(state: LabState): 'ready' | 'observed' | 'changed' {
  const ref = state.reference
  if (state.lesson === 'bath') {
    if (state.mass !== ref.mass || state.age !== 0) return 'changed'
    return state.environment === 'cmb' ? 'observed' : 'ready'
  }
  if (state.environment !== ref.environment) return 'changed'
  if (state.lesson === 'time') {
    if (state.mass !== ref.mass) return 'changed'
    return state.age > 0 ? 'observed' : 'ready'
  }
  if (state.age !== 0) return 'changed'
  const ratio = state.mass / ref.mass
  if (Math.abs(ratio - 2) < 0.02) return 'observed' // Accept the logarithmic slider's nearest step.
  return ratio === 1 ? 'ready' : 'changed'
}

export function reducer(state: LabState, action: Action): LabState {
  let next = state
  switch (action.type) {
    case 'lesson':
      return initialState(action.id, [...state.completed])
    case 'mass':
      if (!Number.isFinite(action.mass)) return state
      next = {
        ...state,
        mass: Math.min(MAX_MASS, Math.max(MIN_MASS, action.mass)),
        age: 0,
        running: false,
      }
      break
    case 'environment':
      next = { ...state, environment: action.environment, age: 0, running: false }
      break
    case 'age':
      if (state.environment !== 'vacuum' || !Number.isFinite(action.age)) return state
      next = { ...state, age: Math.min(MAX_AGE, Math.max(0, action.age)), running: false }
      break
    case 'step':
      if (
        !state.running ||
        state.environment !== 'vacuum' ||
        !Number.isFinite(action.seconds) ||
        action.seconds <= 0
      )
        return state
      {
        const age = Math.min(MAX_AGE, state.age + Math.min(0.25, action.seconds) * state.speed)
        next = { ...state, age, running: age < MAX_AGE }
      }
      break
    case 'speed':
      return Number.isFinite(action.speed)
        ? { ...state, speed: Math.min(0.1, Math.max(0.005, action.speed)) }
        : state
    case 'running':
      return state.environment === 'vacuum' && state.age < MAX_AGE
        ? { ...state, running: !state.running }
        : state
    case 'predict':
      if (!Number.isInteger(action.choice) || action.choice < 0 || action.choice > 1) return state
      next = { ...state, prediction: action.choice }
      break
    case 'restore':
      return { ...state, ...state.reference, running: false, prediction: null }
    case 'try':
      next =
        state.lesson === 'bath'
          ? { ...state, ...state.reference, environment: 'cmb', running: false }
          : state.lesson === 'time'
            ? { ...state, ...state.reference, age: 0.75, running: false }
            : { ...state, ...state.reference, mass: 2 * state.reference.mass, running: false }
      break
  }
  if (lessonStatus(next) === 'observed' &&
    next.prediction === LESSONS.find(lesson => lesson.id === next.lesson)!.answer &&
    !next.completed.includes(next.lesson))
    return { ...next, completed: [...next.completed, next.lesson] }
  return next
}
