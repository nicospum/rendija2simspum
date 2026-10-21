import { DEFAULT, validate } from './physics.ts'
import type { Setup } from './physics.ts'
export const LESSONS = [
  {
    title: 'La frecuencia abre la puerta',
    question:
      'Sobre sodio, ¿qué consigue emitir electrones: rojo muy brillante o azul con el mismo brillo?',
    choices: [
      'Los dos: alcanza con iluminar fuerte',
      'Solo el azul de este ensayo: cada fotón supera el umbral',
      'El rojo, porque su onda es más larga',
    ],
    answer: 1,
    hint: 'Usá sodio y brillo 100%. Registrá “Rojo · 450 THz” y después “Azul · 650 THz”. Compará si hay emisión.',
    steps: [
      'Medición con rojo, sodio y brillo 100%',
      'Medición con azul, sodio y brillo 100%',
    ],
    meaning:
      'Cada fotón rojo aporta menos energía de la que necesita un electrón para salir de este sodio ideal. Aumentar su cantidad no suma las energías en un único electrón dentro del modelo de un fotón. El azul sí supera el umbral.',
    setup: { ...DEFAULT, frequency: 450, brightness: 100 },
  },
  {
    title: 'Más brillo, más electrones',
    question:
      'Con sodio y luz azul de 650 THz, ¿qué cambia al pasar de brillo 25% a 100%?',
    choices: [
      'La corriente ideal se cuadruplica; la energía máxima de cada electrón no cambia',
      'Cada electrón sale con cuatro veces más energía',
      'El material cambia su frecuencia umbral',
    ],
    answer: 0,
    hint: 'Mantené sodio y “Azul · 650 THz”. Registrá “Brillo 25%” y “Brillo 100%”. Mirá la corriente y la energía máxima por separado.',
    steps: ['Medición azul con brillo 25%', 'Medición azul con brillo 100%'],
    meaning:
      'A frecuencia fija, cuatro veces la potencia significa cuatro veces los fotones por segundo. Con nuestra eficiencia fija, hay cuatro veces más electrones y corriente. La energía por fotón hf y la energía máxima hf−φ se mantienen.',
    setup: { ...DEFAULT, brightness: 25 },
  },
  {
    title: 'Cada metal tiene su umbral',
    question:
      'Iluminamos sodio y zinc con 1.000 THz y el mismo brillo. ¿Por qué uno emite y el otro no?',
    choices: [
      'El zinc recibe fotones de otra frecuencia',
      'La función trabajo del zinc es mayor que la energía de esos fotones',
      'El sodio transforma los fotones en otro color antes de emitir',
    ],
    answer: 1,
    hint: 'Usá “UV · 1.000 THz” y brillo 50%. Registrá sodio y zinc. Compará la energía por fotón con la función trabajo de cada metal.',
    steps: [
      'Medición UV de 1.000 THz sobre sodio',
      'La misma luz y brillo sobre zinc',
    ],
    meaning:
      'La luz mantiene su energía por fotón; cambiar el metal cambia la energía mínima de extracción φ. A 1.000 THz, hf ≈ 4,14 eV: alcanza para el sodio de 2,46 eV, pero no para el zinc de 4,31 eV.',
    setup: { ...DEFAULT, frequency: 1000 },
  },
  {
    title: '¿Adónde va la energía extra?',
    question:
      'Con sodio y brillo 50%, subimos de 650 a 1.000 THz. ¿Qué pasa con los electrones emitidos?',
    choices: [
      'Salen con más energía máxima, aunque a igual potencia llegan menos fotones por segundo',
      'El brillo fijo obliga a que cada electrón conserve la misma energía',
      'La función trabajo aumenta para consumir toda la energía extra',
    ],
    answer: 0,
    hint: 'Mantené sodio y brillo 50%. Registrá “Azul · 650 THz” y “UV · 1.000 THz”. Compará el reparto de energía y la corriente ideal.',
    steps: [
      'Medición azul de 650 THz, brillo 50%',
      'Medición UV de 1.000 THz, brillo 50%',
    ],
    meaning:
      'El metal necesita la misma energía de extracción. La energía adicional del fotón aumenta Kmáx. A potencia fija, los fotones más energéticos llegan en menor cantidad: en este modelo de eficiencia fija, puede subir la energía de los electrones y bajar la corriente a la vez.',
    setup: { ...DEFAULT },
  },
] as const
export interface Record {
  setup: Setup
}
export interface State {
  setup: Setup
  index: number
  prediction: number | null
  marks: string[]
  completed: number[]
  records: Record[]
  feedback: string
  playing: boolean
  time: number
}
export type Action =
  | { type: 'lesson'; index: number }
  | { type: 'tune'; patch: Partial<Setup> }
  | { type: 'record' }
  | { type: 'predict'; choice: number }
  | { type: 'check' }
  | { type: 'play' }
  | { type: 'tick'; seconds: number }
