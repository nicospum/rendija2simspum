import { DEFAULT, MAX_TIME, MIN_TIME, validate } from './physics.ts'
import type { Setup } from './physics.ts'
export const LESSONS = [
  {
    title: 'Dos destellos, dos fechas',
    question:
      'A y B ocurren a la vez en el andén. Con el tren a +0,6 c, ¿qué fechas les asigna el tren?',
    choices: [
      'También son simultáneos en el tren',
      'B ocurre antes que A en el tren',
      'A ocurre antes que B en el tren',
    ],
    answer: 1,
    hint: 'Usá +0,6 c y “Simultáneos en el andén”. Mirá todas las llegadas y compará las tarjetas “Fecha de emisión” de ambas vistas.',
    meaning:
      'El andén asigna tA = tB = 0. El tren asigna a B una fecha anterior a la de A. Es una diferencia entre redes de relojes sincronizados, incluso después de descontar los tiempos de viaje de las señales.',
    setup: { ...DEFAULT },
    steps: ['Comparar el ensayo a +0,6 c hasta todas las llegadas'],
  },
  {
    title: 'Llegar no es ocurrir',
    question:
      'Con v = 0 y destellos simultáneos, movemos al pasajero hacia B. ¿Qué cambia?',
    choices: [
      'B ocurre antes',
      'Cambia la velocidad de la luz',
      'B llega antes, pero las fechas de emisión siguen siendo iguales',
    ],
    answer: 2,
    hint: 'Con velocidad 0 y emisiones simultáneas en el tren, compará todas las llegadas con el pasajero en el centro y luego hacia B (+¼ L₀).',
    meaning:
      'Acercar el receptor a B acorta ese viaje de luz: llega antes. Los destellos conservan la misma fecha de emisión. Este retraso de propagación se puede corregir y es distinto de la relatividad de la simultaneidad.',
    setup: { ...DEFAULT, beta: 0, sync: 'tren' as const },
    steps: [
      'Llegadas con pasajero en el centro',
      'Llegadas con pasajero hacia B · +¼ L₀',
    ],
  },
  {
    title: 'Invertí el movimiento',
    question:
      'Si cambiás de +0,6 c a −0,6 c sin cambiar la simultaneidad del andén, ¿qué ocurre?',
    choices: [
      'Se invierte el orden de los destellos asignado por el tren',
      'La luz viaja más rápido hacia A',
      'El orden no puede cambiar nunca',
    ],
    answer: 0,
    hint: 'Completá las llegadas a +0,6 c y a −0,6 c, con el pasajero en el centro y emisiones simultáneas en el andén.',
    meaning:
      'Al invertir v se invierte Δt′ = −γvΔx/c². Estos destellos están separados espacialmente y ninguno causa al otro. El orden de sucesos conectados por una señal causal no se invierte así.',
    setup: { ...DEFAULT },
    steps: ['Ensayo a +0,6 c', 'Ensayo a −0,6 c'],
  },
  {
    title: 'Un tren, no dos instantes',
    question:
      'Un tren de longitud propia 300 m pasa a 0,8 c. ¿Qué medición da su longitud en el andén?',
    choices: [
      '500 m, usando extremos simultáneos en el tren',
      '180 m, registrando ambos extremos al mismo tiempo en el andén',
      '300 m en cualquier sistema',
    ],
    answer: 1,
    hint: 'A 0,8 c y L₀ = 300 m, marcá los extremos con cada método. Compará la separación y Δt de las dos marcas en el andén.',
    meaning:
      'γ = 5/3: la longitud medida en el andén es L₀/γ = 180 m. Tomar extremos simultáneos en el tren da marcas separadas 500 m y 1,334 µs en el andén: esa separación no mide una longitud instantánea. No se está aplastando físicamente el vagón.',
    setup: { ...DEFAULT, beta: 0.8, time: 0 },
    steps: [
      'Marcas simultáneas en cada sistema',
      'Marcas tomadas al mismo tiempo del tren',
    ],
  },
] as const
const REQUIRED = [
  ['dates'],
  ['center', 'nearB'],
  ['positive', 'negative'],
  ['correct', 'mixed'],
]
export interface State {
  setup: Setup
  index: number
  prediction: number | null
  marks: string[]
  completed: number[]
  feedback: string
  playing: boolean
  sample: Setup | null
}
export type Action =
  | { type: 'lesson'; index: number }
  | { type: 'tune'; patch: Partial<Omit<Setup, 'time'>> }
  | { type: 'time'; value: number }
  | { type: 'play' }
  | { type: 'tick'; seconds: number }
  | { type: 'measure' }
  | { type: 'predict'; choice: number }
  | { type: 'check' }
