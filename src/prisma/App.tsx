import { lazy, Suspense, useMemo, useState } from 'react'
import './App.css'
import { traceExperiment, refractiveIndex, type ExperimentResult } from './physics/optics'
import { useStore, MATERIAL_LABELS } from './store/store'
import ControlPanel from './components/ui/ControlPanel'
import SceneBoundary from './components/ui/SceneBoundary'
import HelpDialog from './components/ui/HelpDialog'
import Icon from './components/ui/Icon'
import NewtonDiscovery from './components/ui/NewtonDiscovery'
import { LabMission, LabNavigation, MoreLabs } from '../components/ui/LabJourney'
import { PrismLearningGuide, PrismEvidence, type ActiveLesson } from './components/ui/PrismLearning'
import { LESSONS, makeReading, describeLesson, type LessonId } from './education/prismLearning'

const SceneViewport = lazy(() => import('./components/simulation/SceneViewport'))
type HoverTarget = 'lamp' | 'prism' | 'screen' | 'beam' | null
const number = (value: number | null, suffix = '°') =>
  value === null ? '—' : `${value.toFixed(2)}${suffix}`

function SpectrumReadout({
  experiment,
  visible,
}: {
  experiment: ExperimentResult
  visible: boolean
}) {
  const rays = experiment.rays.filter((r) => r.offset === 0 && r.status === 'screen' && r.screenHit)
  const positions = rays.map((r) => r.screenHit!.z)
  const min = Math.min(...positions),
    max = Math.max(...positions)
  const span = Math.max(1e-8, max - min)
  const ordered = [...rays].sort((a, b) => b.screenHit!.z - a.screenHit!.z)
  const whiteHit = experiment.rays.some((r) => r.status === 'missed' && r.screenHit)
  return (
    <div className="spectrum-readout">
      <div className="readout-heading">
        <span className="eyebrow">LECTURA DE PANTALLA</span>
        <span className="mono">
          {visible && rays.length
            ? `${rays.length} muestras · Δz ${number(experiment.metrics.spectralSpread, ' u')}`
            : visible && whiteHit
              ? 'Luz blanca · sin dispersión'
              : 'Sin señal'}
        </span>
      </div>
      <svg
        viewBox="0 0 640 54"
        role="img"
        aria-label={
          visible && rays.length
            ? 'Posiciones calculadas de las longitudes de onda en la pantalla. Escala ajustada al espectro.'
            : visible && whiteHit
              ? 'Luz blanca sin dispersión en la pantalla.'
              : 'Pantalla sin luz detectada'
        }
      >
        <rect x="0" y="6" width="640" height="28" rx="3" fill="#17262a" />
        {Array.from({ length: 33 }, (_, i) => (
          <path
            key={i}
            d={`M${i * 20} 38v${i % 4 === 0 ? 7 : 3}`}
            stroke="#637273"
            strokeWidth="0.7"
          />
        ))}
        {visible &&
          rays.map((r) => (
            <rect
              key={r.wavelength}
              x={36 + ((max - r.screenHit!.z) / span) * 568}
              y="9"
              width="5"
              height="22"
              rx="1"
              fill={r.color}
              opacity="0.85"
            />
          ))}
        {visible && !rays.length && whiteHit && (
          <rect x="317" y="9" width="6" height="22" rx="1" fill="#fff7df" />
        )}
      </svg>
      <div className="spectrum-axis">
        <span>{visible && ordered.length ? `${ordered[0].wavelength} nm` : '—'}</span>
        <span>Posición relativa · escala ajustada</span>
        <span>
          {visible && ordered.length ? `${ordered[ordered.length - 1].wavelength} nm` : '—'}
        </span>
      </div>
      <p className="readout-scale-note">
        Esta banda ajusta su escala automáticamente. Para comparar separación, usá Δz o la
        referencia del reto.
      </p>
    </div>
  )
}

