import ScienceArtifact from '../shared/ScienceArtifact'
import { CHAPTER_NOTES } from './chapterNotes'
import { blackHoleLabs } from './catalog'
import type { ChapterId } from './progress'
import './notebook.css'
export default function BlackHoleNotebook({
  current,
}: {
  current: ChapterId
}) {
  const note = CHAPTER_NOTES[current],
    index = blackHoleLabs.findIndex((l) => l.id === current),
    next = blackHoleLabs[index + 1]
  return (
    <section
      className="bh-notebook"
      aria-label="Bitácora de descubrimientos del capítulo"
    >
      <div className="bh-notebook-head">
        <div>
          <p className="bh-kicker">REGRESO A LA BITÁCORA / 0{index + 1}</p>
          <h2>
            Ahora podés
            <br />
            <em>reconocer las pistas.</em>
          </h2>
        </div>
        <span aria-hidden="true">✦</span>
      </div>
      <p className="bh-notebook-question">{note.question}</p>
      <div className="bh-object-grid">
        {note.objects.map((o) => (
          <article key={o.name}>
            <ScienceArtifact kind={o.kind} />
            <h3>{o.name}</h3>
            <p>{o.text}</p>
          </article>
        ))}
      </div>
      <div className="bh-history">
        {[note.idea, note.evidence].map((item) => (
          <article key={item.title}>
            <p className="bh-kicker">{item.date}</p>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <a href={item.source} target="_blank" rel="noreferrer">
              Leer la fuente ↗
            </a>
          </article>
        ))}
      </div>
      <div className="bh-next-stop">
        <p className="bh-kicker">
          {next
            ? 'LA PRÓXIMA PREGUNTA'
            : 'LA EXPEDICIÓN NO SE TERMINA CON UNA FÓRMULA'}
        </p>
        <h3>
          {next ? next.question : '¿Qué pistas conectaste en el camino?'}
        </h3>
        <a href={next?.href ?? '/agujeros-negros/'}>
          {next
            ? `Seguir con ${next.title} →`
            : 'Volver al atlas y mi bitácora →'}
        </a>
      </div>
    </section>
  )
}
