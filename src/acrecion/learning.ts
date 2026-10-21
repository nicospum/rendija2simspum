import { DEFAULT, validate } from './physics.ts'
import type { Setup } from './physics.ts'

export const LESSONS = [
  {
    title: '¿Quién enciende la oscuridad?',
    question:
      'Sin gas alrededor, ¿el agujero negro conserva este disco brillante?',
    choices: [
      'Sí: brilla el interior',
      'No: la luz viene del gas exterior',
      'Se convierte en una estrella',
    ],
    answer: 1,
    hint: 'Llevá la alimentación a 0 y después a 60 % o más. ¿Qué desaparece y qué vuelve a brillar?',
    meaning:
      'El gas libera energía al perder energía orbital y calentarse. El horizonte no es una superficie luminosa. Sin ese gas, desaparece el disco; eso no demuestra que no haya un agujero negro. Esta luz no es radiación de Hawking.',
    setup: { ...DEFAULT, gas: 0 },
  },
  {
    title: 'Un disco. Dos apariencias.',
    question:
      'Al inclinar el disco, ¿la parte que parece levantarse es gas que salió de su plano?',
    choices: [
      'Sí: el gas forma una cúpula',
      'No: la gravedad curva el camino de su luz',
      'Es otro agujero negro',
    ],
    answer: 1,
    hint: 'Pasá de 0° a 70° o más. Después apagá y volvé a encender “Curvar la luz”.',
    meaning:
      'El disco sigue siendo plano. Rayos de su parte posterior se curvan y alcanzan al observador por encima y por debajo de la sombra. Comparar con luz recta separa perspectiva y lente gravitacional.',
    setup: { ...DEFAULT, inclination: 0, doppler: false },
  },
  {
    title: 'El lado que viene hacia vos',
    question:
      'Con el disco inclinado, ¿qué lado se refuerza por el movimiento del gas?',
    choices: ['El que se aleja', 'Ambos por igual', 'El que se acerca'],
    answer: 2,
    hint: 'Activá “Movimiento relativista” a 70° y después mirá el disco de frente, a 0°.',
    meaning:
      'El movimiento cambia la frecuencia y concentra la radiación en la dirección de avance. En la intensidad integrada sobre frecuencias aparece un factor g⁴. De frente desaparece la asimetría entre los lados, aunque persisten otros efectos relativistas.',
    setup: { ...DEFAULT, inclination: 70, doppler: false },
  },
  {
    title: 'Pesar algo que no vemos',
    question:
      'A igual radio orbital, si la masa invisible se duplica, ¿qué pasa con el período?',
    choices: ['Se reduce a 1/√2 del original', 'Se duplica', 'No cambia'],
    answer: 0,
    hint: 'La estrella está a 100 UA. Llevá la masa de 4 a 8 millones de soles y compará con la órbita de referencia.',
    meaning:
      'En el régimen de esta órbita, T² = 4π²a³/(GM). Duplicar M divide T por √2. Medir tamaño y período permite inferir masa aunque no haya disco brillante. La estrella es un ejemplo ideal, no datos de una estrella observada.',
    setup: { ...DEFAULT, gas: 0, mass: 4, view: 'star' as const },
  },
] as const

export interface Learning {
  index: number
  prediction: number | null
  observations: string[]
  completed: number[]
}
export function observe(index: number, s: Setup, previous: readonly string[]) {
  validate(s)
  const marks = new Set(previous)
  if (index === 0 && s.gas === 0 && s.view === 'disk') marks.add('off')
  if (index === 0 && s.gas >= 60 && s.view === 'disk') marks.add('gas')
  if (index === 1 && s.inclination >= 70 && s.view === 'disk')
    marks.add(s.lens ? 'bent' : 'straight')
  if (index === 2 && s.view === 'disk' && s.doppler) {
    if (s.inclination >= 65) marks.add('inclined')
    if (s.inclination <= 5) marks.add('face')
  }
  if (index === 3 && s.mass >= 7.9 && s.view === 'star') marks.add('mass')
  return [...marks]
}
export function observed(index: number, marks: readonly string[]) {
  const required = [
    ['off', 'gas'],
    ['bent', 'straight'],
    ['inclined', 'face'],
    ['mass'],
  ][index]
  return !!required && required.every((mark) => marks.includes(mark))
}
export function checkAnswer(
  l: Learning,
): 'predict' | 'try' | 'revise' | 'complete' {
  if (l.prediction === null) return 'predict'
  if (!observed(l.index, l.observations)) return 'try'
  return l.prediction === LESSONS[l.index].answer ? 'complete' : 'revise'
}