function App() {
  const state = useStore()
  const config = state.pausedConfig ?? state.config
  const experiment = useMemo(() => traceExperiment(config), [config])
  const [hover, setHover] = useState<HoverTarget>(null)
  // Click/focus pins the explanation; leaving an object only clears transient hover.
  const [selectedTarget, setSelectedTarget] = useState<HoverTarget>(null)
  const informationTarget = selectedTarget ?? hover
  const closeInformation = () => {
    setHover(null)
    setSelectedTarget(null)
  }
  const [help, setHelp] = useState<'guide' | 'theory' | null>(null)
  const illuminated = state.lightEnabled && state.lightIntensity > 0
  const { metrics } = experiment
  const whiteHits = experiment.rays.filter((r) => r.status === 'missed' && r.screenHit).length
  const outsideHits = experiment.rays.filter(
    (r) => r.screenHit && Math.abs(r.screenHit.z) > 12,
  ).length
  const material = MATERIAL_LABELS[config.material]
  const reading = useMemo(
    () => makeReading(config, experiment, state.lightIntensity, state.lightEnabled),
    [config, experiment, state.lightIntensity, state.lightEnabled],
  )
  const [lesson, setLesson] = useState<ActiveLesson | null>(null)
  const [touchCamera, setTouchCamera] = useState(false)
  const activeLesson = LESSONS.find((item) => item.id === lesson?.id)
  const lessonIndex = LESSONS.findIndex((item) => item.id === lesson?.id)
  const feedback = lesson
    ? describeLesson(lesson.id, lesson.baseline, reading, !!state.pausedConfig)
    : null
  const startLesson = (id: LessonId) => {
    const actions = useStore.getState()
    actions.reset()
    if (id === 'split') actions.setParameter('lightAngle', 16)
    if (id === 'brightness') actions.setIntensity(0.35)
    const initial = useStore.getState()
    setLesson({
      id,
      baseline: makeReading(
        initial.config,
        traceExperiment(initial.config),
        initial.lightIntensity,
        initial.lightEnabled,
      ),
    })
    closeInformation()
  }
  const tryChange = () => {
    if (!lesson) return
    if (lesson.id === 'split') state.setParameter('lightAngle', 0)
    if (lesson.id === 'brightness') state.setIntensity(0.9)
    if (lesson.id === 'distance') state.setParameter('screenDistance', 4.2)
    if (lesson.id === 'material') state.setMaterial('quartz')
  }
  const tooltip = {
    lamp: {
      title: 'La luz antes del prisma',
      text: `La luz blanca se representa con 33 muestras entre 380 y 700 nm. Dirección: ${config.lightAngle}°. Mover la fuente cambia por dónde llega el haz; la intensidad cambia el brillo, sin modificar la refracción.`,
    },
    prism: {
      title: 'Un material, distintas desviaciones',
      text: `${material}: n(380 nm) = ${refractiveIndex(380, config.material).toFixed(4)} y n(700 nm) = ${refractiveIndex(700, config.material).toFixed(4)}. ${metrics.totalInternalReflections > 0 ? 'Hay rayos con reflexión interna total.' : `Incidencia del rayo de 550 nm: ${number(metrics.incidenceAngle)}.`}`,
    },
    screen: {
      title: 'El espectro es una medición',
      text: illuminated
        ? `${metrics.screenHits} rayos refractados y ${whiteHits} sin atravesar el prisma alcanzan el plano de pantalla. Separación entre 380 y 700 nm: ${number(metrics.spectralSpread, ' u')}.${outsideHits ? ` ${outsideHits} impactos quedan fuera del banco visible.` : ''}`
        : 'La fuente no emite luz. Encendela y aumentá la intensidad para observar el espectro.',
    },
    beam: {
      title: 'Refracción y dispersión',
      text: `Cada segmento se obtiene al intersectar un rayo con una cara y aplicar la ley de Snell. Desviación del rayo de 550 nm: ${number(metrics.deviationAngle)}.`,
    },
  }
  const preset = (kind: 'classic' | 'quartz' | 'reflection') => {
    closeInformation()
    setLesson(null)
    state.reset()
    if (kind === 'quartz') state.setMaterial('quartz')
    if (kind === 'reflection') {
      state.setParameter('prismAngle', -35)
      state.setParameter('apexAngle', 75)
    }
  }
  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="/" aria-label="SPUM, volver a todos los experimentos">
          <span className="brand-mark">
            <Icon name="prism" size={27} />
          </span>
          <span>
            SPUM<span className="brand-sub">PRISMA DE NEWTON</span>
          </span>
        </a>
        <nav aria-label="Experimentos y ayuda">
          <a className="experiment-home" href="/">
            ← Experimentos
          </a>
          <a className="text-button related-experiment" href="/doble-rendija/">
            Doble rendija ↗
          </a>
          <button className="text-button" onClick={() => setHelp('theory')}>
            <Icon name="book" size={17} />
            El fundamento
          </button>
          <button className="button guide-button" onClick={() => setHelp('guide')}>
            <Icon name="help" size={16} />
            Cómo explorar
          </button>
        </nav>
      </header>
      <main id="experiment">
        <div className="intro">
          <div>
            <div className="eyebrow intro-eyebrow">
              <span className="tiny-line" /> ÓPTICA · EXPERIMENTO 02
            </div>
            <h1>
              El color está en la luz<span>.</span>
            </h1>
            <p>Dirigí un haz de luz blanca. Explorá un prisma. Descubrí lo que ya estaba ahí.</p>
            <a className="prism-history-link" href="#prism-history-title">
              Qué descubrió Newton y por qué importó ↓
            </a>
          </div>
          <div className="newton-note">
            <span className="mono">WOOLSTHORPE, 1666</span>
            <p>
              La pregunta de Newton,
              <br />
              un laboratorio abierto.
            </p>
            <span className="small-spectrum" />
          </div>
        </div>
        <LabNavigation
          light
          links={[
            ['Visor', '#spum-mission'],
            ['Controles', '#prism-controls'],
            ['Retos', '#prism-retos'],
            ['Por qué', '#prism-history-title'],
          ]}
        />
        <PrismLearningGuide
          active={lesson?.id ?? null}
          onSelect={(id) => {
            startLesson(id)
            document.getElementById('spum-mission')?.scrollIntoView({ block: 'start' })
          }}
        />
        <LabMission
          light
          title={activeLesson?.question}
          instruction={
            activeLesson?.instruction ??
            'Elegí una pregunta y seguí el haz desde la lámpara hasta la pantalla. Cada control tiene una pista sobre qué mirar.'
          }
          index={lesson ? lessonIndex : undefined}
          href={lesson ? '#prism-evidence-title' : '#prism-retos'}
          result={feedback?.status === 'observed' ? feedback.heading : undefined}
          onStart={!lesson ? () => startLesson(LESSONS[0].id) : undefined}
          onNext={
            feedback?.status === 'observed'
              ? () => startLesson(LESSONS[(lessonIndex + 1) % LESSONS.length].id)
              : undefined
          }
        />
        <div className="laboratory-layout">
          <section className="experiment-column" aria-label="Simulación y mediciones">
            <div className="scene-card">
              <div className="scene-toolbar">
                <div className={`live-status ${state.pausedConfig ? 'paused' : ''}`}>
                  <span />
                  {state.pausedConfig
                    ? 'LECTURA CONGELADA'
                    : illuminated
                      ? 'SIMULACIÓN EN VIVO'
                      : 'FUENTE APAGADA'}
                </div>
                <div className="view-tabs" aria-label="Vista de cámara">
                  <button
                    className={state.view === 'perspective' ? 'selected' : ''}
                    aria-pressed={state.view === 'perspective'}
                    onClick={() => state.setView('perspective')}
                  >
                    Perspectiva 3D
                  </button>
                  <button
                    className={state.view === 'top' ? 'selected' : ''}
                    aria-pressed={state.view === 'top'}
                    onClick={() => state.setView('top')}
                  >
                    Vista superior
                  </button>
                </div>
              </div>
              <div className="scene-viewport">
                <SceneBoundary>
                  <Suspense
                    fallback={<div className="scene-fallback">Preparando el banco óptico…</div>}
                  >
                    <SceneViewport
                      experiment={experiment}
                      config={config}
                      intensity={state.lightIntensity}
                      lightEnabled={state.lightEnabled}
                      view={state.view}
                      showNormals={state.showNormals}
                      showLabels={state.showLabels}
                      cameraResetKey={state.cameraResetKey}
                      onHover={setHover}
                      onSelect={setSelectedTarget}
                      activeTarget={informationTarget}
                      touchCamera={touchCamera}
                    />
                  </Suspense>
                </SceneBoundary>
                <div className="scene-coordinate">
                  <span>Y</span>
                  <span>↗ Z</span>
                  <span>→ X</span>
                </div>
                {informationTarget && (
                  <div
                    className="physics-tooltip"
                    id="prism-information"
                    role="status"
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') closeInformation()
                    }}
                  >
                    <span className="eyebrow">LO QUE ESTÁ SUCEDIENDO</span>
                    <strong>{tooltip[informationTarget].title}</strong>
                    <p>{tooltip[informationTarget].text}</p>
                    <button aria-label="Cerrar información" onClick={closeInformation}>
                      <Icon name="close" size={13} />
                    </button>
                  </div>
                )}
                {(!metrics.screenHits || !illuminated) && (
                  <div className="scene-notice">
                    {!illuminated
                      ? 'Encendé la fuente y aumentá la intensidad para observar la luz.'
                      : whiteHits
                        ? 'El haz evita el prisma: llega luz blanca, sin dispersión.'
                        : 'El haz sale hacia otra dirección. Probá otra rotación.'}
                  </div>
                )}
              </div>
              <div className="scene-bottom">
                <span>
                  <span className="mouse-symbol">↔</span>Arrastrá para orbitar · scroll para acercar
                </span>
                <div>
                  <button
                    className="spum-mobile-camera-switch"
                    aria-pressed={touchCamera}
                    onClick={() => setTouchCamera(!touchCamera)}
                  >
                    {touchCamera ? 'Dejar de girar' : 'Girar cámara'}
                  </button>
                  <button aria-pressed={state.showLabels} onClick={state.toggleLabels}>
                    Etiquetas
                  </button>
                  <button aria-pressed={state.showNormals} onClick={state.toggleNormals}>
                    Normales
                  </button>
                  <button
                    onClick={state.resetCamera}
                    title="Restablecer cámara"
                    aria-label="Restablecer cámara"
                  >
                    <Icon name="expand" size={15} />
                  </button>
                </div>
              </div>
              <p className="spum-touch-hint">
                {touchCamera
                  ? 'Cámara activa: arrastrá para girar y pellizcá para acercar. Tocá “Dejar de girar” para volver a deslizar la página.'
                  : 'Deslizá sobre el visor para seguir leyendo. Activá “Girar cámara” para explorar el montaje desde otro ángulo.'}
              </p>
              <div className="measurements">
                <div>
                  <span>ÍNDICE DE REFRACCIÓN</span>
                  <strong>
                    {refractiveIndex(550, config.material).toFixed(4)}
                    <small>n · 550 nm</small>
                  </strong>
                </div>
                <div>
                  <span>ÁNGULO DE INCIDENCIA</span>
                  <strong>
                    {number(illuminated ? metrics.incidenceAngle : null)}
                    <small>respecto de la normal</small>
                  </strong>
                </div>
                <div>
                  <span>DESVIACIÓN DEL HAZ</span>
                  <strong>
                    {number(illuminated ? metrics.deviationAngle : null)}
                    <small>rayo de 550 nm</small>
                  </strong>
                </div>
              </div>
              <SpectrumReadout experiment={experiment} visible={illuminated} />
            </div>
            <div className="experiment-actions">
              <button
                className={`button ${state.pausedConfig ? 'primary' : 'freeze-button'}`}
                onClick={state.togglePause}
              >
                <Icon name={state.pausedConfig ? 'play' : 'pause'} size={16} />
                {state.pausedConfig ? 'Aplicar y reanudar' : 'Congelar lectura'}
              </button>
              <p>
                {state.pausedConfig
                  ? 'Prepará cambios y reanudá para ver el resultado.'
                  : 'Sin secuencias grabadas. Cada trayectoria se recalcula.'}
              </p>
              <span className="model-tag">SNELL + CAUCHY</span>
            </div>
            <PrismEvidence
              active={lesson}
              current={reading}
              frozen={!!state.pausedConfig}
              onTry={tryChange}
              onRestart={() => {
                if (lesson) startLesson(lesson.id)
              }}
              onExit={() => setLesson(null)}
            />
          </section>
          <ControlPanel
            activeControl={LESSONS.find((item) => item.id === lesson?.id)?.controlId}
            onReset={() => {
              closeInformation()
              setLesson(null)
              state.reset()
            }}
          />
        </div>
        <NewtonDiscovery />
        <section className="explore-section" aria-label="Experimentos sugeridos">
          <div className="explore-heading">
            <span className="eyebrow">SEGUÍ LA CURIOSIDAD</span>
            <span>Tres puntos de partida</span>
          </div>
          <div className="preset-grid">
            <button onClick={() => preset('classic')}>
              <span className="preset-number">01</span>
              <div>
                <strong>Separá la luz blanca</strong>
                <p>Volvé al experimento clásico de Newton.</p>
              </div>
              <Icon name="arrow" />
            </button>
            <button onClick={() => preset('quartz')}>
              <span className="preset-number">02</span>
              <div>
                <strong>Probá otro material</strong>
                <p>Compará la dispersión del cuarzo y el vidrio.</p>
              </div>
              <Icon name="arrow" />
            </button>
            <button onClick={() => preset('reflection')}>
              <span className="preset-number">03</span>
              <div>
                <strong>Buscá la reflexión interna</strong>
                <p>¿Qué sucede cuando la luz no puede salir?</p>
              </div>
              <Icon name="arrow" />
            </button>
          </div>
        </section>
        <MoreLabs current="prisma" light />
      </main>
      <footer className="app-footer">
        <a href="/">
          SPUM <span className="footer-dot">/</span> Todos los experimentos
        </a>
        <button onClick={() => setHelp('theory')}>
          Acerca del modelo <Icon name="arrow" size={13} />
        </button>
        <a href="/doble-rendija/">Explorar la doble rendija ↗</a>
      </footer>
      <HelpDialog mode={help} onClose={() => setHelp(null)} />
    </div>
  )
}
export default App
