import { useEffect, useReducer, useState } from 'react'
import Info from '../components/ui/InfoPopover'
import {
  LabMission,
  LabNavigation,
  MoreLabs,
} from '../components/ui/LabJourney'
import EinsteinNavigation from '../einstein/EinsteinNavigation'
import { LESSONS, initialState, observations, reducer } from './learning'
import { snapshot } from './physics'
import type { Setup } from './physics'
import Scene from './Scene'
import { n } from './format'

function Clock({
  value,
  total,
  name,
  color,
}: {
  value: number
  total: number
  name: string
  color: string
}) {
  return (
    <div className="gv-clock">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="42" fill="#102735" stroke="#426477" />
        {Array.from({ length: 12 }, (_, i) => (
          <path
            key={i}
            d="M50 12V17"
            transform={`rotate(${i * 30} 50 50)`}
            stroke="#96b4c1"
          />
        ))}
        <circle
          cx="50"
          cy="50"
          r="35"
          pathLength="100"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${(value / total) * 100} 100`}
          transform="rotate(-90 50 50)"
        />
        <path
          d="M50 50V24"
          transform={`rotate(${(value / total) * 360} 50 50)`}
          stroke={color}
          strokeWidth="3"
        />
        <circle cx="50" cy="50" r="3" fill={color} />
      </svg>
      <div>
        <span>{name}</span>
        <strong style={{ color }}>
          {n(value)} <small>años</small>
        </strong>
        <p>Tiempo propio acumulado</p>
      </div>
    </div>
  )
}
export default function TwinsApp() {
  const [s, dispatch] = useReducer(reducer, undefined, () => initialState()),
    [view, setView] = useState<'trip' | 'diagram'>('trip'),
    [signals, setSignals] = useState(true),
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
    lesson = LESSONS[s.index],
    done = s.completed.includes(s.index),
    checks = observations(s)
  const tune = (patch: Partial<Setup>) => dispatch({ type: 'tune', patch }),
    time = (progress: number, side: Setup['side'] = 'after') =>
      dispatch({ type: 'time', progress, side }),
    start = (index: number) => dispatch({ type: 'lesson', index })
  const next = () => {
    start((s.index + 1) % 4)
    requestAnimationFrame(() => {
      document
        .getElementById('gv-challenges')
        ?.scrollIntoView({ block: 'start' })
      document.getElementById('gv-question')?.focus({ preventScroll: true })
    })
  }
  return (
    <div className="rl-shell gv-shell">
      <a href="#gv-controls" className="rl-skip">
        Ir a los controles
      </a>
      <header className="rl-header">
        <a className="rl-brand" href="/">
          ∿ SPUM <small>EXPERIMENTOS</small>
        </a>
        <a href="/einstein/">Especial Einstein ↗</a>
      </header>
      <main>
        <EinsteinNavigation current="nos-vemos-a-la-vuelta" />
        <section className="rl-intro">
          <div>
            <p className="rl-eyebrow">LABORATORIO 10 / RELATIVIDAD ESPECIAL</p>
            <h1>
              Nos vemos
              <br />
              <em>a la vuelta.</em>
            </h1>
          </div>
          <div>
            <p className="rl-eyebrow">
              LOS MISMOS ENCUENTROS. DISTINTOS TIEMPOS.
            </p>
            <h2>
              ¿Podemos volver
              <br />
              con edades diferentes?
            </h2>
            <p>
              Un gemelo se queda. El otro viaja y regresa. Armá el recorrido,
              seguí sus relojes y descubrí qué cuenta cada uno entre el abrazo
              de salida y el reencuentro.
            </p>
            <a href="#gv-challenges">Empezar con una predicción ↓</a>
          </div>
        </section>
        <LabNavigation
          links={[
            ['Las vistas', '#gv-views'],
            ['Controles', '#gv-controls'],
            ['Retos', '#gv-challenges'],
            ['Por qué', '#gv-science'],
          ]}
        />
        <LabMission
          index={s.index}
          title={lesson.title}
          instruction={lesson.hint}
          href="#gv-challenges"
          result={
            done
              ? 'Reto completado. Seguí explorando o probá el siguiente.'
              : undefined
          }
          onNext={done ? () => start((s.index + 1) % 4) : undefined}
        />
        <section
          id="gv-views"
          className="rl-observatory"
          aria-label="Viaje y espacio-tiempo"
        >
          <div className="rl-observatory-heading">
            <div>
              <p className="rl-eyebrow">DOS RECORRIDOS / UN REENCUENTRO</p>
              <h2>¿Cuánto vivimos en el camino?</h2>
            </div>
            <span className="rl-state">
              {s.playing
                ? 'VIAJE EN CURSO'
                : s.setup.progress === 1
                  ? 'REENCUENTRO'
                  : 'PAUSADO · EXPLORÁ'}
            </span>
          </div>
          <div
            className="rl-mobile-views"
            role="group"
            aria-label="Elegir vista en celular"
          >
            {(['trip', 'diagram'] as const).map((kind) => (
              <button
                key={kind}
                aria-pressed={view === kind}
                onClick={() => setView(kind)}
              >
                {kind === 'trip' ? 'El viaje' : 'Espacio-tiempo'}
              </button>
            ))}
          </div>
          <div className="rl-views">
            {(['trip', 'diagram'] as const).map((kind, i) => (
              <article
                className="rl-frame"
                key={kind}
                data-active={view === kind}
              >
                <div className="rl-frame-heading">
                  <div>
                    <span>
                      0{i + 1} /{' '}
                      {kind === 'trip'
                        ? 'EL RECORRIDO'
                        : 'LAS LÍNEAS DE UNIVERSO'}
                    </span>
                    <h3>
                      {kind === 'trip' ? 'El viaje' : 'El espacio-tiempo'}
                    </h3>
                  </div>
                  <Info
                    name={
                      kind === 'trip'
                        ? 'Cómo leer el viaje'
                        : 'Cómo leer el espacio-tiempo'
                    }
                  >
                    {kind === 'trip'
                      ? 'Vista espacial calculada en el sistema inercial de casa. Un año luz es distancia; a la velocidad de la luz se recorre en un año. Las dos vías solo separan ida y vuelta en el dibujo: el movimiento es en una dimensión. Los tamaños de casa y nave son simbólicos.'
                      : 'La altura es tiempo en casa y la horizontal es distancia. Cada curva es una historia en el espacio-tiempo, no una órbita espacial. La parte brillante es el pasado recorrido y la tenue el viaje planeado. Con c = 1, las unidades de ambos ejes tienen igual escala. La línea rosa conecta sucesos simultáneos en el sistema comóvil actual de la nave.'}
                  </Info>
                </div>
                <Scene setup={s.setup} kind={kind} signals={signals} />
                <p className="rl-frame-caption">
                  {kind === 'trip'
                    ? `Etapa: ${m.phase}. Alejamiento máximo: ${n(m.distance)} años luz. Casa define el tiempo del control.`
                    : 'Ambas vistas usan coordenadas de casa. La línea rosa muestra otro criterio de simultaneidad; no representa una señal de luz.'}
                </p>
              </article>
            ))}
          </div>
          <div className="gv-clocks" aria-live={s.playing ? 'off' : 'polite'}>
            <Clock
              value={m.t}
              total={s.setup.duration}
              name="Gemelo en casa"
              color="#f2bd8c"
            />
            <Clock
              value={m.own}
              total={s.setup.duration}
              name="Gemelo en la nave"
              color="#9ee9df"
            />
            <div className="gv-difference">
              <span>
                {s.setup.progress === 1
                  ? 'Diferencia al reencontrarse'
                  : 'Diferencia en este corte de casa'}
              </span>
              <strong>
                {n(m.gap)} <small>años</small>
              </strong>
              <p>
                {s.setup.progress === 1
                  ? 'Mismo lugar y evento: compará ambos relojes.'
                  : 'Se comparan sucesos simultáneos en casa; no imágenes recibidas.'}
              </p>
            </div>
          </div>
          <p className="rl-map-note">
            Relojes ideales en espacio-tiempo plano, sin gravedad. Salida, giro
            y llegada se idealizan como cambios instantáneos de velocidad.{' '}
            <Info name="Qué idealiza el modelo">
              La aceleración real necesita tiempo y recursos. Aquí usamos tramos
              inerciales unidos por cambios instantáneos: no calculamos fuerzas
              ni una maniobra realizable. El tiempo propio se integra en cada
              tramo y permanece continuo al girar. La espera ocurre en reposo
              respecto de casa, lejos de fuentes gravitatorias. Casa representa
              una estación inercial, no la superficie terrestre con gravedad.
            </Info>
          </p>
        </section>
        <section
          className="rl-controls"
          id="gv-controls"
          aria-labelledby="gv-controls-title"
        >
          <div className="rl-section-heading">
            <div>
              <p className="rl-eyebrow">
                UN PLAN DE VIAJE / CAMBIOS QUE PODÉS MEDIR
              </p>
              <h2 id="gv-controls-title">Armá tu viaje.</h2>
            </div>
            <a href="#gv-views">Ver viaje y relojes ↑</a>
          </div>
          <div className="rl-control-grid">
            {(['outbound', 'inbound'] as const).map((key) => (
              <div className="rl-control-card" key={key}>
                <div className="rl-control-label">
                  <label htmlFor={`gv-${key}`}>
                    Rapidez de {key === 'outbound' ? 'ida' : 'vuelta'}
                  </label>
                  <output>{n(s.setup[key])} c</output>
                </div>
                <input
                  id={`gv-${key}`}
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.01"
                  value={s.setup[key]}
                  aria-valuetext={`${n(s.setup[key])} veces la velocidad de la luz`}
                  onChange={(e) => tune({ [key]: +e.target.value })}
                />
                <p>
                  Por cada año en casa, este tramo suma{' '}
                  <b>{n(Math.sqrt(1 - s.setup[key] ** 2))} años</b> en la nave.
                </p>
              </div>
            ))}
            <div className="rl-control-card gv-wide">
              <div className="gv-buttons">
                <button onClick={() => tune({ outbound: 0.6, inbound: 0.6 })}>
                  Ambos a 0,6 c
                </button>
                <button onClick={() => tune({ outbound: 0.8, inbound: 0.8 })}>
                  Ambos a 0,8 c
                </button>
              </div>
              <p>
                Las rapideces se eligen como parte del plan; no aceleran un
                viaje en curso. Cambiar una condición vuelve a la salida y
                pausa.
              </p>
            </div>
            <div className="rl-control-card">
              <div className="rl-control-label">
                <label htmlFor="gv-duration">Duración total en casa</label>
                <output>{n(s.setup.duration)} años</output>
              </div>
              <input
                id="gv-duration"
                type="range"
                min="2"
                max="20"
                step="1"
                value={s.setup.duration}
                onChange={(e) => tune({ duration: +e.target.value })}
              />
              <button onClick={() => tune({ duration: 10 })}>
                Usar 10 años
              </button>
              <p>
                Se mantiene fija al cambiar las rapideces: la distancia al
                destino se recalcula para poder volver a tiempo.
              </p>
            </div>
            <div className="rl-control-card">
              <div className="rl-control-label">
                <label htmlFor="gv-wait">Espera en el destino</label>
                <output>{n(m.stop)} años</output>
              </div>
              <input
                id="gv-wait"
                type="range"
                min="0"
                max="0.4"
                step="0.05"
                value={s.setup.wait}
                aria-valuetext={`${n(m.stop)} años, ${n(s.setup.wait * 100)} por ciento del total`}
                onChange={(e) => tune({ wait: +e.target.value })}
              />
              <div className="gv-buttons">
                <button onClick={() => tune({ wait: 0 })}>Sin espera</button>
                <button onClick={() => tune({ duration: 10, wait: 0.2 })}>
                  Esperar 2 de 10 años
                </button>
              </div>
              <p>
                En reposo respecto de casa, dτ/dt = 1. La espera ocupa el{' '}
                {n(s.setup.wait * 100)} % del total y deja menos tiempo para
                viajar.
              </p>
            </div>
            <div className="rl-control-card gv-wide">
              <div className="rl-control-label">
                <label htmlFor="gv-time">Tiempo transcurrido en casa</label>
                <output>{n(m.t)} años</output>
              </div>
              <input
                id="gv-time"
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={s.setup.progress}
                aria-valuetext={`${n(m.t)} de ${n(s.setup.duration)} años, ${m.phase}`}
                onChange={(e) => time(+e.target.value)}
              />
              <div className="gv-buttons">
                <button
                  className="rl-primary"
                  onClick={() => dispatch({ type: 'play' })}
                >
                  {s.playing
                    ? 'Pausar viaje'
                    : s.setup.progress === 1
                      ? 'Repetir viaje'
                      : 'Iniciar viaje'}
                </button>
                <button onClick={() => time(0)}>Ir a la salida</button>
                <button onClick={() => time(1)}>Ir al reencuentro</button>
              </div>
              <p>
                El deslizador permite ir y volver sin esperar la reproducción.
                Los números son años físicos; la reproducción tarda unos 14
                segundos.
              </p>
            </div>
          </div>
          <div className="gv-effect" aria-live={s.playing ? 'off' : 'polite'}>
            <span>EL EFECTO DE TU CAMBIO</span>
            <p>
              Al volver: casa <b>{n(s.setup.duration)} años</b> · nave{' '}
              <b>{n(m.ownTotal)} años</b> · diferencia{' '}
              <b>{n(s.setup.duration - m.ownTotal)} años</b>. Destino a{' '}
              <b>{n(m.distance)} años luz</b>.
            </p>
          </div>
          <a className="gv-jump" href="#gv-views">
            Comparar las dos vistas ↑
          </a>
        </section>
        <section id="gv-turn" className="rl-controls">
          <div className="rl-section-heading">
            <div>
              <p className="rl-eyebrow">LA PREGUNTA DE LA PARADOJA</p>
              <h2>¿Y desde la nave?</h2>
            </div>
            <Info name="El ahora remoto">
              En un tramo inercial, el evento de casa simultáneo con la nave
              cumple t casa = t − vx/c². Cambiar la velocidad cambia esta
              asignación lejana. En el giro instantáneo idealizado hay un salto
              de coordenadas, no un salto en un reloj físico. Con una maniobra
              de duración finita, el cambio de asignación es continuo.
            </Info>
          </div>
          <p>
            La nave cambia de sistema comóvil al regresar. Compará ambos lados
            del primer cambio de velocidad: mismo lugar, mismo reloj local,
            distinto “ahora” lejano.
          </p>
          <div className="gv-buttons">
            <button onClick={() => time(m.out / s.setup.duration, 'before')}>
              Antes de cambiar
            </button>
            <button onClick={() => time(m.out / s.setup.duration, 'after')}>
              Después de cambiar
            </button>
          </div>
          <div className="gv-remote" aria-live={s.playing ? 'off' : 'polite'}>
            <div>
              <span>Reloj local de la nave</span>
              <strong>{n(m.own)} años</strong>
            </div>
            <div>
              <span>“Ahora” de casa asignado por la nave</span>
              <strong>{n(m.assignedEarth)} años</strong>
              <p>Simultaneidad comóvil con v = {n(m.velocity)} c.</p>
            </div>
          </div>
          <p>
            Sin espera, a 0,8 c y 10 años de viaje: el reloj local vale 3 años
            antes y después del giro; la asignación remota pasa de 1,8 a 8,2.{' '}
            <b>Nadie envejece de golpe.</b>
          </p>
          <div className="gv-buttons">
            <button aria-pressed={signals} onClick={() => setSignals(!signals)}>
              Mostrar mensaje que llega a casa
            </button>
          </div>
          {signals && (
            <p className="gv-message">
              A casa le llega ahora un mensaje emitido por la nave cuando su
              reloj marcaba <b>{n(m.received.own)} años</b>, en t ={' '}
              {n(m.received.t)} años de casa. El reloj de la nave en el corte
              actual marca {n(m.own)}. La luz tardó {n(m.t - m.received.t)}{' '}
              años:{' '}
              <b>recibir una imagen y asignar un “ahora” no son lo mismo.</b> La
              línea amarilla del diagrama es ese trayecto de luz.
            </p>
          )}
          <a className="gv-jump" href="#gv-views">
            Ver las líneas del diagrama ↑
          </a>
        </section>
        <section
          className="rl-challenges"
          id="gv-challenges"
          aria-labelledby="gv-challenges-title"
        >
          <div className="rl-section-heading">
            <div>
              <p className="rl-eyebrow">PREDECIR / PROBAR / EXPLICAR</p>
              <h2 id="gv-challenges-title">Cuatro citas con el tiempo.</h2>
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
              <h3 id="gv-question" tabIndex={-1}>
                {lesson.question}
              </h3>
              <fieldset className="rl-predictions">
                <legend>Tu predicción</legend>
                {lesson.choices.map((choice, i) => (
                  <label key={choice}>
                    <input
                      type="radio"
                      name="gv-prediction"
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
                    {checks[i] ? '✓' : '○'} {step}
                  </li>
                ))}
              </ul>
              <div className="rl-challenge-actions">
                <a href={s.index === 2 ? '#gv-turn' : '#gv-controls'}>
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
        <section id="gv-science" className="rl-science">
          <div>
            <p className="rl-eyebrow">POR QUÉ IMPORTA</p>
            <h2>
              Cada recorrido
              <br />
              <em>lleva su tiempo.</em>
            </h2>
            <p>
              El tiempo propio es lo que mide un reloj que acompaña a una
              persona. La diferencia al volver es física: describe también
              cuánto envejeció cada gemelo idealizado.
            </p>
            <p>
              La aparente paradoja nace de tratar todo el viaje de la nave como
              un único sistema inercial. Los tramos de ida y vuelta usan
              sistemas diferentes. Casa mantiene uno solo en este modelo.
            </p>
            <a
              href="https://www.einstein-online.info/en/spotlight/twins/"
              target="_blank"
              rel="noreferrer"
            >
              Einstein Online: los gemelos viajeros ↗
            </a>
          </div>
          <div>
            <details open>
              <summary>La fórmula que suma los relojes</summary>
              <div className="rl-formula">
                τ = ∫ √(1 − v(t)²/c²) dt
                <span>
                  τ nave = t ida √(1 − β ida²) + t espera + t vuelta √(1 − β
                  vuelta²)
                </span>
              </div>
              <p>
                β = v/c. El tiempo t pertenece al sistema inercial de casa. Con
                rapidez constante en cada tramo, la integral se convierte en
                esta suma. La velocidad de la luz sigue siendo c.
              </p>
              <p className="gv-equation">
                En tu viaje: {n(m.out)} ×{' '}
                {n(Math.sqrt(1 - s.setup.outbound ** 2))} + {n(m.stop)} +{' '}
                {n(m.back)} × {n(Math.sqrt(1 - s.setup.inbound ** 2))} ={' '}
                <b>{n(m.ownTotal)} años</b>.
              </p>
            </details>
            <details>
              <summary>¿La aceleración “quita años”?</summary>
              <p>
                El giro conecta los tramos y rompe la simetría entre recorridos.
                La diferencia no se concentra en ese instante: ya se acumula a
                lo largo de los tramos. Una maniobra real también contribuye a
                la integral según su velocidad y duración. Aquí idealizamos su
                duración a cero.
              </p>
              <a
                href="https://www.einstein-online.info/en/spotlight/twinsroad/"
                target="_blank"
                rel="noreferrer"
              >
                Einstein Online: recorridos y giros ↗
              </a>
            </details>
            <details>
              <summary>Lo que llega por luz</summary>
              <p>
                En unidades de años y años luz, t recepción = t emisión + x
                emisión. El modelo resuelve esta ecuación en cada tramo para
                encontrar el último mensaje que llega a casa. Este retraso
                óptico es distinto del tiempo propio y de la simultaneidad
                comóvil.
              </p>
            </details>
            <details>
              <summary>Alcance del modelo</summary>
              <p>
                Movimiento rectilíneo, sin gravedad, relojes ideales y cambios
                instantáneos de velocidad. La espera está en reposo respecto de
                casa. Se fija la duración total y se calcula el destino para que
                las dos rapideces elegidas permitan regresar. No se simulan
                motores, combustible ni envejecimiento biológico detallado. Las
                cifras redondeadas son solo de presentación.
              </p>
            </details>
          </div>
        </section>
        <section className="rl-continue">
          <p className="rl-eyebrow">DEL MOVIMIENTO A LA GRAVEDAD</p>
          <h2>¿Gravedad o aceleración?</h2>
          <p>
            Entrá al ascensor de Einstein: compará caída libre, aceleración y
            las mediciones de un laboratorio local.
          </p>
          <a className="gv-jump" href="/ascensor-de-einstein/">
            Explorar el ascensor de Einstein →
          </a>
        </section>
        <EinsteinNavigation current="nos-vemos-a-la-vuelta" />
        <MoreLabs current="nos-vemos-a-la-vuelta" />
      </main>
      <footer className="rl-footer">
        <a href="/">∿ SPUM / EXPERIMENTOS</a>
        <span>Un reencuentro. Dos historias.</span>
      </footer>
    </div>
  )
}
