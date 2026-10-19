import { lazy, Suspense, useEffect, useState } from 'react'
import { useLabStore } from './store/store'
import { fringeSpacing } from './physics/interference'
import LabControls from './components/ui/LabControls'
import DistributionChart from './components/ui/DistributionChart'
import LearningGuide from './components/ui/LearningGuide'
import DoubleSlitEvidence, { type ActiveLesson } from './components/ui/DoubleSlitEvidence'
import DoubleSlitDiscovery from './components/ui/DoubleSlitDiscovery'
import {
  LESSONS,
  lessonConfig,
  proposedConfig,
  makeReading,
  type LessonId,
} from './education/doubleSlitLearning'
import './App.css'
import './components/ui/DoubleSlitLearning.css'

const SceneViewport = lazy(() => import('./components/simulation/SceneViewport'))

function useAutoEmission() {
  const running = useLabStore((s) => s.isAutoMode && !s.isPaused)
  const rate = useLabStore((s) => s.emissionRate)
  useEffect(() => {
    if (!running) return
    let previous = performance.now(),
      remainder = 0
    const timer = window.setInterval(() => {
      const now = performance.now()
      // A background tab never accumulates a backlog of invisible emissions.
      if (document.hidden) {
        previous = now
        remainder = 0
        return
      }
      remainder += Math.min((now - previous) / 1000, 0.2) * rate
      previous = now
      const count = Math.floor(remainder)
      remainder -= count
      if (count) useLabStore.getState().emit(count)
    }, 100)
    return () => window.clearInterval(timer)
  }, [running, rate])
}

