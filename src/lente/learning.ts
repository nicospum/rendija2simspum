import { geometry, radians } from './physics.ts'
export type LessonId = 'bend' | 'ring' | 'capture' | 'mass'
export interface Setup {
  mass: number
  gravity: boolean
  source: number
  yaw: number
  rayAngle: number
  azimuth: number
}
export interface State extends Setup {
  lesson: LessonId
  reference: Setup
  prediction: number | null
  completed: LessonId[]
}
export const LESSONS = [
  {
    id: 'bend',
    name: 'Luz que se desvía',
    title: '¿La estrella está donde la ves?',
    question: 'Quitá la gravedad sin mover la cámara ni la fuente. ¿Qué esperás que cambie?',
    choices: ['La posición y la forma de las imágenes', 'Solo el brillo de la estrella'],
    answer: 0,
    action: 'Comparar sin lente',
    hint: 'Alterná con/sin lente. La misma esfera de fondo ilumina ambas imágenes.',
    meaning:
      'La luz llega por otras direcciones. Una imagen desplazada o duplicada no implica varias estrellas: distintos caminos conectan la misma fuente con la cámara. Esa relación permite estudiar masa que no vemos directamente.',
  },
  {
    id: 'ring',
    name: 'Encontrar el anillo',
    title: 'Una fuente. Muchas direcciones.',
    question: '¿Qué aparece al alinear fuente, agujero negro y cámara?',
    choices: ['Un anillo alrededor de la sombra', 'La fuente desaparece por completo'],
    answer: 0,
    action: 'Alinear la fuente',
    hint: 'Mové la fuente hacia 0° con la cámara en 0°. También podés alinear moviendo solo la cámara.',
    meaning:
      'La simetría permite que la luz de la misma fuente llegue por todos los lados. El anillo emerge de las trayectorias calculadas: no está dibujado sobre la imagen. Con desalineación se rompe en arcos e imágenes.',
  },
  {
    id: 'capture',
    name: 'Captura o escape',
    title: 'No todas las direcciones traen luz.',
    question:
      'El rayo seleccionado está fuera de la sombra. ¿Qué ocurre al apuntarlo más cerca del centro?',
    choices: ['El rastreo alcanza el horizonte', 'Siempre atraviesa el agujero negro'],
    answer: 0,
    action: 'Apuntar a 3° del centro',
    hint: 'Seleccioná un píxel o mové la dirección del rayo. El umbral depende de b, no de tocar una esfera de fotones sólida.',
    meaning:
      'El rastreo inverso termina en el horizonte: esa dirección no recibe luz de la esfera de fondo. Por fuera del umbral hay rayos que regresan al fondo tras curvarse. La esfera de fotones es una órbita circular inestable; no una superficie material.',
  },
  {
    id: 'mass',
    name: 'La escala de la masa',
    title: 'Más masa, ¿la misma imagen?',
    question:
      'Duplicá la masa dejando fijas las distancias físicas a la cámara y al fondo. ¿Qué cambia?',
    choices: [
      'Crecen el horizonte y el tamaño angular de la sombra',
      'Nada: toda imagen es independiente de la masa',
    ],
    answer: 0,
    action: 'Duplicar la masa',
    hint: 'Las distancias indicadas en UA se conservan. La escala del diagrama también permanece fija.',
    meaning:
      'El radio del horizonte crece linealmente con M y la sombra ocupa más ángulo. Si escaláramos también todas las distancias con M, la imagen adimensional sí sería la misma. Acá conservamos metros para que puedas separar ambos casos.',
  },
] as const

export function initialState(lesson: LessonId = 'bend', completed: LessonId[] = []): State {
  const reference: Setup = {
    mass: 1,
    gravity: true,
    source: lesson === 'bend' || lesson === 'ring' ? 8 : 0,
    yaw: 0,
    rayAngle: 14,
    azimuth: 0,
  }
  return {
    ...reference,
    reference: { ...reference },
    lesson,
    prediction: null,
    completed: [...completed],
  }
}
export type Action =
  | { type: 'lesson'; id: LessonId }
  | { type: 'mass' | 'source' | 'yaw' | 'rayAngle' | 'azimuth'; value: number }
  | { type: 'pick'; angle: number; azimuth: number }
  | { type: 'gravity'; value: boolean }
  | { type: 'predict'; value: number }
  | { type: 'try' }
  | { type: 'restore' }
export function lessonStatus(state: State): 'ready' | 'observed' | 'changed' {
  const ref = state.reference
  const changed = (['mass', 'gravity', 'source', 'yaw'] as const).filter(
    (key) => Math.abs(Number(state[key]) - Number(ref[key])) > 1e-8,
  )
  if (state.lesson === 'capture') {
    if (changed.length || state.azimuth !== ref.azimuth) return 'changed'
    if (state.rayAngle === ref.rayAngle) return 'ready'
    return radians(state.rayAngle) < geometry(state.mass).shadowAngle ? 'observed' : 'changed'
  }
  if (!changed.length) return 'ready'
  if (changed.length !== 1) return 'changed'
  if (state.lesson === 'bend')
    return changed[0] === 'gravity' && !state.gravity ? 'observed' : 'changed'
  if (state.lesson === 'ring')
    return (changed[0] === 'source' || changed[0] === 'yaw') &&
      Math.abs(state.source + state.yaw) < 0.2
      ? 'observed'
      : 'changed'
  return changed[0] === 'mass' && Math.abs(state.mass / ref.mass - 2) < 0.01
    ? 'observed'
    : 'changed'
}
export function reducer(state: State, action: Action): State {
  let next = state
  switch (action.type) {
    case 'lesson':
      return initialState(action.id, state.completed)
    case 'restore':
      return { ...state, ...state.reference, prediction: null }
    case 'predict':
      if (!Number.isInteger(action.value) || action.value < 0 || action.value > 1) return state
      next = { ...state, prediction: action.value }
      break
    case 'gravity':
      next = { ...state, gravity: action.value }
      break
    case 'mass':
    case 'source':
    case 'yaw':
    case 'rayAngle':
    case 'azimuth': {
      if (!Number.isFinite(action.value)) return state
      const limits = {
        mass: [0.5, 2],
        source: [-18, 18],
        yaw: [-18, 18],
        rayAngle: [0, 70],
        azimuth: [-Math.PI, Math.PI],
      }
      const [min, max] = limits[action.type]
      next = { ...state, [action.type]: Math.min(max, Math.max(min, action.value)) }
      break
    }
    case 'pick':
      if (![action.angle, action.azimuth].every(Number.isFinite)) return state
      next = {
        ...state,
        rayAngle: Math.min(70, Math.max(0, action.angle)),
        azimuth: Math.atan2(Math.sin(action.azimuth), Math.cos(action.azimuth)),
      }
      break
    case 'try':
      next = { ...state, ...state.reference }
      if (state.lesson === 'bend') next.gravity = false
      if (state.lesson === 'ring') next.source = 0
      if (state.lesson === 'capture') next.rayAngle = 3
      if (state.lesson === 'mass') next.mass = 2
      break
  }
  if (lessonStatus(next) === 'observed' &&
    next.prediction === LESSONS.find(lesson => lesson.id === next.lesson)!.answer &&
    !next.completed.includes(next.lesson))
    next = { ...next, completed: [...next.completed, next.lesson] }
  return next
}
