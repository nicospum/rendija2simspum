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
import { C, gamma, HALF_RATE_BETA, OWN_PERIOD, snapshot } from './physics'
import type { Frame } from './physics'
import { initialState, LESSONS, observations, reducer } from './learning'
import Scene from './Scene'

const n = (v: number, digits = 3) =>
  v.toLocaleString('es-AR', { maximumFractionDigits: digits })
const name = (frame: Frame) => (frame === 'nave' ? 'nave' : 'estación')
export default function LightClockApp() {
  const [s, dispatch] = useReducer(reducer, undefined, () =>
    initialState(0, readCompleted('reloj-de-luz')),
  )
  const [activeView, setActiveView] = useState<Frame>('estacion')
  const [guide, setGuide] = useState(true)
  const [visible, setVisible] = useState(!document.hidden)
  useChapterProgress('reloj-de-luz', s.completed)
  useEffect(() => {
    const visibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', visibility)
    return () => document.removeEventListener('visibilitychange', visibility)
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
  const lesson = LESSONS[s.index],
    done = s.completed.includes(s.index)
  const other: Frame = s.setup.follow === 'nave' ? 'estacion' : 'nave'
  const g = gamma(s.setup.beta),
    moving = snapshot(s.setup, other)
  const start = (index: number) => dispatch({ type: 'lesson', index })
  const nextDiscovery = () => {
    start((s.index + 1) % 4)
    requestAnimationFrame(() => {
      document
        .getElementById('rl-challenges')
        ?.scrollIntoView({ behavior: 'instant', block: 'start' })
      document.getElementById('rl-question')?.focus({ preventScroll: true })
    })
  }
  const beta = (value: number) => dispatch({ type: 'beta', value })
  const fraction = (value: number) => dispatch({ type: 'fraction', value })
  const checked = observations(s)
  return (
    <div className="en-lab rl-shell">
      <a href="#rl-controls" className="rl-skip">
        Ir a los controles
      </a>
      <header className="rl-header">
        <a href="/" className="rl-brand">
          ∿ SPUM <small>EXPERIMENTOS</small>
        </a>
        <a href="/einstein/">Especial Einstein ↗</a>
      </header>
      <main>
        <EinsteinNavigation />
        <section className="rl-intro">
          <div>
            <p className="rl-eyebrow">LABORATORIO 08 / RELATIVIDAD ESPECIAL</p>
            <h1>
              El reloj
              <br />
              <em>de luz.</em>
            </h1>
          </div>
          <div>
            <p className="rl-eyebrow">DOS MIRADAS. UNA MISMA LUZ.</p>
            <h2>
              ¿Un segundo dura <br />
              lo mismo para todos?
            </h2>
            <p>
              Un pulso rebota entre dos espejos. Cambiá la velocidad, seguí su
              camino y descubrí cómo dos sistemas miden tiempos diferentes para
              el mismo tic.
            </p>
            <a href="#rl-challenges">Empezar con una predicción ↓</a>
          </div>
        </section>
        <LabNavigation
          links={[
            ['Las vistas', '#rl-views'],
            ['Controles', '#rl-controls'],
            ['Retos', '#rl-challenges'],
            ['Por qué', '#rl-science'],
          ]}
        />
        <LabMission
          index={s.index}
          title={lesson.title}
          instruction={lesson.hint}
          href="#rl-challenges"
          result={
            done
              ? 'Reto completado. Seguí explorando o pasá al siguiente.'
              : undefined
          }
          onNext={done ? () => start((s.index + 1) % 4) : undefined}
        />
        <section
          className="rl-observatory"
          id="rl-views"
          aria-label="Dos sistemas para el mismo pulso"
        >
          <div className="rl-observatory-heading">
            <div>
              <p className="rl-eyebrow">
                MISMO PULSO / DOS SISTEMAS INERCIALES
              </p>
              <h2>Seguí un tic.</h2>
            </div>
            <span className="rl-state">
              {s.playing
                ? 'EN MARCHA'
                : s.setup.fraction === 1
                  ? 'TIC COMPLETO'
                  : 'PAUSADO · PODÉS EXPLORAR'}
            </span>
          </div>
          <div
            className="rl-mobile-views"
            role="group"
            aria-label="Elegir vista en celular"
          >
            {(['nave', 'estacion'] as const).map((frame) => (
              <button
                key={frame}
                aria-pressed={activeView === frame}
                onClick={() => setActiveView(frame)}
              >
                Desde la {name(frame)}
              </button>
            ))}
          </div>
          <div className="rl-views">
            {(['nave', 'estacion'] as const).map((frame, i) => (
              <article
                key={frame}
                className={`rl-frame rl-${frame}`}
                data-active={activeView === frame}
              >
                <div className="rl-frame-heading">
                  <div>
                    <span>
                      0{i + 1} / SISTEMA {frame === 'nave' ? 'N′' : 'E'}
                    </span>
                    <h3>Desde la {name(frame)}</h3>
                  </div>
                  <b>
                    {frame === s.setup.follow
                      ? 'RELOJ EN REPOSO'
                      : s.setup.beta === 0
                        ? 'SIN MOVIMIENTO'
                        : 'RELOJ EN MOVIMIENTO'}
                  </b>
                </div>
                <Scene setup={s.setup} frame={frame} guide={guide} />
              </article>
            ))}
          </div>
          <div
            className="rl-comparison"
            aria-live={s.playing ? 'off' : 'polite'}
          >
            <div>
              <span>
                Reloj seguido · {name(s.setup.follow)}{' '}
                <Info name="Tiempo propio">
                  Es el tiempo que acumula el reloj entre emisión y regreso del
                  pulso al mismo espejo. Un tic se cuenta solo al completar la
                  ida y vuelta. No contamos el reflejo superior como otro tic.
                </Info>
              </span>
              <strong>
                {n(s.setup.fraction * OWN_PERIOD * 1e6)}{' '}
                <small>µs propios</small>
              </strong>
            </div>
            <div>
              <span>
                Tiempo en la {name(other)}{' '}
                <Info name="Tiempo asignado">
                  La emisión y el regreso ocurren en posiciones diferentes en
                  este sistema. El tiempo se asigna con una red de relojes
                  sincronizados en ese sistema; no es el retraso de una imagen
                  que llega a un observador.
                </Info>
              </span>
              <strong>
                {n(moving.point.t * 1e6)} <small>µs asignados</small>
              </strong>
            </div>
            <div>
              <span>
                Ritmo móvil{' '}
                <Info name="Ritmo del reloj móvil">
                  Por cada unidad de tiempo del sistema donde el reloj se mueve,
                  su reloj propio acumula 1/γ = √(1 − v²/c²). Este cociente no
                  cambia al adelantar el pulso. No es una comparación de edades
                  al reunirse.
                </Info>
              </span>
              <strong>
                {n(100 / g, 1)} <small>%</small>
              </strong>
              <div className="rl-rate-track">
                <span style={{ width: `${100 / g}%` }} />
              </div>
            </div>
          </div>
          <p className="rl-map-note">
            Seguimos el mismo evento del pulso en ambos paneles. Son diagramas
            de coordenadas, con encuadre automático y la misma escala espacial
            entre paneles; no fotografías. Un tic = una ida y vuelta.{' '}
            <Info name="Leer las dos vistas">
              El pulso, la emisión, el reflejo y el regreso se relacionan
              mediante transformaciones de Lorentz. Cada sistema asigna su
              propio tiempo al evento. Las líneas punteadas muestran el
              recorrido calculado del tic completo. Cian y dorado identifican
              los sistemas: es el mismo pulso. El dibujo ajusta el encuadre al
              cambiar la velocidad, sin modificar la distancia de 150 m entre
              espejos.
            </Info>
          </p>
        </section>
        <section
          className="rl-controls"
          id="rl-controls"
          aria-labelledby="rl-controls-title"
        >
          <div className="rl-section-heading">
            <div>
              <p className="rl-eyebrow">TU PRUEBA / UNA VARIABLE POR VEZ</p>
              <h2 id="rl-controls-title">Hacé que cambie.</h2>
            </div>
            <a href="#rl-views">Ver las dos lecturas ↑</a>
          </div>
          <ChallengeGuide
            index={s.index}
            title={lesson.title}
            prediction={s.prediction === null ? undefined : lesson.choices[s.prediction]}
            steps={lesson.steps.map((label, i) => ({ label, done: checked[i] }))}
            saved={done}
            challengeHref="#rl-challenges"
            viewHref="#rl-views"
            help="c es la velocidad de la luz en el vacío: 0,6 c significa el 60 % de esa velocidad. Un µs es una millonésima de segundo. Cambiar velocidad o reloj seguido reinicia el pulso; después completá otro tic."
          />
          <div className="rl-control-grid">
            <div className="rl-control-card">
              <div className="rl-control-label">
                <label htmlFor="rl-beta">Velocidad relativa</label>
                <output>{n(s.setup.beta, 4)} c</output>
              </div>
              <input
                id="rl-beta"
                type="range"
                min="0"
                max="0.95"
                step="0.001"
                value={s.setup.beta}
                aria-valuetext={`${n(s.setup.beta * 100, 2)} por ciento de c`}
                onChange={(e) => beta(Number(e.target.value))}
              />
              <div className="rl-range-ends">
                <span>0 · juntos</span>
                <span>0,95 c</span>
              </div>
              <div className="rl-presets">
                {[0, 0.6, 0.8, HALF_RATE_BETA].map((v) => (
                  <button key={v} onClick={() => beta(v)}>
                    {v === HALF_RATE_BETA ? '≈ 0,866 c' : `${n(v, 1)} c`}
                  </button>
                ))}
              </div>
              <p>
                {n((s.setup.beta * C) / 1000, 0)} km/s · γ = {n(g)}. Cambiar
                velocidad prepara un ensayo nuevo: no simulamos la aceleración.
              </p>
            </div>
            <div className="rl-control-card">
              <fieldset>
                <legend>Reloj que seguimos</legend>
                <div className="rl-follow">
                  {(['nave', 'estacion'] as const).map((frame) => (
                    <button
                      key={frame}
                      aria-pressed={s.setup.follow === frame}
                      onClick={() => dispatch({ type: 'follow', frame })}
                    >
                      {frame === 'nave' ? 'Nave' : 'Estación'}
                    </button>
                  ))}
                </div>
              </fieldset>
              <p>
                Seguí el otro reloj desde el encuentro inicial. Cambia el par de
                sucesos comparados; ninguno de los dos sistemas tiene prioridad.
              </p>
              <label className="rl-check">
                <input
                  type="checkbox"
                  checked={guide}
                  onChange={(e) => setGuide(e.target.checked)}
                />{' '}
                Mostrar guía del tic completo
              </label>
            </div>
            <div className="rl-control-card rl-time-control">
              <div className="rl-control-label">
                <label htmlFor="rl-fraction">Recorrido del pulso</label>
                <output>{n(s.setup.fraction * 100, 0)} %</output>
              </div>
              <input
                id="rl-fraction"
                type="range"
                min="0"
                max="1"
                step="0.005"
                value={s.setup.fraction}
                onChange={(e) => fraction(Number(e.target.value))}
              />
              <div className="rl-range-ends">
                <span>Emisión · 0</span>
                <span>Reflejo · ½</span>
                <span>Regreso · 1 tic</span>
              </div>
              <div className="rl-transport">
                <button
                  className="rl-primary"
                  onClick={() => dispatch({ type: 'play' })}
                >
                  {s.playing
                    ? 'Pausar pulso'
                    : s.setup.fraction === 1
                      ? 'Repetir recorrido'
                      : 'Iniciar pulso'}
                </button>
                <button
                  onClick={() => fraction(Math.min(1, s.setup.fraction + 0.1))}
                >
                  Avanzar un paso
                </button>
                <button onClick={() => fraction(0.5)}>Ir al reflejo</button>
                <button onClick={() => fraction(1)}>Completar este tic</button>
                <button onClick={() => fraction(0)}>Volver al encuentro</button>
              </div>
              <p>
                {s.setup.fraction === 0
                  ? 'Los relojes parten de cero en el encuentro.'
                  : s.setup.fraction < 0.5
                    ? 'La luz va hacia el espejo superior.'
                    : s.setup.fraction < 1
                      ? 'Ya se reflejó: está volviendo al espejo emisor.'
                      : 'La luz regresó al emisor: se completó un tic.'}{' '}
                Movimiento muy ralentizado; tiempos físicos en microsegundos.
                Arranca pausado y podés explorar todo sin reproducir.
              </p>
            </div>
          </div>
          <div className="rl-impact">
            <span>PARA EL TIC COMPLETO</span>
            <p>
              {n(2 * 150, 0)} m / c = <b>{n(OWN_PERIOD * 1e6)} µs</b> propios{' '}
              <span>→</span> {n(moving.pathLength, 1)} m / c ={' '}
              <b>{n(moving.period * 1e6)} µs</b> en la {name(other)}.
            </p>
            <p>
              {s.setup.beta === 0
                ? 'Sin movimiento relativo, ambas cuentas coinciden.'
                : `El camino es ×${n(g)} más largo y el intervalo también. La luz conserva c en ambos sistemas.`}
            </p>
            <a href="#rl-views">Ver cómo cambió el camino ↑</a>
          </div>
        </section>
        <section
          className="rl-challenges"
          id="rl-challenges"
          aria-labelledby="rl-challenges-title"
        >
          <div className="rl-section-heading">
            <div>
              <p className="rl-eyebrow">PREDECIR / PROBAR / EXPLICAR</p>
              <h2 id="rl-challenges-title">
                Cuatro tics para cambiar de idea.
              </h2>
            </div>
            <span>{s.completed.length} / 4 descubrimientos</span>
          </div>
          <div
            className="rl-lessons"
            role="group"
            aria-label="Elegir reto educativo"
          >
            {LESSONS.map((l, i) => (
              <button
                key={l.title}
                aria-pressed={s.index === i}
                onClick={() => start(i)}
              >
                <span>{s.completed.includes(i) ? '✓' : `0${i + 1}`}</span>
                {l.title}
              </button>
            ))}
          </div>
          <div className="rl-challenge-body">
            <div>
              <p className="rl-eyebrow">RETO {s.index + 1} / 4</p>
              <h3 id="rl-question" tabIndex={-1}>
                {lesson.question}
              </h3>
              <fieldset className="rl-predictions">
                <legend>Tu predicción</legend>
                {lesson.choices.map((choice, i) => (
                  <label key={choice}>
                    <input
                      type="radio"
                      name="rl-prediction"
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
              <p>{lesson.hint}</p>
              <ul className="rl-observation-list">
                {lesson.steps.map((step, i) => (
                  <li key={step}>
                    {checked[i] ? '✓' : '○'} {step}
                  </li>
                ))}
              </ul>
              <div className="rl-challenge-actions">
                <a href="#rl-controls">Ir a los controles ↑</a>
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
                <button className="rl-next" onClick={nextDiscovery}>
                  {s.index === 3
                    ? 'Volver al primer reto ↻'
                    : 'Siguiente descubrimiento →'}
                </button>
              )}
            </div>
          </div>
        </section>
        <section className="rl-science" id="rl-science">
          <div>
            <p className="rl-eyebrow">POR QUÉ CAMBIÓ NUESTRA IDEA DEL TIEMPO</p>
            <h2>
              La luz pone
              <br />
              <em>las reglas.</em>
            </h2>
            <p>
              Einstein tomó en serio dos ideas: las leyes físicas son las mismas
              para todos los sistemas inerciales, y la luz en vacío tiene la
              misma velocidad c. Para conservar ambas, espacio y tiempo tienen
              que relacionarse de otra manera.
            </p>
            <p>
              El reloj de luz hace visible esa relación. La dilatación temporal
              afecta a cualquier reloj ideal y a los procesos que lo acompañan;
              no es una falla de los espejos ni una ilusión de la vista.
            </p>
            <a
              href="https://www.einstein-online.info/en/spotlight/light-clocks-time-dilation/"
              target="_blank"
              rel="noreferrer"
            >
              Einstein Online: del reloj de luz a la dilatación temporal ↗
            </a>
          </div>
          <div>
            <details open>
              <summary>La fórmula sale del recorrido</summary>
              <p>
                En reposo, Δτ = 2L/c. Para media vuelta vista desde el otro
                sistema, el camino diagonal cumple (cΔt/2)² = L² + (vΔt/2)².
              </p>
              <div className="rl-formula">
                Δt = γ Δτ <span>γ = 1 / √(1 − v²/c²)</span>
              </div>
              <p>
                L = 150 m y c = 299.792.458 m/s. γ multiplica tanto el intervalo
                como la distancia que recorre la luz en ese sistema. El ritmo
                del reloj móvil es 1/γ.
              </p>
            </details>
            <details>
              <summary>¿Cómo pueden ambos medir más lento al otro?</summary>
              <p>
                Cada sistema sincroniza sus relojes y define sus propios sucesos
                simultáneos. Seguir el reloj de la nave y seguir el de la
                estación compara pares de sucesos diferentes. No estamos
                reuniendo ambos relojes después de un viaje.
              </p>
              <a
                href="https://www.einstein-online.info/en/spotlight/dialectic/"
                target="_blank"
                rel="noreferrer"
              >
                Einstein Online: la reciprocidad ↗
              </a>
            </details>
            <details>
              <summary>Qué calcula y qué representa el dibujo</summary>
              <p>
                Trayectorias analíticas y transformaciones de Lorentz en
                espacio-tiempo plano. Los espejos ideales tienen separación
                transversal fija y no hay gravedad, aceleración ni retraso
                óptico hasta una cámara. El intervalo en el sistema donde se
                mueve el reloj usa relojes sincronizados en posiciones
                diferentes. Las dos vistas coinciden en el evento seguido y
                representan sus respectivos cortes de simultaneidad.
              </p>
              <p>
                Colores, halo y ralentización ayudan a leer el modelo. El
                encuadre se ajusta a la velocidad; la regla indica su escala.
                Nada se acelera por encima de c. Avanzar manualmente selecciona
                un estado, sin cambiar las leyes físicas.
              </p>
            </details>
          </div>
        </section>
        <section className="rl-continue">
          <p className="rl-eyebrow">EL RECORRIDO EINSTEIN EMPIEZA ACÁ</p>
          <h2>Ahora, ¿qué significa “al mismo tiempo”?</h2>
          <p>
            Seguí con el tren de Einstein: compará fechas de destellos, seguí sus señales y descubrí por qué medir una longitud exige elegir sucesos simultáneos.
          </p>
          <div>
            <a href="/tren-de-einstein/">Seguir con el tren de Einstein →</a>
            <a href="/einstein/">Ver el especial Einstein →</a>
            <a href="/horizonte/">Comparar relojes cerca de un horizonte ↗</a>
          </div>
        </section>
        <EinsteinNavigation footer />
        <MoreLabs current="reloj-de-luz" />
      </main>
      <footer className="rl-footer">
        <a href="/">∿ SPUM / EXPERIMENTOS</a>
        <span>Una pregunta cambia tu punto de vista.</span>
      </footer>
    </div>
  )
}
