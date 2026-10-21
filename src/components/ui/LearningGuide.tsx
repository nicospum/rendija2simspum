import { LESSONS, type LessonId } from '../../education/doubleSlitLearning'

export default function LearningGuide({
  active,
  onExplore,
}: {
  active: LessonId | null
  onExplore: (id: LessonId) => void
}) {
  return (
    <section className="q-guide" id="q-retos" aria-label="Recorrido para aprender">
      <div className="q-guide-heading">
        <span className="q-eyebrow">PREDECÍ · CAMBIÁ · COMPARÁ</span>
        <span>Cuatro preguntas. Una variable a la vez.</span>
      </div>
      <p className="q-guide-intro">
        Cada reto prepara una referencia con impactos simulados al azar. Podés repetirlo: los puntos
        cambian, la probabilidad del montaje permanece.
      </p>
      <div className="q-guide-grid">
        {LESSONS.map((lesson) => (
          <button
            key={lesson.number}
            className={active === lesson.id ? 'q-guide-active' : ''}
            aria-pressed={active === lesson.id}
            onClick={() => onExplore(lesson.id)}
          >
            <span>{lesson.number}</span>
            <div>
              <h2>{lesson.title}</h2>
              <p>{lesson.question}</p>
            </div>
            <b aria-hidden="true">↗</b>
          </button>
        ))}
      </div>
    </section>
  )
}
