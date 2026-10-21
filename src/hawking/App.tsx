import Tip from '../components/ui/InfoPopover'
import { BlackHoleNavigation } from '../series/BlackHoleNavigation'
import BlackHoleNotebook from '../series/BlackHoleNotebook'
import { readCompleted } from '../series/progress'
import { useBlackHoleProgress } from '../series/usePassport'
import { LabMission, LabNavigation, MoreLabs } from '../components/ui/LabJourney'
import { useEffect, useReducer, useState } from 'react'
import SceneExplorer from './SceneExplorer'
import Spectrum from './Spectrum'
import LiveImpact from './LiveImpact'
import EntropyExplorer from './EntropyExplorer'
import { factor, impact } from './impact'
import { BALANCE_MASS, CMB, MAX_AGE, SOLAR_MASS, YEAR, scientific } from './physics'
import { initialState, LESSONS, lessonStatus, reading, reducer } from './learning'
import type { Action } from './learning'
import type { LessonId } from './learning'
import { massInWindow, massWindow } from './exploration'
import type { Dispatch } from 'react'

function Arrow() {
  return <span aria-hidden="true">↗</span>
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
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    initialState('mass', readCompleted('hawking').map(i => LESSONS[i].id)),
  )
  const [motion, setMotion] = useState(true)
  useBlackHoleProgress('hawking', state.completed, LESSONS)
  const { reduced, visible } = useMotion()
  useClock(state.running, dispatch)
  const current = reading(state),
    reference = reading(state.reference),
    initial = reading({ ...state, age: 0 })
  const lesson = LESSONS.find((item) => item.id === state.lesson)!
  const lessonIndex = LESSONS.findIndex((item) => item.id === state.lesson)
  const status = lessonStatus(state)
  const ratio = current.massKg / reference.massKg
  const effect = impact(state, state.reference)
  const [massAnchor, setMassAnchor] = useState(1e12)
  const massRange = massWindow(massAnchor)
  function prepareLesson(id: LessonId) {
    setMassAnchor(id === 'bath' ? SOLAR_MASS : 1e12)
    dispatch({ type: 'lesson', id })
  }
  function restoreReference() {
    setMassAnchor(state.reference.mass)
    dispatch({ type: 'restore' })
  }
  function tryLesson() {
    setMassAnchor(state.reference.mass)
    dispatch({ type: 'try' })
  }
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
    <div className="bh-lab hk-shell">
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
        <BlackHoleNavigation current="hawking" />
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

        <LabNavigation
          links={[
            ['Visor', '#spum-mission'],
            ['Controles', '#hk-controls'],
            ['Retos', '#hk-challenges'],
            ['Por qué', '#hk-discovery'],
          ]}
        />
        <LabMission
          live={!state.running}
          title={lesson.question}
          instruction={lesson.hint}
          index={lessonIndex}
          href="#hk-challenges"
          result={
            status === 'observed'
              ? state.lesson === 'bath'
                ? 'La emisión continúa; el entorno aporta más energía de la que sale.'
                : `Masa ${factor(ratio)} · Temperatura ${factor(current.temperatureK / reference.temperatureK)} · Área ${factor(current.areaM2 / reference.areaM2)}`
              : undefined
          }
          onNext={
            status === 'observed'
              ? () => prepareLesson(LESSONS[(lessonIndex + 1) % LESSONS.length].id)
              : undefined
          }
        />
        <div className="hk-workspace">
          <section className="hk-observatory" id="hk-view" aria-label="Visor del agujero negro">
            <SceneExplorer
              current={current}
              reference={reference}
              moving={motion && !reduced && visible}
              emission={effect.emissionSignal}
              absorption={effect.absorptionSignal}
              motion={motion}
              reduced={reduced}
              onToggle={() => setMotion(!motion)}
            />
            <div className="hk-measurements">
              <div>
                <span>
                  Temperatura{' '}
                  <Tip name="Temperatura">
                    T = ℏc³/(8πGMkB). Al duplicar la masa, se reduce a la mitad. Se refiere a un
                    observador lejano. No es la temperatura del gas de un disco de acreción. Los
                    colores dorado y azul del esquema identifican flujos; no son colores térmicos
                    observados. Ahora T = {scientific(current.temperatureK, 'K')}.
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
                    material. El círculo punteado permite comparar con el radio inicial del reto.
                    Acercar el visor amplía ambos; cambiar la masa sí cambia el radio físico.
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
                    fotones; omite cuerpo gris y otras partículas. Un watt es un joule de energía
                    por segundo. Si dividís M por dos, Pideal crece por cuatro; esa energía sale de
                    la masa, E = Mc².
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
                    misma emisividad y absorptividad ideales. Mirá las dos barras debajo del visor:
                    la mayor decide el signo del balance. El flujo dorado no desaparece cuando
                    predomina la absorción azul.
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
              <div className="hk-control-title">
                <label htmlFor="hk-mass">
                  Masa inicial <output>{scientific(state.mass, 'kg')}</output>
                </label>
                <Tip name="Control de masa">
                  La masa no es un zoom. Cambia rₛ, T, potencia, vida ideal y entropía. Ahora
                  explorás entre media y dos veces la escala elegida. Moverla reinicia el tiempo;
                  acercar el visor conserva todas las magnitudes.
                </Tip>
              </div>
              <input
                id="hk-mass"
                type="range"
                min="0.5"
                max="2"
                step="0.01"
                value={state.mass / massAnchor}
                aria-valuetext={`${factor(state.mass / massAnchor)} de la escala elegida: ${scientific(state.mass, 'kilogramos')}`}
                onChange={(e) =>
                  dispatch({
                    type: 'mass',
                    mass: massInWindow(massAnchor, massAnchor * Number(e.target.value)),
                  })
                }
              />
              <div className="hk-range-ends">
                <span>½ de la escala</span>
                <span>2 veces la escala</span>
              </div>
              <p>
                Rango lineal y acotado: {scientific(massRange.min, 'kg')} a{' '}
                {scientific(massRange.max, 'kg')}. Cambiá de escala con los ejemplos de abajo.
              </p>
              <div className="hk-mass-steps">
                <button
                  disabled={state.mass <= massRange.min}
                  onClick={() =>
                    dispatch({ type: 'mass', mass: massInWindow(massAnchor, state.mass / 2) })
                  }
                >
                  Masa ÷2
                </button>
                <button
                  disabled={state.mass >= massRange.max}
                  onClick={() =>
                    dispatch({ type: 'mass', mass: massInWindow(massAnchor, state.mass * 2) })
                  }
                >
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
                <button
                  aria-pressed={massAnchor === 1e12}
                  onClick={() => {
                    setMassAnchor(1e12)
                    dispatch({ type: 'mass', mass: 1e12 })
                  }}
                >
                  10¹² kg hipotético
                </button>
                <button
                  aria-pressed={massAnchor === SOLAR_MASS}
                  onClick={() => {
                    setMassAnchor(SOLAR_MASS)
                    dispatch({ type: 'mass', mass: SOLAR_MASS })
                  }}
                >
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
              <div className="hk-inline-help">
                <span>¿Qué significa el fondo cósmico?</span>
                <Tip name="Fondo cósmico">
                  Es radiación que llena el universo, remanente de su etapa temprana. Acá usamos un
                  baño uniforme a 2,7255 K. Si está más caliente que el agujero negro, la absorción
                  domina aunque este siga emitiendo. El azul simboliza esa energía entrante; las
                  estrellas decorativas del visor no son el fondo cósmico.
                </Tip>
              </div>
            </fieldset>
            <div className={`hk-control-group ${state.lesson === 'time' ? 'hk-highlight' : ''}`}>
              <div className="hk-control-title">
                <label htmlFor="hk-age">
                  Tiempo transcurrido{' '}
                  <output>{(state.age * 100).toFixed(1).replace('.', ',')} % de τ₀</output>
                </label>
                <Tip name="Tiempo y evaporación">
                  τ₀ es la vida ideal calculada desde la masa inicial, en vacío. Avanzar al 75 % no
                  deja el 25 % de masa: M/M₀ = ∛(1 − t/τ₀), por eso queda cerca del 63 %. Cuanta
                  menos masa queda, más caliente y potente se vuelve. La velocidad del reloj solo
                  comprime tiempo; no cambia esa ley. Con fondo cósmico no aplicamos esta solución
                  aislada.
                </Tip>
              </div>
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
            <button className="hk-reset" onClick={restoreReference}>
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
            <span className="hk-progress">{state.completed.length} / 4 descubrimientos</span>
          </div>
          <div className="hk-lesson-nav" aria-label="Elegir reto">
            {LESSONS.map((item, i) => (
              <button
                key={item.id}
                aria-pressed={state.lesson === item.id}
                onClick={() => prepareLesson(item.id)}
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
              <div className="hk-inline-help">
                <span>¿Qué mirar en este reto?</span>
                <Tip name={`Guía: ${lesson.short}`}>
                  {lesson.hint}{' '}
                  {status === 'observed'
                    ? lesson.meaning
                    : 'Elegí una predicción, aplicá el cambio y compará con la referencia. Los factores × indican cuántas veces vale cada magnitud respecto del inicio; no son medidas observadas en un agujero negro real.'}
                </Tip>
              </div>
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
                <button className="hk-button hk-primary" onClick={tryLesson}>
                  {lesson.action} <Arrow />
                </button>
                <button className="hk-reset" onClick={restoreReference}>
                  Restaurar
                </button>
              </div>
              <p className="hk-footnote">{lesson.hint} La huella se guarda al comparar y revisar tu predicción.</p>
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
            prepareLesson('entropy')
            dispatch({ type: 'try' })
          }}
          onRestore={restoreReference}
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
                prepareLesson('bath')
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
        <BlackHoleNotebook current="hawking" />
        <MoreLabs current="hawking" />
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
