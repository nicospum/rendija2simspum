import { useEffect, useReducer, useState } from 'react'
import Info from '../components/ui/InfoPopover'
import {
  LabMission,
  LabNavigation,
  MoreLabs,
} from '../components/ui/LabJourney'
import EinsteinNavigation from '../einstein/EinsteinNavigation'
import {
  GPS,
  DAY,
  heightFromPosition,
  heightPosition,
  snapshot,
} from './physics'
import type { Setup } from './physics'
import { initialState, LESSONS, observations, reducer } from './learning'
import { n, signed } from './format'
import Scene from './Scene'
export default function HeightApp() {
  const [s, dispatch] = useReducer(reducer, undefined, () => initialState()),
    [chart, setChart] = useState(false),
    [visible, setVisible] = useState(!document.hidden)
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
  const m = snapshot(s.setup),
    gps = s.setup.mode === 'gps',
    factor = gps ? 1e6 : 1e9,
    unit = gps ? 'µs' : 'ns',
    l = LESSONS[s.index],
    done = s.completed.includes(s.index),
    checks = observations(s)
  const tune = (patch: Partial<Omit<Setup, 'progress'>>) =>
      dispatch({ type: 'tune', patch }),
    time = (value: number) => dispatch({ type: 'time', value }),
    start = (index: number) => dispatch({ type: 'lesson', index })
  const next = () => {
    start((s.index + 1) % 4)
    requestAnimationFrame(() => {
      document
        .getElementById('al-challenges')
        ?.scrollIntoView({ block: 'start' })
      document.getElementById('al-question')?.focus({ preventScroll: true })
    })
  }
  return (
    <div className="rl-shell al-shell">
      <a href="#al-controls" className="rl-skip">
        Ir a los controles
      </a>
      <header className="rl-header">
        <a className="rl-brand" href="/">
          ∿ SPUM <small>EXPERIMENTOS</small>
        </a>
        <a href="/einstein/">Especial Einstein ↗</a>
      </header>
      <main>
        <EinsteinNavigation current="el-tiempo-tiene-altura" />
        <section className="rl-intro">
          <div>
            <p className="rl-eyebrow">LABORATORIO 12 / RELATIVIDAD GENERAL</p>
            <h1>
              El tiempo
              <br />
              <em>tiene altura.</em>
            </h1>
          </div>
          <div>
            <p className="rl-eyebrow">
              UN MISMO PLANETA / RELOJES QUE NO EMPATAN
            </p>
            <h2>
              ¿Un segundo pasa igual
              <br />
              en el suelo y en órbita?
            </h2>
            <p>
              Subí un reloj, esperá y compará. Después llevá la idea hasta un
              satélite: la gravedad y el movimiento aportan efectos distintos.
              Descubrí por qué el GPS necesita tenerlos en cuenta.
            </p>
            <a href="#al-challenges">Empezar con una predicción ↓</a>
          </div>
        </section>
        <LabNavigation
          links={[
            ['Las vistas', '#al-views'],
            ['Controles', '#al-controls'],
            ['Retos', '#al-challenges'],
            ['Por qué', '#al-science'],
          ]}
        />
        <LabMission
          index={s.index}
          title={l.title}
          instruction={l.hint}
          href="#al-challenges"
          result={
            done
              ? 'Reto completado. Podés seguir comparando o pasar al siguiente.'
              : undefined
          }
          onNext={done ? () => start((s.index + 1) % 4) : undefined}
        />
        <section
          id="al-views"
          className="rl-observatory"
          aria-label="Ubicación y comparación de relojes"
        >
          <div className="rl-observatory-heading">
            <div>
              <p className="rl-eyebrow">
                {gps ? 'SATÉLITE Y GPS' : 'RELOJES EN ALTURA'} / DOS LECTURAS
                DEL MISMO ENSAYO
              </p>
              <h2>El tiempo que cada uno acumula.</h2>
            </div>
            <span className="rl-state">
              {s.playing
                ? 'ENSAYO EN CURSO'
                : s.setup.progress === 1
                  ? 'COMPARACIÓN COMPLETA'
                  : 'PAUSADO · EXPLORÁ'}
              <br />
              Referencia: {n(m.elapsed / DAY)}{' '}
              {m.elapsed === DAY ? 'día' : 'días'}
            </span>
          </div>
          <div
            className="rl-mobile-views"
            role="group"
            aria-label="Elegir vista en celular"
          >
            <button aria-pressed={!chart} onClick={() => setChart(false)}>
              Dónde están
            </button>
            <button aria-pressed={chart} onClick={() => setChart(true)}>
              Qué acumulan
            </button>
          </div>
          <div className="rl-views">
            {[false, true].map((isChart, i) => (
              <article
                key={String(isChart)}
                className="rl-frame"
                data-active={chart === isChart}
              >
                <div className="rl-frame-heading">
                  <div>
                    <span>
                      0{i + 1} /{' '}
                      {isChart
                        ? 'LAS DIFERENCIAS MEDIBLES'
                        : 'LA POSICIÓN DE LOS RELOJES'}
                    </span>
                    <h3>{isChart ? 'Qué acumulan' : 'Dónde están'}</h3>
                  </div>
                  <Info
                    name={
                      isChart
                        ? 'Cómo leer el gráfico'
                        : 'Qué representa la escena'
                    }
                  >
                    {isChart
                      ? 'El eje horizontal es tiempo del reloj fijo en la superficie. En modo ampliado, el vertical muestra diferencias: gravedad, movimiento y balance físico. No multiplicamos el tiempo propio real. Sin ampliar, comparamos tiempos totales en segundos y las curvas casi coinciden. El ajuste de GPS agrega una lectura corregida, manteniendo el balance físico.'
                      : gps
                        ? 'Tierra esférica y no rotante. La órbita circular usa la velocidad calculada para su radio. El encuadre cambia con la altura para conservar el satélite visible; los tamaños del satélite son simbólicos. En velocidad elegida no se integra una órbita: se compara el ritmo de una trayectoria ideal a radio y rapidez constantes.'
                        : 'Ambos relojes están sostenidos en reposo respecto de la Tierra ideal. La altura de la ilustración usa una escala logarítmica para mostrar desde centímetros hasta kilómetros. Los números son alturas físicas; los aros indican avance del ensayo, no una gran diferencia entre segundos.'}
                  </Info>
                </div>
                <Scene setup={s.setup} chart={isChart} />
                <p className="rl-frame-caption">
                  {isChart
                    ? s.setup.expanded
                      ? 'Se grafican desfases: positivo significa más tiempo propio acumulado que la referencia; negativo, menos.'
                      : 'Escala sin ampliar: los tiempos totales casi coinciden. Las diferencias físicas siguen en las tarjetas.'
                    : gps
                      ? 'Órbita circular o comparación a radio fijo. El modelo no incluye la rotación terrestre ni un receptor GPS real.'
                      : 'No se simula el traslado: comparamos ritmos sostenidos en dos alturas, con el mismo cero inicial asignado en el modelo.'}
                </p>
              </article>
            ))}
          </div>
          <div className="al-readings" aria-live={s.playing ? 'off' : 'polite'}>
            <div>
              <span>Tiempo del reloj de referencia</span>
              <strong>
                {n(m.elapsed / DAY)}{' '}
                <small>{m.elapsed === DAY ? 'día' : 'días'}</small>
              </strong>
              <p>{n(m.elapsed, 1)} segundos propios en la superficie.</p>
            </div>
            <div>
              <span>
                Desfase físico del reloj elevado{' '}
                <Info name="Tiempo propio y comparación">
                  Es τ elevado menos τ referencia entre dos cortes del tiempo
                  estático del modelo. Cada reloj acumula su propio tiempo. No
                  es un retraso de propagación de luz ni una fotografía del
                  reloj lejano. Alineamos el cero inicial por convenio; no se
                  simula cómo se transportan ni se reúnen los relojes.
                </Info>
              </span>
              <strong>
                {signed(m.physicalOffset * factor)} <small>{unit}</small>
              </strong>
              <p>
                {m.physicalOffset > 0
                  ? 'El elevado acumula más tiempo propio.'
                  : m.physicalOffset < 0
                    ? 'El elevado acumula menos tiempo propio.'
                    : 'Sin diferencia en este instante.'}
              </p>
            </div>
            <div>
              <span>
                {gps
                  ? 'Lectura transmitida − referencia'
                  : 'Diferencia de ritmo por día'}
              </span>
              <strong>
                {signed((gps ? m.readoutOffset : m.total * DAY) * factor)}{' '}
                <small>{gps ? unit : `${unit}/día`}</small>
              </strong>
              <p>
                {gps
                  ? s.setup.corrected
                    ? 'Con ajuste ideal desde el inicio.'
                    : 'Sin ajuste: sigue el desfase físico.'
                  : 'El ritmo se mantiene; el desfase crece con la duración.'}
              </p>
            </div>
          </div>
          <p className="rl-map-note">
            Tierra esférica no rotante: modelo de Schwarzschild con reloj de
            referencia fijo en la superficie. Los efectos físicos son diminutos;
            las diferencias se muestran en ns o µs.{' '}
            <Info name="Qué idealiza este modelo">
              No se incluyen geoide, rotación terrestre, Sagnac, excentricidad
              orbital, atmósfera ni retardos de señal. No es un simulador de
              posicionamiento GPS operativo. Las trayectorias se mantienen a
              altura y rapidez constantes; sostener un reloj sin órbita requiere
              apoyo o propulsión. Los números de GPS son aproximados y cambian
              con esas simplificaciones.
            </Info>
          </p>
        </section>
        <section
          id="al-controls"
          className="rl-controls"
          aria-labelledby="al-controls-title"
        >
          <div className="rl-section-heading">
            <div>
              <p className="rl-eyebrow">ALTURA / MOVIMIENTO / DURACIÓN</p>
              <h2 id="al-controls-title">Armá tu comparación.</h2>
            </div>
            <a href="#al-views">Ver relojes y diferencias ↑</a>
          </div>
          <div
            className="al-buttons"
            role="group"
            aria-label="Escala del experimento"
          >
            <button
              aria-pressed={!gps}
              onClick={() => dispatch({ type: 'mode', mode: 'torre' })}
            >
              Relojes en altura
            </button>
            <button
              aria-pressed={gps}
              onClick={() => dispatch({ type: 'mode', mode: 'gps' })}
            >
              Satélite y GPS
            </button>
          </div>
          <div className="rl-control-grid">
            <div className="rl-control-card">
              <div className="rl-control-label">
                <label htmlFor="al-height">Altura sobre la referencia</label>
                <output>
                  {n(gps ? s.setup.height / 1000 : s.setup.height)}{' '}
                  {gps ? 'km' : 'm'}
                </output>
              </div>
              <input
                id="al-height"
                type="range"
                min={gps ? 400 : 0}
                max={gps ? 36000 : 100}
                step="any"
                value={
                  gps ? s.setup.height / 1000 : heightPosition(s.setup.height)
                }
                aria-valuetext={`${n(s.setup.height)} metros sobre la referencia`}
                onChange={(e) =>
                  tune({
                    height: gps
                      ? +e.target.value * 1000
                      : Math.max(
                          0,
                          Math.min(4000, heightFromPosition(+e.target.value)),
                        ),
                  })
                }
              />
              <div className="al-buttons">
                {gps ? (
                  <>
                    <button onClick={() => tune({ height: 400000 })}>
                      Órbita baja · 400 km
                    </button>
                    <button onClick={() => tune({ height: GPS.height })}>
                      GPS · 20.200 km
                    </button>
                    <button onClick={() => tune({ height: 35786000 })}>
                      Órbita alta · 35.786 km
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => tune({ height: 0 })}>
                      Misma altura · 0 m
                    </button>
                    <button onClick={() => tune({ height: 0.33 })}>
                      Subir 33 cm
                    </button>
                    <button onClick={() => tune({ height: 100 })}>
                      Subir a 100 m
                    </button>
                    <button onClick={() => tune({ height: 4000 })}>
                      Subir a 4.000 m
                    </button>
                  </>
                )}
              </div>
              <p>
                {gps
                  ? 'Al cambiar el radio, la velocidad circular se recalcula. La diferencia gravitatoria depende del potencial, no solo del valor local de g.'
                  : 'El deslizador tiene escala logarítmica para acceder a cambios pequeños y grandes. En este ensayo ambos relojes están quietos: aislamos la gravedad.'}
              </p>
            </div>
            <div className="rl-control-card">
              <div className="rl-control-label">
                <label htmlFor="al-days">Duración observada</label>
                <output>
                  {s.setup.days} {s.setup.days === 1 ? 'día' : 'días'}
                </output>
              </div>
              <input
                id="al-days"
                type="range"
                min="1"
                max="7"
                step="1"
                value={s.setup.days}
                onChange={(e) => tune({ days: +e.target.value })}
              />
              <div className="al-buttons">
                <button onClick={() => tune({ days: 1 })}>
                  Observar 1 día
                </button>
                <button onClick={() => tune({ days: 7 })}>
                  Observar 7 días
                </button>
              </div>
              <p>
                La altura y la rapidez fijan el ritmo. Más tiempo de observación
                acumula más diferencia, sin cambiar ese ritmo.
              </p>
            </div>
            {gps && (
              <div className="rl-control-card al-wide">
                <div className="rl-control-label">
                  <label htmlFor="al-speed">
                    Rapidez local del reloj elevado
                  </label>
                  <output>{n(m.velocity / 1000)} km/s</output>
                </div>
                <div
                  className="al-buttons"
                  role="group"
                  aria-label="Movimiento del reloj"
                >
                  <button
                    aria-pressed={s.setup.motion === 'quieto'}
                    onClick={() => tune({ motion: 'quieto' })}
                  >
                    Sostener sin movimiento
                  </button>
                  <button
                    aria-pressed={s.setup.motion === 'circular'}
                    onClick={() => tune({ motion: 'circular' })}
                  >
                    Órbita circular
                  </button>
                  <button
                    aria-pressed={s.setup.motion === 'manual'}
                    onClick={() =>
                      tune({ motion: 'manual', speed: m.velocity })
                    }
                  >
                    Velocidad elegida
                  </button>
                </div>
                <input
                  id="al-speed"
                  type="range"
                  min="0"
                  max="8000"
                  step="any"
                  value={m.velocity}
                  disabled={s.setup.motion !== 'manual'}
                  aria-valuetext={`${n(m.velocity)} metros por segundo, medidos por un observador estático local`}
                  onChange={(e) => tune({ speed: +e.target.value })}
                />
                <p>
                  {s.setup.motion === 'circular'
                    ? `Velocidad calculada para una órbita circular. Período respecto de la referencia: ${n(m.period! / 3600)} h.`
                    : s.setup.motion === 'quieto'
                      ? 'Un reloj inmóvil a esa altura necesita sostén o propulsión. Es un caso de comparación, no un satélite sin motores.'
                      : 'Arrastrá para elegir la rapidez. La trayectoria a radio fijo puede requerir propulsión y no se dibuja como una órbita circular libre.'}
                </p>
              </div>
            )}
            <div className="rl-control-card al-wide">
              <div
                className="al-buttons"
                role="group"
                aria-label="Escala del gráfico"
              >
                <button
                  aria-pressed={s.setup.expanded}
                  onClick={() => tune({ expanded: true })}
                >
                  Ampliar diferencias
                </button>
                <button
                  aria-pressed={!s.setup.expanded}
                  onClick={() => tune({ expanded: false })}
                >
                  Tiempo sin ampliar
                </button>
              </div>
              <p>
                La ampliación cambia el gráfico a diferencias de tiempo;
                conserva los cálculos y el instante. Sin ampliar, los tiempos
                acumulados casi coinciden.
              </p>
            </div>
            <div className="rl-control-card al-wide">
              <div className="rl-control-label">
                <label htmlFor="al-time">Tiempo en la referencia</label>
                <output>
                  {n(m.elapsed / DAY)} {m.elapsed === DAY ? 'día' : 'días'}
                </output>
              </div>
              <input
                id="al-time"
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={s.setup.progress}
                aria-valuetext={`${n(m.elapsed / DAY)} de ${s.setup.days} días`}
                onChange={(e) => time(+e.target.value)}
              />
              <div className="al-buttons">
                <button
                  className="rl-primary"
                  onClick={() => dispatch({ type: 'play' })}
                >
                  {s.playing
                    ? 'Pausar comparación'
                    : s.setup.progress === 1
                      ? 'Repetir comparación'
                      : 'Iniciar comparación'}
                </button>
                <button onClick={() => time(0)}>Volver al inicio</button>
                <button onClick={() => time(1)}>Ver resultado</button>
              </div>
              <p>
                Podés explorar sin reproducir. Las condiciones nuevas reinician
                el ensayo; cambiar de vista, escala o ajuste conserva el
                instante.
              </p>
            </div>
          </div>
          <div className="al-effect" aria-live={s.playing ? 'off' : 'polite'}>
            <span>EL EFECTO DE TU CAMBIO · POR DÍA DE REFERENCIA</span>
            <p>
              Gravedad{' '}
              <b>
                {signed(m.gravity * DAY * factor)} {unit}
              </b>{' '}
              · movimiento{' '}
              <b>
                {signed(m.motion * DAY * factor)} {unit}
              </b>{' '}
              · balance{' '}
              <b>
                {signed(m.total * DAY * factor)} {unit}
              </b>
              .
            </p>
          </div>
          <a className="al-jump" href="#al-views">
            Comparar las dos vistas ↑
          </a>
        </section>
        {gps && (
          <section id="al-gps" className="rl-controls">
            <div className="rl-section-heading">
              <div>
                <p className="rl-eyebrow">DE LA FÍSICA A LA INGENIERÍA</p>
                <h2>La señal necesita un ajuste.</h2>
              </div>
              <Info name="Qué corrige el ajuste GPS">
                Comparamos dos ensayos con el mismo desfase inicial cero. El
                ajustado modifica idealmente la frecuencia desde la salida para
                cancelar el ritmo de este caso constante. Activarlo recalcula
                esa lectura; no describe un salto físico en el satélite ni
                detiene su envejecimiento. Un GPS real combina ajustes nominales
                y correcciones variables.
              </Info>
            </div>
            <div
              className="al-buttons"
              role="group"
              aria-label="Ajuste del reloj GPS"
            >
              <button
                aria-pressed={!s.setup.corrected}
                onClick={() => tune({ corrected: false })}
              >
                Sin ajuste
              </button>
              <button
                aria-pressed={s.setup.corrected}
                onClick={() => tune({ corrected: true })}
              >
                Ajuste desde la salida
              </button>
            </div>
            <div className="al-gps-grid">
              <div>
                <span>Desfase físico</span>
                <strong>{signed(m.physicalOffset * 1e6)} µs</strong>
                <p>Tiempo propio del satélite menos tiempo de referencia.</p>
              </div>
              <div>
                <span>Lectura transmitida − referencia</span>
                <strong>{signed(m.readoutOffset * 1e6)} µs</strong>
                <p>
                  {s.setup.corrected
                    ? 'Compensación ideal para este ensayo.'
                    : 'Sin compensación electrónica.'}
                </p>
              </div>
              <div>
                <span>Sesgo de pseudodistancia cΔt</span>
                <strong>{signed(m.rangeBias / 1000)} km</strong>
                <p>
                  Equivalente de una señal; no es un error de posición
                  calculado.
                </p>
              </div>
            </div>
            <p>
              El ajuste ideal de frecuencia es Δf/f ={' '}
              <b>{m.frequencyAdjustment.toExponential(3).replace('.', ',')}</b>.
              Comparar con ajuste significa aplicarlo desde el inicio del
              ensayo, conservando el tiempo propio físico. La geometría, el
              reloj del receptor y otras señales intervienen en una posición GPS
              real.
            </p>
            <a className="al-jump" href="#al-views">
              Ver el balance y la lectura ajustada ↑
            </a>
          </section>
        )}
        <section
          id="al-challenges"
          className="rl-challenges"
          aria-labelledby="al-challenges-title"
        >
          <div className="rl-section-heading">
            <div>
              <p className="rl-eyebrow">PREDECIR / PROBAR / EXPLICAR</p>
              <h2 id="al-challenges-title">
                Cuatro formas de comparar el tiempo.
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
              <h3 id="al-question" tabIndex={-1}>
                {l.question}
              </h3>
              <fieldset className="rl-predictions">
                <legend>Tu predicción</legend>
                {l.choices.map((choice, i) => (
                  <label key={choice}>
                    <input
                      type="radio"
                      name="al-prediction"
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
                <a href={s.index === 3 ? '#al-gps' : '#al-controls'}>
                  Ir a los controles ↑
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
        <section id="al-science" className="rl-science">
          <div>
            <p className="rl-eyebrow">POR QUÉ IMPORTA</p>
            <h2>
              El tiempo también
              <br />
              <em>es geografía.</em>
            </h2>
            <p>
              Comparar relojes a distinta altura revela una diferencia física de
              ritmo. Los relojes atómicos permiten medir diferencias que la vida
              cotidiana no percibe; el efecto también importa en navegación por
              satélite.
            </p>
            <p>
              La idea conecta el ascensor de Einstein con el GPS: gravedad y
              movimiento se calculan juntos. El ajuste de la señal aprovecha esa
              predicción, sin borrar la diferencia de tiempo propio.
            </p>
            <a
              href="https://www.nist.gov/atomic-clocks/a-powerful-tool-for-science/putting-einstein-test"
              target="_blank"
              rel="noreferrer"
            >
              NIST: poner a prueba a Einstein con relojes ↗
            </a>
          </div>
          <div>
            <details open>
              <summary>La fórmula de los relojes</summary>
              <div className="rl-formula">
                dτ elevado / dτ referencia = [α(r)/α(R)] √(1 − v²/c²)
                <span>α(r) = √(1 − 2GM/(rc²)) · r = R + h</span>
              </div>
              <p>
                R es el radio de la Tierra ideal, r el radio del reloj elevado y
                v su rapidez medida localmente por un observador estático. La
                referencia está quieta en R. Para diferencias pequeñas: Δritmo ≈
                GM(1/R − 1/r)/c² − v²/(2c²).
              </p>
              <p>
                Para alturas pequeñas y relojes quietos: Δritmo ≈ gh/c². La
                ecuación exacta del modelo usa potencial y movimiento, no solo
                el valor de g en cada lugar.
              </p>
            </details>
            <details>
              <summary>
                Qué significa “el reloj de arriba va más rápido”
              </summary>
              <p>
                Al comparar intervalos con el mismo tiempo de referencia, el
                reloj elevado puede acumular más tiempo propio. Su dueño siente
                normales sus segundos; no ve su entorno acelerado. El resultado
                no es el retraso que tarda una señal en llegar. Aquí se alinean
                los ceros por convenio y no se simula el transporte de los
                relojes.
              </p>
              <a
                href="https://www.nist.gov/news-events/news/2022/02/jila-atomic-clocks-measure-einsteins-general-relativity-millimeter-scale"
                target="_blank"
                rel="noreferrer"
              >
                NIST/JILA: diferencias medidas a escala milimétrica ↗
              </a>
            </details>
            <details>
              <summary>Qué simplifica el ejemplo de GPS</summary>
              <p>
                Usamos una Tierra esférica no rotante, radio y rapidez
                constantes. No modelamos geoide, Sagnac, excentricidad,
                atmósfera, trayecto de señales ni resolución de posición del
                receptor. El caso orbital calcula una geodésica circular de
                Schwarzschild; otras rapideces requieren una trayectoria
                sostenida ideal. Los valores difieren ligeramente de los de un
                GPS operativo.
              </p>
              <a
                href="https://gssc.esa.int/navipedia/index.php/Relativistic_Clock_Correction"
                target="_blank"
                rel="noreferrer"
              >
                ESA Navipedia: corrección relativista de relojes ↗
              </a>
            </details>
            <details>
              <summary>Del desfase a una distancia equivalente</summary>
              <p>
                Multiplicar un sesgo temporal de señal por c da una
                pseudodistancia equivalente. No equivale automáticamente al
                error de ubicación: un receptor estima su reloj y posición con
                varias señales y una geometría específica. El panel muestra esta
                magnitud para entender por qué importa sincronizar.
              </p>
            </details>
          </div>
        </section>
        <section className="rl-continue">
          <p className="rl-eyebrow">LA PRÓXIMA PREGUNTA</p>
          <h2>¿Qué le pasó a la órbita de Mercurio?</h2>
          <p>
            Seguí con “La órbita que no se cierra”: compará Newton y Einstein y
            descubrí la precesión del perihelio de Mercurio.
          </p>
          <a className="al-jump" href="/orbita-que-no-se-cierra/">
            Explorar la órbita de Mercurio →
          </a>
        </section>
        <EinsteinNavigation current="el-tiempo-tiene-altura" />
        <MoreLabs current="el-tiempo-tiene-altura" />
      </main>
      <footer className="rl-footer">
        <a href="/">∿ SPUM / EXPERIMENTOS</a>
        <span>La misma Tierra. Distintos tiempos.</span>
      </footer>
    </div>
  )
}
