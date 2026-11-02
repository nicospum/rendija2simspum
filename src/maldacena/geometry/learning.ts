import type { Lesson } from '../LabFrame'
import { DEFAULT, settings, type GeometrySettings } from './physics.ts'

export type LabKind = 'geometry' | 'duality'
export const GEOMETRY_LESSONS: readonly Lesson[] = [
  {
    title: 'La recta pierde la carrera',
    question:
      'Entre los mismos extremos, ¿qué camino mide menos distancia física en este espacio?',
    choices: [
      'La recta del papel',
      'El arco que entra en el interior',
      'Los dos siempre miden igual',
    ],
    answer: 1,
    hint: 'Con ℓ=2 y ε=0,2, tocá «Medir los dos caminos». Compará la regla física, no la longitud en píxeles.',
    meaning:
      'La métrica pesa cada tramo como ds=√(dx²+dz²)/z. Cerca de z=0, avanzar un poco en el dibujo cuesta mucha distancia física. El arco aprovecha regiones más profundas: es la geodésica espacial, no el recorrido de una señal luminosa.',
  },
  {
    title: 'Una mano mueve el camino',
    question:
      'Si separás los extremos con el mismo corte ε, ¿qué le pasa al camino más corto?',
    choices: [
      'Tiene menos longitud física',
      'Cambia de color pero mide lo mismo',
      'Crece su longitud física',
    ],
    answer: 2,
    hint: 'Arrastrá un extremo o usá «Separar a ℓ=3». Mantené ε=0,2 y medí. El arco punteado conserva la referencia ℓ=2.',
    meaning:
      'El arco se vuelve más profundo y su longitud aumenta. La relación no es lineal: 2 asinh(ℓ/2ε) crece aproximadamente como un logaritmo cuando el intervalo supera mucho al corte.',
  },
  {
    title: 'El borde no está cerquita',
    question:
      'Al bajar el corte desde ε=0,2 hasta ε=0,04, sin cambiar ℓ, la longitud regulada…',
    choices: ['Aumenta', 'Disminuye', 'No depende del corte'],
    answer: 0,
    hint: 'Con ℓ=2, acercá la línea rosa a ε=0,04 y tocá «Medir los dos caminos». No estamos moviendo una pared material.',
    meaning:
      'La frontera z=0 está a distancia espacial infinita en esta rebanada. ε mantiene los extremos a una distancia regulada: al reducirlo incluimos más recorrido cercano a la frontera. El corte es una elección de resolución del cálculo, no una altura física de nuestro universo.',
  },
  {
    title: '¿Hasta dónde llega?',
    question: 'Con el mismo ε, ¿qué intervalo tiene una geodésica que alcanza mayor z?',
    choices: [
      'El intervalo más corto',
      'El intervalo más ancho',
      'Todos alcanzan el mismo z',
    ],
    answer: 1,
    hint: 'Conservá ε=0,2, llevá ℓ a 4 y medí. Compará la profundidad máxima con la referencia punteada de ℓ=2.',
    meaning:
      'La profundidad máxima es R=√[(ℓ/2)²+ε²]. Una región más amplia de la frontera se asocia a un camino que entra más en AdS. El siguiente laboratorio usa esa geometría para calcular una entropía, dentro de un caso concreto de holografía.',
  },
]
export const DUALITY_LESSONS: readonly Lesson[] = [
  {
    title: 'Una región más grande',
    question:
      'En el vacío de esta CFT, si duplicás el intervalo manteniendo ε, ¿la entropía se duplica?',
    choices: [
      'Sí, sigue linealmente a ℓ',
      'No: suma 13,86 nats, no se multiplica por dos',
      'No cambia',
    ],
    answer: 1,
    hint: 'Pasá de ℓ=2 a ℓ=4 con ε=0,1 y medí. Compará el aumento respecto de la referencia: no necesitás calcular el logaritmo.',
    meaning:
      'En este ejemplo cCFT=60: duplicar ℓ suma 20 ln 2 ≈ 13,86 nats, en vez de duplicar la entropía. Un nat es una unidad de información, como el bit, pero usa logaritmo natural. Para un intervalo del vacío de una CFT₂ en una línea infinita, S=(cCFT/3) ln(ℓ/ε). La longitud geométrica se aproxima a esa misma ley al acercar el corte a la frontera.',
  },
  {
    title: 'Mover no es agrandar',
    question:
      'Si trasladás todo el intervalo sin cambiar su longitud en este vacío homogéneo, ¿qué cambia en la entropía?',
    choices: ['Aumenta hacia la derecha', 'Disminuye hacia la izquierda', 'No cambia'],
    answer: 2,
    hint: 'Usá «Mover el intervalo a +1» o arrastrá la manija central. Mantené ℓ=2 y ε=0,1; después medí.',
    meaning:
      'El vacío sobre la línea infinita es invariante por traslaciones. Cambiar el centro mueve el arco y la región, pero ambas descripciones conservan la entropía. No estamos rotando una cámara ni cambiando de observador.',
  },
  {
    title: 'La diferencia del corte',
    question:
      '¿Qué debería pasar con la pequeña diferencia entre longitud regulada y fórmula logarítmica al reducir ε?',
    choices: [
      'Se hace menor',
      'Siempre es exactamente cero',
      'Demuestra que la dualidad es falsa',
    ],
    answer: 0,
    hint: 'Medí primero con ε=0,3. Después elegí ε=0,03 y volvé a medir, sin cambiar ℓ=2. Las dos mediciones deben quedar registradas.',
    meaning:
      'Nuestros extremos están a z=ε: la longitud exacta es 2L asinh(ℓ/2ε). El logaritmo CFT mostrado es el límite asintótico, en una convención de constante aditiva fijada. A corte finito no fingimos igualdad exacta ni interpretamos la diferencia como un fallo de AdS/CFT.',
  },
  {
    title: 'Comparar lo que cambia',
    question:
      'Si comparás ℓ=2 y ℓ=4 con el mismo corte, ¿qué incremento queda al acercar ε a cero?',
    choices: [
      'Cero: se cancela todo',
      '13,86 nats en este ejemplo, independiente del corte',
      'Un incremento que crece sin límite',
    ],
    answer: 1,
    hint: 'Con ℓ=4, medí la diferencia respecto de ℓ=2 a ε=0,1. Repetí a ε=0,02. Compará ΔS, no la entropía total divergente.',
    meaning:
      'Al restar entropías de dos intervalos usando el mismo esquema, la contribución divergente común se cancela. ΔS_CFT=(cCFT/3) ln(4/2). La diferencia geométrica converge a ese valor. Es una comprobación acotada del diccionario semiclásico, no una prueba de toda la conjetura.',
  },
]
export interface GeometryTrial {
  kind: LabKind
  lesson: number
  prediction: number | null
  setup: GeometrySettings
  marks: readonly string[]
  measurements: number
  records: readonly GeometrySettings[]
}
export function reference(kind: LabKind, lesson: number): GeometrySettings {
  return settings({
    ...DEFAULT,
    cutoff: kind === 'geometry' ? 0.2 : lesson === 2 ? 0.3 : 0.1,
    interval: kind === 'duality' && lesson === 3 ? 4 : 2,
  })
}
export function initialTrial(kind: LabKind, lesson = 0): GeometryTrial {
  return {
    kind,
    lesson,
    prediction: null,
    setup: reference(kind, lesson),
    marks: [],
    measurements: 0,
    records: [],
  }
}
export function measure(trial: GeometryTrial): GeometryTrial {
  const { kind, lesson, setup: s } = trial
  const marks = new Set(trial.marks)
  const same = (a: number, b: number) => Math.abs(a - b) < 0.001
  if (kind === 'geometry') {
    if (lesson === 0 && same(s.interval, 2) && same(s.cutoff, 0.2)) marks.add('compare')
    if (lesson === 1 && s.interval >= 3 && same(s.cutoff, 0.2)) marks.add('wide')
    if (lesson === 2 && same(s.interval, 2) && s.cutoff <= 0.04) marks.add('edge')
    if (lesson === 3 && s.interval >= 3.9 && same(s.cutoff, 0.2)) marks.add('deep')
  } else {
    if (lesson === 0 && same(s.interval, 4) && same(s.cutoff, 0.1)) marks.add('double')
    if (
      lesson === 1 &&
      same(s.interval, 2) &&
      same(s.cutoff, 0.1) &&
      Math.abs(s.center) >= 0.8
    )
      marks.add('move')
    if (lesson === 2 && same(s.interval, 2)) {
      if (same(s.cutoff, 0.3)) marks.add('coarse')
      if (same(s.cutoff, 0.03)) marks.add('fine')
    }
    if (lesson === 3 && same(s.interval, 4)) {
      if (same(s.cutoff, 0.1)) marks.add('delta-coarse')
      if (same(s.cutoff, 0.02)) marks.add('delta-fine')
    }
  }
  return {
    ...trial,
    marks: [...marks],
    measurements: trial.measurements + 1,
    records: [...trial.records, { ...s }].slice(-8),
  }
}
export function steps(trial: GeometryTrial) {
  const required =
    trial.kind === 'geometry'
      ? [
          [['compare', 'Medí ambos caminos con ℓ=2 y ε=0,2']],
          [['wide', 'Medí un intervalo ℓ≥3 con ε=0,2']],
          [['edge', 'Medí ℓ=2 con ε≤0,04']],
          [['deep', 'Medí ℓ=4 con ε=0,2']],
        ]
      : [
          [['double', 'Medí ℓ=4 con ε=0,1']],
          [['move', 'Trasladá el centro a |x|≥0,8 y medí con ℓ=2, ε=0,1']],
          [
            ['coarse', 'Medí ℓ=2 con ε=0,3'],
            ['fine', 'Medí ℓ=2 con ε=0,03'],
          ],
          [
            ['delta-coarse', 'Compará ΔS con ℓ=4 y ε=0,1'],
            ['delta-fine', 'Compará ΔS con ℓ=4 y ε=0,02'],
          ],
        ]
  return required[trial.lesson].map(([id, label]) => ({
    label,
    done: trial.marks.includes(id),
  }))
}
