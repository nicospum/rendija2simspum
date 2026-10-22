import SceneConsole from '../components/ui/SceneConsole'
import ChallengeGuide from '../components/ui/ChallengeGuide'
import { useEffect, useReducer, useState } from 'react'
import Info from '../components/ui/InfoPopover'
import {
  LabMission,
  LabNavigation,
  MoreLabs,
} from '../components/ui/LabJourney'
import EinsteinNavigation from '../einstein/EinsteinNavigation'
import { readCompleted } from '../einstein/progress'
import { useChapterProgress } from '../einstein/usePassport'
import {
  C,
  gamma,
  measurement,
  MIN_TIME,
  MAX_TIME,
  order,
  snapshot,
} from './physics'
import type { Frame, Setup } from './physics'
import { initialState, LESSONS, observations, reducer } from './learning'
import Scene from './Scene'
const n = (v: number, digits = 3) =>
  (Math.abs(v) < 0.5 * 10 ** -digits ? 0 : v).toLocaleString('es-AR', {
    maximumFractionDigits: digits,
  })
const label = (frame: Frame) => (frame === 'anden' ? 'andén' : 'tren')
export default function TrainApp() {
  const [s, dispatch] = useReducer(reducer, undefined, () =>
    initialState(0, readCompleted('tren-de-einstein')),
  )
  const [view, setView] = useState<Frame>('tren')
  const [visible, setVisible] = useState(!document.hidden)
  useChapterProgress('tren-de-einstein', s.completed)
  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])
  useEffect(() => {
    if (!s.playing || !visible) return
    let frame = 0,
      previous = 0
    const animate = (now: number) => {
      if (!previous) previous = now
      if (now - previous >= 1000 / 30) {
        dispatch({ type: 'tick', seconds: (now - previous) / 1000 })
        previous = now
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [s.playing, visible])
  const setup = s.setup,
    l = LESSONS[s.index],
    done = s.completed.includes(s.index),
    g = gamma(setup.beta),
    checks = observations(s)
  const tune = (patch: Partial<Omit<Setup, 'time'>>) =>
    dispatch({ type: 'tune', patch })
  const time = (value: number) => dispatch({ type: 'time', value })
  const flash = () => {
    time(MIN_TIME)
    dispatch({ type: 'play' })
  }
  const start = (index: number) => dispatch({ type: 'lesson', index })
  const next = () => {
    start((s.index + 1) % 4)
    requestAnimationFrame(() => {
      document
        .getElementById('tr-challenges')
        ?.scrollIntoView({ behavior: 'instant', block: 'start' })
      document.getElementById('tr-question')?.focus({ preventScroll: true })
    })
  }
  const platform = snapshot(setup, 'anden'),
    train = snapshot(setup, 'tren')
  return (
    <div className="en-lab rl-shell tr-shell">
      <a href="#tr-controls" className="rl-skip">
        Ir a los controles
      </a>
      <header className="rl-header">
        <a className="rl-brand" href="/">
          ∿ SPUM <small>EXPERIMENTOS</small>
        </a>
        <a href="/einstein/">Especial Einstein ↗</a>
      </header>
      <main>
        <EinsteinNavigation current="tren-de-einstein" />
        <section className="rl-intro">
          <div>
            <p className="rl-eyebrow">LABORATORIO 09 / RELATIVIDAD ESPECIAL</p>
            <h1>
              El tren
              <br />
              <em>de Einstein.</em>
            </h1>
          </div>
          <div>
            <p className="rl-eyebrow">
              UN EXPERIMENTO. DOS FORMAS DE FECHARLO.
            </p>
            <h2>
              ¿Qué significa <br />
              “al mismo tiempo”?
            </h2>
            <p>
              Dos destellos, un tren y un andén. Cambiá de sistema, seguí las
              señales y medí el vagón. Descubrí por qué recibir, fechar y medir
              son tareas diferentes.
            </p>
            <a data-scene-play href="#tr-views">Jugar sobre la escena ↓</a>
          </div>
        </section>
        <LabNavigation
          links={[
            ['Las vistas', '#tr-views'],
            ['Controles', '#tr-controls'],
            ['Retos', '#tr-challenges'],
            ['Por qué', '#tr-science'],
          ]}
        />
        <LabMission
          index={s.index}
          title={l.title}
          instruction={l.hint}
          href="#tr-challenges"
          result={
            done
              ? 'Reto completado. Podés seguir explorando o pasar al siguiente.'
              : undefined
          }
          onNext={done ? () => start((s.index + 1) % 4) : undefined}
        />
        <section
          id="tr-views"
          data-scene-workspace
          className="rl-observatory"
          aria-label="Andén y tren, dos sistemas del mismo experimento"
        >
          <div className="rl-observatory-heading">
            <div>
              <p className="rl-eyebrow">
                A Y B / DOS DESTELLOS EN LOS EXTREMOS
              </p>
              <h2>Ocurrió. Viajó. Llegó.</h2>
            </div>
            <span className="rl-state">
              {s.playing
                ? 'SEÑALES EN VIAJE'
                : setup.time === MAX_TIME
                  ? 'RECORRIDO COMPLETO'
                  : 'PAUSADO · PODÉS EXPLORAR'}
            </span>
          </div>
          <div className="spum-live-stage">
          <div
            className="rl-mobile-views"
            role="group"
            aria-label="Elegir vista en celular"
          >
            {(['anden', 'tren'] as const).map((frame) => (
              <button
                key={frame}
                aria-pressed={view === frame}
                onClick={() => setView(frame)}
              >
                Desde el {label(frame)}
              </button>
            ))}
          </div>
          <div className="rl-views">
            {(['anden', 'tren'] as const).map((frame, i) => {
              const m = frame === 'anden' ? platform : train
              return (
                <article
                  key={frame}
                  className={`rl-frame tr-${frame}`}
                  data-active={view === frame}
                >
                  <div className="rl-frame-heading">
                    <div>
                      <span>
                        0{i + 1} / SISTEMA {frame === 'anden' ? 'E' : 'T′'}
                      </span>
                      <h3>Desde el {label(frame)}</h3>
                    </div>
                    <b>
                      {frame === 'anden'
                        ? 'ANDÉN EN REPOSO'
                        : 'VAGÓN EN REPOSO'}
                    </b>
                  </div>
                  <p className="spum-scene-prompt">Arrastrá P · tocá A o B para lanzar luz</p>
                  <Scene
                    setup={setup}
                    frame={frame}
                    sample={s.sample}
                    onPassenger={(offset) => tune({ offset })}
                    onFlash={flash}
                  />
                  <div className="tr-clockline">
                    <span>Tiempo de este sistema</span>
                    <strong>{n(m.time * 1e6)} µs</strong>
                  </div>
                  <details className="tr-records">
                    <summary>Fechas de emisión y llegada</summary>
                    <div className="tr-dates">
                      <div>
                        <span>
                          FECHA DE EMISIÓN{' '}
                          <Info name={`Fechas de emisión en el ${label(frame)}`}>
                            Fechas asignadas al destello con relojes sincronizados en este
                            sistema. No son las horas a las que llega su luz al receptor. A
                            es el extremo izquierdo y B el derecho en el tren. Las fechas
                            son calculadas; ✓ indica que ya se emitió en el corte mostrado.
                          </Info>
                        </span>
                        <p>
                          A <b>{n(m.pulses[0].emission.t * 1e6)} µs</b>{' '}
                          {m.pulses[0].emitted ? '✓' : ''} <i>·</i> B{' '}
                          <b>{n(m.pulses[1].emission.t * 1e6)} µs</b>{' '}
                          {m.pulses[1].emitted ? '✓' : ''}
                        </p>
                        <strong>{order(m.emissionGap)}</strong>
                      </div>
                      <div>
                        <span>
                          LLEGADA {frame === 'anden' ? 'AL RECEPTOR E' : 'AL PASAJERO P'}{' '}
                          <Info name={`Llegadas en el ${label(frame)}`}>
                            Cada hora corresponde al paso de una señal por este receptor en
                            reposo en el {label(frame)}. Se calcula el trayecto de luz desde
                            cada emisión. Los detectores ideales registran el paso sin
                            absorber el pulso, para que ambos puedan comparar sus registros.
                          </Info>
                        </span>
                        <p>
                          {m.pulses.map((p) => (
                            <span key={p.label} className={p.received ? 'tr-received' : ''}>
                              {p.label} <b>{n(p.arrival.t * 1e6)} µs</b>{' '}
                              {p.received
                                ? '✓ recibida'
                                : p.emitted
                                  ? '· en viaje'
                                  : '· por emitir'}{' '}
                            </span>
                          ))}
                        </p>
                        <strong>{order(m.arrivalGap)}</strong>
                      </div>
                    </div>
                  </details>
                </article>
              )
            })}
          </div>
          </div>
          <SceneConsole
            challengeHref="#tr-challenges"
            viewHref="#tr-views"
            challenge={{
              index: s.index,
              lessons: LESSONS,
              question: l.question,
              choices: l.choices,
              prediction: s.prediction,
              steps: l.steps.map((label, i) => ({ label, done: checks[i] })),
              verified: s.feedback.startsWith('¡Descubrimiento completo!'),
              feedback: s.feedback,
              meaning: l.meaning,
              onPredict: (choice) => dispatch({ type: 'predict', choice }),
              onLesson: start,
              onCheck: () => dispatch({ type: 'check' }),
              onRestore: () => start(s.index),
            }}
            hint="Arrastrá el círculo P para mover al pasajero; el ensayo vuelve al inicio. Tocá A o B para lanzar los dos destellos. Mover a P cambia las llegadas, no las fechas de emisión. Δt significa fecha de B menos fecha de A: si es negativa, B ocurre primero. Las dos vistas muestran coordenadas, no fotografías. Podés usar también los botones o las flechas del teclado."
          >
            <div className="spum-console-row">
              <label htmlFor="tr-live-speed">Velocidad del tren</label>
              <output>
                {n(setup.beta, 2)} c · L andén {n(platform.length, 1)} m
              </output>
            </div>
            <input
              id="tr-live-speed"
              type="range"
              min="-0.9"
              max="0.9"
              step="0.01"
              value={setup.beta}
              onChange={(e) => tune({ beta: +e.target.value })}
            />
            <p className="spum-console-impact">
              En el tren: emisión{' '}
              {order(train.emissionGap).replace('Primero', 'primero')}; llegada a P{' '}
              {order(train.arrivalGap).replace('Primero', 'primero')}.
              <br />
              Δt (B − A): emisión {n(train.emissionGap * 1e6)} µs · llegada{' '}
              {n(train.arrivalGap * 1e6)} µs.
            </p>
            <div className="spum-console-buttons">
              <button onClick={flash}>Lanzar destellos</button>
              <button onClick={() => dispatch({ type: 'play' })}>
                {s.playing ? 'Pausar' : 'Continuar'}
              </button>
              <button onClick={() => time(MAX_TIME)}>Todas las llegadas</button>
            </div>
            <div className="spum-console-row">
              <label htmlFor="tr-live-time">Recorrer las señales</label>
              <output>{n(setup.time, 2)} L₀/c</output>
            </div>
            <input
              id="tr-live-time"
              type="range"
              min={MIN_TIME}
              max={MAX_TIME}
              step="0.01"
              value={setup.time}
              onChange={(e) => time(+e.target.value)}
            />
            <div
              className="spum-console-buttons"
              role="group"
              aria-label="Posición y rapidez de prueba"
            >
              <button
                aria-pressed={setup.offset === 0}
                onClick={() => tune({ offset: 0 })}
              >
                P al centro
              </button>
              <button
                aria-pressed={setup.offset === 0.25}
                onClick={() => tune({ offset: 0.25 })}
              >
                P hacia B · ¼
              </button>
              {[-0.6, 0, 0.6, 0.8].map((beta) => (
                <button key={beta} onClick={() => tune({ beta })}>
                  {n(beta, 1)} c
                </button>
              ))}
            </div>
            <details className="spum-console-help">
              <summary>Emisiones y regla de medir</summary>
              <div className="spum-console-buttons">
                {(['anden', 'tren'] as const).map((sync) => (
                  <button
                    key={sync}
                    aria-pressed={setup.sync === sync}
                    onClick={() => tune({ sync })}
                  >
                    Destellos a la vez en el {label(sync)}
                  </button>
                ))}
              </div>
              <div className="spum-console-buttons">
                <button
                  onClick={() => {
                    dispatch({ type: 'tune', patch: { protocol: 'simultaneo' } })
                    dispatch({ type: 'measure' })
                  }}
                >
                  Medir simultáneos en cada sistema
                </button>
                <button
                  onClick={() => {
                    dispatch({ type: 'tune', patch: { protocol: 'tren' } })
                    dispatch({ type: 'measure' })
                  }}
                >
                  Medir al mismo tiempo del tren
                </button>
              </div>
              {s.sample && (
                <p className="spum-console-impact">
                  Marcas en el andén:{' '}
                  {n(measurement(s.sample, 'anden').distance, 1)} m · Δt ={' '}
                  {n(measurement(s.sample, 'anden').deltaT * 1e6)} µs.{' '}
                  {measurement(s.sample, 'anden').valid
                    ? 'Longitud válida.'
                    : 'Dos instantes: no es una longitud instantánea.'}
                </p>
              )}
            </details>
          </SceneConsole>
          <div
            className="tr-live-summary"
            aria-live={s.playing ? 'off' : 'polite'}
          >
            <span>
              En el andén: L = <b>{n(platform.length, 1)} m</b>
            </span>
            <span>
              En el tren: L₀ = <b>{n(setup.length, 0)} m</b>
            </span>
            <span>
              Δt′ de emisión B − A: <b>{n(train.emissionGap * 1e6)} µs</b>
            </span>
          </div>
          <p className="rl-map-note">
            Diagramas de coordenadas: cada panel usa su propia simultaneidad.
            Los cortes coinciden en el evento del reloj central del tren.{' '}
            <Info name="Dos vistas, dos cortes">
              El control temporal sigue el tiempo del centro del tren τ. El
              panel del andén muestra t = γτ; el del tren, t′ = τ. Coinciden en
              ese evento central, no en todos los puntos del espacio. Por eso
              las señales pueden aparecer emitidas en momentos diferentes en
              cada panel. No son fotografías. La altura de las etiquetas solo
              separa marcas: el cálculo físico es longitudinal en una dimensión.
            </Info>
          </p>
        </section>
        <section
          id="tr-controls"
          className="rl-controls"
          aria-labelledby="tr-controls-title"
        >
          <div className="rl-section-heading">
            <div>
              <p className="rl-eyebrow">
                CAMBIÁ UNA COSA / MIRÁ LAS DOS CUENTAS
              </p>
              <h2 id="tr-controls-title">Armá tu prueba.</h2>
            </div>
            <a href="#tr-views">Ver el tren y las señales ↑</a>
          </div>
          <ChallengeGuide
            index={s.index}
            title={l.title}
            prediction={s.prediction === null ? undefined : l.choices[s.prediction]}
            steps={l.steps.map((label, i) => ({ label, done: checks[i] }))}
            saved={done}
            challengeHref="#tr-challenges"
            viewHref="#tr-views"
            help="c es la velocidad de la luz. «Fecha de emisión» dice cuándo ocurrió el destello; «llegada» dice cuándo alcanzó al pasajero. Cambiar el ensayo reinicia las señales; cambiar de vista conserva los mismos sucesos."
          />
          <div className="rl-control-grid">
            <div className="rl-control-card">
              <div className="rl-control-label">
                <label htmlFor="tr-speed">Velocidad del tren</label>
                <output>{n(setup.beta, 2)} c</output>
              </div>
              <input
                id="tr-speed"
                type="range"
                min="-0.9"
                max="0.9"
                step="0.01"
                value={setup.beta}
                onChange={(e) => tune({ beta: Number(e.target.value) })}
              />
              <div className="rl-range-ends">
                <span>← −0,9 c</span>
                <span>0</span>
                <span>+0,9 c →</span>
              </div>
              <div className="rl-presets">
                {[-0.6, 0, 0.6, 0.8].map((b) => (
                  <button key={b} onClick={() => tune({ beta: b })}>
                    {b > 0 ? '+' : ''}
                    {n(b, 1)} c
                  </button>
                ))}
              </div>
              <p>
                γ = {n(g)} · {n((Math.abs(setup.beta) * C) / 1000, 0)} km/s.
                Cambiar una condición reinicia las señales: comparamos ensayos
                inerciales, sin acelerar un tren.
              </p>
            </div>
            <div className="rl-control-card">
              <fieldset>
                <legend>¿Dónde son simultáneos los destellos?</legend>
                <div className="rl-follow">
                  {(['anden', 'tren'] as const).map((frame) => (
                    <button
                      key={frame}
                      aria-pressed={setup.sync === frame}
                      onClick={() => tune({ sync: frame })}
                    >
                      Simultáneos en el {label(frame)}
                    </button>
                  ))}
                </div>
              </fieldset>
              <p>
                Esta selección cambia los sucesos físicos de emisión. Alternar
                las vistas, en cambio, conserva el mismo ensayo.
              </p>
            </div>
            <div className="rl-control-card">
              <div className="rl-control-label">
                <label htmlFor="tr-length">Longitud propia L₀</label>
                <output>{n(setup.length, 0)} m</output>
              </div>
              <input
                id="tr-length"
                type="range"
                min="100"
                max="400"
                step="25"
                value={setup.length}
                onChange={(e) => tune({ length: Number(e.target.value) })}
              />
              <button onClick={() => tune({ length: 300 })}>Usar 300 m</button>
              <p>
                Se mide en reposo con el tren. En el andén vale L₀/γ ={' '}
                <b>{n(platform.length, 1)} m</b>. La contracción depende del
                movimiento relativo, no de una deformación del vagón.
              </p>
            </div>
            <div className="rl-control-card">
              <div className="rl-control-label">
                <label htmlFor="tr-offset">Posición del pasajero</label>
                <output>{n(setup.offset, 2)} L₀</output>
              </div>
              <input
                id="tr-offset"
                type="range"
                min="-0.3"
                max="0.3"
                step="0.01"
                value={setup.offset}
                onChange={(e) => tune({ offset: Number(e.target.value) })}
              />
              <div className="rl-presets">
                <button onClick={() => tune({ offset: 0 })}>Centro</button>
                <button onClick={() => tune({ offset: 0.25 })}>
                  Hacia B · +¼ L₀
                </button>
              </div>
              <p>
                Cambia cuánto viaja la luz hasta P, manteniendo las fechas de
                emisión. Su reloj está sincronizado con la red del tren.
              </p>
            </div>
            <div className="rl-control-card rl-time-control">
              <div className="rl-control-label">
                <label htmlFor="tr-time">Tiempo del centro del tren</label>
                <output>{n(((setup.time * setup.length) / C) * 1e6)} µs</output>
              </div>
              <input
                id="tr-time"
                type="range"
                min={MIN_TIME}
                max={MAX_TIME}
                step="0.01"
                value={setup.time}
                aria-valuetext={`${n(((setup.time * setup.length) / C) * 1e6)} microsegundos en el reloj central del tren`}
                onChange={(e) => time(Number(e.target.value))}
              />
              <div className="rl-range-ends">
                <span>Antes de los destellos</span>
                <span>Todas las llegadas</span>
              </div>
              <div className="rl-transport">
                <button
                  className="rl-primary"
                  onClick={() => dispatch({ type: 'play' })}
                >
                  {s.playing
                    ? 'Pausar señales'
                    : setup.time === MAX_TIME
                      ? 'Repetir señales'
                      : 'Iniciar señales'}
                </button>
                <button onClick={() => time(0)}>Ir al encuentro · τ = 0</button>
                <button onClick={() => time(MAX_TIME)}>
                  Ver todas las llegadas
                </button>
                <button onClick={() => time(MIN_TIME)}>Volver al inicio</button>
              </div>
              <p>
                τ = 0 marca el encuentro de los centros. Fechas negativas
                significan “antes del encuentro”. Movimiento muy ralentizado;
                los valores físicos están en microsegundos. Podés explorar sin
                reproducir.
              </p>
            </div>
          </div>
          <div className="rl-impact">
            <span>EL EFECTO DE TU CAMBIO</span>
            <p>
              Longitud en el andén: <b>{n(platform.length, 1)} m</b>, el{' '}
              <b>{n(100 / g, 1)} %</b> de L₀. En el tren, el orden de emisión es{' '}
              <b>{order(train.emissionGap).replace('Primero', 'primero')}</b>;
              el de recepción por P es{' '}
              <b>{order(train.arrivalGap).replace('Primero', 'primero')}</b>.
            </p>
            <a href="#tr-views">Comparar las fechas y las señales ↑</a>
          </div>
        </section>
        <section
          id="tr-measure"
          className="rl-controls"
          aria-labelledby="tr-measure-title"
        >
          <div className="rl-section-heading">
            <div>
              <p className="rl-eyebrow">UN INSTRUMENTO / DOS EXTREMOS</p>
              <h2 id="tr-measure-title">¿Cuándo ponés las marcas?</h2>
            </div>
            <Info name="Medir una longitud">
              Para medir la longitud de un objeto en un sistema hay que
              registrar sus extremos al mismo tiempo en ese sistema. Dos marcas
              tomadas en momentos distintos pueden tener otra separación, sin
              medir la longitud del objeto. Las marcas guardadas no se desplazan
              al adelantar el tiempo.
            </Info>
          </div>
          <div
            className="tr-measuring-tools"
            role="group"
            aria-label="Método para registrar los extremos"
          >
            <button
              aria-pressed={setup.protocol === 'simultaneo'}
              onClick={() => tune({ protocol: 'simultaneo' })}
            >
              Simultáneos en cada sistema
            </button>
            <button
              aria-pressed={setup.protocol === 'tren'}
              onClick={() => tune({ protocol: 'tren' })}
            >
              Mismo tiempo del tren
            </button>
            <button
              className="rl-primary"
              onClick={() => dispatch({ type: 'measure' })}
            >
              Marcar extremos ahora
            </button>
          </div>
          <p className="tr-help">
            Cada tarjeta registra su par de eventos. “Mismo tiempo del tren”
            sirve en el vagón; con movimiento relativo, sus eventos no son
            simultáneos en el andén. Cambiar el método conserva el instante y
            pausa la escena.
          </p>
          {s.sample ? (
            <div className="tr-measure-grid">
              {(['anden', 'tren'] as const).map((frame) => {
                const m = measurement(s.sample!, frame)
                return (
                  <article key={frame}>
                    <span>REGISTRO EN EL {label(frame).toUpperCase()}</span>
                    <h3>{n(m.distance, 1)} m</h3>
                    <p>
                      Extremo A: {n(m.events[0].t * 1e6)} µs
                      <br />
                      Extremo B: {n(m.events[1].t * 1e6)} µs
                    </p>
                    <strong>Δt = {n(m.deltaT * 1e6)} µs</strong>
                    <b className={m.valid ? 'tr-valid' : 'tr-invalid'}>
                      {m.valid
                        ? '✓ Longitud válida en este sistema'
                        : '≠ Son dos instantes: no mide la longitud'}
                    </b>
                  </article>
                )
              })}
            </div>
          ) : (
            <p className="tr-empty">
              Todavía sin marcas. Elegí un método y registrá los extremos para
              comparar separación y fechas.
            </p>
          )}
          <a className="tr-inline-link" href="#tr-views">
            Ver las marcas en las dos vistas ↑
          </a>
        </section>
        <section
          id="tr-challenges"
          className="rl-challenges"
          aria-labelledby="tr-challenges-title"
        >
          <div className="rl-section-heading">
            <div>
              <p className="rl-eyebrow">PREDECIR / PROBAR / EXPLICAR</p>
              <h2 id="tr-challenges-title">
                Cuatro paradas, una nueva mirada.
              </h2>
            </div>
            <span>{s.completed.length} / 4 descubrimientos</span>
          </div>
          <div
            className="rl-lessons"
            role="group"
            aria-label="Elegir reto educativo"
          >
            {LESSONS.map((lesson, i) => (
              <button
                key={lesson.title}
                aria-pressed={s.index === i}
                onClick={() => start(i)}
              >
                <span>{s.completed.includes(i) ? '✓' : `0${i + 1}`}</span>
                {lesson.title}
              </button>
            ))}
          </div>
          <div className="rl-challenge-body">
            <div>
              <p className="rl-eyebrow">RETO {s.index + 1} / 4</p>
              <h3 id="tr-question" tabIndex={-1}>
                {l.question}
              </h3>
              <fieldset className="rl-predictions">
                <legend>Tu predicción</legend>
                {l.choices.map((choice, i) => (
                  <label key={choice}>
                    <input
                      type="radio"
                      name="tr-prediction"
                      checked={s.prediction === i}
                      onChange={() => dispatch({ type: 'predict', choice: i })}
                    />
                    {choice}
                  </label>
                ))}
              </fieldset>
            </div>
            <div>
              <h3>Ahora probalo.</h3>
              <p>{l.hint}</p>
              <ul className="rl-observation-list">
                {l.steps.map((step, i) => (
                  <li key={step}>
                    {checks[i] ? '✓' : '○'} {step}
                  </li>
                ))}
              </ul>
              <div className="rl-challenge-actions">
                <a href={s.index === 3 ? '#tr-measure' : '#tr-controls'}>
                  {s.index === 3
                    ? 'Ir al instrumento de medida ↑'
                    : 'Probar sobre la escena ↑'}
                </a>
                <button onClick={() => start(s.index)}>
                  Reiniciar este reto ↻
                </button>
              </div>
              <button
                className="rl-primary"
                onClick={() => dispatch({ type: 'check' })}
              >
                Comprobar mi explicación
              </button>
              {s.feedback && (
                <p className="rl-feedback" role="status">
                  {s.feedback}
                </p>
              )}
              {done && (
                <button className="rl-next" onClick={next}>
                  {s.index === 3
                    ? 'Volver al primer reto ↻'
                    : 'Siguiente descubrimiento →'}
                </button>
              )}
            </div>
          </div>
        </section>
        <section id="tr-science" className="rl-science">
          <div>
            <p className="rl-eyebrow">POR QUÉ IMPORTA</p>
            <h2>
              No hay un “ahora”
              <br />
              <em>para todo el universo.</em>
            </h2>
            <p>
              Con relojes sincronizados dentro de cada sistema, observadores en
              movimiento relativo pueden asignar fechas distintas a sucesos
              separados espacialmente. No alcanza con corregir el tiempo que
              tarda la luz en llegar: la simultaneidad también cambia.
            </p>
            <p>
              La misma idea determina cómo medimos longitudes. La contracción
              corresponde a pares de extremos simultáneos en cada sistema; no a
              una fotografía ni a un vagón que se aplasta.
            </p>
            <a
              href="https://www.einstein-online.info/en/spotlight/now/"
              target="_blank"
              rel="noreferrer"
            >
              Einstein Online: definir “ahora” ↗
            </a>
          </div>
          <div>
            <details open>
              <summary>Las ecuaciones de las dos vistas</summary>
              <div className="rl-formula">
                t′ = γ(t − vx/c²)
                <span>x′ = γ(x − vt) · γ = 1/√(1 − v²/c²)</span>
              </div>
              <p>
                Para dos destellos simultáneos en el andén: Δt′ = −γvΔx/c². Para
                una longitud propia L₀: L = L₀/γ al registrar ambos extremos
                simultáneamente en el andén.
              </p>
            </details>
            <details>
              <summary>Cuándo ocurrió y cuándo llegó</summary>
              <p>
                En el sistema de reposo de un receptor, t llegada = t emisión +
                distancia/c. Se transforma cada evento de emisión y recepción
                con Lorentz. Los detectores ideales registran el paso sin
                absorber la señal. Mover al pasajero cambia la distancia de
                viaje, conservando las emisiones.
              </p>
            </details>
            <details>
              <summary>Qué representan los dibujos</summary>
              <p>
                Modelo longitudinal 1D de relatividad especial, sin gravedad ni
                aceleración. Las vistas tienen la misma escala espacial y
                encuadre automático. Las marcas A/B quedan en los lugares donde
                ocurrieron las emisiones; no siguen al vagón. Las alturas solo
                separan etiquetas. Cada panel usa su propia simultaneidad y
                ambos cortes coinciden en el evento del reloj central del tren.
              </p>
              <p>
                Las señales activas se dejan de dibujar poco después de pasar
                por ambos receptores, pero sus fechas quedan registradas. El
                control temporal selecciona estados físicos; la ralentización,
                el halo y los colores son ayudas gráficas.
              </p>
            </details>
            <a
              href="https://www.einstein-online.info/en/relativity_space_time/"
              target="_blank"
              rel="noreferrer"
            >
              Einstein Online: espacio, tiempo y longitudes ↗
            </a>
          </div>
        </section>
        <section className="rl-continue">
          <p className="rl-eyebrow">SIGUIENTE PREGUNTA DEL ESPECIAL</p>
          <h2>¿Y si los relojes vuelven a encontrarse?</h2>
          <p>
            Planeá el viaje de los gemelos y compará el tiempo propio acumulado
            en dos recorridos entre la salida y el reencuentro.
          </p>
          <a className="tr-inline-link" href="/nos-vemos-a-la-vuelta/">
            Explorar Nos vemos a la vuelta →
          </a>
        </section>
        <EinsteinNavigation current="tren-de-einstein" footer />
        <MoreLabs current="tren-de-einstein" />
      </main>
      <footer className="rl-footer">
        <a href="/">∿ SPUM / EXPERIMENTOS</a>
        <span>Cambiar de sistema cambia la pregunta.</span>
      </footer>
    </div>
  )
}
