import {
  DEFAULT,
  fallRadius,
  fallTimeAt,
  makePulse,
  pulseTrain,
  MAX_TIME,
  validate,
} from './physics.ts'
import type { Setup, Pulse } from './physics.ts'
export const LESSONS = [
  {
    title: 'Dos alturas, dos ritmos',
    question:
      'Si sostenés un reloj más cerca del horizonte, ¿cómo marcha frente al reloj de la antena?',
    choices: [
      'Más lento respecto de la antena',
      'Más rápido respecto de la antena',
      'Se rompe y deja de medir tiempo',
    ],
    answer: 0,
    hint: 'Con “Sostenida”, compará el reloj a 4 rs y a 1,2 rs. El número de ritmo compara ambos relojes; cada uno funciona normalmente en su lugar.',
    meaning:
      'Los relojes estáticos a distintas alturas acumulan tiempos propios diferentes. Acercarse reduce el ritmo relativo. Mantenerse quieto exige aceleración; no se puede sostener un reloj estático justo en el horizonte.',
    setup: { ...DEFAULT },
  },
  {
    title: 'Cruzar sin parar el reloj',
    question:
      '¿Qué le pasa al reloj propio de una sonda en caída libre cuando cruza el horizonte?',
    choices: [
      'Necesita un tiempo propio infinito',
      'Sigue midiendo y cruza en un tiempo propio finito',
      'El horizonte es una pared que la detiene',
    ],
    answer: 1,
    hint: 'Elegí “Caída libre”. Visitá “En el horizonte” y después “Un poco adentro”. Compará el reloj propio antes y después del cruce.',
    meaning:
      'El horizonte limita qué señales pueden llegar al exterior. En este modelo el reloj de la sonda sigue durante el cruce: no hay una pared ni una parada local del tiempo. Las coordenadas de Schwarzschild se vuelven singulares ahí; el mapa usa coordenadas regulares.',
    setup: { ...DEFAULT, mode: 'fall' as const, time: 0 },
  },
  {
    title: 'Mensajes cada vez más rojos',
    question:
      'La sonda emite pulsos con la misma separación en su reloj. Cerca del horizonte, ¿cómo se reciben afuera?',
    choices: [
      'Cada vez más juntos y azules',
      'Igual que al principio',
      'Más separados y con menor frecuencia',
    ],
    answer: 2,
    hint: 'En caída libre, enviá un pulso a 3 rs y otro con “Muy cerca”, a 1,05 rs. Compará frecuencia y demora en las dos tarjetas de envío.',
    meaning:
      'La recepción combina corrimiento gravitacional y movimiento de la sonda. Al acercarse al horizonte, la frecuencia recibida tiende a cero y la llegada se retrasa sin límite. Una frecuencia muy baja puede salir de la banda visible: rojo es una clave gráfica, no una foto literal.',
    setup: { ...DEFAULT, mode: 'fall' as const, time: 0 },
  },
  {
    title: 'El último lugar para avisar',
    question:
      'Un pulso apuntado hacia afuera, emitido dentro del horizonte, ¿puede alcanzar la antena exterior?',
    choices: [
      'Sí, si es lo bastante brillante',
      'No: sus caminos futuros siguen hacia radios menores',
      'Sí, porque la luz acelera por encima de c',
    ],
    answer: 1,
    hint: 'Enviá un pulso con “Afuera” (1,2 rs) y otro con “Un poco adentro” (0,8 rs). En la tarjeta del exterior, tocá “Recibir este pulso” y compará sus destinos.',
    meaning:
      'Fuera, un rayo saliente puede llegar a la antena. En el horizonte queda sobre su generador; dentro, incluso la dirección local saliente lleva a radios menores. La luz siempre se mide localmente a c: dr/dT es una velocidad de coordenadas, no una medición local.',
    setup: { ...DEFAULT, mode: 'fall' as const, time: 0 },
  },
] as const
export interface Learning {
  index: number
  prediction: number | null
  marks: string[]
  completed: number[]
}
export function observe(
  index: number,
  s: Setup,
  previous: readonly string[],
  sent?: Pulse,
) {
  const marks = new Set(previous)
  if (index === 0 && s.mode === 'hover') {
    if (s.radius >= 3.9) marks.add('high')
    if (s.radius <= 1.3) marks.add('low')
  }
  if (index === 1 && s.mode === 'fall') {
    const x = fallRadius(s.time)
    if (x !== null && Math.abs(x - 1) < 0.02) marks.add('horizon')
    if (x !== null && x < 0.9) marks.add('inside')
  }
  if (s.mode === 'fall' && sent) {
    if (index === 2 && sent.radius > 2.8 && sent.radius < 3.2)
      marks.add('early')
    if (index === 2 && sent.radius > 1 && sent.radius <= 1.06) marks.add('late')
    if (index === 3 && sent.radius > 1.1 && sent.radius < 1.3)
      marks.add('outside')
    if (index === 3 && sent.radius < 0.9) marks.add('trapped')
  }
  return [...marks]
}
export function observed(l: Learning) {
  return (
    [
      ['high', 'low'],
      ['horizon', 'inside'],
      ['early', 'late'],
      ['outside', 'trapped', 'heard'],
    ][l.index]?.every((m) => l.marks.includes(m)) ?? false
  )
}
export function checkAnswer(l: Learning) {
  if (l.prediction === null) return 'predict'
  if (!observed(l)) return 'try'
  return l.prediction === LESSONS[l.index].answer ? 'complete' : 'revise'
}
export interface State {
  setup: Setup
  learning: Learning
  manual: Pulse[]
  feedback: string
  notice: string
  playing: boolean
  nextId: number
}
export type Action =
  | { type: 'lesson'; index: number }
  | { type: 'tune'; patch: Partial<Setup> }
  | { type: 'radius'; radius: number }
  | { type: 'play' }
  | { type: 'tick'; delta: number }
  | { type: 'send' }
  | { type: 'predict'; choice: number }
  | { type: 'check' }
  | { type: 'receive' }
  | { type: 'receivePulse'; id: string }
