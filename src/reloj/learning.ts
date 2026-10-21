import { gamma, MAX_BETA, validate } from './physics.ts'
import type { Frame, Setup } from './physics.ts'

export const LESSONS = [
  {
    title: 'Primero, el mismo ritmo',
    question:
      'Sin movimiento relativo, ¿cuánto tarda el mismo tic en los dos sistemas?',
    choices: [
      'Lo mismo en ambos',
      'El doble desde la estación',
      'La luz se queda quieta',
    ],
    answer: 0,
    hint: 'Llevá la velocidad a 0 y completá la ida y vuelta. Compará las dos lecturas.',
    meaning:
      'Con v = 0, los sistemas coinciden: el recorrido mide 300 m y el tic dura 1,001 µs en ambos. Esta es la referencia para descubrir qué cambia al moverse.',
    beta: 0.6,
    steps: ['Completá un tic con v = 0'],
  },
  {
    title: 'Más camino, la misma luz',
    question: 'Al pasar de 0,6 c a 0,8 c, ¿por qué tarda más el tic móvil?',
    choices: [
      'La luz pierde velocidad',
      'Recorre más distancia a la misma c',
      'Los espejos se separan verticalmente',
    ],
    answer: 1,
    hint: 'Completá un tic a 0,6 c y otro a 0,8 c, siguiendo la nave. Mirá la diagonal y los tiempos.',
    meaning:
      'El camino medido desde la estación aumenta de 375 a 500 m. A la misma velocidad c, el tic tarda 1,251 y 1,668 µs. En la nave sigue durando 1,001 µs: la separación transversal entre espejos no cambia.',
    beta: 0.6,
    steps: ['Tic completo a 0,6 c · nave', 'Tic completo a 0,8 c · nave'],
  },
  {
    title: '¿Quién se mueve?',
    question: 'Si ahora seguimos el reloj de la estación, ¿qué mide la nave?',
    choices: [
      'La estación tiene un tiempo absoluto',
      'Solo los relojes de las naves se retrasan',
      'El reloj de la estación también marcha más lento respecto de la nave',
    ],
    answer: 2,
    hint: 'A 0,8 c, completá un tic de la nave. Cambiá “Reloj que seguimos” a Estación y completá otro.',
    meaning:
      'La comparación es recíproca: cada sistema asigna un tic más largo al reloj móvil. Cambiamos el reloj seguido y, por tanto, el par de sucesos comparados. La simultaneidad también depende del sistema; esto no compara edades al reencontrarse.',
    beta: 0.8,
    steps: ['Tic de la nave a 0,8 c', 'Tic de la estación a 0,8 c'],
  },
  {
    title: 'Encontrá el medio ritmo',
    question:
      '¿A qué velocidad el reloj móvil avanza aproximadamente a la mitad del ritmo del sistema que lo mide?',
    choices: [
      'Cerca de 0,866 c',
      'Exactamente a 0,5 c',
      'Solo si supera la velocidad de la luz',
    ],
    answer: 0,
    hint: 'Buscá “Ritmo móvil” cerca del 50 %. Completá el tic y comprobá que el tiempo asignado sea el doble del propio.',
    meaning:
      'Con v = √3/2 · c ≈ 0,866 c, γ = 2. El mismo tic dura 1,001 µs en su reloj y 2,001 µs en el otro sistema. No hace falta alcanzar c: cuanto más te acercás, mayor es la diferencia.',
    beta: 0.6,
    steps: ['Tic con ritmo móvil entre 49,5 % y 50,5 %'],
  },
] as const
export interface State {
  setup: Setup
  index: number
  prediction: number | null
  marks: string[]
  completed: number[]
  feedback: string
  playing: boolean
}
export type Action =
  | { type: 'lesson'; index: number }
  | { type: 'beta'; value: number }
  | { type: 'follow'; frame: Frame }
  | { type: 'fraction'; value: number }
  | { type: 'play' }
  | { type: 'tick'; seconds: number }
  | { type: 'predict'; choice: number }
  | { type: 'check' }

