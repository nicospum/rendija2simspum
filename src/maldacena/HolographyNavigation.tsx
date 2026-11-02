import { useContext } from 'react'
import { HolographyContext } from './HolographyContext'
import { holographySections } from './catalog'
import './holography.css'

export default function HolographyNavigation({ compact = false }: { compact?: boolean }) {
  const experience = useContext(HolographyContext)
  if (!experience) return null
  return (
    <nav
      className="md-holography-tabs"
      aria-label={compact ? 'Secciones junto a la escena' : 'Secciones de Holografía'}
    >
      {!compact && <p>UN LABORATORIO · TRES FORMAS DE EXPLORAR · 12 RETOS</p>}
      <div>
        {holographySections.map((section, index) => (
          <a
            key={section.slug}
            href={`/holografia/?seccion=${section.slug}`}
            aria-current={experience.section === section.slug ? 'page' : undefined}
            onClick={(event) => {
              if (
                (event.button != null && event.button !== 0) ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return
              event.preventDefault()
              experience.navigate(section.slug, compact)
            }}
          >
            {index + 1}. {section.label}
          </a>
        ))}
      </div>
      {!compact && (
        <small>
          Cambiar de sección prepara otro ensayo. Tus descubrimientos guardados se
          conservan.
        </small>
      )}
    </nav>
  )
}