export function initialState(index = 0, completed: number[] = []): State {
  const setup: Setup = { ...LESSONS[index].setup }
  return {
    setup,
    learning: {
      index,
      prediction: null,
      marks: observe(index, setup, []),
      completed: [...completed],
    },
    manual: [],
    feedback: '',
    notice: '',
    playing: false,
    nextId: 1,
  }
}
function setSetup(s: State, setup: Setup): State {
  validate(setup)
  const marks = observe(s.learning.index, setup, s.learning.marks)
  if (
    s.learning.index === 3 &&
    setup.mode === 'fall' &&
    s.manual.some(
      (p) =>
        p.radius > 1.1 &&
        p.radius < 1.3 &&
        p.arrival !== null &&
        p.arrival <= setup.time,
    )
  )
    marks.push('heard')
  return {
    ...s,
    setup,
    learning: {
      ...s.learning,
      marks: [...new Set(marks)],
    },
    feedback: '',
    notice: '',
  }
}
export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'lesson':
      return Number.isInteger(a.index) && a.index >= 0 && a.index < 4
        ? initialState(a.index, s.learning.completed)
        : s
    case 'tune': {
      const modeChange =
        a.patch.mode !== undefined && a.patch.mode !== s.setup.mode
      const restart =
        modeChange || (a.patch.radius !== undefined && s.setup.mode === 'hover')
      const next = {
        ...s.setup,
        ...a.patch,
        ...(modeChange ? { time: 0 } : {}),
      }
      try {
        return {
          ...setSetup(s, next),
          ...(restart ? { manual: [], playing: false } : {}),
        }
      } catch {
        return s
      }
    }
    case 'radius': {
      try {
        return {
          ...setSetup(s, {
            ...s.setup,
            mode: 'fall',
            time: fallTimeAt(a.radius),
          }),
          playing: false,
          manual: s.setup.mode === 'fall' ? s.manual : [],
        }
      } catch {
        return s
      }
    }
    case 'play':
      return {
        ...s,
        playing: !s.playing,
        setup: {
          ...s.setup,
          time: s.setup.time >= MAX_TIME ? 0 : s.setup.time,
        },
      }
    case 'tick': {
      if (!s.playing || !Number.isFinite(a.delta) || a.delta <= 0) return s
      const time = Math.min(
        MAX_TIME,
        s.setup.time + Math.min(0.1, a.delta) * 0.8,
      )
      return { ...setSetup(s, { ...s.setup, time }), playing: time < MAX_TIME }
    }
    case 'send': {
      const p = makePulse(s.setup, `manual-${s.nextId}`, true)
      if (!p)
        return {
          ...s,
          notice:
            'La sonda ya salió del tramo calculado. Volvé a un punto de la caída para enviar.',
        }
      return {
        ...s,
        playing: false,
        manual: [...s.manual.slice(-15), p],
        nextId: s.nextId + 1,
        learning: {
          ...s.learning,
          marks: observe(s.learning.index, s.setup, s.learning.marks, p),
        },
        feedback: '',
        notice:
          p.arrival === null
            ? 'Pulso guardado: no puede llegar a la antena exterior.'
            : 'Pulso guardado: tiene una llegada futura. Compará su tarjeta debajo del visor.',
      }
    }
    case 'predict':
      return Number.isInteger(a.choice) && a.choice >= 0 && a.choice < 3
        ? {
            ...s,
            learning: { ...s.learning, prediction: a.choice },
            feedback: '',
          }
        : s
    case 'check': {
      const status = checkAnswer(s.learning),
        l = LESSONS[s.learning.index]
      return {
        ...s,
        playing: false,
        feedback:
          status === 'predict'
            ? 'Elegí una predicción. Podés revisarla después de probar.'
            : status === 'try'
              ? `Falta comparar: ${l.hint}`
              : status === 'revise'
                ? `Revisá tu explicación: ${l.meaning}`
                : `¡Descubrimiento completo! ${l.meaning}`,
        learning:
          status !== 'complete'
            ? s.learning
            : {
                ...s.learning,
                completed: [
                  ...new Set([...s.learning.completed, s.learning.index]),
                ],
              },
      }
    }
    case 'receivePulse': {
      const p = s.manual.find((p) => p.id === a.id)
      if (!p || p.arrival === null || p.arrival > MAX_TIME) return s
      return {
        ...setSetup(s, {
          ...s.setup,
          time: Math.min(MAX_TIME, p.arrival + 1e-7),
        }),
        playing: false,
        notice:
          'Recibimos ese envío. Compará la marca del emisor con la lectura de la antena.',
      }
    }
    case 'receive': {
      const next = [...pulseTrain(s.setup), ...s.manual]
        .filter(
          (p) =>
            p.emitted <= s.setup.time &&
            p.arrival !== null &&
            p.arrival > s.setup.time + 1e-7,
        )
        .sort((a, b) => a.arrival! - b.arrival!)[0]
      if (!next || next.arrival! > MAX_TIME)
        return {
          ...s,
          playing: false,
          notice:
            'No hay otra llegada pendiente dentro de esta ventana. Las señales interiores nunca llegan; las muy cercanas pueden llegar después del tramo de escucha.',
        }
      return {
        ...setSetup(s, {
          ...s.setup,
          time: Math.min(MAX_TIME, next.arrival! + 1e-7),
        }),
        playing: false,
        notice:
          'Llegó un mensaje. La antena muestra la marca de reloj que llevaba al emitirse.',
      }
    }
  }
}
