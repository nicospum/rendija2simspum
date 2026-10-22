import { challengeGuide } from './trialSteps'
import type { ObservationStep } from './trialSteps'
import './ChallengeGuide.css'

export default function ChallengeGuide({
  index,
  title,
  prediction,
  steps,
  saved,
  automatic = false,
  challengeHref,
  viewHref,
  help,
  notice,
}: {
  index: number
  title: string
  prediction: string | undefined
  steps: readonly ObservationStep[]
  saved: boolean
  automatic?: boolean
  challengeHref: string
  viewHref: string
  help: string
  notice?: string
}) {
  const guide = challengeGuide(prediction, steps, automatic)
  return (
    <div
      className="spum-trial-guide"
      aria-label="Guía del reto junto a los controles"
    >
      <span className="spum-trial-label">
        RETO {index + 1}/4 · {saved ? 'HUELLA GUARDADA ✓' : 'PASO A PASO'}
      </span>
      <strong>{title}</strong>
      <p role="status">{notice ?? guide.prompt}</p>
      {prediction !== undefined && (
        <p className="spum-trial-idea">Tu idea: {prediction}</p>
      )}
      <div className="spum-trial-actions">
        <a href={viewHref}>Ver qué cambió ↑</a>
        <a href={challengeHref}>{guide.action}</a>
      </div>
      <details>
        <summary>Mi comparación y cómo usar los controles</summary>
        <ul>
          {steps.map((step) => (
            <li key={step.label}>
              {step.done ? '✓ Hecho: ' : '○ Pendiente: '}
              {step.label}
            </li>
          ))}
        </ul>
        <p>{help}</p>
        <p>
          Los botones con valores ayudan a comparar sin acertar un punto
          exacto de la barra. Podés explorar sin reproducir. Si hay dos
          vistas, alternálas para mirar el mismo ensayo desde otro lugar.
        </p>
        <p>
          Cambiar de reto prepara otro ensayo. Reiniciarlo conserva tus
          huellas guardadas. Equivocarte no resta puntos: revisá tu idea y
          volvé a probar.
        </p>
      </details>
    </div>
  )
}

export function FirstVisit({ name }: { name: string }) {
  return (
    <details className="spum-first-visit">
      <summary>¿Primera vez en {name}? Así se juega y se aprende.</summary>
      <ol>
        <li>
          <strong>Imaginá.</strong> Elegí un laboratorio y una predicción,
          aunque no sepas la respuesta.
        </li>
        <li>
          <strong>Probá.</strong> Cambiá una condición y compará el dibujo y
          las medidas. Los retos indican qué estados mirar.
        </li>
        <li>
          <strong>Explicá.</strong> Volvé a tu pregunta, revisá tu idea y
          guardá el descubrimiento. Podés cambiar de respuesta: aprender no
          exige acertar de entrada.
        </li>
      </ol>
      <p>
        Los laboratorios están siempre abiertos. Tus huellas se guardan en
        este navegador; reiniciar un ensayo no las borra. En celular, abrí
        «Mi reto» junto al visor: podés elegir una idea, usar los mandos y
        comprobarla sin abandonar la escena.
      </p>
    </details>
  )
}
