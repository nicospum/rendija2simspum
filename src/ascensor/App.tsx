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
import { initialState, LESSONS, observations, reducer } from './learning'
import { SCENARIOS, snapshot } from './physics'
import type { Setup, Scenario } from './physics'
import { n } from './format'
import Scene from './Scene'
export default function ElevatorApp() {
  const [s, dispatch] = useReducer(reducer, undefined, () =>
    initialState(0, readCompleted('ascensor-de-einstein')),
  ),
    [view, setView] = useState(false),
    [visible, setVisible] = useState(!document.hidden)
  useChapterProgress('ascensor-de-einstein', s.completed)
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
    l = LESSONS[s.index],
    done = s.completed.includes(s.index),
    checks = observations(s),
    isLight = s.setup.instrument === 'luz'
  const tune = (patch: Partial<Omit<Setup, 'progress'>>) =>
      dispatch({ type: 'tune', patch }),
    time = (value: number) => dispatch({ type: 'time', value }),
    start = (index: number) => dispatch({ type: 'lesson', index })
  const release = () => {
    time(0)
    dispatch({ type: 'play' })
  }
  const next = () => {
    start((s.index + 1) % 4)
    requestAnimationFrame(() => {
      document
        .getElementById('as-challenges')
        ?.scrollIntoView({ block: 'start' })
      document.getElementById('as-question')?.focus({ preventScroll: true })
    })
  }
  return (
    <div className="en-lab rl-shell as-shell">
      <a href="#as-controls" className="rl-skip">
        Ir a los controles
      </a>
      <header className="rl-header">
        <a className="rl-brand" href="/">
          ∿ SPUM <small>EXPERIMENTOS</small>
        </a>
        <a href="/einstein/">Especial Einstein ↗</a>
      </header>
      <main>
        <EinsteinNavigation current="ascensor-de-einstein" />
        <section className="rl-intro">
          <div>
            <p className="rl-eyebrow">LABORATORIO 11 / RELATIVIDAD GENERAL</p>
            <h1>
              El ascensor
              <br />
              <em>de Einstein.</em>
            </h1>
          </div>
          <div>
            <p className="rl-eyebrow">
              UNA CABINA CERRADA / UNA IDEA QUE CAMBIÓ LA GRAVEDAD
            </p>
            <h2>
              ¿Gravedad
              <br />o aceleración?
            </h2>
            <p>
              Soltá dos pelotas, mirá una balanza y hacé cruzar un pulso de luz.
              Compará lo que pasa dentro de la cabina con el contexto exterior y
              descubrí qué podés deducir con un experimento local.
            </p>
            <a data-scene-play href="#as-views">Jugar sobre la escena ↓</a>
          </div>
        </section>
        <LabNavigation
          links={[
            ['Las vistas', '#as-views'],
            ['Controles', '#as-controls'],
            ['Retos', '#as-challenges'],
            ['Por qué', '#as-science'],
          ]}
        />
        <LabMission
          index={s.index}
          title={l.title}
          instruction={l.hint}
          href="#as-challenges"
          result={
            done
              ? 'Reto completado. Compará otro caso o seguí al siguiente.'
              : undefined
          }
          onNext={done ? () => start((s.index + 1) % 4) : undefined}
        />
        <section
          id="as-views"
          data-scene-workspace
          className="rl-observatory"
          aria-label="Interior y referencia exterior del ascensor"
        >
          <div className="rl-observatory-heading">
            <div>
              <p className="rl-eyebrow">
                {SCENARIOS[s.setup.scenario].title.toUpperCase()} /{' '}
                {isLight ? 'UN PULSO DE LUZ' : 'DOS PELOTAS Y UNA BALANZA'}
              </p>
              <h2>
                {isLight
                  ? 'La cabina cambia. La luz sigue.'
                  : '¿Qué te cuenta el piso?'}
              </h2>
            </div>
            <span className="rl-state">
              {s.playing
                ? 'ENSAYO EN CURSO'
                : s.setup.progress === 1
                  ? 'RESULTADO DEL ENSAYO'
                  : 'PAUSADO · EXPLORÁ'}
              <br />
              {isLight ? 'τ emisor' : 't'} ={' '}
              {isLight ? n(m.light.emitterTime * 1e9) : n(m.t)}{' '}
              {isLight ? 'ns' : 's'}
            </span>
          </div>
          <div className="spum-live-stage">
          <div
            className="rl-mobile-views"
            role="group"
            aria-label="Elegir vista en celular"
          >
            <button aria-pressed={!view} onClick={() => setView(false)}>
              Dentro de la cabina
            </button>
            <button aria-pressed={view} onClick={() => setView(true)}>
              {isLight ? 'Referencia libre' : 'Desde afuera'}
            </button>
          </div>
          <div className="rl-views">
            {[false, true].map((outside, i) => (
              <article
                key={String(outside)}
                className="rl-frame"
                data-active={view === outside}
              >
                <div className="rl-frame-heading">
                  <div>
                    <span>
                      0{i + 1} /{' '}
                      {outside
                        ? 'OTRO SISTEMA DE REFERENCIA'
                        : 'EL LABORATORIO LOCAL'}
                    </span>
                    <h3>
                      {outside
                        ? isLight
                          ? 'Referencia libre local'
                          : 'Desde afuera'
                        : 'Dentro de la cabina'}
                    </h3>
                  </div>
                  <Info
                    name={
                      outside
                        ? 'Qué muestra la referencia exterior'
                        : 'Qué podés medir adentro'
                    }
                  >
                    {outside
                      ? isLight
                        ? 'Para la luz usamos un laboratorio libre local, inicialmente en reposo respecto de la cabina: el rayo es recto. La línea verde muestra el nivel del emisor de una cabina con aceleración propia. No es una imagen global de la Tierra ni el mismo sistema exterior del ensayo mecánico.'
                        : 'Para las pelotas, los ejes exteriores están ligados al suelo si hay campo gravitatorio y a un laboratorio inercial si estamos lejos de masas. El contorno punteado marca la cabina al inicio. Se calcula la posición de la cabina y de ambas pelotas con las mismas ecuaciones.'
                      : 'Las pelotas se liberan a la vez, a la misma altura y sin velocidad inicial relativa. La balanza es otro instrumento: sostiene un objeto de la masa elegida y mide la fuerza de apoyo. La masa se conserva incluso cuando esa fuerza vale cero.'}
                  </Info>
                </div>
                <p className="spum-scene-prompt">{isLight ? 'Arrastrá el pulso por su trayectoria' : 'Tocá una pelota para soltar ambas'}</p>
                <Scene
                  setup={s.setup}
                  outside={outside}
                  onRelease={release}
                  onProgress={time}
                />
                <p className="rl-frame-caption">
                  {isLight
                    ? outside
                      ? 'Amarillo: luz en el marco libre. Verde: nivel emisor de la cabina. Los ejes horizontal y vertical tienen unidades distintas.'
                      : 'El rayo baja respecto de una cabina acelerada. En una cabina libre permanece recto. La escala vertical ampliada permite ver una desviación minúscula.'
                    : outside
                      ? `${SCENARIOS[s.setup.scenario].description} a cabina = ${n(m.cabinAcceleration)} m/s²; g = ${n(m.g)} m/s². El contorno punteado marca el inicio.`
                      : 'La balanza sostiene un objeto; las pelotas están libres hasta tocar el piso. Las alturas se calculan en metros.'}
                </p>
              </article>
            ))}
          </div>
          </div>
          <SceneConsole
            challengeHref="#as-challenges"
            viewHref="#as-views"
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
            hint="Tocá cualquiera de las pelotas para soltar ambas a la vez. Podés pausar y recorrer el ensayo sin esperar. En modo luz, arrastrá el pulso por su trayectoria. Cambiar cabina, masa o intensidad prepara un ensayo nuevo. La balanza sostiene otro objeto: mide apoyo, mientras las pelotas caen libres."
          >
            <div className="spum-console-row">
              <label htmlFor="as-live-time">
                {isLight ? 'Recorrer el pulso' : 'Recorrer la caída'}
              </label>
              <output>
                {n(s.setup.progress * 100, 0)} % ·{' '}
                {isLight ? `${n(m.light.emitterTime * 1e9)} ns` : `${n(m.t)} s`}
              </output>
            </div>
            <input
              id="as-live-time"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={s.setup.progress}
              onChange={(e) => time(+e.target.value)}
            />
            <p className="spum-console-impact">
              {isLight
                ? `Desvío interior: ${n(m.light.drop * 1e15)} fm · ${s.setup.zoom ? 'eje vertical en femtómetros' : 'escala vertical en metros'}.`
                : `Altura: ${n(m.ballY)} m · Balanza: ${n(m.normal)} N · Campo: ${n(m.g)} m/s².`}
            </p>
            <div className="spum-console-buttons">
              <button onClick={release}>
                {isLight ? 'Emitir luz' : 'Soltar pelotas'}
              </button>
              <button onClick={() => dispatch({ type: 'play' })}>
                {s.playing ? 'Pausar ensayo' : 'Continuar ensayo'}
              </button>
              <button onClick={() => time(1)}>Ver resultado</button>
            </div>
            <div
              className="spum-console-buttons"
              role="group"
              aria-label="Cambiar cabina junto a la escena"
            >
              {(Object.keys(SCENARIOS) as Scenario[]).map((scenario) => (
                <button
                  key={scenario}
                  aria-pressed={s.setup.scenario === scenario}
                  onClick={() => tune({ scenario })}
                >
                  {SCENARIOS[scenario].short}
                </button>
              ))}
            </div>
            <div className="spum-console-buttons">
              <button
                aria-pressed={!isLight}
                onClick={() => tune({ instrument: 'pelotas' })}
              >
                Pelotas y balanza
              </button>
              <button
                aria-pressed={isLight}
                onClick={() => tune({ instrument: 'luz' })}
              >
                Pulso de luz
              </button>
              {isLight ? (
                <button
                  aria-pressed={s.setup.zoom}
                  onClick={() => tune({ zoom: !s.setup.zoom })}
                >
                  {s.setup.zoom ? 'Quitar ampliación' : 'Ampliar desvío'}
                </button>
              ) : (
                <>
                  <button onClick={() => tune({ mass: 1 })}>Objeto de 1 kg</button>
                  <button onClick={() => tune({ mass: 4 })}>Objeto de 4 kg</button>
                </>
              )}
            </div>
            <details className="spum-console-help">
              <summary>
                Ajustar intensidad{isLight ? ' y ancho' : ' y masa'}
              </summary>
              <div className="spum-console-row">
                <label htmlFor="as-live-strength">Intensidad</label>
                <output>{n(s.setup.strength)} m/s²</output>
              </div>
              <input
                id="as-live-strength"
                type="range"
                min="1"
                max="20"
                step="0.01"
                value={s.setup.strength}
                onChange={(e) => tune({ strength: +e.target.value })}
              />
              <div className="spum-console-buttons">
                <button onClick={() => tune({ strength: 9.81 })}>
                  Usar 9,81 m/s²
                </button>
              </div>
              {isLight ? (
                <>
                  <label htmlFor="as-live-width">
                    Ancho de cabina: {n(s.setup.width)} m
                  </label>
                  <input
                    id="as-live-width"
                    type="range"
                    min="1"
                    max="6"
                    step="0.1"
                    value={s.setup.width}
                    onChange={(e) => tune({ width: +e.target.value })}
                  />
                </>
              ) : (
                <>
                  <label htmlFor="as-live-mass">
                    Masa del objeto: {n(s.setup.mass)} kg
                  </label>
                  <input
                    id="as-live-mass"
                    type="range"
                    min="0.2"
                    max="5"
                    step="0.1"
                    value={s.setup.mass}
                    onChange={(e) => tune({ mass: +e.target.value })}
                  />
                </>
              )}
            </details>
          </SceneConsole>
          <div className="as-readings" aria-live={s.playing ? 'off' : 'polite'}>
            <div>
              <span>
                {isLight
                  ? 'Desvío del rayo en la cabina'
                  : 'Altura de ambas pelotas'}
              </span>
              <strong>
                {isLight ? n(m.light.drop * 1e15) : n(m.ballY)}{' '}
                <small>{isLight ? 'fm' : 'm'}</small>
              </strong>
              <p>
                {isLight
                  ? '1 femtómetro = 10⁻¹⁵ metros.'
                  : m.contact
                    ? 'Llegaron juntas; choque ideal sin rebote.'
                    : 'Se mide respecto del piso de la cabina.'}
              </p>
            </div>
            <div>
              <span>
                Lectura de la balanza{' '}
                <Info name="Peso aparente">
                  La balanza mide la fuerza normal N sobre un objeto apoyado, no
                  la fuerza gravitatoria por sí sola. En el modelo N = m(g + a
                  cabina), con el eje exterior positivo hacia arriba y g como
                  magnitud del campo hacia abajo. En caída libre a cabina = −g y
                  N = 0. El objeto conserva su masa.
                </Info>
              </span>
              <strong>
                {n(m.normal)} <small>N</small>
              </strong>
              <p>Objeto apoyado: {n(s.setup.mass)} kg · masa constante.</p>
            </div>
            <div>
              <span>
                Acelerómetro de la cabina{' '}
                <Info name="Aceleración propia">
                  Mide la aceleración que registra un instrumento sujeto a la
                  cabina. Marca cero en caída libre aunque las coordenadas
                  exteriores la describan acelerando hacia abajo. En una nave
                  con motor o un ascensor sostenido marca una magnitud positiva.
                </Info>
              </span>
              <strong>
                {n(m.proper)} <small>m/s²</small>
              </strong>
              <p>
                {m.proper === 0
                  ? 'Sin empuje de apoyo: ingravidez local.'
                  : 'Hay apoyo o motor: la cabina no es libre.'}
              </p>
            </div>
          </div>
          <p className="rl-map-note">
            {isLight
              ? 'El tiempo de la luz está en nanosegundos; no es el tiempo del ensayo con pelotas. Ejes con escalas distintas: una curva visible aquí no implica una desviación grande.'
              : 'Gravedad homogénea y velocidades bajas. Se ignoran aire y fuerzas de marea; el encuadre exterior se ajusta para mantener toda la cabina visible.'}{' '}
            <Info name="Hasta dónde vale la equivalencia">
              Es un principio local: sirve en regiones y tiempos suficientemente
              pequeños para despreciar cambios del campo y fuerzas de marea. Un
              campo real puede producir diferencias entre trayectorias cercanas.
              La equivalencia no convierte cualquier campo gravitatorio global
              en una nave acelerada. Para cuerpos usamos el límite de baja
              velocidad; para la luz, un marco de Rindler en espacio-tiempo
              plano y su equivalencia local con una cabina sostenida.
            </Info>
          </p>
        </section>
        <section
          id="as-controls"
          className="rl-controls"
          aria-labelledby="as-controls-title"
        >
          <div className="rl-section-heading">
            <div>
              <p className="rl-eyebrow">
                CAMBIÁ UNA CONDICIÓN / COMPARÁ EL RESULTADO
              </p>
              <h2 id="as-controls-title">Elegí tu cabina.</h2>
            </div>
            <a href="#as-views">Ver la cabina y las mediciones ↑</a>
          </div>
          <ChallengeGuide
            index={s.index}
            title={l.title}
            prediction={s.prediction === null ? undefined : l.choices[s.prediction]}
            steps={l.steps.map((label, i) => ({ label, done: checks[i] }))}
            saved={done}
            challengeHref="#as-challenges"
            viewHref="#as-views"
            help="La balanza mide la fuerza de apoyo en newtons (N), no la presencia de gravedad. Elegí una cabina y tocá «Ver resultado»; después cambiá la situación para comparar. Cambiar condiciones reinicia el ensayo."
          />
          <div
            className="as-scenarios"
            role="group"
            aria-label="Situación de la cabina"
          >
            {(Object.keys(SCENARIOS) as Scenario[]).map((key) => (
              <button
                key={key}
                aria-pressed={s.setup.scenario === key}
                onClick={() => tune({ scenario: key })}
              >
                <b>{SCENARIOS[key].title}</b>
                <span>{SCENARIOS[key].description}</span>
              </button>
            ))}
          </div>
          <div className="as-context">
            <span>
              CAMPO GRAVITATORIO: <b>{n(m.g)} m/s² ↓</b>
            </span>
            <span>
              ACELERACIÓN EXTERIOR DE LA CABINA:{' '}
              <b>{n(m.cabinAcceleration)} m/s²</b> (positivo hacia arriba)
            </span>
          </div>
          <div
            className="as-buttons"
            role="group"
            aria-label="Instrumento del ensayo"
          >
            <button
              aria-pressed={!isLight}
              onClick={() => tune({ instrument: 'pelotas' })}
            >
              Pelotas y balanza
            </button>
            <button
              aria-pressed={isLight}
              onClick={() => tune({ instrument: 'luz' })}
            >
              Pulso de luz
            </button>
          </div>
          <div className="rl-control-grid">
            <div className="rl-control-card">
              <div className="rl-control-label">
                <label htmlFor="as-strength">Intensidad del ensayo</label>
                <output>{n(s.setup.strength)} m/s²</output>
              </div>
              <input
                id="as-strength"
                type="range"
                min="1"
                max="20"
                step="0.01"
                value={s.setup.strength}
                onChange={(e) => tune({ strength: +e.target.value })}
              />
              <button onClick={() => tune({ strength: 9.81 })}>
                Usar 9,81 m/s²
              </button>
              <p>
                {s.setup.scenario === 'cohete'
                  ? 'Controla la aceleración hacia arriba del motor.'
                  : s.setup.scenario === 'deriva'
                    ? 'En esta situación no hay campo ni motor; variar este valor no crea peso.'
                    : 'Controla la magnitud del campo gravitatorio hacia abajo.'}{' '}
                En el ensayo mecánico, el tiempo final se ajusta para observar
                la caída completa.
              </p>
            </div>
            {!isLight ? (
              <div className="rl-control-card">
                <div className="rl-control-label">
                  <label htmlFor="as-mass">Masa del objeto elegido</label>
                  <output>{n(s.setup.mass)} kg</output>
                </div>
                <input
                  id="as-mass"
                  type="range"
                  min="0.2"
                  max="5"
                  step="0.1"
                  value={s.setup.mass}
                  onChange={(e) => tune({ mass: +e.target.value })}
                />
                <div className="as-buttons">
                  <button onClick={() => tune({ mass: 1 })}>
                    Objeto de 1 kg
                  </button>
                  <button onClick={() => tune({ mass: 4 })}>
                    Objeto de 4 kg
                  </button>
                </div>
                <p>
                  Cambia la pelota verde y el objeto apoyado en la balanza. La
                  pelota naranja siempre tiene 1 kg. La masa cambia la fuerza,
                  no la aceleración de caída.
                </p>
              </div>
            ) : (
              <div className="rl-control-card">
                <div className="rl-control-label">
                  <label htmlFor="as-width">Ancho que cruza la luz</label>
                  <output>{n(s.setup.width)} m</output>
                </div>
                <input
                  id="as-width"
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={s.setup.width}
                  onChange={(e) => tune({ width: +e.target.value })}
                />
                <button onClick={() => tune({ width: 3 })}>Usar 3 m</button>
                <p>
                  El desvío crece aproximadamente con el cuadrado del ancho. La
                  luz cruza a c = 299.792.458 m/s; la reproducción solo
                  ralentiza su presentación.
                </p>
              </div>
            )}
            {isLight && (
              <div className="rl-control-card as-wide">
                <div
                  className="as-buttons"
                  role="group"
                  aria-label="Escala vertical de la luz"
                >
                  <button
                    aria-pressed={s.setup.zoom}
                    onClick={() => tune({ zoom: true })}
                  >
                    Ampliar desvío
                  </button>
                  <button
                    aria-pressed={!s.setup.zoom}
                    onClick={() => tune({ zoom: false })}
                  >
                    Escala sin ampliar
                  </button>
                </div>
                <p>
                  La ampliación cambia solo el dibujo, nunca los cálculos. En
                  escala métrica el desvío es demasiado pequeño para
                  distinguirlo. En ampliación el eje vertical usa femtómetros y
                  el horizontal, metros; no se puede medir un ángulo físico con
                  este gráfico.
                </p>
              </div>
            )}
            <div className="rl-control-card as-wide">
              <div className="rl-control-label">
                <label htmlFor="as-time">
                  {isLight ? 'Tiempo del pulso' : 'Tiempo desde que soltamos'}
                </label>
                <output>
                  {isLight ? n(m.light.emitterTime * 1e9) : n(m.t)}{' '}
                  {isLight ? 'ns' : 's'}
                </output>
              </div>
              <input
                id="as-time"
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={s.setup.progress}
                aria-valuetext={`${isLight ? n(m.light.emitterTime * 1e9) + ' nanosegundos' : n(m.t) + ' segundos'}`}
                onChange={(e) => time(+e.target.value)}
              />
              <div className="as-buttons">
                <button
                  className="rl-primary"
                  onClick={() => dispatch({ type: 'play' })}
                >
                  {s.playing
                    ? 'Pausar ensayo'
                    : s.setup.progress === 1
                      ? 'Repetir ensayo'
                      : 'Iniciar ensayo'}
                </button>
                <button onClick={() => time(0)}>Volver al inicio</button>
                <button onClick={() => time(1)}>Ver resultado</button>
              </div>
              <p>
                Podés mover el tiempo a mano o reproducir. Cambiar una condición
                reinicia el ensayo y pausa. Cambiar la vista o la ampliación
                conserva el instante.
              </p>
            </div>
          </div>
          <div className="as-effect" aria-live={s.playing ? 'off' : 'polite'}>
            <span>EL EFECTO DE TU CAMBIO</span>
            <p>
              {isLight
                ? `Desvío al cruzar ${n(s.setup.width)} m: ${n(m.light.fullDrop * 1e15)} fm. Tiempo de cruce: ${n((s.setup.width / 299792458) * 1e9)} ns.`
                : `Balanza: ${n(s.setup.mass)} × ${n(m.proper)} = ${n(m.normal)} N. ${m.proper === 0 ? 'Las pelotas conservan su altura relativa.' : `Ambas llegan al piso a los ${n(m.hitTime!)} s.`}`}
            </p>
          </div>
          <a className="as-jump" href="#as-views">
            Comparar las dos vistas ↑
          </a>
        </section>
        <section
          id="as-challenges"
          className="rl-challenges"
          aria-labelledby="as-challenges-title"
        >
          <div className="rl-section-heading">
            <div>
              <p className="rl-eyebrow">PREDECIR / PROBAR / EXPLICAR</p>
              <h2 id="as-challenges-title">Cuatro pistas sobre la gravedad.</h2>
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
              <h3 id="as-question" tabIndex={-1}>
                {l.question}
              </h3>
              <fieldset className="rl-predictions">
                <legend>Tu predicción</legend>
                {l.choices.map((choice, i) => (
                  <label key={choice}>
                    <input
                      type="radio"
                      name="as-prediction"
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
                <a href="#as-views">Probar sobre la escena ↑</a>
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
        <section id="as-science" className="rl-science">
          <div>
            <p className="rl-eyebrow">POR QUÉ IMPORTA</p>
            <h2>
              El primer paso
              <br />
              <em>hacia otra gravedad.</em>
            </h2>
            <p>
              Einstein tomó la caída libre como guía: un laboratorio pequeño que
              cae puede comportarse, localmente, como uno sin gravedad. El peso
              que sentimos está relacionado con el apoyo que nos aparta de esa
              caída.
            </p>
            <p>
              La idea conecta aceleración, gravedad y propagación de la luz. Fue
              una pista hacia la relatividad general: para describir regiones
              grandes y fuerzas de marea hace falta la geometría del
              espacio-tiempo.
            </p>
            <a
              href="https://www.einstein-online.info/en/spotlight/equivalence_principle/"
              target="_blank"
              rel="noreferrer"
            >
              Einstein Online: el ascensor y el cohete ↗
            </a>
          </div>
          <div>
            <details open>
              <summary>Las ecuaciones de las pelotas y la balanza</summary>
              <div className="rl-formula">
                y relativa = h − ½(g + a cabina)t²
                <span>N = m(g + a cabina)</span>
              </div>
              <p>
                El eje exterior apunta hacia arriba; g es una magnitud positiva
                hacia abajo. Al soltar: y cabina = ½ a cabina t²; y pelota
                exterior = h − ½gt². Restando obtenemos el movimiento relativo.
                Al tocar el piso se detiene la caída relativa, sin rebote.
              </p>
              <p>
                La balanza sostiene un objeto distinto de las pelotas libres. El
                acelerómetro mide la aceleración propia del soporte. En caída
                libre, a cabina = −g y ambos instrumentos de apoyo marcan cero.
              </p>
            </details>
            <details>
              <summary>La luz: cálculo y ampliación</summary>
              <div className="rl-formula">
                Δy ≈ a propia L²/(2c²)
                <span>
                  Modelo exacto de Rindler para el rayo: y = −(a propia x²/c²) /
                  [1 + √(1 − (a propia x/c²)²)]
                </span>
              </div>
              <p>
                La segunda expresión evita perder precisión al calcular desvíos
                diminutos. Se emite luz horizontalmente en un sistema
                inicialmente en reposo. La referencia libre ve un rayo recto y
                una cabina que acelera; la cabina registra una trayectoria
                descendente. Para una cabina sostenida en gravedad es una
                aproximación local que omite curvatura y mareas.
              </p>
              <a
                href="https://www.einstein-online.info/en/spotlight/equivalence_light/"
                target="_blank"
                rel="noreferrer"
              >
                Einstein Online: equivalencia y desvío de la luz ↗
              </a>
            </details>
            <details>
              <summary>¿Entonces la gravedad no existe?</summary>
              <p>
                No. El campo puede seguir presente mientras un acelerómetro
                libre marca cero. En un campo real, cuerpos separados pueden
                acercarse o alejarse por fuerzas de marea. Esa variación no
                desaparece al elegir un sistema libre. Este modelo homogéneo las
                omite, por eso su equivalencia es local.
              </p>
            </details>
            <details>
              <summary>Qué simplificamos</summary>
              <p>
                Región pequeña, gravedad homogénea y aceleraciones constantes.
                Las pelotas son puntos materiales en vacío, con velocidades muy
                inferiores a c. La balanza no modela transitorios del impacto.
                El pulso sigue un cálculo relativista en espacio-tiempo plano
                acelerado; no integra geodésicas de un planeta. Los gráficos de
                luz usan escalas distintas por eje. Las fuerzas de marea y los
                relojes a distintas alturas quedan para otros capítulos.
              </p>
            </details>
          </div>
        </section>
        <section className="rl-continue">
          <p className="rl-eyebrow">LA PRÓXIMA PREGUNTA</p>
          <h2>¿El tiempo también tiene altura?</h2>
          <p>
            Compará relojes situados a distintas alturas y explorá cómo la
            gravedad y el movimiento se combinan en un satélite GPS.
          </p>
          <a className="as-jump" href="/el-tiempo-tiene-altura/">
            Explorar El tiempo tiene altura →
          </a>
        </section>
        <EinsteinNavigation current="ascensor-de-einstein" footer />
        <MoreLabs current="ascensor-de-einstein" />
      </main>
      <footer className="rl-footer">
        <a href="/">∿ SPUM / EXPERIMENTOS</a>
        <span>Una cabina pequeña. Una idea enorme.</span>
      </footer>
    </div>
  )
}
