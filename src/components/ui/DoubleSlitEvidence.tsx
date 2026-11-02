import {
  LESSONS,
  describeLesson,
  type LessonId,
  type Reading,
} from '../../education/doubleSlitLearning'
import DistributionChart from './DistributionChart'

export interface ActiveLesson {
  id: LessonId
  baseline: Reading
}

const value = (number: number) => number.toFixed(3).replace('.', ',')

export function DoubleSlitReadingComparison({
  before,
  current,
  lesson,
}: {
  before: Reading
  current: Reading
  lesson: LessonId
}) {
  return (
    <div className="q-reading-comparison" aria-label="Referencia y corrida actual">
      {[before, current].map((reading, index) => (
        <div key={index}>
          <span className="q-eyebrow">{index === 0 ? 'REFERENCIA' : 'AHORA'}</span>
          <strong>{reading.detected.toLocaleString('es-AR')}</strong>
          <small>impactos simulados</small>
          <p>
            Camino marcado: <b>{Math.round(reading.config.detectorStrength * 100)} %</b>
          </p>
          {lesson === 'single' ? (
            <p>
              Ancho central del modelo: <b>{value(reading.centralLobeWidth)} u</b>
            </p>
          ) : (
            <p>
              Δz del modelo:{' '}
              <b>
                {reading.fringeSpacing === null
                  ? 'sin franjas entre caminos'
                  : `${value(reading.fringeSpacing)} u`}
              </b>
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

export function DoubleSlitControlComparison({
  active,
  current,
  paused,
  onGather,
}: {
  active: ActiveLesson
  current: Reading
  paused: boolean
  onGather: () => void
}) {
  const feedback = describeLesson(active.id, active.baseline, current, paused)
  return (
    <div className="q-control-comparison" role="group" aria-label="Comparación junto al control">
      <DoubleSlitReadingComparison before={active.baseline} current={current} lesson={active.id} />
      <DistributionChart
        compact
        guided
        comparisonOverride={active.id === 'accumulation' ? null : active.baseline}
      />
      <p className="q-control-result">{feedback.heading}</p>
      <button className="q-button" disabled={paused} onClick={onGather}>
        Sumar 1600 impactos
      </button>
      {paused && <p>Reanudá el experimento para registrar detecciones nuevas.</p>}
      <div className="q-control-comparison-links">
        <a className="q-control-link" href="#slit-evidence-title">
          Ver la explicación completa {active.id === 'accumulation' ? '↓' : '↑'}
        </a>
        <a className="q-control-link" href="#laboratorio">
          Volver al visor ↑
        </a>
      </div>
    </div>
  )
}

export default function DoubleSlitEvidence({
  active,
  current,
  paused,
  onTry,
  onGather,
  onRestart,
  onExit,
}: {
  active: ActiveLesson | null
  current: Reading
  paused: boolean
  onTry: () => void
  onGather: () => void
  onRestart: () => void
  onExit: () => void
}) {
  if (!active)
    return (
      <p className="q-free-exploration">
        Elegí una pregunta de arriba para comparar una variable con una referencia. También podés
        explorar libremente y guardar tus propias corridas.
      </p>
    )
  const lesson = LESSONS.find((item) => item.id === active.id)!
  const feedback = describeLesson(active.id, active.baseline, current, paused)
  return (
    <section
      className={`q-evidence q-evidence--${feedback.status}`}
      aria-labelledby="slit-evidence-title"
    >
      <div className="q-evidence-heading">
        <span className="q-eyebrow">DEL CONTROL A LA EXPLICACIÓN</span>
        <button onClick={onExit}>Explorar libremente ×</button>
      </div>
      <h2 id="slit-evidence-title">{lesson.question}</h2>
      <p className="q-prediction">Antes de probar, hacé una predicción. {lesson.instruction}</p>
      <div className="q-lesson-feedback" role="status">
        <strong>{feedback.heading}</strong>
        <p>{feedback.text}</p>
      </div>
      <DoubleSlitReadingComparison before={active.baseline} current={current} lesson={active.id} />
      <div className="q-evidence-actions">
        <button className="q-button q-lesson-primary" disabled={paused} onClick={onTry}>
          {active.id === 'accumulation'
            ? current.detected < 1600
              ? 'Acumular hasta 1600 impactos ↗'
              : 'Acumular 1600 más ↗'
            : 'Probar este cambio ↗'}
        </button>
        <a href={`#${lesson.controlId}`}>
          {active.id === 'accumulation' ? 'Emitir paso a paso →' : 'Mover el control →'}
        </a>
        {active.id !== 'accumulation' && (
          <button disabled={paused} onClick={onGather}>
            Sumar 1600 impactos
          </button>
        )}
        <button onClick={onRestart}>Reiniciar este reto</button>
      </div>
      <p className="q-lesson-scope">
        Los atajos muestrean detecciones nuevas; no cargan un patrón dibujado. Las cifras de Δz y
        ancho son predicciones. Contrastalas con las frecuencias del gráfico de abajo; una muestra
        finita siempre fluctúa.
      </p>
      <a className="q-chart-jump" href="#chart-title">
        Comparar las distribuciones ↓
      </a>
    </section>
  )
}
