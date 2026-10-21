import { reading } from './learning.ts'
import type { Setup } from './learning.ts'
import { scientific } from './physics.ts'

export function factor(value: number) {
  return value >= 0.01 && value < 1000
    ? `×${Number(value.toPrecision(3)).toLocaleString('es-AR', { maximumFractionDigits: 3 })}`
    : `×(${scientific(value)})`
}

// This bounded visual response emphasizes changes; it is not a photon rate or a visible color.
export function flowSignal(powerRatio: number) {
  return Math.min(1, Math.max(0.04, 0.45 + Math.log2(Math.max(powerRatio, 1e-300)) * 0.15))
}

export function impact(setup: Setup, baseline: Setup) {
  const current = reading(setup),
    reference = reading(baseline)
  const mass = current.massKg / reference.massKg
  const temperature = current.temperatureK / reference.temperatureK
  const power = current.powerW / reference.powerW
  const entropy = current.entropyOverK / reference.entropyOverK
  const sameInitialMass = setup.mass === baseline.mass
  const sameAge = setup.age === baseline.age
  const sameEnvironment = setup.environment === baseline.environment
  const changed = Number(!sameInitialMass) + Number(!sameAge) + Number(!sameEnvironment)
  let title = 'Una referencia para ver los cambios'
  let explanation =
    'Probá dividir la masa por dos: el radio se reduce a la mitad, la temperatura se duplica y la potencia ideal se multiplica por cuatro.'
  if (changed > 1) {
    title = 'Cambiaste más de una condición'
    explanation =
      'Las medidas siguen calculándose, pero combinan varios cambios. Restaurá la referencia para atribuir el resultado a una sola variable.'
  } else if (!sameEnvironment) {
    title =
      current.netW < 0
        ? 'Sigue emitiendo, pero gana energía'
        : 'El entorno aporta energía; todavía pierde masa'
    explanation =
      current.netW < 0
        ? 'La temperatura del fondo supera a la del agujero negro. La absorción azul domina: emitir radiación no alcanza para evaporarse.'
        : 'Este agujero negro está más caliente que el fondo. La potencia emitida sigue superando a la absorbida: el balance aún favorece la pérdida de masa.'
  } else if (!sameAge) {
    title =
      current.massKg < reference.massKg
        ? 'Se achica y se calienta al emitir'
        : 'Volviste a un momento anterior'
    explanation = `Masa restante ${factor(mass)}; temperatura ${factor(temperature)}; potencia ideal ${factor(power)} respecto de la referencia. La energía radiada sale de su masa: E = Mc².`
  } else if (!sameInitialMass) {
    title =
      mass > 1 ? 'Más grande, más frío y menos emisor' : 'Más pequeño, más caliente y más emisor'
    explanation = `Masa ${factor(mass)} → radio ${factor(mass)}, temperatura ${factor(temperature)}, potencia ideal ${factor(power)} y entropía ${factor(entropy)}. El área cambia con el cuadrado del radio.`
  }
  return {
    current,
    reference,
    mass,
    temperature,
    power,
    entropy,
    title,
    explanation,
    isolated: changed <= 1,
    emissionSignal: flowSignal(power),
    absorptionSignal: current.absorbedW > 0 ? flowSignal(current.absorbedW / reference.powerW) : 0,
    areaSideRatio: Math.sqrt(entropy),
    metrics: [
      { name: 'Radio', ratio: mass },
      { name: 'Temperatura', ratio: temperature },
      { name: 'Potencia ideal', ratio: power },
      { name: 'Entropía', ratio: entropy },
    ],
  }
}