export function initialState(index = 0, completed: number[] = []): State {
  if (!LESSONS[index]) throw new RangeError('Reto inválido.')
  return {
    setup: { ...LESSONS[index].setup },
    index,
    prediction: null,
    marks: [],
    completed: [...completed],
    feedback: '',
    playing: false,
    sample: null,
  }
}
export function observe(
  index: number,
  s: Setup,
  previous: readonly string[],
  measured = false,
) {
  validate(s)
  const marks = new Set(previous),
    near = (a: number, b: number) => Math.abs(a - b) < 1e-8
  if (s.time >= 1.6) {
    if (
      index === 0 &&
      near(s.beta, 0.6) &&
      s.sync === 'anden' &&
      near(s.offset, 0)
    )
      marks.add('dates')
    if (index === 1 && near(s.beta, 0) && s.sync === 'tren') {
      if (near(s.offset, 0)) marks.add('center')
      if (near(s.offset, 0.25)) marks.add('nearB')
    }
    if (index === 2 && s.sync === 'anden' && near(s.offset, 0)) {
      if (near(s.beta, 0.6)) marks.add('positive')
      if (near(s.beta, -0.6)) marks.add('negative')
    }
  }
  if (index === 3 && measured && near(s.beta, 0.8) && near(s.length, 300))
    marks.add(s.protocol === 'simultaneo' ? 'correct' : 'mixed')
  return [...marks]
}
export function observations(s: State) {
  return REQUIRED[s.index].map((mark) => s.marks.includes(mark))
}
export function observed(s: State) {
  return observations(s).every(Boolean)
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
    case 'tune': {
      const instrumentOnly = Object.keys(a.patch).every(
        (key) => key === 'protocol',
      )
      const setup = {
        ...s.setup,
        ...a.patch,
        time: instrumentOnly ? s.setup.time : MIN_TIME,
      }
      try {
        validate(setup)
      } catch {
        return s
      }
      return { ...update(s, setup), sample: null }
    }
    case 'time':
      return Number.isFinite(a.value)
        ? update(s, {
            ...s.setup,
            time: Math.max(MIN_TIME, Math.min(MAX_TIME, a.value)),
          })
        : s
    case 'play':
      return s.playing
        ? { ...s, playing: false }
        : update(
            s,
            {
              ...s.setup,
              time: s.setup.time === MAX_TIME ? MIN_TIME : s.setup.time,
            },
            true,
          )
    case 'tick': {
      if (!s.playing || !Number.isFinite(a.seconds) || a.seconds <= 0) return s
      const time = Math.min(
        MAX_TIME,
        s.setup.time + Math.min(a.seconds, 0.1) * 0.35,
      )
      return update(s, { ...s.setup, time }, time < MAX_TIME)
    }
    case 'measure':
      return {
        ...s,
        sample: { ...s.setup },
        marks: observe(s.index, s.setup, s.marks, true),
        feedback: '',
        playing: false,
      }
    case 'predict':
      return Number.isInteger(a.choice) && a.choice >= 0 && a.choice < 3
        ? { ...s, prediction: a.choice, feedback: '' }
        : s
    case 'check': {
      if (s.prediction === null)
        return { ...s, feedback: 'Elegí una predicción antes de comprobar.' }
      if (!observed(s))
        return {
          ...s,
          feedback:
            'Todavía falta una comparación del reto. Seguí los pasos de observación y volvé a comprobar.',
        }
      if (s.prediction !== LESSONS[s.index].answer)
        return {
          ...s,
          feedback:
            'Revisá la explicación con las fechas, las llegadas o las marcas de longitud. Podés cambiar tu respuesta y volver a probar.',
        }
      return {
        ...s,
        feedback: `¡Descubrimiento completo! ${LESSONS[s.index].meaning}`,
        completed: [...new Set([...s.completed, s.index])],
      }
    }
  }
}
