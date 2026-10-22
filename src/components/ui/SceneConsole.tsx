import type { ReactNode } from 'react'
import './SceneConsole.css'

export default function SceneConsole({
  children,
  hint,
  challengeHref,
}: {
  children: ReactNode
  hint: string
  challengeHref: string
}) {
  return (
    <div
      className="spum-scene-console"
      role="group"
      aria-label="Controles junto al experimento"
    >
      <div className="spum-console-heading">
        <strong>Probá acá.</strong>
        <a href={challengeHref}>Mi reto ↓</a>
      </div>
      {children}
      <details className="spum-console-help">
        <summary>Cómo jugar y qué cambia</summary>
        <p className="spum-console-hint">{hint}</p>
      </details>
    </div>
  )
}