export default function App() {
  useAutoEmission()
  const config = useLabStore((s) => s.config)
  const detected = useLabStore((s) => s.detected)
  const histogram = useLabStore((s) => s.histogram)
  const isPaused = useLabStore((s) => s.isPaused)
  const isAutoMode = useLabStore((s) => s.isAutoMode)
  const burstSize = useLabStore((s) => s.burstSize)
  const showWaves = useLabStore((s) => s.showWaves)
  const view = useLabStore((s) => s.view)
  const [lesson, setLesson] = useState<ActiveLesson | null>(null)
  const spacing = fringeSpacing(config)
  const detectorOn = config.detectorStrength > 0
  const reading = makeReading(config, histogram, detected)
  const activeControl = LESSONS.find((item) => item.id === lesson?.id)?.controlId

  function explore(id: LessonId) {
    const state = useLabStore.getState()
    state.resetAll()
    state.setConfig(lessonConfig(id))
    state.emit(id === 'accumulation' ? 1 : 1600)
    if (id !== 'accumulation') state.saveComparison()
    const prepared = useLabStore.getState()
    setLesson({ id, baseline: makeReading(prepared.config, prepared.histogram, prepared.detected) })
  }

  function tryLesson() {
    if (!lesson) return
    const state = useLabStore.getState()
    if (state.isPaused) return
    if (lesson.id === 'accumulation') {
      state.emit(state.detected < 1600 ? 1600 - state.detected : 1600)
    } else {
      const suggested = proposedConfig(lesson.id)
      if (lesson.id === 'separation') state.setConfig({ slitSeparation: suggested.slitSeparation })
      if (lesson.id === 'detector')
        state.setConfig({ detectorStrength: suggested.detectorStrength })
      if (lesson.id === 'single') state.setConfig({ slitWidth: suggested.slitWidth })
      state.emit(1600)
    }
  }

  return (
    <div className="q-shell">
      <a className="q-skip" href="#laboratorio">
        Ir al experimento
      </a>
      <header className="q-header">
        <a className="q-brand" href="/" aria-label="SPUM experimentos, inicio">
          <span className="q-brand-mark">∿</span>
          <span>
            SPUM<small>EXPERIMENTOS</small>
          </span>
        </a>
        <nav aria-label="Navegación principal">
          <a href="/">← Todos los experimentos</a>
          <a href="/prisma/">Prisma de Newton ↗</a>
        </nav>
      </header>
      <main>
        <section className="q-intro">
          <div>
            <p className="q-eyebrow">
              <span /> CUÁNTICA · EXPERIMENTO 01
            </p>
            <h1>
              Un punto es azar.
              <br />
              Muchos, <em>un patrón.</em>
            </h1>
            <p className="q-intro-description">
              Emití una partícula a la vez. Descubrí por qué dos rendijas cambiaron nuestra forma de
              entender la naturaleza.
            </p>
            <a className="q-history-jump" href="#discovery-title">
              Por qué este experimento cambió la física ↓
            </a>
          </div>
          <aside className="q-intro-note">
            <span>LA DOBLE RENDIJA</span>
            <p>
              La pregunta no es solo dónde llega.
              <br />
              Es qué podemos saber del camino.
            </p>
            <div className="q-mini-fringes" aria-hidden="true" />
          </aside>
        </section>
        <LearningGuide active={lesson?.id ?? null} onExplore={explore} />
        <section
          className="q-lab-layout"
          id="laboratorio"
          aria-label="Laboratorio de doble rendija"
        >
          <div className="q-experiment-column">
            <div className="q-scene-card">
              <div className="q-scene-toolbar">
                <span className="q-live">
                  <i /> {isPaused ? 'LECTURA EN PAUSA' : 'LABORATORIO EN VIVO'}
                </span>
                <div className="q-view-tabs" aria-label="Vista de cámara">
                  <button
                    aria-pressed={view === 'perspective'}
                    onClick={() => useLabStore.getState().setView('perspective')}
                  >
                    Perspectiva 3D
                  </button>
                  <button
                    aria-pressed={view === 'top'}
                    onClick={() => useLabStore.getState().setView('top')}
                  >
                    Vista superior
                  </button>
                </div>
              </div>
              <Suspense
                fallback={
                  <div className="q-scene-loading" role="status">
                    Preparando el banco de doble rendija…
                  </div>
                }
              >
                <SceneViewport />
              </Suspense>
              <div className="q-scene-bottom">
                <span>Arrastrá para orbitar · scroll para acercar</span>
                <div>
                  <button
                    aria-pressed={showWaves}
                    onClick={() => useLabStore.getState().setShowWaves(!showWaves)}
                  >
                    Campo ilustrativo
                  </button>
                  <button
                    onClick={() => useLabStore.getState().resetCamera()}
                    aria-label="Restablecer cámara"
                  >
                    Encuadrar ↗
                  </button>
                </div>
              </div>
              <p className="q-scene-caption">
                Los puntos son detecciones. El campo representa fases de forma esquemática; no
                muestra la trayectoria de cada partícula.
              </p>
            </div>
            {lesson?.id === 'accumulation' && (
              <span className="q-control-focus-label">
                CONTROL DE ESTE RETO · EMITÍ SIN CAMBIAR EL MONTAJE
              </span>
            )}
            <div
              className={`q-emission-bar ${lesson?.id === 'accumulation' ? 'q-emission-active' : ''}`}
              id="emission-controls"
            >
              <button
                className="q-button q-primary"
                disabled={isPaused}
                onClick={() => useLabStore.getState().emit(burstSize)}
              >
                Emitir {burstSize === 1 ? 'una partícula' : `${burstSize} partículas`}{' '}
                <span>↗</span>
              </button>
              <button
                className="q-button"
                aria-pressed={isAutoMode}
                onClick={() => useLabStore.getState().toggleAuto()}
              >
                {isAutoMode ? 'Detener emisión' : 'Emisión continua'}
              </button>
              <button
                className="q-icon-button"
                onClick={() => useLabStore.getState().togglePause()}
                aria-label={isPaused ? 'Reanudar experimento' : 'Pausar experimento'}
              >
                {isPaused ? '▶' : 'Ⅱ'}
              </button>
            </div>
            {lesson?.id === 'accumulation' && (
              <a className="q-control-link" href="#slit-evidence-title">
                Ver la comparación ↓
              </a>
            )}
            <div className="q-metrics" aria-label="Lecturas del experimento">
              <div>
                <span>DETECCIONES</span>
                <strong>{detected.toLocaleString('es-AR')}</strong>
                <small>en esta corrida</small>
              </div>
              <div>
                <span>SEPARACIÓN DE FRANJAS</span>
                <strong>
                  {config.slitCount > 1 && config.detectorStrength < 1
                    ? `${spacing.toFixed(2)} u`
                    : '—'}
                </strong>
                <small>
                  {config.slitCount === 1
                    ? 'difracción de una abertura'
                    : config.detectorStrength === 1
                      ? 'sin términos de interferencia'
                      : 'Δz ≈ λL / d'}
                </small>
              </div>
              <div>
                <span>INFORMACIÓN DE CAMINO</span>
                <strong>{Math.round(config.detectorStrength * 100)} %</strong>
                <small>
                  {detectorOn ? 'fracción marcada por el detector' : 'caminos indistinguibles'}
                </small>
              </div>
            </div>
            <DoubleSlitEvidence
              active={lesson}
              current={reading}
              paused={isPaused}
              onTry={tryLesson}
              onGather={() => useLabStore.getState().emit(1600)}
              onRestart={() => {
                if (lesson) explore(lesson.id)
              }}
              onExit={() => setLesson(null)}
            />
            <DistributionChart
              comparisonOverride={
                lesson ? (lesson.id === 'accumulation' ? null : lesson.baseline) : undefined
              }
              guided={!!lesson}
            />
            <p className="q-run-note" role="status">
              {detected === 0
                ? 'La pantalla está lista. Emití una partícula para registrar el primer impacto.'
                : detected < 100
                  ? 'Cada impacto es localizado. Seguí emitiendo: hacen falta muchos para distinguir la distribución.'
                  : config.slitCount === 1
                    ? 'Con una rendija permanece la difracción. Registrar el camino no cambia este patrón ideal.'
                    : detectorOn
                      ? 'El detector reduce la interferencia entre caminos. La difracción de cada rendija permanece.'
                      : 'La acumulación revela máximos y mínimos: se suman amplitudes antes de calcular probabilidades.'}
            </p>
          </div>
          <LabControls
            activeControl={activeControl}
            onReset={() => {
              setLesson(null)
              useLabStore.getState().resetAll()
            }}
          />
        </section>
        <DoubleSlitDiscovery />
        <details className="q-model">
          <summary>
            Cómo funciona el modelo y qué representan las unidades <span>+</span>
          </summary>
          <div>
            <p>
              Se calcula un patrón analítico de Fraunhofer para rendijas rectangulares con
              iluminación coherente y uniforme. Una distribución normalizada sobre la pantalla
              visible determina las posiciones aleatorias de cada detección. La altura de los puntos
              es decorativa.
            </p>
            <p>
              Las longitudes se expresan en unidades normalizadas (u); la escena es un esquema y no
              un montaje calibrado en metros. El campo de fase no resuelve la evolución de
              Schrödinger. La separación de franjas indicada usa la aproximación paraxial.
            </p>
            <p>
              El detector marca una fracción ideal de los eventos: al 100 % los caminos quedan
              distinguidos. Electrones, fotones y neutrones comparten el mismo patrón ideal si
              tienen la misma longitud de onda; sus condiciones experimentales reales son
              diferentes. Se muestran detecciones condicionadas a llegar a la pantalla, no la
              eficiencia de una fuente real.
            </p>
            <p>
              Para profundizar:{' '}
              <a
                href="https://www.feynmanlectures.caltech.edu/III_01.html"
                target="_blank"
                rel="noreferrer"
              >
                Feynman · comportamiento cuántico ↗
              </a>{' '}
              ·{' '}
              <a
                href="https://www.feynmanlectures.caltech.edu/III_03.html"
                target="_blank"
                rel="noreferrer"
              >
                Cómo se combinan amplitudes ↗
              </a>{' '}
              ·{' '}
              <a href="https://doi.org/10.1119/1.16104" target="_blank" rel="noreferrer">
                Tonomura y colaboradores · electrones individuales ↗
              </a>
            </p>
          </div>
        </details>
      </main>
      <footer className="q-footer">
        <a href="/">SPUM / Una colección para aprender experimentando</a>
        <span>
          Explorá también <a href="/prisma/">el prisma de Newton ↗</a>
        </span>
      </footer>
    </div>
  )
}
