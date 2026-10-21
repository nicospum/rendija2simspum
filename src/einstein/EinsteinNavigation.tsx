import './einstein.css'
import { einsteinLabs } from './catalog'
export default function EinsteinNavigation({
  current = 'reloj-de-luz',
}: {
  current?: string
}) {
  const index = einsteinLabs.findIndex((lab) => lab.id === current)
  return (
    <nav className="es-navigation" aria-label="Índice del especial Einstein">
      <a href="/einstein/">
        <span>ESPECIAL EINSTEIN</span> Espacio, tiempo y cuantos de luz{' '}
        <b>Ver el recorrido ↗</b>
      </a>
      {[...new Set(einsteinLabs.map((lab) => lab.field))].map((field) => (
        <div className="es-navigation-group" key={field}>
          <span>{field}</span>
          {einsteinLabs
            .filter((lab) => lab.field === field)
            .map((lab) => (
              <a
                key={lab.id}
                href={lab.href}
                aria-current={lab.id === current ? 'page' : undefined}
              >
                0{einsteinLabs.indexOf(lab) + 1} · {lab.title}
              </a>
            ))}
        </div>
      ))}
      <div className="es-navigation-steps">
        <a href={index > 0 ? einsteinLabs[index - 1].href : '/einstein/'}>
          {index > 0
            ? `← Anterior: ${einsteinLabs[index - 1].title}`
            : '← Mapa Einstein'}
        </a>
        <a
          href={
            index >= 0 && index < einsteinLabs.length - 1
              ? einsteinLabs[index + 1].href
              : '/einstein/'
          }
        >
          {index >= 0 && index < einsteinLabs.length - 1
            ? `Siguiente: ${einsteinLabs[index + 1].title} →`
            : 'Volver al mapa Einstein →'}
        </a>
      </div>
    </nav>
  )
}
