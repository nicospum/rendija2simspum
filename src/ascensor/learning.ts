import { DEFAULT, validate } from './physics.ts'
import type { Setup } from './physics.ts'
export const LESSONS = [
  {
    title: '¿Gravedad o motor?',
    question:
      'Con la misma intensidad, ¿qué distingue la pelota y la balanza entre una cabina sostenida y una nave acelerada?',
    choices: [
      'La pelota cae solo si hay un planeta',
      'En este laboratorio local producen el mismo resultado',
      'El motor hace que la masa desaparezca',
    ],
    answer: 1,
    hint: 'A 9,81 m/s², compará el resultado en “Ascensor sostenido” y “Nave acelerada”. Mirá el interior y luego la referencia exterior.',
    steps: [
      'Resultado en el ascensor sostenido',
      'Resultado en la nave acelerada',
    ],
    meaning:
      'En ambos casos la pelota cae respecto de la cabina y la balanza ejerce la misma fuerza. El exterior permite reconocer contextos distintos; las mediciones locales no distinguen estos dos casos ideales.',
    setup: { ...DEFAULT },
  },
  {
    title: 'Caer sin sentir peso',
    question:
      'Al pasar del ascensor sostenido a caída libre, ¿por qué la balanza marca cero?',
    choices: [
      'El campo gravitatorio se apaga',
      'Porque la masa se vuelve cero',
      'Cabina y objetos caen juntos y el soporte deja de empujarlos',
    ],
    answer: 2,
    hint: 'Compará el resultado en “Ascensor sostenido”, “Caída libre” y “Nave a la deriva”. La balanza puede marcar cero con campo gravitatorio o sin él.',
    steps: ['Cabina sostenida', 'Cabina en caída libre', 'Nave a la deriva'],
    meaning:
      'La ingravidez mide la ausencia de fuerza de apoyo, no la ausencia de un campo gravitatorio. En caída libre, cabina y objetos tienen la misma aceleración; en este modelo local su interior se comporta como una nave a la deriva.',
    setup: { ...DEFAULT },
  },
  {
    title: 'Dos masas, una caída',
    question:
      'En la nave acelerada cambiamos el objeto de 1 a 4 kg. ¿Qué ocurre?',
    choices: [
      'La lectura de la balanza se cuadruplica, pero la caída relativa no cambia',
      'El objeto de 4 kg cae cuatro veces más rápido',
      'La aceleración depende de la masa',
    ],
    answer: 0,
    hint: 'En “Pelotas y balanza”, usá la nave acelerada y compará el resultado con “Objeto de 1 kg” y “Objeto de 4 kg”. Ambas pelotas se sueltan a la misma altura y sin velocidad inicial.',
    steps: ['Resultado con 1 kg', 'Resultado con 4 kg'],
    meaning:
      'La fuerza de apoyo es proporcional a la masa: pasa de 9,81 a 39,24 N. La aceleración relativa es la misma y las pelotas llegan juntas. No hay aire ni diferencias de velocidad inicial.',
    setup: { ...DEFAULT, scenario: 'cohete' as const, mass: 1 },
  },
  {
    title: 'También le pasa a la luz',
    question:
      'Al ampliar la escala vertical, ¿qué vemos en la cabina acelerada y en caída libre?',
    choices: [
      'La luz pierde su velocidad c',
      'En ambos interiores la luz cae como una pelota durante segundos',
      'La trayectoria baja en la cabina acelerada y es recta en la cabina libre',
    ],
    answer: 2,
    hint: 'Elegí “Pulso de luz”, ancho de 3 m y 9,81 m/s². Con el desvío ampliado, compará “Nave acelerada” y “Caída libre” hasta la pared de enfrente.',
    steps: [
      'Luz en la cabina acelerada, con ampliación',
      'Luz en caída libre, con ampliación',
    ],
    meaning:
      'La cabina acelerada cambia de posición mientras la luz cruza. Un laboratorio libre local describe un rayo recto. El desvío en la cabina acelerada mide aproximadamente 0,49 femtómetros en 3 m: la escala vertical ampliada lo hace visible. La curvatura global de un campo real requiere relatividad general.',
    setup: {
      ...DEFAULT,
      scenario: 'cohete' as const,
      instrument: 'luz' as const,
    },
  },
] as const
const required = [
  ['ground', 'rocket'],
  ['ground', 'fall', 'drift'],
  ['one', 'four'],
  ['bent', 'straight'],
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
    same = (a: number, b: number) => Math.abs(a - b) < 1e-8
  if (setup.progress === 1 && same(setup.strength, 9.81)) {
    if (setup.instrument === 'pelotas') {
      if (s.index === 0 && same(setup.mass, 2)) {
        if (setup.scenario === 'suelo') marks.add('ground')
        if (setup.scenario === 'cohete') marks.add('rocket')
      }
      if (s.index === 1 && same(setup.mass, 2)) {
        if (setup.scenario === 'suelo') marks.add('ground')
        if (setup.scenario === 'caida') marks.add('fall')
        if (setup.scenario === 'deriva') marks.add('drift')
      }
      if (s.index === 2 && setup.scenario === 'cohete') {
        if (same(setup.mass, 1)) marks.add('one')
        if (same(setup.mass, 4)) marks.add('four')
      }
    }
    if (
      s.index === 3 &&
      setup.instrument === 'luz' &&
      setup.zoom &&
      same(setup.width, 3)
    ) {
      if (setup.scenario === 'cohete') marks.add('bent')
      if (setup.scenario === 'caida') marks.add('straight')
    }
  }
  return { ...s, setup, marks: [...marks], playing, feedback: '' }
}
export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'lesson':
      return Number.isInteger(a.index) && LESSONS[a.index]
        ? initialState(a.index, s.completed)
        : s
    case 'tune': {
      const onlyZoom = Object.keys(a.patch).every((k) => k === 'zoom')
      const setup = {
        ...s.setup,
        ...a.patch,
        progress: onlyZoom ? s.setup.progress : 0,
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
        s.setup.progress + Math.min(0.1, a.seconds) * 0.16,
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
            'Todavía falta una comparación. Seguí los pasos y volvé a comprobar.',
        }
      if (s.prediction !== LESSONS[s.index].answer)
        return {
          ...s,
          feedback:
            'Revisá las pelotas, la balanza o el rayo de luz. Podés cambiar tu respuesta y volver a probar.',
        }
      return {
        ...s,
        feedback: `¡Descubrimiento completo! ${LESSONS[s.index].meaning}`,
        completed: [...new Set([...s.completed, s.index])],
      }
  }
}
