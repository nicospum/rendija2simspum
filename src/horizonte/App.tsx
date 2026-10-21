import { useEffect, useReducer, useState } from 'react'
import Info from '../components/ui/InfoPopover'
import {
  LabMission,
  LabNavigation,
  MoreLabs,
} from '../components/ui/LabJourney'
import { BlackHoleNavigation } from '../series/BlackHoleSeries'
import { scientific } from '../hawking/physics'
import Scene, { LightFutures, SignalColor } from './Scene'
import { model, pulseTrain, MAX_TIME, lapse, RECEIVER } from './physics'
import type { Pulse } from './physics'
import { initialState, reducer, LESSONS, observed } from './learning'

const n = (value: number, digits = 2) =>
  value.toLocaleString('es-AR', { maximumFractionDigits: digits })
function Clock({
  label,
  value,
  note,
  help,
}: {
  label: string
  value: number | null
  note: string
  help: string
}) {
  return (
    <div>
      <span>
        {label}
        <Info name={label}>{help}</Info>
      </span>
      <strong>{value === null ? '—' : `${n(value, 1)} s`}</strong>
      <small>{note}</small>
    </div>
  )
}
export default function HorizonApp() {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState())
  const [view, setView] = useState<'map' | 'light'>('map')
  const [visible, setVisible] = useState(!document.hidden)
  const [reduceMotion, setReduceMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden)
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onMotion = () => setReduceMotion(media.matches)
    document.addEventListener('visibilitychange', onVisibility)
    media.addEventListener('change', onMotion)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      media.removeEventListener('change', onMotion)
    }
  }, [])
  useEffect(() => {
    if (!state.playing || !visible) return
    let frame = 0,
      previous = 0
    const animate = (now: number) => {
      if (!previous) previous = now
      if (now - previous >= 1000 / 30) {
        dispatch({ type: 'tick', delta: (now - previous) / 1000 })
        previous = now
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [state.playing, visible])
  const s = state.setup,
    m = model(s),
    learning = state.learning,
    l = LESSONS[learning.index]
  const train = pulseTrain(s)
  const pulses = [...train, ...state.manual].sort(
    (a, b) => a.emitted - b.emitted,
  )
  const received = pulses
    .filter(
      (p) => p.emitted <= s.time && p.arrival !== null && p.arrival <= s.time,
    )
    .sort((a, b) => a.arrival! - b.arrival!)
  const last = received[received.length - 1]
  const next = pulses
    .filter(
      (p) => p.emitted <= s.time && p.arrival !== null && p.arrival > s.time,
    )
    .sort((a, b) => a.arrival! - b.arrival!)[0]
  const complete = learning.completed.includes(learning.index)
  const start = (index: number) => {
    dispatch({ type: 'lesson', index })
    setView('map')
  }
  const go = (x: number) => dispatch({ type: 'radius', radius: x })
  const arrivalLabel = (p: Pulse) =>
    p.arrival === null
      ? 'No llega al exterior'
      : `${n(p.arrival * lapse(RECEIVER) * m.unit, 1)} s`
  return (
    <div className="ac-shell hz-shell">
      <a className="ac-skip" href="#hz-controls">
        Ir a los controles
      </a>
      <header className="ac-header">
        <a className="ac-brand" href="/">
          ∿ SPUM <small>EXPERIMENTOS</small>
        </a>
        <a href="/agujeros-negros/">Especial agujeros negros ↗</a>
      </header>
      <main>
        <BlackHoleNavigation current="horizonte" />
        <section className="ac-intro">
          <div>
            <p className="ac-eyebrow">LABORATORIO 07 / CAÍDA, RELOJES Y LUZ</p>
            <h1>
              Al borde
              <br />
              <em>del horizonte.</em>
            </h1>
          </div>
          <div>
            <p className="ac-eyebrow">UN CRUCE. DOS HISTORIAS.</p>
            <p>
              El reloj de la sonda sigue. Sus mensajes tardan cada vez más.
              Explorá qué sucede en la caída y qué puede saber alguien que
              espera afuera.
            </p>
            <a href="#hz-challenges">
              Cuatro preguntas para cambiar tu idea del tiempo ↓
            </a>
          </div>
        </section>
        <LabNavigation
          links={[
            ['Mapa', '#spum-mission'],
            ['Controles', '#hz-controls'],
            ['Mensajes', '#hz-receiver'],
            ['Retos', '#hz-challenges'],
          ]}
        />
        <LabMission
          title={l.title}
          instruction={l.hint}
          index={learning.index}
          href="#hz-challenges"
          result={
            complete
              ? 'Reto completado. Seguí explorando o pasá al siguiente.'
              : observed(learning)
                ? 'Comparación realizada. Comprobá tu explicación.'
                : undefined
          }
          onNext={complete ? () => start((learning.index + 1) % 4) : undefined}
        />
        <section
          className="ac-workbench hz-workbench"
          aria-label="Mapa y controles del horizonte"
        >
          <div className="ac-visual">
            <div className="ac-toolbar">
              <div role="group" aria-label="Elegir vista del modelo">
                <button
                  aria-pressed={view === 'map'}
                  onClick={() => setView('map')}
                >
                  La caída
                </button>
                <button
                  aria-pressed={view === 'light'}
                  onClick={() => setView('light')}
                >
                  Futuros de la luz
                </button>
              </div>
              <span className="hz-live-state">
                {state.playing
                  ? 'TIEMPO EN MARCHA'
                  : 'PAUSADO · PODÉS EXPLORAR'}
              </span>
            </div>
            <div
              id="hz-view"
              className="hz-clock-strip"
              aria-label="Relojes del mismo corte del mapa, no mensajes recibidos"
            >
              <div>
                <span>Reloj sonda · en el mapa</span>
                <strong>
                  {m.probeClock === null
                    ? 'Fin del tramo'
                    : `${n(m.probeClock, 1)} s`}
                </strong>
              </div>
              <div>
                <span>Reloj antena · a 20 rs</span>
                <strong>{n(m.receiverClock, 1)} s</strong>
              </div>
              <div>
                <span>
                  {s.mode === 'hover'
                    ? 'Ritmo relativo sostenida'
                    : 'Cruce · tiempo propio'}
                </span>
                <strong>
                  {s.mode === 'hover'
                    ? `${n(m.heldRate * 100, 1)} %`
                    : `${n(m.horizonProper, 1)} s`}
                </strong>
              </div>
            </div>
            <div>
              {view === 'map' ? (
                <Scene setup={s} pulses={pulses} />
              ) : (
                <LightFutures setup={s} />
              )}
            </div>
            <div className="ac-image-notes">
              <span>
                Horizonte{' '}
                <Info name="El horizonte de sucesos">
                  rs = 2GM/c² es el radio del horizonte. El aro solo marca el
                  límite causal; no es una superficie que brilla ni una pared.
                  Desde dentro, ningún mensaje alcanza esta antena exterior.
                </Info>
              </span>
              <span>
                Relojes{' '}
                <Info name="Un mapa no es una foto">
                  El mapa usa cortes de tiempo de Painlevé–Gullstrand, que
                  permiten seguir el cruce. Los relojes de abajo corresponden a
                  ese mismo corte. Para saber qué recibe la antena hay que
                  esperar a que llegue cada pulso: mirá el panel de mensajes.
                </Info>
              </span>
              <span>
                La sonda{' '}
                <Info name="Caer o sostenerse">
                  En caída libre radial, la sonda ya entra a 4 rs con la
                  velocidad de una caída desde reposo en infinito. No la
                  soltamos en reposo a 4 rs. Sostenerla a radio fijo es otra
                  situación: exige un motor. No hay una sonda estática dentro
                  del horizonte.
                </Info>
              </span>
              <span>
                La luz{' '}
                <Info name="Puntos de luz, no partículas de Hawking">
                  Cada punto sigue un rayo radial saliente calculado. Sus
                  colores indican el cambio de frecuencia hacia la antena, de
                  forma representativa. Se amplifica su visibilidad; no es un
                  cálculo del brillo recibido. Los puntos violetas interiores no
                  pueden enviar información al exterior.
                </Info>
              </span>
            </div>
            <p className="ac-caption">
              Schwarzschild, sin giro ni carga. Mapa radial con escala de radio
              comprimida; no imagen de cámara. La caída mostrada va de 4 a 0,6
              rs. Después continúa la escucha, sin inventar una trayectoria para
              la sonda.
            </p>
            <div className="hz-map-message">
              <b>
                {m.radius === null
                  ? 'Terminó el tramo de caída mostrado.'
                  : s.mode === 'hover'
                    ? 'El motor mantiene el radio fijo.'
                    : m.radius > 1
                      ? 'La sonda cae y todavía está afuera.'
                      : m.radius === 1
                        ? 'Cruza el horizonte. Su reloj propio marca un tiempo finito.'
                        : 'La sonda está adentro. Su reloj siguió después del cruce.'}
              </b>
              <p>
                {m.radius === null
                  ? 'La antena aún puede recibir mensajes emitidos antes. Usá los accesos de radio para volver a la caída.'
                  : s.mode === 'hover'
                    ? `Aceleración propia necesaria: ${scientific(m.acceleration, 'm/s²')}. Caer libremente, en cambio, tiene aceleración propia cero.`
                    : 'El estado de la sonda en este mapa no es la imagen que la antena ve en ese instante.'}
              </p>
            </div>
          </div>
          <aside
            className="ac-controls"
            id="hz-controls"
            aria-label="Controles de caída y relojes"
          >
            <p className="ac-eyebrow">UNA VARIABLE. DOS RELOJES.</p>
            <h2>Tu misión</h2>
            <div
              className="hz-mode"
              role="group"
              aria-label="Movimiento de la sonda"
            >
              <button
                aria-pressed={s.mode === 'hover'}
                onClick={() =>
                  dispatch({ type: 'tune', patch: { mode: 'hover' } })
                }
              >
                Sostenida
              </button>
              <button
                aria-pressed={s.mode === 'fall'}
                onClick={() =>
                  dispatch({ type: 'tune', patch: { mode: 'fall' } })
                }
              >
                Caída libre
              </button>
            </div>
            {s.mode === 'hover' ? (
              <>
                <label htmlFor="hz-radius">
                  Radio sostenido <output>{n(s.radius)} rs</output>
                </label>
                <input
                  id="hz-radius"
                  type="range"
                  min="1.2"
                  max="4"
                  step=".05"
                  value={s.radius}
                  onChange={(e) =>
                    dispatch({
                      type: 'tune',
                      patch: { radius: +e.target.value },
                    })
                  }
                />
                <p>
                  Comparás ensayos a igual T, recalculados para cada radio. El
                  motor no puede sostenerlo justo en el horizonte.
                </p>
              </>
            ) : (
              <>
                <label htmlFor="hz-fall-radius">
                  Explorar radio de caída{' '}
                  <output>
                    {m.radius === null
                      ? 'Volvé a la caída'
                      : `${n(m.radius)} rs`}
                  </output>
                </label>
                <input
                  id="hz-fall-radius"
                  type="range"
                  min=".6"
                  max="4"
                  step=".01"
                  value={m.radius ?? 0.6}
                  onChange={(e) => go(+e.target.value)}
                />
                <p>
                  Elegir un radio salta al tiempo exacto de esa geodésica. El
                  reloj propio no se detiene al cruzar.
                </p>
              </>
            )}
            <div
              className="hz-checkpoints"
              role="group"
              aria-label="Puntos de la caída"
            >
              <button onClick={() => go(3)}>Más lejos · 3 rs</button>
              <button onClick={() => go(1.2)}>Afuera · 1,2 rs</button>
              <button onClick={() => go(1.05)}>Muy cerca · 1,05 rs</button>
              <button onClick={() => go(1)}>En el horizonte</button>
              <button onClick={() => go(0.8)}>Un poco adentro</button>
            </div>
            <label htmlFor="hz-time">
              Tiempo del mapa T <output>{n(s.time)} rs/c</output>
            </label>
            <input
              id="hz-time"
              type="range"
              min="0"
              max={MAX_TIME}
              step=".02"
              value={s.time}
              onChange={(e) =>
                dispatch({ type: 'tune', patch: { time: +e.target.value } })
              }
            />
            <p>
              T es una coordenada regular, no el reloj de la antena. El receptor
              tarda en ver las señales: puede seguir escuchando después del
              tramo mostrado.
            </p>
            <div className="hz-play-controls">
              <button onClick={() => dispatch({ type: 'play' })}>
                {state.playing ? 'Pausar tiempo' : 'Iniciar tiempo'}
              </button>
              <button
                onClick={() =>
                  dispatch({
                    type: 'tune',
                    patch: { time: Math.min(MAX_TIME, s.time + 0.5) },
                  })
                }
              >
                Avanzar un paso
              </button>
            </div>
            <p>
              Ritmo visual: 1 s de animación = 0,8 rs/c ({n(0.8 * m.unit, 1)} s
              de T).{' '}
              {reduceMotion
                ? 'Movimiento reducido: podés avanzar por pasos.'
                : 'El recorrido empieza pausado para que elijas qué comparar.'}
            </p>
            <label htmlFor="hz-mass">
              Masa del agujero negro <output>{n(s.mass, 1)} millones M☉</output>
            </label>
            <input
              id="hz-mass"
              type="range"
              min="1"
              max="8"
              step=".5"
              value={s.mass}
              onChange={(e) =>
                dispatch({ type: 'tune', patch: { mass: +e.target.value } })
              }
            />
            <p>
              Conservamos radios en rs. Más masa agranda el horizonte y
              multiplica los tiempos físicos; no cambia estas curvas
              normalizadas.
            </p>
            <label htmlFor="hz-interval">
              Separación propia entre pulsos{' '}
              <output>{n(s.interval)} rs/c</output>
            </label>
            <input
              id="hz-interval"
              type="range"
              min=".5"
              max="1.5"
              step=".25"
              value={s.interval}
              onChange={(e) =>
                dispatch({ type: 'tune', patch: { interval: +e.target.value } })
              }
            />
            <p>
              El tren se recalcula con intervalos iguales en el reloj emisor. No
              son intervalos iguales de llegada.
            </p>
            <button
              className="ac-primary hz-send"
              disabled={m.radius === null}
              onClick={() => dispatch({ type: 'send' })}
            >
              Enviar pulso ahora
            </button>
            <button
              className="ac-compare"
              onClick={() => dispatch({ type: 'receive' })}
            >
              Escuchar el próximo
            </button>
            {state.notice && (
              <p className="hz-notice" role="status">
                {state.notice}
              </p>
            )}
            <a className="ac-test" href="#hz-receiver">
              Ver los mensajes ↓
            </a>
            <a className="ac-test" href="#hz-view">
              Volver al visor ↑
            </a>
            <button className="ac-reset" onClick={() => start(learning.index)}>
              Reiniciar este reto ↻
            </button>
          </aside>
        </section>
        <section
          className="ac-metrics hz-clocks"
          aria-label="Lecturas de los relojes"
        >
          <Clock
            label="Reloj propio de la sonda"
            value={m.probeClock}
            note={
              m.radius === null
                ? 'Fuera del tramo calculado'
                : 'Desde su entrada / inicio del ensayo'
            }
            help="Es el tiempo acumulado por la sonda en el punto del mapa, no el último valor visto por la antena. En caída libre E = 1, dτ = dT para estas coordenadas. El cruce tiene una lectura finita."
          />
          <Clock
            label="Reloj de la antena"
            value={m.receiverClock}
            note="Estática a 20 rs · desde T = 0"
            help="Es un reloj físico estático: dτantena = √(1−1/20) dT. Comparar lecturas en un corte del mapa requiere una convención de simultaneidad; el panel de mensajes calcula lo que realmente se recibe."
          />
          <div>
            <span>
              Ritmo de reloj sostenido{' '}
              <Info name="Este factor solo compara relojes estáticos">
                dτsonda/dτantena = √[(1−1/x)/(1−1/20)]. Cada reloj marcha
                normalmente en su lugar. No uses esta fórmula de relojes
                sostenidos como si describiera sola la caída libre.
              </Info>
            </span>
            <strong>
              {s.mode === 'hover' ? `${n(m.heldRate * 100, 1)} %` : 'En caída'}
            </strong>
            <small>
              {s.mode === 'hover'
                ? 'Respecto al reloj de la antena'
                : 'Hay movimiento además de gravedad'}
            </small>
          </div>
          <Clock
            label="Tiempo propio hasta el cruce"
            value={m.horizonProper}
            note="Caída elegida desde 4 rs · E = 1"
            help="τcruce = (2/3)(4^(3/2)−1) rs/c. No es el tiempo de llegada de una imagen del cruce: una señal emitida exactamente en el horizonte no alcanza la antena."
          />
        </section>
        <section id="hz-receiver" className="hz-receiver-section">
          <div className="ac-section-heading">
            <div>
              <p className="ac-eyebrow">
                MAPA Y RECEPCIÓN SON DOS COSAS DIFERENTES
              </p>
              <h2>Lo que llega afuera.</h2>
            </div>
            <span>{received.length} mensajes recibidos</span>
          </div>
          <div className="hz-radio-grid">
            <article className="hz-radio">
              <div className="hz-antenna-icon" aria-hidden="true">
                ⌁
              </div>
              <p className="ac-eyebrow">ANTENA ESTÁTICA / 20 rs</p>
              <h3>
                {last
                  ? 'Llegó una marca del pasado.'
                  : 'La primera señal sigue viajando.'}
              </h3>
              <strong className="hz-radio-time">
                {last
                  ? `${n(last.proper * m.unit, 1)} s`
                  : 'Todavía sin mensaje'}
              </strong>
              <p>
                {last
                  ? `Es lo que marcaba el reloj emisor al enviar el último pulso recibido, desde ${n(last.radius)} rs. No es su lectura actual en el mapa.`
                  : 'Que el mapa muestre a la sonda no significa que ya haya llegado su luz. Avanzá el tiempo o escuchá el próximo mensaje.'}
              </p>
              {last && (
                <div className="hz-radio-data">
                  <span>
                    Recibido con reloj de antena: <b>{arrivalLabel(last)}</b>
                  </span>
                  <span>
                    Frecuencia recibida / emitida:{' '}
                    <b>{n(last.frequency ?? 0, 3)} ×</b>
                  </span>
                </div>
              )}
              <div
                className="hz-received-dots"
                aria-label="Últimos pulsos recibidos"
              >
                {received.slice(-18).map((p) => (
                  <i
                    key={p.id}
                    style={{ background: SignalColor(p.frequency) }}
                    title={`Emisión en ${n(p.radius)} rs`}
                  />
                ))}
              </div>
              <p className="hz-next-message">
                {next
                  ? `Próxima llegada en ${n((next.arrival! - s.time) * lapse(RECEIVER) * m.unit, 1)} s del reloj de la antena.`
                  : 'Sin otra llegada pendiente en este instante.'}
              </p>
              <button onClick={() => dispatch({ type: 'receive' })}>
                Escuchar el próximo
              </button>
            </article>
            <div className="hz-transmissions">
              <p className="ac-eyebrow">
                TUS ENVÍOS GUARDADOS / PREDICCIONES DE LLEGADA
              </p>
              <h3>Mandá una pregunta con luz.</h3>
              <p>
                Guardá pulsos desde distintos radios. Estas tarjetas predicen su
                llegada; no afirman que ya hayan llegado.
              </p>
              <div className="hz-send-cards">
                {state.manual.length === 0 ? (
                  <div className="hz-empty">
                    Probá «Más lejos» → «Enviar pulso ahora». Después repetí
                    «Muy cerca» y compará los números.
                  </div>
                ) : (
                  state.manual.slice(-4).map((p) => (
                    <article
                      key={p.id}
                      className={p.arrival === null ? 'hz-trapped' : ''}
                    >
                      <span>EMISIÓN EN {n(p.radius)} rs</span>
                      <h4>
                        {p.arrival === null
                          ? 'No alcanza la antena'
                          : `Frecuencia: ${n(p.frequency ?? 0, 3)} ×`}
                      </h4>
                      <dl>
                        <div>
                          <dt>Reloj emisor</dt>
                          <dd>{n(p.proper * m.unit, 1)} s</dd>
                        </div>
                        <div>
                          <dt>Llegada · reloj antena</dt>
                          <dd>{arrivalLabel(p)}</dd>
                        </div>
                        <div>
                          <dt>Demora · reloj antena</dt>
                          <dd>
                            {p.arrival === null
                              ? 'Sin llegada'
                              : `${n((p.arrival - p.emitted) * lapse(RECEIVER) * m.unit, 1)} s`}
                          </dd>
                        </div>
                      </dl>
                      <button
                        className="hz-receive-saved"
                        disabled={p.arrival === null || p.arrival > MAX_TIME}
                        onClick={() =>
                          dispatch({ type: 'receivePulse', id: p.id })
                        }
                      >
                        {p.arrival === null
                          ? 'Sin recepción posible'
                          : p.arrival > MAX_TIME
                            ? 'Fuera de esta ventana'
                            : s.time >= p.arrival
                              ? 'Revisar recepción'
                              : 'Recibir este pulso'}
                      </button>
                    </article>
                  ))
                )}
              </div>
              <p className="hz-caption">
                Se guardan hasta 16 envíos y se muestran los últimos cuatro.
                Cambiar entre sostener y caer reinicia la historia. Las señales
                interiores no están «muy demoradas»: no tienen llegada exterior.
                Recibir un envío adelanta el tiempo de la antena; no hace viajar
                la luz más rápido.
              </p>
              <details className="hz-train-details">
                <summary>Comparar el tren de pulsos</summary>
                <p>
                  Emisiones separadas por {n(s.interval * m.unit, 1)} s del
                  reloj emisor. La tabla predice llegadas; no todos estos
                  mensajes ya se recibieron. Primeros 12 envíos automáticos del
                  tramo actual.
                </p>
                <table className="hz-train-table">
                  <caption>Marcas de reloj e intervalos, en segundos</caption>
                  <thead>
                    <tr>
                      <th>Emite · sonda</th>
                      <th>Recibe · antena</th>
                      <th>Intervalo recibido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {train.slice(0, 12).map((p, i) => (
                      <tr key={p.id}>
                        <td>{n(p.proper * m.unit, 1)}</td>
                        <td>
                          {p.arrival === null
                            ? 'No llega'
                            : n(p.arrival * lapse(RECEIVER) * m.unit, 1)}
                        </td>
                        <td>
                          {i === 0
                            ? '—'
                            : p.arrival === null ||
                                train[i - 1].arrival === null
                              ? 'Sin llegada'
                              : n(
                                  (p.arrival - train[i - 1].arrival!) *
                                    lapse(RECEIVER) *
                                    m.unit,
                                  1,
                                )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </div>
          </div>
        </section>
        <section id="hz-challenges" className="ac-challenges">
          <div className="ac-section-heading">
            <div>
              <p className="ac-eyebrow">PREDECIR / PROBAR / EXPLICAR</p>
              <h2>Cuatro pasos hacia el límite.</h2>
            </div>
            <span>{learning.completed.length} / 4 descubrimientos</span>
          </div>
          <div
            className="ac-lesson-tabs"
            role="group"
            aria-label="Elegir reto educativo"
          >
            {LESSONS.map((lesson, i) => (
              <button
                key={lesson.title}
                aria-pressed={learning.index === i}
                onClick={() => start(i)}
              >
                <span>
                  {learning.completed.includes(i) ? '✓' : `0${i + 1}`}
                </span>
                {lesson.title}
              </button>
            ))}
          </div>
          <div className="ac-lesson-body">
            <div>
              <p className="ac-eyebrow">RETO {learning.index + 1} / 4</p>
              <h3>{l.question}</h3>
              <div
                className="ac-predictions"
                role="radiogroup"
                aria-label="Tu predicción"
              >
                {l.choices.map((choice, i) => (
                  <label key={choice}>
                    <input
                      type="radio"
                      name="hz-prediction"
                      checked={learning.prediction === i}
                      onChange={() => dispatch({ type: 'predict', choice: i })}
                    />
                    {choice}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3>Ahora probalo.</h3>
              <p>{l.hint}</p>
              <a className="ac-test" href="#hz-controls">
                Ir a los controles ↑
              </a>
              <p className="ac-progress">
                {observed(learning)
                  ? '✓ Comparación realizada'
                  : '○ Falta comparar los estados del reto'}
              </p>
              <button
                className="ac-primary"
                onClick={() => dispatch({ type: 'check' })}
              >
                Comprobar mi explicación
              </button>
              {state.feedback && (
                <p className="ac-feedback" role="status">
                  {state.feedback}
                </p>
              )}
              {complete && (
                <button
                  className="ac-next"
                  onClick={() => start((learning.index + 1) % 4)}
                >
                  {learning.index === 3
                    ? 'Volver al primer reto ↻'
                    : 'Siguiente descubrimiento →'}
                </button>
              )}
            </div>
          </div>
        </section>
        <section className="ac-physics" id="hz-physics">
          <div>
            <p className="ac-eyebrow">POR QUÉ CAMBIA NUESTRA IDEA DEL TIEMPO</p>
            <h2>
              Ver tarde
              <br />
              <em>no es detener el tiempo.</em>
            </h2>
            <p>
              La relatividad general distingue los tiempos propios de distintos
              recorridos. Para conectar dos lugares también importa cómo viaja
              la información entre ellos.
            </p>
            <p>
              El horizonte es un límite causal. La sonda puede cruzarlo sin que
              su reloj se detenga; sus mensajes hacia la antena cambian de
              frecuencia y tardan más, y los emitidos desde dentro no llegan. No
              queda una imagen brillante congelada para siempre.
            </p>
            <a href="/acrecion/">¿Qué luz sí podemos detectar? →</a>
          </div>
          <div className="ac-formulas">
            <details open>
              <summary>Dos relojes sostenidos</summary>
              <p className="ac-equation">
                dτ₁ / dτ₂ = √[(1 − rs/r₁)/(1 − rs/r₂)]
              </p>
              <p>
                Válido para ambos relojes estáticos fuera del horizonte.
                Sostenerlos requiere aceleración. La frecuencia de señales entre
                ellos tiene el mismo cociente, una vez separado el retraso de
                propagación.
              </p>
            </details>
            <details>
              <summary>Caída y luz en coordenadas regulares</summary>
              <p className="ac-equation">
                dx/dT = −1/√x · sonda E = 1<br />
                dx/dT = ±1 − 1/√x · luz radial
              </p>
              <p>
                x = r/rs y T = ctPG/rs. La sonda entra a 4 rs ya cayendo desde
                reposo en infinito; en esta geodésica, dτsonda = dtPG. T no es
                el tiempo de Schwarzschild ni, por sí solo, el reloj de la
                antena.
              </p>
              <p>
                El horizonte está en x = 1. Para luz local saliente, el signo de
                dx/dT cambia allí. Eso no permite medir una velocidad local de
                luz distinta de c.
              </p>
            </details>
            <details>
              <summary>Frecuencia y llegada de un pulso</summary>
              <p className="ac-equation">gcaída = (1 − 1/√x) / √(1 − 1/20)</p>
              <p>
                Para una señal radial saliente de la caída elegida, recibida por
                una antena estática a 20 rs. Incluye gravedad y movimiento. Solo
                se asigna frecuencia recibida si x &gt; 1.
              </p>
              <p className="ac-equation">
                Tllegada = Temisión + Q(20) − Q(x)
                <br />
                Q(x) = x + 2√x + 2 ln|√x − 1|
              </p>
              <p>
                La llegada diverge al emitir cada vez más cerca del horizonte
                desde afuera. Exactamente en el horizonte o dentro, no existe
                llegada exterior.
              </p>
            </details>
            <details>
              <summary>Qué simplificamos</summary>
              <p>
                Sonda y luz de prueba, radiales, en Schwarzschild eterno: sin
                giro, carga, retroacción, discos o evaporación. El reloj
                estático solo se sostiene entre 1,2 y 4 rs. La antena está a
                radio finito, no en infinito.
              </p>
              <p>
                El radio gráfico se comprime para hacer visible el horizonte. La
                caída se muestra hasta 0,6 rs y luego la sonda deja de
                dibujarse; no se prolonga su reloj fuera del tramo. Los
                diagramas de luz terminan antes de la singularidad. La ventana
                de escucha termina en T = 48. No simulamos fuerzas de marea ni
                una imagen inmersiva de la cámara.
              </p>
            </details>
            <details>
              <summary>Fuentes para seguir explorando</summary>
              <ul>
                <li>
                  <a
                    href="https://sites.science.oregonstate.edu/physics/coursewikis/GGR/book/dfggr/oradial.html"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Oregon State · geodésicas radiales y relojes
                  </a>
                </li>
                <li>
                  <a
                    href="https://arxiv.org/abs/gr-qc/0411060"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Hamilton y Lisle · coordenadas regulares y modelo del río
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.einstein-online.info/en/spotlight/changing_places/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Einstein Online · por qué el interior no puede enviar
                    señales afuera
                  </a>
                </li>
                <li>
                  <a
                    href="https://svs.gsfc.nasa.gov/14576/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    NASA · otra visualización de una caída, con una cámara
                    inmersiva
                  </a>
                </li>
              </ul>
            </details>
          </div>
        </section>
        <MoreLabs current="horizonte" />
      </main>
      <footer className="ac-footer">
        SPUM · EXPERIMENTOS PARA ENTENDER
        <a href="/">Volver a todos los laboratorios ↗</a>
      </footer>
    </div>
  )
}
