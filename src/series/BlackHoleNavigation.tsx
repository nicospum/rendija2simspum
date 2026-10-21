import { blackHoleLabs } from './catalog'
import { useBlackHolePassport } from './usePassport'
import type { ChapterId } from './progress'
import './series.css'
export function BlackHoleNavigation({ current }: { current: string }) {
  const index = blackHoleLabs.findIndex((l) => l.id === current)
  return index < 0 ? null : (
    <ChapterNavigation index={index} current={current} />
  )
}
function ChapterNavigation({
  index,
  current,
}: {
  index: number
  current: string
}) {
  const passport = useBlackHolePassport()
  return (
    <nav
      className="spum-series"
      aria-label="Índice del especial agujeros negros"
    >
      <details>
        <summary>
          <img
            src="/agujeros-negros/atlas-emblema-v1.webp"
            width="48"
            height="32"
            alt=""
          />
          <span>
            ATLAS DE LO INVISIBLE
            <strong>
              0{index + 1} / 05 · {blackHoleLabs[index].title}
            </strong>
          </span>
          <b>Índice</b>
        </summary>
        <ol>
          {blackHoleLabs.map((lab, i) => (
            <li key={lab.id}>
              <a
                href={lab.href}
                aria-current={lab.id === current ? 'page' : undefined}
              >
                <span>0{i + 1}</span>
                <div>
                  <strong>{lab.title}</strong>
                  <small>{lab.question}</small>
                  <em>{passport[lab.id as ChapterId].length}/4 retos</em>
                </div>
              </a>
            </li>
          ))}
        </ol>
        <a className="spum-series-home" href="/agujeros-negros/">
          Ver el atlas y mi bitácora ↗
        </a>
      </details>
      <div className="spum-series-steps">
        <a
          href={
            index > 0 ? blackHoleLabs[index - 1].href : '/agujeros-negros/'
          }
        >
          {index > 0
            ? `← Anterior: ${blackHoleLabs[index - 1].title}`
            : '← Inicio del especial'}
        </a>
        <a
          href={
            index < 4 ? blackHoleLabs[index + 1].href : '/agujeros-negros/'
          }
        >
          {index < 4
            ? `Siguiente: ${blackHoleLabs[index + 1].title} →`
            : 'Volver al mapa del especial →'}
        </a>
      </div>
    </nav>
  )
}
