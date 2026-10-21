/** Local, homogeneous field; Newtonian mechanics for slow bodies, Rindler light rays. SI. */
export const C = 299_792_458
export const HEIGHT = 1.8
export const WIDTH = 3
export type Scenario = 'suelo' | 'caida' | 'cohete' | 'deriva'
export interface Setup {
  scenario: Scenario
  strength: number
  mass: number
  instrument: 'pelotas' | 'luz'
  progress: number
  width: number
  zoom: boolean
}
export const DEFAULT: Setup = {
  scenario: 'suelo',
  strength: 9.81,
  mass: 2,
  instrument: 'pelotas',
  progress: 0,
  width: 3,
  zoom: true,
}
export const SCENARIOS = {
  suelo: {
    title: 'Ascensor sostenido',
    short: 'Sostenido',
    description: 'Cerca de una masa; el soporte impide que la cabina caiga.',
  },
  caida: {
    title: 'Caída libre',
    short: 'Caída libre',
    description: 'Hay campo gravitatorio, pero cabina y objetos caen juntos.',
  },
  cohete: {
    title: 'Nave acelerada',
    short: 'Nave acelerada',
    description: 'Lejos de masas, el motor acelera la cabina hacia arriba.',
  },
  deriva: {
    title: 'Nave a la deriva',
    short: 'A la deriva',
    description: 'Lejos de masas, motores apagados: movimiento inercial.',
  },
} as const
export function validate(s: Setup) {
  if (
    !Object.prototype.hasOwnProperty.call(SCENARIOS, s.scenario) ||
    ![s.strength, s.mass, s.progress, s.width].every(Number.isFinite) ||
    s.strength < 1 ||
    s.strength > 20 ||
    s.mass < 0.2 ||
    s.mass > 5 ||
    s.progress < 0 ||
    s.progress > 1 ||
    s.width < 1 ||
    s.width > 6 ||
    !['pelotas', 'luz'].includes(s.instrument) ||
    typeof s.zoom !== 'boolean'
  )
    throw new RangeError('Configuración del ascensor inválida.')
}
export function field(s: Setup) {
  validate(s)
  const g = s.scenario === 'suelo' || s.scenario === 'caida' ? s.strength : 0
  const cabinAcceleration =
    s.scenario === 'caida'
      ? -s.strength
      : s.scenario === 'cohete'
        ? s.strength
        : 0
  return { g, cabinAcceleration, proper: g + cabinAcceleration }
}
/** Photon emitted horizontally at the origin of a uniformly accelerated (Rindler) frame.
 * Stable rationalization avoids subtracting two nearly equal numbers at terrestrial a.
 * For a supported local gravity lab the equivalence approximation ignores curvature. */
export function light(s: Setup, fraction = s.progress) {
  const { proper: a } = field(s)
  if (!Number.isFinite(fraction) || fraction < 0 || fraction > 1)
    throw new RangeError('Fracción de luz inválida.')
  const x = s.width * fraction,
    z = (a * x) / (C * C),
    root = Math.sqrt(1 - z * z)
  const insideY = (-a * x * x) / (C * C * (1 + root))
  const labTime = x / C,
    emitterTime = a === 0 ? labTime : (C / a) * Math.atanh(z)
  const cabinY =
    (a * labTime * labTime) / (Math.sqrt(1 + ((a * labTime) / C) ** 2) + 1)
  return {
    x,
    insideY,
    labY: 0,
    cabinY,
    labTime,
    emitterTime,
    drop: -insideY,
    fullDrop:
      (a * s.width * s.width) /
      (C * C * (1 + Math.sqrt(1 - ((a * s.width) / (C * C)) ** 2))),
  }
}
export function snapshot(s: Setup) {
  const f = field(s),
    duration = 1.15 * Math.sqrt((2 * HEIGHT) / s.strength),
    t = duration * s.progress
  const hitTime = f.proper === 0 ? null : Math.sqrt((2 * HEIGHT) / f.proper)
  const ballY = Math.max(0, HEIGHT - 0.5 * f.proper * t * t),
    cabinY = 0.5 * f.cabinAcceleration * t * t
  return {
    ...f,
    t,
    duration,
    hitTime,
    ballY,
    cabinY,
    ballWorldY: cabinY + ballY,
    normal: s.mass * f.proper,
    gravityForce: s.mass * f.g,
    contact: hitTime !== null && t >= hitTime,
    light: light(s),
  }
}
