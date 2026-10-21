import { DEFAULT, GPS, validate } from './physics.ts'
import type { Setup } from './physics.ts'
export const LESSONS = [
  {
    title: 'Un reloj más arriba',
    question:
      'Dos relojes están quietos respecto de la Tierra. Subimos uno 100 m. ¿Qué cambia después de un día?',
    choices: [
      'El de arriba acumula un poco más de tiempo propio',
      'El reloj de arriba se detiene',
      'No cambia nada si ambos relojes son iguales',
    ],
    answer: 0,
    hint: 'En “Relojes en altura”, compará “Misma altura · 0 m” y “Subir a 100 m”. En ambos casos, observá un día completo.',
    steps: ['Un día a la misma altura', 'Un día a 100 m'],
    meaning:
      'En este modelo terrestre, el reloj elevado acumula cerca de 0,94 ns extra por día. Es una diferencia de tiempo propio, no el retraso de una señal al viajar. A la misma altura y en reposo relativo no aparece esa diferencia.',
    setup: { ...DEFAULT, height: 0 },
  },
  {
    title: 'Una diferencia que se acumula',
    question:
      'Mantenemos un reloj a 100 m. Si pasamos de 1 a 7 días, ¿qué ocurre con su adelanto?',
    choices: [
      'La diferencia se borra cada medianoche',
      'Se multiplica por siete, mientras la diferencia de ritmo sigue igual',
      'El reloj se vuelve siete veces más rápido',
    ],
    answer: 1,
    hint: 'A 100 m, compará “Observar 1 día” y “Observar 7 días”, avanzando al final en ambos ensayos. Separá el ritmo diario del desfase acumulado.',
    steps: ['Resultado de 1 día a 100 m', 'Resultado de 7 días a 100 m'],
    meaning:
      'La altura fija una diferencia de ritmo. Sostener esa condición más tiempo acumula más desfase: siete días producen siete veces el adelanto de un día. El ritmo del reloj no crece con la duración del ensayo.',
    setup: { ...DEFAULT },
  },
  {
    title: 'El satélite tiene dos efectos',
    question:
      'A la altura GPS, comparamos un reloj sostenido sin movimiento con uno en órbita circular. ¿Qué aporta moverse?',
    choices: [
      'Suma otro adelanto igual al gravitatorio',
      'Borra la gravedad',
      'Resta tiempo propio, aunque a esta altura gana el efecto gravitatorio',
    ],
    answer: 2,
    hint: 'En “Satélite y GPS”, usá “GPS · 20.200 km” y 1 día. Compará “Sostener sin movimiento” y “Órbita circular”. Mirá las contribuciones de gravedad y movimiento.',
    steps: [
      'Un día a altura GPS, sin movimiento',
      'Un día a altura GPS, en órbita',
    ],
    meaning:
      'La mayor altura suma unos 46 µs/día y el movimiento orbital resta unos 7 µs/día en este modelo esférico no rotante. El balance sigue siendo positivo, de unos 38 µs/día. La rotación terrestre y el geoide refinan los valores de un GPS real.',
    setup: { ...GPS, motion: 'quieto' as const },
  },
  {
    title: 'El GPS necesita un ajuste',
    question:
      'Al comparar una señal de tiempo ajustada desde la salida, ¿qué se corrige?',
    choices: [
      'La física deja de afectar al satélite',
      'La lectura transmitida queda alineada; el tiempo propio físico sigue siendo distinto',
      'El satélite baja hasta el suelo',
    ],
    answer: 1,
    hint: 'A altura GPS, órbita circular y 1 día, compará “Sin ajuste” y “Ajuste desde la salida”. Mirá la lectura transmitida y el desfase físico por separado.',
    steps: [
      'Un día de GPS sin ajuste',
      'El mismo ensayo con ajuste ideal desde el inicio',
    ],
    meaning:
      'El ajuste ideal compensa la diferencia de ritmo de la señal transmitida. No elimina la diferencia física de tiempo propio. El sesgo cΔt es una pseudodistancia equivalente de una señal: no predice por sí solo el error de posición de un receptor.',
    setup: { ...GPS },
  },
] as const
const required = [
  ['same', 'high'],
  ['one', 'seven'],
  ['rest', 'orbit'],
  ['raw', 'corrected'],
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
  | { type: 'tune'; patch: Partial<Omit<Setup, 'progress'>> }
  | { type: 'mode'; mode: Setup['mode'] }
  | { type: 'time'; value: number }
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
    same = (a: number, b: number) => Math.abs(a - b) < 1e-6
  if (setup.progress === 1) {
    if (s.index === 0 && setup.mode === 'torre' && setup.days === 1) {
      if (same(setup.height, 0)) marks.add('same')
      if (same(setup.height, 100)) marks.add('high')
    }
    if (s.index === 1 && setup.mode === 'torre' && same(setup.height, 100)) {
      if (setup.days === 1) marks.add('one')
      if (setup.days === 7) marks.add('seven')
    }
    if (
      setup.mode === 'gps' &&
      same(setup.height, GPS.height) &&
      setup.days === 1
    ) {
      if (s.index === 2 && !setup.corrected) {
        if (setup.motion === 'quieto') marks.add('rest')
        if (setup.motion === 'circular') marks.add('orbit')
      }
      if (s.index === 3 && setup.motion === 'circular')
        marks.add(setup.corrected ? 'corrected' : 'raw')
    }
  }
  return { ...s, setup, playing, marks: [...marks], feedback: '' }
}
export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'lesson':
      return Number.isInteger(a.index) && LESSONS[a.index]
        ? initialState(a.index, s.completed)
        : s
    case 'mode':
      return ['torre', 'gps'].includes(a.mode)
        ? update(s, {
            ...(a.mode === 'gps' ? GPS : DEFAULT),
            expanded: s.setup.expanded,
          })
        : s
    case 'tune': {
      const preserve = Object.keys(a.patch).every(
          (k) => k === 'corrected' || k === 'expanded',
        ),
        setup = {
          ...s.setup,
          ...a.patch,
          progress: preserve ? s.setup.progress : 0,
        }
      try {
        validate(setup)
      } catch {
        return s
      }
      return update(s, setup)
    }
    case 'time':
      return Number.isFinite(a.value)
        ? update(s, { ...s.setup, progress: Math.max(0, Math.min(1, a.value)) })
        : s
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
        s.setup.progress + Math.min(0.1, a.seconds) * 0.12,
      )
      return update(s, { ...s.setup, progress }, progress < 1)
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
            'Todavía falta una comparación del reto. Seguí los pasos y volvé a comprobar.',
        }
      if (s.prediction !== LESSONS[s.index].answer)
        return {
          ...s,
          feedback:
            'Compará el ritmo diario con el desfase acumulado y las contribuciones del gráfico. Podés cambiar tu respuesta.',
        }
      return {
        ...s,
        feedback: `¡Descubrimiento completo! ${LESSONS[s.index].meaning}`,
        completed: [...new Set([...s.completed, s.index])],
      }
  }
}
