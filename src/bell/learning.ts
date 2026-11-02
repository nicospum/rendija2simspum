import {
  BELL_ANGLES,
  SAME_ANGLES,
  PAIRS,
  card,
  quantum,
  sampleLot,
  stats,
  sweep,
  validateAngles,
} from './physics.ts'
import type { Angles, Counts, Pair, Sweep } from './physics.ts'
import { n } from './format.ts'
export const LESSONS = [
  {
    title: 'Azar de cada lado, relación entre ambos',
    question: 'Al girar B de 0° a 45°, manteniendo A en 0°, ¿qué cambia?',
    choices: [
      'Podés elegir si A dará + o −',
      'Cambian las coincidencias; cada lado sigue teniendo 50 % de probabilidad de +',
      'Cada pareja empieza a dar cuatro resultados a la vez',
    ],
    answer: 1,
    wrongFeedback: [
      'Girar el analizador cambia cómo medís, pero no permite elegir la salida de A. En ambos montajes A tiene 50 % de probabilidad de +; lo que cambia es cuántas parejas coinciden.',
      '',
      'Cada pareja deja una salida en A y una en B. ++, +−, −+ y −− son cuatro posibilidades; no cuatro resultados simultáneos.',
    ],
    hint: 'En «Experimento», usá A₀B₀. Medí un lote nuevo de 200 con «B a 0°» y otro con «B a 45°». Compará iguales/distintos y la lectura local de A.',
    steps: ['200 pares nuevos con A₀=0°, B₀=0°', '200 pares nuevos con A₀=0°, B₀=45°'],
    meaning:
      'En 0°/0° siempre coinciden (E=+1); en 0°/45° coinciden la mitad en promedio (E=0). En ambos, P(A+)=P(B+)=½. El azar local no basta para distinguir una fuente cuántica de una mezcla local bien construida.',
    angles: SAME_ANGLES,
  },
  {
    title: 'Intentá superar el límite con tarjetas',
    question:
      'Una tarjeta trae cuatro respuestas locales ±1. ¿Qué valores puede dar su suma CHSH?',
    choices: [
      'Cualquier número hasta 4 si elegís bien los signos',
      'Siempre cero, porque hay azar',
      'Sólo +2 o −2; mezclar tarjetas mantiene la media entre esos límites',
    ],
    answer: 2,
    wrongFeedback: [
      'Los cuatro productos comparten las mismas respuestas. No podés elegir sus signos por separado: uno de los paréntesis es cero y el otro ±2.',
      'Una tarjeta concreta da +2 o −2. Mezclar tarjetas con sumas opuestas puede dar media cero; el azar local por sí solo no obliga a ello.',
      '',
    ],
    hint: 'Abrí «Tarjetas locales». Guardá la tarjeta inicial y después cambiá A₀ de + a − y guardá otra. Mirá qué paréntesis es cero y cuál vale ±2; cambiar B₁ intercambia sus papeles.',
    steps: ['Guardar una tarjeta con S=+2', 'Guardar otra tarjeta con S=−2'],
    meaning:
      'Si B₀ y B₁ son iguales, B₀−B₁=0; si son opuestos, B₀+B₁=0. El otro paréntesis vale ±2. Por eso cada tarjeta da ±2 y cualquier mezcla independiente de los ajustes satisface |S|≤2.',
    angles: BELL_ANGLES,
  },
  {
    title: 'Cuatro ajustes, una prueba estadística',
    question:
      'Con los ángulos de Bell, ¿cómo deben interpretarse la predicción exacta y los lotes de 50 o 1000 pares por combinación?',
    choices: [
      'La predicción es 2√2; los lotes fluctúan y una muestra mayor acota mejor la estimación',
      'Superar 2 una vez con pocos pares prueba por sí solo una ley de la naturaleza',
      'Cambiar N cambia la predicción exacta de la fuente',
    ],
    answer: 0,
    wrongFeedback: [
      '',
      'Superar 2 en un lote no alcanza por sí solo: las muestras fluctúan. Además, esta simulación usa probabilidades programadas; probar la naturaleza requiere un experimento y su análisis estadístico.',
      'N es la cantidad de parejas medidas, no un ajuste de la fuente. Con estos ángulos la predicción sigue en 2√2; más datos reducen la incertidumbre de la estimación.',
    ],
    hint: 'Usá «Ángulos de Bell» y medí «4 × 50 pares» y «4 × 1000 pares». Son lotes nuevos: compará las cuatro filas y sus cotas, no sólo una coincidencia.',
    steps: [
      'Un ensayo completo de 50 pares por combinación con ángulos de Bell',
      'Otro ensayo completo de 1000 por combinación con los mismos ángulos',
    ],
    meaning:
      'S=E₀₀+E₀₁+E₁₀−E₁₁. La predicción ideal es 2√2≈2,828, superior al límite local 2. Los datos fluctúan; el margen simultáneo corresponde a cada lote fijado de antemano. Esta simulación no es una prueba experimental ni su intervalo es un p-valor.',
    angles: BELL_ANGLES,
  },
  {
    title: '¿Podés mandar un mensaje?',
    question:
      'B alterna entre 0° y 90° sin avisar. Si A sólo mira su propia lista de resultados, ¿puede leer ese mensaje?',
    choices: [
      'Sí: + significa que B eligió 0°',
      'No: su distribución sigue siendo 50/50; las correlaciones se revelan al comparar las listas',
      'Sí, porque las coincidencias siempre son visibles desde A',
    ],
    answer: 1,
    wrongFeedback: [
      'A puede obtener + tanto si B eligió 0° como 90°: en ambos casos tiene probabilidad 50 %. Un signo local no revela la elección remota.',
      '',
      'Una coincidencia compara dos registros. A necesita la lista de B para reconocerla; reunir ambas listas exige comunicación ordinaria.',
    ],
    hint: 'En A₀B₀, medí 200 pares con «B a 0°» y otros con «B a 90°», dejando A₀=0°. Compará la lista local A y después los resultados emparejados.',
    steps: ['200 pares con B₀=0° y A₀=0°', '200 pares con B₀=90° y A₀=0°'],
    meaning:
      'Las parejas pasan de coincidir a diferir, pero los resultados locales de A conservan probabilidad ½ para cada salida. Comparar correlaciones requiere reunir las listas por un canal ordinario; el entrelazamiento no transmite un mensaje controlable más rápido que la luz.',
    angles: SAME_ANGLES,
  },
] as const
const REQUIRED = [
  ['same', 'tilted'],
  ['positive', 'negative'],
  ['small', 'large'],
  ['same', 'opposite'],
]
export interface Run {
  angles: Angles
  pair: Pair
  counts: Counts
}
export interface Evidence {
  label: string
  text: string
  trial?: Sweep
}
export interface State {
  index: number
  angles: Angles
  pair: Pair
  card: number
  run: Run | null
  trial: Sweep | null
  evidence: Record<string, Evidence>
  prediction: number | null
  feedback: string
  verified: boolean
  completed: number[]
  event: number
  last: number | null
}
export type Action =
  | { type: 'lesson'; index: number }
  | { type: 'angle'; index: number; value: number }
  | { type: 'preset'; angles: Angles }
  | { type: 'pair'; pair: Pair }
  | { type: 'card'; index: number }
  | { type: 'saveCard' }
  | { type: 'sample'; size: 1 | 200; seed: number }
  | { type: 'sweep'; n: 50 | 1000; seed: number }
  | { type: 'predict'; choice: number }
  | { type: 'check' }
