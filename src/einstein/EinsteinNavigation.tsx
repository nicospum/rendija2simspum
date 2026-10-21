import './einstein.css'
import { einsteinLabs } from './catalog'
import { usePassport } from './usePassport'
import type { ChapterId } from './progress'
import ChapterNotebook from './ChapterNotebook'
export default function EinsteinNavigation({
  current = 'reloj-de-luz',
  footer = false,
}: {
  current?: string
  footer?: boolean
}) {
  const index = einsteinLabs.findIndex((lab) => lab.id === current),
    passport = usePassport()
  if (index < 0) return null
  return (
    <>
      {footer && <ChapterNotebook current={current as ChapterId} />}
      <nav
        className="es-navigation"
        aria-label="Índice del especial Einstein"
      >
        <div className="en-nav-brand">
          <a href="/einstein/">
            <img
              src="/einstein/einstein-avatar-v1.webp"
              width="48"
              height="48"
              alt=""
            />
            <span>
              ESPECIAL EINSTEIN
              <strong>El cuaderno de las grandes preguntas</strong>
            </span>
          </a>
          <span>0{index + 1} / 07</span>
        </div>
        <details>
          <summary>
            <span>Ver los siete capítulos</span>
            <strong>{einsteinLabs[index].title}</strong>
            <b aria-hidden="true">+</b>
          </summary>
          <div className="en-chapter-index">
            {[...new Set(einsteinLabs.map((lab) => lab.field))].map(
              (field) => (
                <div className="es-navigation-group" key={field}>
                  <span>{field}</span>
                  {einsteinLabs
                    .filter((lab) => lab.field === field)
                    .map((lab) => (
                      <a
                        key={lab.id}
                        href={lab.href}
                        aria-current={
                          lab.id === current ? 'page' : undefined
                        }
                      >
                        <span>0{einsteinLabs.indexOf(lab) + 1}</span>
                        <strong>{lab.title}</strong>
                        <small>
                          {passport[lab.id as ChapterId].length}/4
                        </small>
                      </a>
                    ))}
                </div>
              ),
            )}
          </div>
          <a className="en-nav-home" href="/einstein/">
            Ver el recorrido y mi pasaporte ↗
          </a>
        </details>
        <div className="es-navigation-steps">
          <a href={index > 0 ? einsteinLabs[index - 1].href : '/einstein/'}>
            {index > 0
              ? `← Anterior: ${einsteinLabs[index - 1].title}`
              : '← Mapa Einstein'}
          </a>
          <a
            href={
              index < einsteinLabs.length - 1
                ? einsteinLabs[index + 1].href
                : '/einstein/'
            }
          >
            {index < einsteinLabs.length - 1
              ? `Siguiente: ${einsteinLabs[index + 1].title} →`
              : 'Volver al mapa Einstein →'}
          </a>
        </div>
      </nav>
    </>
  )
}
