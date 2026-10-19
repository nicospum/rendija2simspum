const LESSONS = [
  {
    title: 'Primero, un punto',
    text: 'Emití uno. ¿Podés deducir el patrón con un solo impacto?',
    number: '01',
  },
  {
    title: 'Dejá que se acumule',
    text: 'Muchos eventos revelan dónde es más probable detectar.',
    number: '02',
  },
  {
    title: 'Registrá el camino',
    text: 'Guardá la corrida y activá el detector. ¿Qué cambia?',
    number: '03',
  },
  {
    title: 'Probá una rendija',
    text: 'La difracción permanece. Explorá el ancho de la abertura.',
    number: '04',
  },
]

export default function LearningGuide({
  active,
  onExplore,
}: {
  active: number
  onExplore: (index: number) => void
}) {
  return (
    <section className="q-guide" aria-label="Recorrido para aprender">
      <div className="q-guide-heading">
        <span className="q-eyebrow">UN RECORRIDO, CUATRO PREGUNTAS</span>
        <span>Podés explorar en cualquier orden</span>
      </div>
      <div className="q-guide-grid">
        {LESSONS.map((lesson, index) => (
          <button
            key={lesson.number}
            className={active === index ? 'q-guide-active' : ''}
            aria-pressed={active === index}
            onClick={() => onExplore(index)}
          >
            <span>{lesson.number}</span>
            <div>
              <h2>{lesson.title}</h2>
              <p>{lesson.text}</p>
            </div>
            <b aria-hidden="true">↗</b>
          </button>
        ))}
      </div>
    </section>
  )
}
