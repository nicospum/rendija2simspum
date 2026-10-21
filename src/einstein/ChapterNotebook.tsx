import { CHAPTER_NOTES } from './chapterNotes'
import type { ChapterId } from './progress'
import Artifact from './Artifact'
export default function ChapterNotebook({
  current,
}: {
  current: ChapterId
}) {
  const note = CHAPTER_NOTES[current]
  return (
    <section
      className="en-notebook"
      aria-label="Cuaderno de descubrimientos del capítulo"
    >
      <div className="en-notebook-heading">
        <div>
          <p className="en-kicker">LAS PIEZAS QUE AHORA PODÉS RECONOCER</p>
          <h2>Lo que acabás de mirar.</h2>
        </div>
        <img
          src="/einstein/einstein-avatar-v1.webp"
          width="160"
          height="160"
          alt="Einstein ilustrado, pensando con un lápiz"
          loading="lazy"
          decoding="async"
        />
      </div>
      <p className="en-question">{note.question}</p>
      <div className="en-object-grid">
        {note.objects.map((object) => (
          <article key={object.name}>
            <Artifact kind={object.kind} />
            <h3>{object.name}</h3>
            <p>{object.text}</p>
          </article>
        ))}
      </div>
      <div className="en-history">
        {[note.idea, note.evidence].map((item) => (
          <article key={item.title}>
            <span>{item.date}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <a href={item.url} target="_blank" rel="noreferrer">
              Leer la fuente ↗
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
