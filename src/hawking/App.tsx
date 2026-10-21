import { useEffect, useId, useReducer, useState } from 'react'
import Horizon from './Horizon'
import Spectrum from './Spectrum'
import LiveImpact from './LiveImpact'
import EntropyExplorer from './EntropyExplorer'
import { factor, impact } from './impact'
import { BALANCE_MASS, CMB, MAX_AGE, SOLAR_MASS, YEAR, scientific } from './physics'
import { initialState, LESSONS, lessonStatus, reading, reducer } from './learning'
import type { Action } from './learning'
import type { Dispatch, ReactNode } from 'react'

function Arrow() {
  return <span aria-hidden="true">↗</span>
}
function Tip({ name, children }: { name: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <span
      className="hk-tip"
      data-open={open}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        aria-label={`Información: ${name}`}
        aria-expanded={open}
        aria-controls={id}
        aria-describedby={id}
        onClick={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
        }}
      >
        ?
      </button>
      <span id={id} role="tooltip">
        {children}
      </span>
    </span>
  )
}
function useMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [visible, setVisible] = useState(!document.hidden)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    const visibility = () => setVisible(!document.hidden)
    query.addEventListener('change', update)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      query.removeEventListener('change', update)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [])
  return { reduced, visible }
}
function useClock(running: boolean, dispatch: Dispatch<Action>) {
  useEffect(() => {
    if (!running) return
    let frame = 0,
      previous = 0
    const resetTime = () => {
      previous = 0
    }
    document.addEventListener('visibilitychange', resetTime)
    const tick = (now: number) => {
      if (document.hidden) previous = 0
      else if (!previous) previous = now
      else if (now - previous >= 80) {
        dispatch({ type: 'step', seconds: (now - previous) / 1000 })
        previous = now
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', resetTime)
    }
  }, [running, dispatch])
}

export default function HawkingApp() {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState())
  const [motion, setMotion] = useState(true)
  const { reduced, visible } = useMotion()
  useClock(state.running, dispatch)
  const current = reading(state),
    reference = reading(state.reference),
    initial = reading({ ...state, age: 0 })
  const lesson = LESSONS.find((item) => item.id === state.lesson)!
  const status = lessonStatus(state)
  const ratio = current.massKg / reference.massKg
  const effect = impact(state, state.reference)
  const [sceneInfo, setSceneInfo] = useState(false)
  const ratios =
    state.lesson === 'time'
      ? [
          {
            name: 'Masa restante',
            value: ratio,
            ref: reference.massKg,
            now: current.massKg,
            unit: 'kg',
          },
          {
            name: 'Temperatura',
            value: current.temperatureK / reference.temperatureK,
            ref: reference.temperatureK,
            now: current.temperatureK,
            unit: 'K',
          },
          { name: 'Radio', value: ratio, ref: reference.radiusM, now: current.radiusM, unit: 'm' },
          {
            name: 'Potencia emitida ideal',
            value: current.powerW / reference.powerW,
            ref: reference.powerW,
            now: current.powerW,
            unit: 'W',
          },
        ]
      : [
          {
            name: 'Radio',
            value: current.radiusM / reference.radiusM,
            ref: reference.radiusM,
            now: current.radiusM,
            unit: 'm',
          },
          {
            name: 'Temperatura',
            value: current.temperatureK / reference.temperatureK,
            ref: reference.temperatureK,
            now: current.temperatureK,
            unit: 'K',
          },
          {
            name: 'Área',
            value: current.areaM2 / reference.areaM2,
            ref: reference.areaM2,
            now: current.areaM2,
            unit: 'm²',
          },
          {
            name: 'Entropía S/kB',
            value: current.entropyOverK / reference.entropyOverK,
            ref: reference.entropyOverK,
            now: current.entropyOverK,
            unit: '',
          },
        ]
  return (
    <div className="hk-shell">
      <a className="hk-skip" href="#hk-controls">
        Ir a los controles
      </a>
      <header className="hk-header">
        <a href="/" className="hk-brand" aria-label="SPUM, todos los laboratorios">
          <span aria-hidden="true">∿</span> SPUM <small>EXPERIMENTOS</small>
        </a>
        <nav aria-label="Navegación del laboratorio">
          <a href="#hk-challenges">Los retos</a>
          <a href="#hk-discovery">La gran idea</a>
          <a href="/">
            Todos los labs <Arrow />
          </a>
        </nav>
      </header>
      <main>
        <section className="hk-intro">
          <div>
            <p className="hk-eyebrow">
              <span className="hk-dot" /> LABORATORIO 03 / AGUJEROS NEGROS
            </p>
            <h1>
              Hasta la oscuridad
              <br />
              <em>tiene temperatura.</em>
            </h1>
          </div>
          <div className="hk-intro-copy">
            <p>Radiación de Hawking</p>
            <h2>
              ¿Qué pasa cuando un agujero negro
              <br className="hk-wide-break" /> empieza a perder masa?
            </h2>
            <p>
              Cambiá su masa. Adelantá el tiempo. Descubrí la conexión entre gravedad, calor y
              física cuántica.
            </p>
            <a href="#hk-challenges">
              Empezar con una pregunta <Arrow />
            </a>
          </div>
        </section>
        <div className="hk-model-banner">
          <span>MODELO TEÓRICO</span>
          <p>
            Schwarzschild: sin rotación ni carga. Temperatura semiclásica; potencia y evolución con
            fotones ideales. <a href="#hk-limits">Ver alcance ↓</a>
          </p>
        </div>

        <div className="hk-workspace">
          <section className="hk-observatory" id="hk-view" aria-label="Visor del agujero negro">
            <div className="hk-scene">
              <Horizon
                ratio={ratio}
                bath={state.environment === 'cmb'}
                moving={motion && !reduced && visible}
                emission={effect.emissionSignal}
                absorption={effect.absorptionSignal}
              />
              <div className="hk-scene-top">
                <span>
                  <i /> HORIZONTE DE SUCESOS
                </span>
                <button
                  onClick={() => setMotion(!motion)}
                  aria-pressed={!motion}
                  disabled={reduced}
                >
                  {reduced ? 'Movimiento reducido' : motion ? 'Pausar visual' : 'Animar visual'}
                </button>
              </div>
              <div className="hk-scene-label">
                <span>SCHWARZSCHILD</span>
                <strong>{scientific(current.massKg, 'kg')}</strong>
                <small>{scientific(current.massKg / SOLAR_MASS)} masas solares nominales</small>
              </div>
              <button
                className="hk-horizon-info"
                aria-expanded={sceneInfo}
                onClick={() => setSceneInfo(!sceneInfo)}
              >
                ¿Qué estoy viendo? <span aria-hidden="true">{sceneInfo ? '−' : '+'}</span>
              </button>
              {sceneInfo && (
                <div className="hk-scene-explainer">
                  El disco oscuro marca el horizonte. El borde dorado y los puntos son símbolos de
                  la emisión; no son una foto, una temperatura visible ni trayectorias de
                  partículas. Ninguna señal sale del interior. La trama es ilustrativa, no un
                  cálculo de lente gravitatoria. El brillo y la velocidad de los marcadores se
                  amplifican a partir de la potencia relativa a la referencia; no representan
                  fotones individuales ni velocidades físicas.
                </div>
              )}
              <div className="hk-scene-key">
                <span>
                  <i />
                  Emisión
                </span>
                {state.environment === 'cmb' && (
                  <span>
                    <i />
                    Entorno entrante
                  </span>
                )}
                <span>Potencia relativa · señal visual amplificada</span>
              </div>
            </div>
            <div className="hk-measurements">
              <div>
                <span>
                  Temperatura{' '}
                  <Tip name="Temperatura">
                    T = ℏc³/(8πGMkB). Al duplicar la masa, se reduce a la mitad. Se refiere a un
                    observador lejano.
                  </Tip>
                </span>
                <strong>{scientific(current.temperatureK, 'K')}</strong>
                <small>T ∝ 1/M</small>
              </div>
              <div>
                <span>
                  Radio del horizonte{' '}
                  <Tip name="Radio">
                    rₛ = 2GM/c². La esfera del horizonte crece con la masa. No es una superficie
                    material.
                  </Tip>
                </span>
                <strong>{scientific(current.radiusM, 'm')}</strong>
                <small>rₛ ∝ M</small>
              </div>
              <div>
                <span>
                  Potencia emitida ideal{' '}
                  <Tip name="Potencia ideal">
                    P = ℏc⁶/(15360πG²M²). Aproximación de cuerpo negro con área del horizonte, solo
                    fotones; omite cuerpo gris y otras partículas.
                  </Tip>
                </span>
                <strong>{scientific(current.powerW, 'W')}</strong>
                <small>Pideal ∝ 1/M²</small>
              </div>
              <div className={current.netW < 0 ? 'hk-absorbing' : ''}>
                <span>
                  Potencia neta ideal{' '}
                  <Tip name="Balance de energía">
                    Emitida − absorbida. Positiva: pierde masa. Negativa: gana masa. El baño usa la
                    misma emisividad y absorptividad ideales.
                  </Tip>
                </span>
                <strong>{scientific(current.netW, 'W')}</strong>
                <small>
                  {current.netW < 0 ? 'Absorbe más: gana masa' : 'Emite más: pierde masa'}
                </small>
              </div>
            </div>
            <LiveImpact setup={state} baseline={state.reference} running={state.running} />
          </section>

          <aside className="hk-controls" id="hk-controls" aria-labelledby="hk-controls-title">
            <div className="hk-panel-heading">
              <div>
                <p className="hk-eyebrow">TU UNIVERSO, TUS VARIABLES</p>
                <h2 id="hk-controls-title">Explorá el modelo</h2>
              </div>
              <span className="hk-control-icon" aria-hidden="true">
                ⊹
              </span>
            </div>
            <div
              className={`hk-control-group ${state.lesson === 'mass' || state.lesson === 'entropy' ? 'hk-highlight' : ''}`}
            >
              <label htmlFor="hk-mass">
                Masa inicial <output>{scientific(state.mass, 'kg')}</output>
              </label>
              <input
                id="hk-mass"
                type="range"
                min="9"
                max="40"
                step="0.01"
                value={Math.log10(state.mass)}
                aria-valuetext={scientific(state.mass, 'kilogramos')}
                onChange={(e) => dispatch({ type: 'mass', mass: 10 ** Number(e.target.value) })}
              />
              <div className="hk-range-ends">
                <span>10⁹ kg</span>
                <span>10⁴⁰ kg · escala logarítmica</span>
              </div>
              <p>
                Menos masa → más temperatura. El deslizador recorre órdenes de magnitud; los botones
                permiten comparar cambios pequeños.
              </p>
              <div className="hk-mass-steps">
                <button onClick={() => dispatch({ type: 'mass', mass: state.mass / 2 })}>
                  Masa ÷2
                </button>
                <button onClick={() => dispatch({ type: 'mass', mass: state.mass * 2 })}>
                  Masa ×2
                </button>
              </div>
              <p className="hk-control-response">
                Respecto de la referencia: temperatura <strong>{factor(effect.temperature)}</strong>{' '}
                · potencia <strong>{factor(effect.power)}</strong>.
              </p>
              <a className="hk-effect-jump" href="#hk-impact-title">
                Ver el efecto y comparar ↑
              </a>
              <div className="hk-presets">
                <button onClick={() => dispatch({ type: 'mass', mass: 1e12 })}>
                  10¹² kg hipotético
                </button>
                <button onClick={() => dispatch({ type: 'mass', mass: SOLAR_MASS })}>
                  1 masa solar
                </button>
              </div>
            </div>
            <fieldset
              className={`hk-control-group ${state.lesson === 'bath' ? 'hk-highlight' : ''}`}
            >
              <legend>Entorno térmico</legend>
              <div className="hk-segmented">
                <button
                  aria-pressed={state.environment === 'vacuum'}
                  onClick={() => dispatch({ type: 'environment', environment: 'vacuum' })}
                >
                  Vacío ideal <small>0 K</small>
                </button>
                <button
                  aria-pressed={state.environment === 'cmb'}
                  onClick={() => dispatch({ type: 'environment', environment: 'cmb' })}
                >
                  Fondo cósmico{' '}
                  <small>{CMB.toLocaleString('es-AR', { maximumFractionDigits: 4 })} K</small>
                </button>
              </div>
              <p>
                {state.environment === 'vacuum'
                  ? 'Sin energía entrante: toda la potencia emitida resta masa.'
                  : 'Comparamos emisión y absorción instantáneas. El reloj queda desactivado: la fórmula de vacío no sirve para un baño térmico.'}
              </p>
              <p className="hk-control-response">
                <strong>
                  {current.netW < 0
                    ? 'Gana energía: domina la absorción azul.'
                    : 'Pierde energía: domina la emisión dorada.'}
                </strong>{' '}
                La temperatura de Hawking no cambia al activar el fondo.
              </p>
            </fieldset>
            <div className={`hk-control-group ${state.lesson === 'time' ? 'hk-highlight' : ''}`}>
              <label htmlFor="hk-age">
                Tiempo transcurrido{' '}
                <output>{(state.age * 100).toFixed(1).replace('.', ',')} % de τ₀</output>
              </label>
              <input
                id="hk-age"
                type="range"
                min="0"
                max={MAX_AGE}
                step="0.005"
                value={state.age}
                disabled={state.environment !== 'vacuum'}
                aria-valuetext={`${(state.age * 100).toFixed(1)} por ciento de la vida ideal inicial`}
                onChange={(e) => dispatch({ type: 'age', age: Number(e.target.value) })}
              />
              <div className="hk-clock">
                <button
                  className="hk-button"
                  onClick={() => dispatch({ type: 'running' })}
                  disabled={state.environment !== 'vacuum' || state.age >= MAX_AGE}
                >
                  {state.running ? 'Ⅱ Pausar reloj' : '▷ Avanzar tiempo'}
                </button>
                <label>
                  Velocidad
                  <select
                    aria-label="Velocidad del reloj"
                    value={state.speed}
                    disabled={state.environment !== 'vacuum'}
                    onChange={(e) => dispatch({ type: 'speed', speed: Number(e.target.value) })}
                  >
                    <option value="0.005">0,5 % τ₀/s</option>
                    <option value="0.025">2,5 % τ₀/s</option>
                    <option value="0.1">10 % τ₀/s</option>
                  </select>
                </label>
              </div>
              <p>
                {state.environment === 'vacuum' ? (
                  <>
                    τ₀ ideal: <strong>{scientific(initial.lifetimeS / YEAR, 'años')}</strong>.
                    Transcurrido: {scientific((state.age * initial.lifetimeS) / YEAR, 'años')}. El
                    reloj comprime escalas enormes.
                  </>
                ) : (
                  'Balance instantáneo con el fondo cósmico. No se integra la evolución en este entorno.'
                )}
              </p>
              {state.age >= MAX_AGE && (
                <p className="hk-stop-note">
                  Límite del recorrido: 95 % de τ₀. El modelo no describe el final de la
                  evaporación.
                </p>
              )}
              {state.environment === 'vacuum' && (
                <p className="hk-control-response">
                  Desde t = 0: masa <strong>{factor(current.massKg / initial.massKg)}</strong> ·
                  temperatura <strong>{factor(current.temperatureK / initial.temperatureK)}</strong>{' '}
                  · potencia <strong>{factor(current.powerW / initial.powerW)}</strong>.
                </p>
              )}
            </div>
            <button className="hk-reset" onClick={() => dispatch({ type: 'restore' })}>
              ↺ Restaurar referencia del reto
            </button>
            <a className="hk-controls-link" href="#hk-challenges">
              Seguí los cuatro retos ↓
            </a>
          </aside>
        </div>

        <section id="hk-challenges" className="hk-challenges" aria-labelledby="hk-challenges-title">
          <div className="hk-panel-heading">
            <div>
              <p className="hk-eyebrow">CAMBIAR · COMPARAR · ENTENDER</p>
              <h2 id="hk-challenges-title">Cuatro preguntas a la oscuridad.</h2>
            </div>
            <span className="hk-progress">{state.completed.length} / 4 explorados</span>
          </div>
          <div className="hk-lesson-nav" aria-label="Elegir reto">
            {LESSONS.map((item, i) => (
              <button
                key={item.id}
                aria-pressed={state.lesson === item.id}
                onClick={() => dispatch({ type: 'lesson', id: item.id })}
              >
                <span>{state.completed.includes(item.id) ? '✓' : `0${i + 1}`}</span>
                {item.short}
              </button>
            ))}
          </div>
          <div className="hk-lesson-body">
            <div className="hk-lesson-prompt">
              <p className="hk-eyebrow">PRIMERO, TU PREDICCIÓN</p>
              <h3>{lesson.title}</h3>
              <p>{lesson.question}</p>
              <div className="hk-predictions">
                {lesson.choices.map((choice, index) => (
                  <button
                    key={choice}
                    aria-pressed={state.prediction === index}
                    onClick={() => dispatch({ type: 'predict', choice: index })}
                  >
                    {choice}
                  </button>
                ))}
              </div>
              <div className="hk-lesson-actions">
                <button className="hk-button hk-primary" onClick={() => dispatch({ type: 'try' })}>
                  {lesson.action} <Arrow />
                </button>
                <button className="hk-reset" onClick={() => dispatch({ type: 'restore' })}>
                  Restaurar
                </button>
              </div>
              <p className="hk-footnote">{lesson.hint}</p>
            </div>
            <div
              className="hk-lesson-result"
              aria-live={state.running ? 'off' : 'polite'}
              aria-atomic="true"
            >
              <span className={`hk-feedback-label hk-${status}`}>
                {status === 'observed'
                  ? 'CAMBIO EXPLORADO'
                  : status === 'changed'
                    ? effect.isolated
                      ? 'EXPLORACIÓN DE UNA VARIABLE'
                      : 'REVISÁ LA COMPARACIÓN'
                    : 'REFERENCIA PREPARADA'}
              </span>
              <h3>
                {status === 'observed'
                  ? state.prediction === null
                    ? 'Esto predice el modelo.'
                    : state.prediction === lesson.answer
                      ? 'Tu predicción coincide con el modelo.'
                      : 'El resultado invita a cambiar de idea.'
                  : status === 'changed'
                    ? effect.isolated
                      ? 'Seguí explorando esa relación.'
                      : 'Aislá la variable del reto.'
                    : '¿Qué esperás que cambie?'}
              </h3>
              <p>
                {status === 'observed'
                  ? lesson.meaning
                  : status === 'changed'
                    ? effect.isolated
                      ? effect.explanation
                      : 'Cambiaste varias condiciones. Restaurá la referencia o usá el botón del reto para comparar una sola variable.'
                    : 'La referencia ya está guardada. Elegí una predicción y probá el cambio; después compará las medidas calculadas.'}
              </p>
              {state.lesson === 'bath' ? (
                <div className="hk-balance-result">
                  <span>
                    Emitida <strong>{scientific(current.powerW, 'W')}</strong>
                  </span>
                  <span>
                    Absorbida <strong>{scientific(current.absorbedW, 'W')}</strong>
                  </span>
                  <span>
                    Neta (emitida − absorbida) <strong>{scientific(current.netW, 'W')}</strong>
                  </span>
                  <small>
                    Referencia en vacío: {scientific(reference.netW, 'W')}. Masa conservada al
                    cambiar el entorno.
                  </small>
                </div>
              ) : (
                <div className="hk-ratio-grid">
                  {ratios.map((item) => (
                    <div key={item.name}>
                      <span>{item.name}</span>
                      <strong>{factor(item.value)}</strong>
                      <small>
                        {scientific(item.ref, item.unit)} → {scientific(item.now, item.unit)}
                      </small>
                    </div>
                  ))}
                </div>
              )}
              <a href="#hk-view">Ver el horizonte y los controles ↑</a>
            </div>
          </div>
          <p className="hk-comparison-note">
            Elegir un reto prepara su propia referencia y pausa el reloj. Explorar una relación del
            modelo no equivale a comprobarla experimentalmente.
          </p>
        </section>

        <EntropyExplorer
          setup={state}
          baseline={state.reference}
          onDouble={() => {
            dispatch({ type: 'lesson', id: 'entropy' })
            dispatch({ type: 'try' })
          }}
          onRestore={() => dispatch({ type: 'restore' })}
        />

        <div className="hk-analysis-grid">
          <Spectrum current={current} reference={reference} />
          <aside className="hk-context">
            <p className="hk-eyebrow">PONER LAS ESCALAS EN CONTEXTO</p>
            <h2>
              Un frío casi imposible
              <br />
              de escuchar.
            </h2>
            <p>
              Con una masa solar, T es apenas{' '}
              <strong>
                {scientific(
                  reading({ mass: SOLAR_MASS, age: 0, environment: 'vacuum' }).temperatureK,
                  'K',
                )}
              </strong>
              . El fondo cósmico está a {CMB.toLocaleString('es-AR', { maximumFractionDigits: 4 })}{' '}
              K: muchísimo más caliente.
            </p>
            <p>
              En el baño ideal, emisión y absorción se equilibran cerca de{' '}
              <strong>{scientific(BALANCE_MASS, 'kg')}</strong>. Ese balance es inestable: perder un
              poco de masa aumenta la temperatura.
            </p>
            <button
              onClick={() => {
                dispatch({ type: 'lesson', id: 'bath' })
                document
                  .getElementById('hk-view')
                  ?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' })
              }}
            >
              Explorar el entorno <Arrow />
            </button>
          </aside>
        </div>

        <section className="hk-discovery" id="hk-discovery" aria-labelledby="hk-discovery-title">
          <div>
            <p className="hk-eyebrow">LA GRAN IDEA / 1973–1975</p>
            <h2 id="hk-discovery-title">
              La gravedad encontró
              <br />
              <em>a la física cuántica.</em>
            </h2>
            <p>
              Un agujero negro clásico solo absorbe. Hawking mostró que los campos cuánticos en una
              geometría con horizonte cambian esa historia: un observador lejano encuentra una
              emisión térmica.
            </p>
            <p>
              La temperatura dio sentido físico a la entropía que Bekenstein había asociado al área
              del horizonte. Gravedad, termodinámica y mecánica cuántica quedaron conectadas.
              Todavía buscamos una descripción completa de la gravedad cuántica.
            </p>
          </div>
          <ol>
            <li>
              <span>1973</span>
              <div>
                <h3>El área cuenta</h3>
                <p>
                  Bekenstein propone una entropía del agujero negro. En este laboratorio: duplicar M
                  multiplica S por cuatro.
                </p>
                <a href="https://doi.org/10.1103/PhysRevD.7.2333" target="_blank" rel="noreferrer">
                  Artículo original <Arrow />
                </a>
              </div>
            </li>
            <li>
              <span>1974–75</span>
              <div>
                <h3>La oscuridad emite</h3>
                <p>
                  Hawking obtiene una temperatura. El resultado surge de campos cuánticos, no de una
                  partícula clásica escapando del interior.
                </p>
                <a href="https://doi.org/10.1007/BF02345020" target="_blank" rel="noreferrer">
                  Cálculo de Hawking <Arrow />
                </a>
              </div>
            </li>
            <li>
              <span>HOY</span>
              <div>
                <h3>Una predicción abierta a prueba</h3>
                <p>
                  Las fuentes consultadas al 20/10/2026 no aportan una detección astronómica
                  confirmada. Los análogos de laboratorio exploran relaciones afines en otros
                  sistemas.
                </p>
                <a
                  href="https://doi.org/10.1038/s41586-019-1241-0"
                  target="_blank"
                  rel="noreferrer"
                >
                  Análogo acústico de 2019 <Arrow />
                </a>
              </div>
            </li>
          </ol>
        </section>

        <section className="hk-limits" id="hk-limits" aria-labelledby="hk-limits-title">
          <div className="hk-panel-heading">
            <div>
              <p className="hk-eyebrow">LA CIENCIA TAMBIÉN DICE HASTA DÓNDE</p>
              <h2 id="hk-limits-title">Qué cuenta esta simulación</h2>
            </div>
          </div>
          <details open>
            <summary>Las ecuaciones y sus límites</summary>
            <div>
              <p>
                <strong>rₛ = 2GM/c² · T = ℏc³/(8πGMkB) · S/kB = A/(4ℓP²).</strong> Schwarzschild,
                sin carga ni rotación, observador lejano, aproximación semiclásica.
              </p>
              <p>
                <strong>Pideal = ℏc⁶/(15360πG²M²)</strong> y <strong>M(t) = M₀(1 − t/τ₀)⅓</strong>,
                con <strong>τ₀ = M₀c²/(3P₀)</strong>. Usamos un cuerpo negro de área A, solo
                fotones. La potencia, el espectro y la vida reales requieren factores de cuerpo gris
                y todas las especies emitidas. En masas pequeñas, otros canales importan mucho. La
                entropía del agujero negro puede disminuir al emitir; la segunda ley generalizada
                considera también la entropía exterior. No se representa el destino final ni se
                resuelve la paradoja de la información.
              </p>
              <p>
                Con entorno: Pneta = Aσ(T⁴ − Tentorno⁴). Se muestra el balance instantáneo, con
                emisividad y absorptividad ideales; no una evolución astrofísica completa. El
                espectro grafica dP/dln(E) = (15P/π⁴)x⁴/(eˣ − 1), con x = E/(kBT).
              </p>
              <a
                href="https://doi.org/10.1140/epjc/s10052-019-7161-1"
                target="_blank"
                rel="noreferrer"
              >
                BlackHawk: emisión con cuerpo gris <Arrow />
              </a>
              <a
                href="https://physics.nist.gov/cuu/Constants/Table/allascii.txt"
                target="_blank"
                rel="noreferrer"
              >
                Constantes NIST, CODATA 2022 <Arrow />
              </a>
            </div>
          </details>
          <details>
            <summary>¿De dónde sale la radiación? ¿Son pares de partículas?</summary>
            <div>
              <p>
                El cálculo relaciona estados de los campos cuánticos para distintos observadores en
                un espacio-tiempo con horizonte. La imagen de un par que se separa puede servir como
                analogía, pero no describe trayectorias observadas ni el mecanismo completo. Una
                antipartícula no tiene masa negativa. Nada de lo dibujado representa una señal que
                escape desde dentro.
              </p>
              <a href="https://doi.org/10.12942/lrr-2001-6" target="_blank" rel="noreferrer">
                Wald: termodinámica de agujeros negros <Arrow />
              </a>
            </div>
          </details>
          <details>
            <summary>¿Hay experimentos de radiación de Hawking?</summary>
            <div>
              <p>
                Sí hay experimentos análogos. En condensados de Bose–Einstein se estudian fonones y
                horizontes acústicos: no son agujeros negros gravitatorios. Un trabajo de fibra
                óptica de 2026 estudia emisión análoga estimulada por un fotón; no equivale a
                detectar evaporación espontánea de un agujero negro astronómico.
              </p>
              <p>
                Los discos de acreción, jets y sombras que observamos alrededor de agujeros negros
                tampoco son radiación de Hawking.
              </p>
              <a href="https://doi.org/10.1038/s41567-020-01076-0" target="_blank" rel="noreferrer">
                Análogo acústico, 2021 <Arrow />
              </a>
              <a href="https://doi.org/10.1038/s41467-026-73812-8" target="_blank" rel="noreferrer">
                Análogo óptico estimulado, 2026 <Arrow />
              </a>
              <a
                href="https://science.nasa.gov/universe/black-holes/anatomy/"
                target="_blank"
                rel="noreferrer"
              >
                NASA: anatomía de un agujero negro <Arrow />
              </a>
            </div>
          </details>
          <a
            className="hk-research-link"
            href="https://github.com/nicospum/rendija2simspum/blob/master/docs/HAWKING_INVESTIGACION.md"
            target="_blank"
            rel="noreferrer"
          >
            Leer la investigación, las derivaciones y las fuentes <Arrow />
          </a>
        </section>
      </main>
      <footer className="hk-footer">
        <a href="/">∿ SPUM / EXPERIMENTOS</a>
        <span>La curiosidad no termina en el horizonte.</span>
        <div>
          <a href="/doble-rendija/">
            Doble rendija <Arrow />
          </a>
          <a href="/prisma/">
            Prisma de Newton <Arrow />
          </a>
        </div>
      </footer>
    </div>
  )
}