export function initialState(index = 0): State {
  if (!Number.isInteger(index) || !LESSONS[index]) throw new RangeError('Reto inválido.')
  return {
    index,
    angles: [...LESSONS[index].angles],
    pair: 0,
    card: 15,
    run: null,
    trial: null,
    evidence: {},
    prediction: null,
    feedback: '',
    verified: false,
    completed: [],
    event: 0,
    last: null,
  }
}
const close = (a: number, b: number) => Math.abs(a - b) < 1e-7
const sameAngles = (a: Angles, b: Angles) => a.every((v, i) => close(v, b[i]))
export const observations = (s: State) =>
  REQUIRED[s.index].map((k) => Boolean(s.evidence[k]))
function missingFeedback(s: State) {
  const done = observations(s),
    missing = LESSONS[s.index].steps.filter((_, i) => !done[i]).join('; ')
  if (s.index === 1)
    return `Todavía falta registrar: ${missing}. Tocá una respuesta para cambiar su signo y después usá «Guardar tarjeta».`
  if (s.index === 2)
    return `Todavía falta medir: ${missing}. Usá «Ángulos de Bell»: estos pasos necesitan los cuatro ángulos indicados y dos ensayos nuevos de distinto tamaño.`
  return `Todavía falta comparar: ${missing}. Usá A₀B₀ y los atajos B; cada colección necesita al menos 200 parejas con los ajustes pedidos.`
}
function sampled(s: State, size: 1 | 200, seed: number): State {
  if (size === 1 && s.run && stats(s.run.counts).N >= 4096)
    return {
      ...s,
      feedback:
        'La colección exploratoria llegó a 4096 pares. Medí un lote nuevo de 200 para empezar otra.',
      verified: false,
    }
  const [a, b] = PAIRS[s.pair],
    lot = sampleLot(s.angles[a], s.angles[b], size, seed),
    counts = lot.counts
  // A fixed-size 200-pair lot replaces the previous exploratory run.
  const previous =
    size === 1 &&
    s.run &&
    sameAngles(s.run.angles, s.angles) &&
    s.run.pair === s.pair &&
    stats(s.run.counts).N < 4096
      ? s.run.counts
      : [0, 0, 0, 0]
  const combined = counts.map((v, i) => v + previous[i]) as Counts,
    m = stats(combined)
  const evidence = { ...s.evidence }
  if (m.N >= 200 && s.pair === 0 && close(s.angles[0], 0)) {
    let key = ''
    if (s.index === 0) {
      if (close(s.angles[2], 0)) key = 'same'
      if (close(s.angles[2], 45)) key = 'tilted'
    }
    if (s.index === 3) {
      if (close(s.angles[2], 0)) key = 'same'
      if (close(s.angles[2], 90)) key = 'opposite'
    }
    if (key)
      evidence[key] = {
        label: `A₀=0° / B₀=${s.angles[2]}°`,
        text: `${m.N} pares · ${m.same} iguales / ${m.different} distintos (${n((m.same / m.N) * 100, 1)} % iguales) · E observado ${n(m.E ?? 0, 3)} · A+ ${n((m.aPlus ?? 0) * 100, 1)} %; predicción local 50 %.`,
      }
  }
  return {
    ...s,
    run: { angles: [...s.angles], pair: s.pair, counts: combined },
    evidence,
    event: s.event + 1,
    last: lot.last,
    feedback:
      'Lote exploratorio actualizado. Los resultados locales fluctúan; compará también sus probabilidades.',
    verified: false,
  }
}
export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'lesson':
      return Number.isInteger(a.index) && LESSONS[a.index]
        ? { ...initialState(a.index), completed: s.completed }
        : s
    case 'angle': {
      if (!Number.isInteger(a.index) || a.index < 0 || a.index > 3) return s
      if (s.angles[a.index] === a.value) return s
      const angles = [...s.angles] as Angles
      angles[a.index] = a.value
      try {
        validateAngles(angles)
      } catch {
        return s
      }
      return {
        ...s,
        angles,
        run: null,
        trial: null,
        last: null,
        feedback:
          'Cambió una orientación: se limpiaron los datos activos. Las referencias guardadas conservan su montaje.',
        verified: false,
      }
    }
    case 'preset':
      try {
        validateAngles(a.angles)
        if (s.pair === 0 && a.angles.every((value, i) => value === s.angles[i])) return s
        return {
          ...s,
          angles: [...a.angles],
          pair: 0,
          run: null,
          trial: null,
          last: null,
          feedback: 'Nuevo montaje preparado. Medí un lote para observarlo.',
          verified: false,
        }
      } catch {
        return s
      }
    case 'pair':
      return PAIRS[a.pair] && a.pair !== s.pair
        ? { ...s, pair: a.pair, run: null, last: null, feedback: '', verified: false }
        : s
    case 'card':
      return Number.isInteger(a.index) && a.index >= 0 && a.index < 16
        ? { ...s, card: a.index, feedback: '', verified: false }
        : s
    case 'saveCard': {
      const c = card(s.card),
        key = c.S === 2 ? 'positive' : 'negative'
      const evidence =
        s.index === 1
          ? {
              ...s.evidence,
              [key]: {
                label: `Tarjeta ${s.card + 1} · S=${c.S > 0 ? '+' : ''}${c.S}`,
                text: `A₀,A₁,B₀,B₁ = ${c.answers.join(', ')}. Productos: ${c.correlations.join(', ')}; el último se resta.`,
              },
            }
          : s.evidence
      return {
        ...s,
        evidence,
        feedback:
          s.index === 1
            ? 'Tarjeta guardada. Ninguna de las 16 puede superar |S|=2.'
            : `Esta tarjeta da S=${c.S > 0 ? '+' : ''}${c.S}. Para registrarla en la comparación, elegí el reto 2.`,
        verified: false,
      }
    }
    case 'sample':
      if (a.size !== 1 && a.size !== 200) return s
      try {
        return sampled(s, a.size, a.seed)
      } catch {
        return s
      }
    case 'sweep':
      try {
        const trial = sweep(s.angles, a.n, a.seed),
          evidence = { ...s.evidence }
        if (s.index === 2 && sameAngles(s.angles, BELL_ANGLES))
          evidence[a.n === 50 ? 'small' : 'large'] = {
            label: `${a.n} pares por combinación`,
            trial,
            text: `Cuatro lotes nuevos con A₀=0°, A₁=45°, B₀=22,5°, B₁=−22,5°. Predicción S=${n(quantum(s.angles).S, 3)}. El resultado del reto no depende de la fluctuación.`,
          }
        return {
          ...s,
          trial,
          evidence,
          feedback:
            'Ensayo nuevo de cuatro combinaciones. Cada fila tiene el tamaño fijado antes de medir; no se sumó al ensayo anterior.',
          verified: false,
        }
      } catch {
        return s
      }
    case 'predict':
      return Number.isInteger(a.choice) && a.choice >= 0 && a.choice < 3
        ? { ...s, prediction: a.choice, feedback: '', verified: false }
        : s
    case 'check':
      if (s.prediction === null)
        return {
          ...s,
          feedback: 'Elegí una explicación para poner a prueba.',
          verified: false,
        }
      if (!observations(s).every(Boolean))
        return {
          ...s,
          feedback: missingFeedback(s),
          verified: false,
        }
      if (s.prediction !== LESSONS[s.index].answer)
        return {
          ...s,
          feedback: `Revisá tu idea: ${LESSONS[s.index].wrongFeedback[s.prediction]} Podés cambiar tu explicación.`,
          verified: false,
        }
      return {
        ...s,
        verified: true,
        feedback: `¡Descubrimiento completo! ${LESSONS[s.index].meaning}`,
        completed: [...new Set([...s.completed, s.index])],
      }
  }
}
