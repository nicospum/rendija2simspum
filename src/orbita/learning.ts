import { MERCURY, validate } from './physics.ts'
import type { Setup } from './physics.ts'
export const LESSONS = [
  {
    title: 'La vuelta no empata',
    question:
      'Después de diez recorridos entre perihelio y perihelio, ¿qué cambia al pasar de Newton a Einstein?',
    choices: [
      'El perihelio relativista avanza; el newtoniano conserva su dirección',
      'Mercurio se escapa del Sol',
      'El Sol se mueve al centro de la elipse',
    ],
    answer: 0,
    hint: 'Con Mercurio, completá diez vueltas con “Ampliar giro ×100.000”. Compará las dos vistas y las marcas de perihelio.',
    steps: ['Diez vueltas de Mercurio con el giro ampliado'],
    meaning:
      'La órbita de dos cuerpos de Newton cierra una elipse. En Schwarzschild, volver al radio mínimo requiere un ángulo algo mayor que 360°. La dirección del perihelio avanza: eso es precesión.',
    setup: { ...MERCURY },
  },
  {
    title: 'La forma importa',
    question:
      'Con igual tamaño orbital y masa central, ¿qué pasa al subir la excentricidad de 0,10 a 0,60?',
    choices: [
      'El giro por vuelta desaparece',
      'Aumenta la precesión por vuelta',
      'Solo cambia el color',
    ],
    answer: 1,
    hint: 'Mantené a = 0,3871 UA y una masa solar. Usá “Poco alargada · 0,10” y “Muy alargada · 0,60”; completá diez vueltas en cada ensayo.',
    steps: ['Diez vueltas con e = 0,10', 'Diez vueltas con e = 0,60'],
    meaning:
      'A igual semieje mayor, una órbita más excéntrica se acerca más al Sol. El factor 1/(1−e²) aumenta el avance por vuelta. No estamos cambiando a la vez el tamaño orbital ni la masa.',
    setup: { ...MERCURY, e: 0.1 },
  },
  {
    title: 'Más cerca, más giro',
    question:
      'Si duplicamos el semieje mayor manteniendo masa y excentricidad, ¿qué pasa con el avance por vuelta?',
    choices: [
      'Se duplica',
      'Se mantiene exactamente igual',
      'Se reduce aproximadamente a la mitad',
    ],
    answer: 2,
    hint: 'Con e = 0,2056 y una masa solar, compará “Tamaño de Mercurio” y “Doble tamaño”. Completá diez vueltas en cada caso. Mirá el avance POR VUELTA.',
    steps: [
      'Diez vueltas al tamaño de Mercurio',
      'Diez vueltas al doble de tamaño',
    ],
    meaning:
      'En campo débil, Δϖ es inversamente proporcional a a. Duplicar a reduce a la mitad el avance por vuelta. Por siglo cae todavía más, porque una órbita mayor también tarda más en completarse.',
    setup: { ...MERCURY },
  },
  {
    title: 'La pista de los 43 segundos',
    question:
      '¿Qué representa el famoso aporte de unos 43″ por siglo en Mercurio?',
    choices: [
      'Una vuelta completa por año',
      'Un aporte relativista adicional a la precesión ya explicada por otros efectos',
      'El giro total observado, sin ninguna otra contribución',
    ],
    answer: 1,
    hint: 'Restaurá “Mercurio real”. Completá las diez vueltas con “Giro real” y con “Ampliar giro ×100.000”. Leé el valor por siglo: la lupa no lo cambia.',
    steps: [
      'Mercurio con giro real, diez vueltas',
      'Mercurio con giro ampliado, diez vueltas',
    ],
    meaning:
      'El aporte relativista es diminuto pero acumulativo. Ayudó a explicar un residuo que la gravitación newtoniana y las perturbaciones conocidas no resolvían. Los otros planetas también hacen precesar la órbita: nuestro modelo aísla el aporte del Sol esférico.',
    setup: { ...MERCURY, expanded: false },
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
const required = [
  ['compare'],
  ['round', 'eccentric'],
  ['small', 'large'],
  ['real', 'expanded'],
]
export const observations = (s: State) =>
  required[s.index].map((k) => s.marks.includes(k))
function update(s: State, setup: Setup, playing = false): State {
  const marks = new Set(s.marks),
    same = (a: number, b: number) => Math.abs(a - b) < 1e-8
  if (setup.progress === 1 && same(setup.mass, 1)) {
    const mercuryShape = same(setup.e, MERCURY.e),
      mercurySize = same(setup.a, MERCURY.a)
    if (s.index === 0 && mercurySize && mercuryShape && setup.expanded)
      marks.add('compare')
    if (s.index === 1 && mercurySize) {
      if (same(setup.e, 0.1)) marks.add('round')
      if (same(setup.e, 0.6)) marks.add('eccentric')
    }
    if (s.index === 2 && mercuryShape) {
      if (mercurySize) marks.add('small')
      if (same(setup.a, 2 * MERCURY.a)) marks.add('large')
    }
    if (s.index === 3 && mercurySize && mercuryShape)
      marks.add(setup.expanded ? 'expanded' : 'real')
  }
  return { ...s, setup, playing, marks: [...marks], feedback: '' }
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
        progress: Object.keys(a.patch).every((k) => k === 'expanded')
          ? s.setup.progress
          : 0,
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
        s.setup.progress + Math.min(0.1, a.seconds) * 0.09,
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
            'Falta una comparación del reto. Seguí la pista y completá los recorridos.',
        }
      if (s.prediction !== LESSONS[s.index].answer)
        return {
          ...s,
          feedback:
            'Revisá las marcas y el avance por vuelta. Podés cambiar tu respuesta y volver a probar.',
        }
      return {
        ...s,
        feedback: `¡Descubrimiento completo! ${LESSONS[s.index].meaning}`,
        completed: [...new Set([...s.completed, s.index])],
      }
  }
}
