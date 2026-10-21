import { experiments } from '../../portal/catalog'
import { BlackHoleNavigation } from '../../series/BlackHoleSeries'
import './LabJourney.css'

export function LabNavigation({
  links,
  light = false,
}: {
  links: readonly (readonly [string, string])[]
  light?: boolean
}) {
  return (
    <nav
      className={`spum-lab-nav ${light ? 'spum-light' : ''}`}
      aria-label="Accesos rápidos del laboratorio"
    >
      {links.map(([label, href]) => (
        <a key={href} href={href}>
          {label}
        </a>
      ))}
    </nav>
  )
}

export function LabMission({
  title,
  instruction,
  index,
  result,
  href,
  onStart,
  onNext,
  live = true,
  light = false,
}: {
  title?: string
  instruction: string
  index?: number
  result?: string
  href: string
  onStart?: () => void
  onNext?: () => void
  live?: boolean
  light?: boolean
}) {
  const activate = (action: () => void) => {
    action()
    requestAnimationFrame(() =>
      document.getElementById('spum-mission')?.focus({ preventScroll: true }),
    )
  }
  return (
    <section
      id="spum-mission"
      tabIndex={-1}
      className={`spum-mission ${light ? 'spum-light' : ''}`}
      aria-label="Tu pregunta junto al experimento"
    >
      <div>
        <span className="spum-mission-label">
          {index === undefined
            ? 'EMPEZÁ POR UNA PREGUNTA'
            : `RETO ${index + 1} / 4 · MIRÁ QUÉ CAMBIA`}
        </span>
        <h2>{title ?? '¿Qué te gustaría descubrir?'}</h2>
        <p>{instruction}</p>
        {result && (
          <p className="spum-mission-result" role="status" aria-live={live ? 'polite' : 'off'}>
            ↳ {result}
          </p>
        )}
      </div>
      <div className="spum-mission-actions">
        {onStart && <button onClick={() => activate(onStart)}>Empezar el primer reto ↗</button>}
        <a href={href}>{result ? 'Entender y comparar ↓' : 'Predicción y comparación ↓'}</a>
        {onNext && (
          <button onClick={() => activate(onNext)}>
            {index === 3 ? 'Volver al primer reto ↻' : 'Siguiente reto →'}
          </button>
        )}
      </div>
    </section>
  )
}

export function MoreLabs({ current, light = false }: { current: string; light?: boolean }) {
  return (
    <nav
      className={`spum-more-labs ${light ? 'spum-light' : ''}`}
      aria-label="Seguí explorando los laboratorios"
    >
      <BlackHoleNavigation current={current} />
      <h2>Una pregunta lleva a otra.</h2>
      <p>Elegí tu próxima exploración.</p>
      <div>
        {experiments
          .filter((lab) => lab.id !== current)
          .map((lab) => (
            <a key={lab.id} href={lab.href}>
              <span>{lab.number}</span>
              {lab.title}
              <b aria-hidden="true">↗</b>
            </a>
          ))}
      </div>
      <a className="spum-all-labs" href="/">
        Ver los {experiments.length} laboratorios
      </a>
    </nav>
  )
}
