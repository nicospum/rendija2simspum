import { LESSONS, describeLesson, type LessonId, type Reading } from '../../education/prismLearning'
import './PrismLearning.css'

export interface ActiveLesson {
  id: LessonId
  baseline: Reading
}

export function PrismLearningGuide({
  active,
  onSelect,
}: {
  active: LessonId | null
  onSelect: (id: LessonId) => void
}) {
  return (
    <section className="prism-learning-guide" id="prism-retos" aria-labelledby="prism-learning-title">
      <div className="prism-learning-heading">
        <div>
          <span className="eyebrow">UNA PREGUNTA ANTES DE MOVER UN CONTROL</span>
          <h2 id="prism-learning-title">¿Qué cambiaría si…?</h2>
        </div>
        <p>
          Cada reto prepara una referencia.
          <br />
          Después, cambiá una sola variable.
        </p>
      </div>
      <div className="prism-learning-grid">
        {LESSONS.map((lesson) => (
          <button
            key={lesson.id}
            aria-pressed={active === lesson.id}
            onClick={() => onSelect(lesson.id)}
          >
            <span>{lesson.number}</span>
            <div>
              <h3>{lesson.title}</h3>
              <p>{lesson.question}</p>
            </div>
            <b aria-hidden="true">↗</b>
          </button>
        ))}
      </div>
    </section>
  )
}

function ReadingComparison({ before, current }: { before: Reading; current: Reading }) {
  const spans = [before, current].map((reading) => {
    const positions = reading.centralSpectrum.map((sample) => sample.z)
    return positions.length ? Math.max(...positions) - Math.min(...positions) : 0
  })
  const extent = Math.max(...spans, 0.02) * 0.65
  return (
    <div className="prism-comparison">
      <div className="prism-comparison-heading">
        <span>REFERENCIA Y LECTURA ACTUAL</span>
        <span>Una misma escala</span>
      </div>
      <div className="prism-spectrum-comparison">
        {[before, current].map((reading, index) => {
          const points = reading.centralSpectrum
          const center = points.length
            ? (Math.min(...points.map((point) => point.z)) +
                Math.max(...points.map((point) => point.z))) /
              2
            : 0
          const hasWhite =
            !points.length && reading.whiteHits > 0 && reading.lightEnabled && reading.intensity > 0
          return (
            <div className="prism-spectrum-row" key={index}>
              <span>{index === 0 ? 'Referencia' : 'Ahora'}</span>
              <div className="prism-spectrum-band">
                <svg
                  viewBox="0 0 440 30"
                  role="img"
                  aria-label={`${index === 0 ? 'Referencia' : 'Actual'}: ${points.length ? 'posiciones del espectro, a escala común de separación' : hasWhite ? 'luz blanca sin separar' : 'sin señal visible'}`}
                >
                  <rect width="440" height="30" rx="4" fill="#18292b" />
                  <line x1="220" y1="3" x2="220" y2="27" stroke="#8b9c8a" strokeDasharray="2 3" />
                  {points.map((point) => (
                    <rect
                      key={point.wavelength}
                      x={220 - ((point.z - center) / extent) * 208 - 2}
                      y="5"
                      width="4"
                      height="20"
                      rx="1"
                      fill={point.color}
                    />
                  ))}
                  {hasWhite && <rect x="217" y="5" width="6" height="20" rx="1" fill="#fff7df" />}
                </svg>
                {!points.length && !hasWhite && (
                  <span className="prism-no-signal">Sin señal visible</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <p className="prism-comparison-caption">
        Esquema de posiciones centrado: compara separación, no brillo.
      </p>
      <div className="prism-comparison-metrics">
        {[before, current].map((reading, index) => (
          <div key={index}>
            <span>{index === 0 ? 'REFERENCIA' : 'AHORA'}</span>
            <strong>
              {reading.lightEnabled &&
              reading.intensity > 0 &&
              reading.hasFullSpectrum &&
              reading.spread !== null
                ? `${reading.spread.toFixed(3)} u`
                : '—'}
            </strong>
            <small>Δz entre violeta y rojo</small>
            <p>
              Desviación:{' '}
              {reading.lightEnabled && reading.intensity > 0 && reading.deviation !== null
                ? `${reading.deviation.toFixed(2)}°`
                : '—'}
            </p>
            <p>
              Brillo de fuente: {reading.lightEnabled ? Math.round(reading.intensity * 100) : 0} %
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PrismEvidence({
  active,
  current,
  frozen,
  onTry,
  onRestart,
  onExit,
}: {
  active: ActiveLesson | null
  current: Reading
  frozen: boolean
  onTry: () => void
  onRestart: () => void
  onExit: () => void
}) {
  if (!active)
    return (
      <p className="prism-free-exploration">
        Elegí una pregunta de arriba para comparar una variable con una referencia. También podés
        explorar libremente: el prisma y las mediciones responden a tus controles.
      </p>
    )
  const lesson = LESSONS.find((item) => item.id === active.id)!
  const feedback = describeLesson(active.id, active.baseline, current, frozen)
  // An extinguished source has no observed spectrum even though its geometric rays still exist.
  const observed =
    current.lightEnabled && current.intensity > 0 ? current : { ...current, centralSpectrum: [] }
  return (
    <section
      className={`prism-evidence prism-evidence--${feedback.status}`}
      aria-labelledby="prism-evidence-title"
    >
      <div className="prism-evidence-title">
        <span className="eyebrow">DEL CONTROL A LA EXPLICACIÓN</span>
        <button onClick={onExit}>Explorar libremente ×</button>
      </div>
      <h2 id="prism-evidence-title">{lesson.question}</h2>
      <p className="prism-prediction">
        Antes de probarlo, hacé una predicción. {lesson.instruction}
      </p>
      <div className="prism-feedback" role="status">
        <strong>{feedback.heading}</strong>
        <p>{feedback.text}</p>
      </div>
      <ReadingComparison before={active.baseline} current={observed} />
      <div className="prism-evidence-actions">
        <button className="button" onClick={onTry}>
          Probar este cambio ↗
        </button>
        <a className="learning-jump" href={`#${lesson.controlId}`}>
          Mover el control →
        </a>
        <button onClick={onRestart}>Reiniciar este reto</button>
      </div>
      <p className="prism-evidence-note">
        Este resultado muestra lo que predice el modelo. Las pruebas históricas de Newton también
        incluyeron selección de colores y recomposición de luz blanca.
      </p>
    </section>
  )
}
