import type { Lesson } from '../LabFrame'
export const LESSONS: readonly Lesson[] = [
  {
    title: 'El todo y lo que sale',
    question:
      'El conjunto BR está en un estado puro. Si mirás solo el primer qubit emitido, ¿su entropía tiene que ser cero?',
    choices: [
      'Sí: puro significa que cada parte tiene entropía cero',
      'No: una parte puede tener entropía aunque el conjunto sea puro',
      'Emitir crea información de la nada',
    ],
    answer: 1,
    hint: 'Usá 6 qubits. Compará «Inicio: 0» con «Primer qubit: 1». Mirá S(R) y el estado del conjunto BR, sin cambiar la preparación.',
    meaning:
      'El conjunto sigue siendo puro, con S(BR)=0. Al ignorar B, R puede tener entropía de entrelazamiento. Es la misma distinción que exploraste con A y B: pureza del todo no significa pureza de cada parte.',
  },
  {
    title: 'Dibujar la vuelta',
    question:
      'Si el conjunto permanece puro y al final todos los qubits están en R, ¿qué debe pasar con S(R)?',
    choices: [
      'Debe seguir creciendo hasta N',
      'Vuelve a cero al reunir el conjunto completo',
      'Se vuelve negativa',
    ],
    answer: 1,
    hint: 'Con 6 qubits, compará «Mitad: 3» y «Todo en R: 6». Activá «Promedio de Page». La línea dorada es una media, no la curva exacta de cada preparación.',
    meaning:
      'Cuando R contiene el sistema completo, su estado es puro y S(R)=0. En estados aleatorios típicos, la entropía primero crece y después baja. La fórmula de Page da una media sobre preparaciones; una curva individual puede fluctuar. El punto de giro del modelo no es un tiempo físico de evaporación.',
  },
  {
    title: 'La tensión de la paradoja',
    question:
      'Al terminar, ¿qué contraste aparece si aproximás la radiación como qubits térmicos independientes y máximamente mezclados?',
    choices: [
      'Esa aproximación deja S(R)=N; el modelo puro da S(R)=0',
      'Las dos cuentas dan siempre lo mismo',
      'La aproximación demuestra que la información desaparece',
    ],
    answer: 0,
    hint: 'Con 6 qubits, llevá todo a R. Compará la referencia «Emisión independiente» apagada y encendida. Cambia la cuenta de referencia, no el estado calculado.',
    meaning:
      'Si B desaparece y el estado final de toda la radiación fuera mixto, no sería el estado puro que exige una evolución unitaria desde un estado puro. Esa tensión es el núcleo de la paradoja. La línea coral es una hipótesis simplificada de qubits independientes; no es el cálculo gravitatorio completo de Hawking ni la entropía térmica 4/3 del otro capítulo.',
  },
  {
    title: 'Las pistas están juntas',
    question:
      'Al reunir toda la radiación, cada qubit puede parecer incierto pero el conjunto es puro. ¿Qué falta al sumar las entropías individuales?',
    choices: [
      'Las correlaciones entre las partes',
      'Un observador que mire con más atención',
      'Más radiación: todavía quedan qubits en B',
    ],
    answer: 0,
    hint: 'Con 6 qubits, llevá «Todo en R: 6». Alterná «R como conjunto» y «Qubits por separado». Compará S(R) con ΣS(Rᵢ), sin cambiar la preparación.',
    meaning:
      'Sumar las entropías de las partes ignora sus correlaciones. Aquí ΣS(Rᵢ)−S(R) es la correlación total: puede incluir correlaciones clásicas y cuánticas, no es una medida general de entrelazamiento. El ejemplo conserva una descripción conjunta pura; no implementa un decodificador de información de un agujero negro real.',
  },
]
export type Inspection = 'whole' | 'separate'
export interface Trial {
  lesson: number
  n: number
  seed: number
  emitted: number
  revealedUntil: number
  prediction: number | null
  marks: readonly string[]
  thermal: boolean
  average: boolean
  inspection: Inspection
}
export function initialTrial(lesson = 0, seed = 17): Trial {
  return {
    lesson,
    n: 6,
    seed,
    emitted: 0,
    revealedUntil: 0,
    prediction: null,
    marks: [],
    thermal: false,
    average: false,
    inspection: 'whole',
  }
}
export function observe(trial: Trial): Trial {
  if (trial.n !== 6) return trial
  const marks = new Set(trial.marks),
    k = trial.emitted
  if (trial.lesson === 0) {
    if (k === 0) marks.add('zero')
    if (k === 1) marks.add('one')
  }
  if (trial.lesson === 1) {
    if (k === 3) marks.add('middle')
    if (k === 6) marks.add('end')
    if (trial.average) marks.add('average')
  }
  if (trial.lesson === 2 && k === 6) marks.add(trial.thermal ? 'independent' : 'fine')
  if (trial.lesson === 3 && k === 6) marks.add(trial.inspection)
  return { ...trial, marks: [...marks] }
}
export function setEmitted(trial: Trial, value: number): Trial {
  if (!Number.isFinite(value)) return trial
  const emitted = Math.max(0, Math.min(trial.n, Math.round(value)))
  return observe({
    ...trial,
    emitted,
    revealedUntil: Math.max(trial.revealedUntil, emitted),
  })
}
export function prepare(trial: Trial, n: number, seed: number): Trial {
  if (!Number.isFinite(n) || !Number.isFinite(seed)) return trial
  return {
    ...initialTrial(trial.lesson, Math.max(1, Math.round(seed))),
    n: Math.max(4, Math.min(8, Math.round(n))),
    prediction: trial.prediction,
  }
}
const REQUIRED = [
  [
    ['zero', 'Comparar con 0 qubits emitidos'],
    ['one', 'Mirar R con 1 qubit emitido'],
  ],
  [
    ['middle', 'Mirar R con 3 qubits emitidos'],
    ['end', 'Reunir los 6 qubits en R'],
    ['average', 'Activar la media de Page'],
  ],
  [
    ['fine', 'Final con la referencia independiente apagada'],
    ['independent', 'Mismo final con la referencia independiente encendida'],
  ],
  [
    ['whole', 'Mirar los 6 qubits como conjunto'],
    ['separate', 'Mirar los mismos qubits por separado'],
  ],
] as const
export function steps(trial: Trial) {
  return [
    { label: 'Usar un montaje de 6 qubits', done: trial.n === 6 },
    ...REQUIRED[trial.lesson].map(([key, label]) => ({
      label,
      done: trial.marks.includes(key),
    })),
  ]
}