const required = [
  ['red', 'blue'],
  ['dim', 'bright'],
  ['sodium', 'zinc'],
  ['blue', 'uv'],
]
export const observations = (s: State) =>
  required[s.index].map((k) => s.marks.includes(k))
export function initialState(index = 0, completed: number[] = []): State {
  if (!Number.isInteger(index) || !LESSONS[index])
    throw new RangeError('Reto inválido.')
  return {
    setup: { ...LESSONS[index].setup },
    index,
    prediction: null,
    marks: [],
    completed: [...completed],
    records: [],
    feedback: '',
    playing: false,
    time: 0,
  }
}
function record(s: State): State {
  const { frequency: f, brightness: b, material: m } = s.setup,
    marks = new Set(s.marks)
  if (s.index === 0 && m === 'sodio' && b === 100) {
    if (f === 450) marks.add('red')
    if (f === 650) marks.add('blue')
  }
  if (s.index === 1 && m === 'sodio' && f === 650) {
    if (b === 25) marks.add('dim')
    if (b === 100) marks.add('bright')
  }
  if (s.index === 2 && f === 1000 && b === 50) {
    if (m === 'sodio') marks.add('sodium')
    if (m === 'zinc') marks.add('zinc')
  }
  if (s.index === 3 && m === 'sodio' && b === 50) {
    if (f === 650) marks.add('blue')
    if (f === 1000) marks.add('uv')
  }
  const records = [
    ...s.records.filter(
      (r) =>
        r.setup.frequency !== f ||
        r.setup.brightness !== b ||
        r.setup.material !== m,
    ),
    { setup: { ...s.setup } },
  ].slice(-2)
  return {
    ...s,
    marks: [...marks],
    records,
    feedback:
      'Medición guardada. Cambiá una variable y registrá otra para comparar.',
  }
}
export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'lesson':
      return Number.isInteger(a.index) && LESSONS[a.index]
        ? initialState(a.index, s.completed)
        : s
    case 'tune': {
      const setup = { ...s.setup, ...a.patch }
      try {
        validate(setup)
      } catch {
        return s
      }
      return { ...s, setup, feedback: '' }
    }
    case 'record':
      return record(s)
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
            'Falta registrar alguna de las condiciones del reto. Seguí la pista y compará tus mediciones.',
        }
      if (s.prediction !== LESSONS[s.index].answer)
        return {
          ...s,
          feedback:
            'Revisá la energía por fotón, el umbral y la corriente. Podés cambiar tu respuesta y volver a probar.',
        }
      return {
        ...s,
        feedback: `¡Descubrimiento completo! ${LESSONS[s.index].meaning}`,
        completed: [...new Set([...s.completed, s.index])],
      }
    case 'play':
      return { ...s, playing: !s.playing }
    case 'tick':
      return s.playing && Number.isFinite(a.seconds) && a.seconds > 0
        ? { ...s, time: s.time + Math.min(0.1, a.seconds) }
        : s
  }
}