export function initialState(index = 0, completed: number[] = []): State {
  if (!LESSONS[index]) throw new RangeError('Reto inválido.')
  return {
    setup: { beta: LESSONS[index].beta, follow: 'nave', fraction: 0 },
    index,
    prediction: null,
    marks: [],
    completed: [...completed],
    feedback: '',
    playing: false,
  }
}
export function observe(index: number, s: Setup, previous: readonly string[]) {
  validate(s)
  const marks = new Set(previous)
  if (s.fraction !== 1) return [...marks]
  const near = (b: number) => Math.abs(s.beta - b) < 0.0001
  if (index === 0 && near(0)) marks.add('rest')
  if (index === 1 && s.follow === 'nave') {
    if (near(0.6)) marks.add('slow')
    if (near(0.8)) marks.add('fast')
  }
  if (index === 2 && near(0.8)) marks.add(s.follow)
  if (index === 3 && Math.abs(1 / gamma(s.beta) - 0.5) <= 0.005)
    marks.add('half')
  return [...marks]
}
const REQUIRED = [['rest'], ['slow', 'fast'], ['nave', 'estacion'], ['half']]
export function observed(s: State) {
  return REQUIRED[s.index]?.every((mark) => s.marks.includes(mark)) ?? false
}
export function observations(s: State) {
  return REQUIRED[s.index].map((mark) => s.marks.includes(mark))
}
function update(s: State, setup: Setup, playing = false): State {
  return {
    ...s,
    setup,
    playing,
    feedback: '',
    marks: observe(s.index, setup, s.marks),
  }
}
export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'lesson':
      return Number.isInteger(a.index) && LESSONS[a.index]
        ? initialState(a.index, s.completed)
        : s
    case 'beta':
      return Number.isFinite(a.value)
        ? update(s, {
            ...s.setup,
            beta: Math.min(MAX_BETA, Math.max(0, a.value)),
            fraction: 0,
          })
        : s
    case 'follow':
      return ['nave', 'estacion'].includes(a.frame)
        ? update(s, { ...s.setup, follow: a.frame, fraction: 0 })
        : s
    case 'fraction':
      return Number.isFinite(a.value)
        ? update(s, { ...s.setup, fraction: Math.max(0, Math.min(1, a.value)) })
        : s
    case 'play':
      return s.playing
        ? { ...s, playing: false }
        : update(
            s,
            {
              ...s.setup,
              fraction: s.setup.fraction === 1 ? 0 : s.setup.fraction,
            },
            true,
          )
    case 'tick': {
      if (!s.playing || !Number.isFinite(a.seconds) || a.seconds <= 0) return s
      // Same elapsed coordinate time per visual second in the system where the clock moves.
      const fraction = Math.min(
        1,
        s.setup.fraction + Math.min(a.seconds, 0.1) / (5 * gamma(s.setup.beta)),
      )
      return update(s, { ...s.setup, fraction }, fraction < 1)
    }
    case 'predict':
      return Number.isInteger(a.choice) && a.choice >= 0 && a.choice < 3
        ? { ...s, prediction: a.choice, feedback: '' }
        : s
    case 'check': {
      if (s.prediction === null)
        return {
          ...s,
          feedback:
            'Elegí primero una predicción. Después probala con los controles.',
        }
      if (!observed(s))
        return {
          ...s,
          feedback:
            'Todavía falta la comparación indicada. Completá los pasos de observación; podés usar “Completar este tic”.',
        }
      if (s.prediction !== LESSONS[s.index].answer)
        return {
          ...s,
          feedback:
            'Revisá tu explicación con las dos lecturas y la distancia recorrida. Podés cambiar la predicción y volver a comprobar.',
        }
      return {
        ...s,
        feedback: `¡Descubrimiento completo! ${LESSONS[s.index].meaning}`,
        completed: [...new Set([...s.completed, s.index])],
      }
    }
  }
}
