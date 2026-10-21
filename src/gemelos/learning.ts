import { DEFAULT, itinerary, validate } from './physics.ts'
import type { Setup } from './physics.ts'
export const LESSONS = [
  {
    title: 'La cita de los relojes',
    question:
      'Tras 10 años en casa y un viaje a 0,8 c de ida y vuelta, ¿cuánto envejece quien viaja?',
    choices: [
      '10 años, porque vuelven al mismo lugar',
      '6 años: su recorrido acumula menos tiempo propio',
      'El reloj de casa se detiene',
    ],
    answer: 1,
    hint: 'Usá el viaje de 10 años, a 0,8 c en ambos tramos y sin espera. Llegá al reencuentro y compará los relojes.',
    steps: ['Reencontrar los relojes a 0,8 c'],
    meaning:
      'En casa transcurren 10 años; en la nave, 6. Los relojes se comparan juntos en el mismo evento: el resultado no depende del retraso de una imagen ni de quién hace la cuenta.',
    setup: { ...DEFAULT },
  },
  {
    title: 'Más rápido, menos tiempo propio',
    question:
      'Manteniendo 10 años de viaje en casa, ¿qué cambia al pasar de 0,6 c a 0,8 c en ambos tramos?',
    choices: [
      'La nave pasa de acumular 8 años a acumular 6',
      'La nave pasa de 6 a 8 años',
      'Solo cambia la animación',
    ],
    answer: 0,
    hint: 'Compará el reencuentro con los botones “Ambos a 0,6 c” y “Ambos a 0,8 c”. La duración en casa queda fija; la distancia alcanzada cambia.',
    steps: ['Reencuentro a 0,6 c', 'Reencuentro a 0,8 c'],
    meaning:
      'Para la misma duración en casa, una mayor rapidez reduce el tiempo propio de los tramos en movimiento. En esta comparación también cambia la distancia: no mantuvimos fijo el destino.',
    setup: { ...DEFAULT, outbound: 0.6, inbound: 0.6 },
  },
  {
    title: 'El giro cambia el «ahora»',
    question:
      'En el giro, el “ahora” asignado al reloj de casa pasa de 1,8 a 8,2 años. ¿Qué significa?',
    choices: [
      'En casa envejecen 6,4 años de golpe',
      'El reloj de la nave salta hacia atrás',
      'Cambia la simultaneidad del sistema comóvil; ningún reloj salta',
    ],
    answer: 2,
    hint: 'Sin espera y a 0,8 c, usá “Antes de cambiar” y “Después de cambiar”. Compará el “ahora” remoto y el reloj de la nave, que conserva 3 años.',
    steps: ['Mirar justo antes del giro', 'Mirar justo después del giro'],
    meaning:
      'La nave cambia de sistema inercial al volver: su criterio de simultaneidad con sucesos lejanos cambia. El reloj local sigue continuo y ningún mensaje viaja instantáneamente. Los dos tramos no son un único sistema inercial.',
    setup: { ...DEFAULT },
  },
  {
    title: 'El tiempo se suma por tramos',
    question:
      'Con 10 años totales en casa y rapidez 0,8 c, agregamos 2 años de espera en el destino. ¿Qué ocurre?',
    choices: [
      'La diferencia final aumenta',
      'La nave acumula 6,8 años en vez de 6',
      'Los giros borran el tiempo acumulado',
    ],
    answer: 1,
    hint: 'Compará “Sin espera” y “Esperar 2 de 10 años”, llegando al reencuentro en ambos casos. Durante la espera la nave está en reposo respecto de casa y ambos relojes avanzan al mismo ritmo.',
    steps: [
      'Viaje sin espera al reencuentro',
      'Viaje con 20 % de espera al reencuentro',
    ],
    meaning:
      'La nave suma 8 × 0,6 + 2 = 6,8 años. La espera reemplaza parte del movimiento y acorta la distancia alcanzada. La diferencia surge de todo el recorrido; no se concentra en un giro mágico.',
    setup: { ...DEFAULT },
  },
] as const
const required = [
  ['finish'],
  ['slow', 'fast'],
  ['before', 'after'],
  ['noWait', 'wait'],
]
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
  | { type: 'tune'; patch: Partial<Setup> }
  | { type: 'time'; progress: number; side?: Setup['side'] }
  | { type: 'play' }
  | { type: 'tick'; seconds: number }
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
  }
}
export function observations(s: State) {
  return required[s.index].map((k) => s.marks.includes(k))
}
function update(s: State, setup: Setup, playing = false): State {
  const marks = new Set(s.marks),
    same = (v: number, w: number) => Math.abs(v - w) < 1e-8
  const base =
    same(setup.duration, 10) &&
    same(setup.outbound, 0.8) &&
    same(setup.inbound, 0.8)
  if (setup.progress === 1) {
    if (s.index === 0 && base && setup.wait === 0) marks.add('finish')
    if (s.index === 1 && setup.duration === 10 && setup.wait === 0) {
      if (same(setup.outbound, 0.6) && same(setup.inbound, 0.6))
        marks.add('slow')
      if (base) marks.add('fast')
    }
    if (s.index === 3 && base) {
      if (setup.wait === 0) marks.add('noWait')
      if (same(setup.wait, 0.2)) marks.add('wait')
    }
  }
  if (
    s.index === 2 &&
    base &&
    setup.wait === 0 &&
    same(setup.progress, itinerary(setup).out / setup.duration)
  )
    marks.add(setup.side)
  return { ...s, setup, marks: [...marks], playing, feedback: '' }
}
export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'lesson':
      return Number.isInteger(a.index) && LESSONS[a.index]
        ? initialState(a.index, s.completed)
        : s
    case 'tune': {
      const setup = {
        ...s.setup,
        ...a.patch,
        progress: 0,
        side: 'after' as const,
      }
      try {
        validate(setup)
      } catch {
        return s
      }
      return update(s, setup)
    }
    case 'time': {
      if (!Number.isFinite(a.progress)) return s
      const setup = {
        ...s.setup,
        progress: Math.max(0, Math.min(1, a.progress)),
        side: a.side ?? 'after',
      }
      try {
        validate(setup)
      } catch {
        return s
      }
      return update(s, setup)
    }
    case 'play':
      return s.playing
        ? { ...s, playing: false }
        : update(
            s,
            {
              ...s.setup,
              progress: s.setup.progress === 1 ? 0 : s.setup.progress,
            },
            true,
          )
    case 'tick': {
      if (!s.playing || !Number.isFinite(a.seconds) || a.seconds <= 0) return s
      const progress = Math.min(
        1,
        s.setup.progress + Math.min(0.1, a.seconds) * 0.07,
      )
      return update(s, { ...s.setup, progress, side: 'after' }, progress < 1)
    }
    case 'predict':
      return Number.isInteger(a.choice) && a.choice >= 0 && a.choice < 3
        ? { ...s, prediction: a.choice, feedback: '' }
        : s
    case 'check':
      if (s.prediction === null)
        return { ...s, feedback: 'Elegí una predicción antes de comprobar.' }
      if (!observations(s).every(Boolean))
        return {
          ...s,
          feedback:
            'Todavía falta una comparación. Seguí los pasos del reto y volvé a comprobar.',
        }
      if (s.prediction !== LESSONS[s.index].answer)
        return {
          ...s,
          feedback:
            'Revisá los relojes y los tramos. Podés cambiar tu respuesta y volver a probar.',
        }
      return {
        ...s,
        feedback: `¡Descubrimiento completo! ${LESSONS[s.index].meaning}`,
        completed: [...new Set([...s.completed, s.index])],
      }
  }
}
