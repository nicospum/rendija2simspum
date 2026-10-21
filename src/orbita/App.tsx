import ChallengeGuide from '../components/ui/ChallengeGuide'
import { useEffect, useMemo, useReducer, useState } from 'react'
import Info from '../components/ui/InfoPopover'
import {
  LabMission,
  LabNavigation,
  MoreLabs,
} from '../components/ui/LabJourney'
import EinsteinNavigation from '../einstein/EinsteinNavigation'
import { readCompleted } from '../einstein/progress'
import { useChapterProgress } from '../einstein/usePassport'
import { ARCSEC, AU, CENTURY, CYCLES, integrate, MERCURY } from './physics'
import type { Setup } from './physics'
import { initialState, LESSONS, observations, reducer } from './learning'
import Scene from './Scene'
const n = (v: number, d = 2) =>
  v.toLocaleString('es-AR', {
    maximumFractionDigits: d,
    minimumFractionDigits: d,
  })
export default function OrbitApp() {
  const [s, dispatch] = useReducer(reducer, undefined, () =>
    initialState(0, readCompleted('orbita-que-no-se-cierra')),
  ),
    [einstein, setEinstein] = useState(true),
    [visible, setVisible] = useState(!document.hidden)
  const { a, e, mass } = s.setup
  const orbit = useMemo(
    () => integrate({ ...MERCURY, a, e, mass }),
    [a, e, mass],
  )
  const century = (orbit.delta * ARCSEC * CENTURY) / orbit.period,
    lesson = LESSONS[s.index],
    done = s.completed.includes(s.index),
    checks = observations(s)
  const tune = (patch: Partial<Omit<Setup, 'progress'>>) =>
    dispatch({ type: 'tune', patch })
  const start = (index: number) => dispatch({ type: 'lesson', index })
  const next = () => {
    start((s.index + 1) % 4)
    requestAnimationFrame(() => {
      document
        .getElementById('or-challenges')
        ?.scrollIntoView({ block: 'start' })
      document.getElementById('or-question')?.focus({ preventScroll: true })
    })
  }
  useChapterProgress('orbita-que-no-se-cierra', s.completed)
  useEffect(() => {
    const update = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
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
  return (
    <div className="en-lab rl-shell or-shell">
      <a className="rl-skip" href="#or-controls">
        Ir a los controles
      </a>
      <header className="rl-header">
        <a className="rl-brand" href="/">
          ∿ SPUM <small>EXPERIMENTOS</small>
        </a>
        <a href="/einstein/">Especial Einstein ↗</a>
      </header>
      <main>
        <EinsteinNavigation current="orbita-que-no-se-cierra" />
        <section className="rl-intro">
          <div>
            <p className="rl-eyebrow">LABORATORIO 13 / RELATIVIDAD GENERAL</p>
            <h1>
              La órbita
              <br />
              que <em>no se cierra.</em>
            </h1>
          </div>
          <div>
            <p className="rl-eyebrow">
              MERCURIO / UNA PISTA EN UN GIRO DIMINUTO
            </p>
            <h2>
              Volvió al punto más cercano.
              <br />
              ¿Pero en la misma dirección?
            </h2>
            <p>
              Una elipse parece repetir siempre el mismo camino. Mirala con más
              cuidado: su orientación puede avanzar. Explorá la pista que ayudó
              a poner a prueba la gravedad de Einstein.
            </p>
            <a href="#or-challenges">Empezar con una predicción ↓</a>
          </div>
        </section>
        <LabNavigation
          links={[
            ['Las órbitas', '#or-views'],
            ['Controles', '#or-controls'],
            ['Retos', '#or-challenges'],
            ['Por qué', '#or-science'],
          ]}
        />
        <LabMission
          index={s.index}
          title={lesson.title}
          instruction={lesson.hint}
          href="#or-challenges"
          result={
            done
              ? 'Reto completado. Seguí explorando o pasá al siguiente.'
              : undefined
          }
          onNext={done ? next : undefined}
        />
        <section
          id="or-views"
          className="rl-observatory"
          aria-label="Comparación de órbitas newtoniana y relativista"
        >
          <div className="rl-observatory-heading">
            <div>
              <p className="rl-eyebrow">MISMOS RADIOS EXTREMOS / DOS TEORÍAS</p>
              <h2>Una vuelta. Una pequeña diferencia.</h2>
            </div>
            <span className="rl-state">
              {s.playing
                ? 'EXPLORANDO'
                : s.setup.progress === 1
                  ? 'DIEZ VUELTAS COMPLETAS'
                  : 'PAUSADO · EXPLORÁ'}
              <br />
              {n(s.setup.progress * CYCLES)} vueltas radiales
            </span>
          </div>
          <div
            className="rl-mobile-views"
            role="group"
            aria-label="Elegir órbita en celular"
          >
            <button aria-pressed={!einstein} onClick={() => setEinstein(false)}>
              Newton · cierra
            </button>
            <button aria-pressed={einstein} onClick={() => setEinstein(true)}>
              Einstein · avanza
            </button>
          </div>
          <div className="rl-views">
            {[false, true].map((rel, i) => (
              <article
                key={String(rel)}
                className="rl-frame"
                data-active={einstein === rel}
              >
                <div className="rl-frame-heading">
                  <div>
                    <span>
                      0{i + 1} /{' '}
                      {rel ? 'ESPACIO-TIEMPO CURVO' : 'GRAVITACIÓN NEWTONIANA'}
                    </span>
                    <h3>{rel ? 'Einstein · avanza' : 'Newton · cierra'}</h3>
                  </div>
                  <Info
                    name={
                      rel
                        ? 'Qué avanza en Einstein'
                        : 'Por qué cierra en Newton'
                    }
                  >
                    {rel
                      ? 'Se integra una geodésica temporal de Schwarzschild. Cada marca es un perihelio: el punto más cercano al Sol. La siguiente marca queda un poco adelantada. La lupa multiplica solo el exceso angular sobre la fase radial; no cambia radios, masa ni resultados físicos.'
                      : 'La elipse corresponde a un planeta de masa despreciable alrededor de un único Sol esférico y fijo. No aparecen otros planetas: en el Sistema Solar real también hay precesión newtoniana por sus perturbaciones. El Sol está en un foco, no en el centro de la elipse.'}
                  </Info>
                </div>
                <Scene
                  orbit={orbit}
                  progress={s.setup.progress}
                  relativistic={rel}
                  expanded={s.setup.expanded}
                />
                <p className="rl-frame-caption">
                  {rel
                    ? s.setup.expanded
                      ? 'El exceso angular está ampliado ×100.000 para verlo. Esta curva no conserva la escala angular física.'
                      : 'Escala angular real: la trayectoria casi coincide con Newton. El giro sigue presente en los números.'
                    : 'La misma elipse se recorre de nuevo. Las marcas del perihelio se superponen en una sola dirección.'}
                </p>
              </article>
            ))}
          </div>
          <div className="or-transport">
            <div className="rl-control-label">
              <label htmlFor="or-visor-phase">Avance en el visor</label>
              <output>{n(s.setup.progress * CYCLES)} / 10 vueltas</output>
            </div>
            <input
              id="or-visor-phase"
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={s.setup.progress}
              aria-valuetext={`${n(s.setup.progress * CYCLES)} vueltas radiales`}
              onChange={(ev) =>
                dispatch({ type: 'time', value: +ev.target.value })
              }
            />
            <div className="or-buttons">
              <button onClick={() => dispatch({ type: 'play' })}>
                {s.playing
                  ? 'Pausar órbitas'
                  : s.setup.progress === 1
                    ? 'Repetir diez vueltas ↻'
                    : 'Explorar órbitas ▶'}
              </button>
              <button onClick={() => dispatch({ type: 'time', value: 1 })}>
                Ver diez vueltas
              </button>
              <button
                aria-pressed={s.setup.expanded}
                onClick={() => tune({ expanded: !s.setup.expanded })}
              >
                Lupa del visor ×100.000
              </button>
            </div>
          </div>
          <div className="or-readings" aria-live={s.playing ? 'off' : 'polite'}>
            <div>
              <span>
                Avance relativista por vuelta{' '}
                <Info name="Qué mide un segundo de arco">
                  Un grado se divide en 3.600 segundos de arco (″). Medimos
                  cuánto excede 360° el ángulo entre dos perihelios sucesivos.
                  No son segundos de tiempo. Newton da cero en este modelo de un
                  único cuerpo central.
                </Info>
              </span>
              <strong>
                {n(orbit.delta * ARCSEC, 4)} <small>″/vuelta</small>
              </strong>
              <p>Valor físico. No depende de la lupa.</p>
            </div>
            <div>
              <span>Aporte relativista por siglo</span>
              <strong>
                {n(century)} <small>″/siglo</small>
              </strong>
              <p>
                Un siglo juliano de 36.525 días; no es toda la precesión
                observada.
              </p>
            </div>
            <div>
              <span>Del perihelio al siguiente</span>
              <strong>
                {n(orbit.period / 86400)} <small>días</small>
              </strong>
              <p>
                Período radial en tiempo de Schwarzschild, referido al infinito.
              </p>
            </div>
          </div>
          <div className="or-century">
            <div>
              <p className="rl-eyebrow">EL GIRO REAL SE ACUMULA</p>
              <h3>Pequeño por vuelta. Medible con los años.</h3>
              <p>
                Einstein aporta {n(century)}″ en cien años con esta
                configuración. La línea de Newton queda en cero porque aislamos
                un solo Sol esférico.
              </p>
            </div>
            <svg
              viewBox="0 0 500 190"
              role="img"
              aria-label={`Avance relativista acumulado: cero al comienzo y ${n(century)} segundos de arco a los cien años. El gráfico conserva las unidades físicas, aunque se cambie la lupa.`}
            >
              <path d="M50 20V150H465" fill="none" stroke="#6d8c9e" />
              <path
                d="M50 150 460 34"
                fill="none"
                stroke="#edb77d"
                strokeWidth="3"
              />
              <path d="M50 150H460" stroke="#7ccecf" strokeWidth="3" />
              <text x="54" y="29" fill="#edb77d" fontSize="13">
                {n(century)}″ · escala vertical ajustada
              </text>
              <text x="55" y="141" fill="#a3c5ce" fontSize="12">
                Newton · 0″
              </text>
              <text x="50" y="176" fill="#b7c9d3" fontSize="12">
                0 años
              </text>
              <text x="403" y="176" fill="#b7c9d3" fontSize="12">
                100 años
              </text>
            </svg>
          </div>
          <p className="rl-map-note">
            Comparación en coordenadas polares (r, φ) de Schwarzschild,
            dibujadas en un plano. El encuadre se ajusta al afelio. La animación
            avanza por fase radial, no a ritmo de tiempo físico.{' '}
            <Info name="Qué representan las dos vistas">
              Ambas comparten los mismos radios mínimo y máximo y la misma fase
              radial χ. No representan una fotografía ni dos planetas en
              posiciones simultáneas. El tamaño del Sol y del planeta es
              simbólico; el aro exterior indica el radio físico del encuadre. La
              trayectoria se calcula, no se reproduce desde una animación
              guardada.
            </Info>
          </p>
        </section>
        <section
          id="or-controls"
          className="rl-controls"
          aria-labelledby="or-controls-title"
        >
          <div className="rl-section-heading">
            <div>
              <p className="rl-eyebrow">FORMA / DISTANCIA / MASA / LUPA</p>
              <h2 id="or-controls-title">Hacé tu propia órbita.</h2>
            </div>
            <a href="#or-views">Comparar las órbitas ↑</a>
          </div>
          <ChallengeGuide
            index={s.index}
            title={lesson.title}
            prediction={s.prediction === null ? undefined : lesson.choices[s.prediction]}
            steps={lesson.steps.map((label, i) => ({ label, done: checks[i] }))}
            saved={done}
            challengeHref="#or-challenges"
            viewHref="#or-views"
            help="El perihelio es el punto más cercano al Sol. Una UA es la distancia media Tierra–Sol. La lupa amplía solo el giro dibujado: no aumenta el avance físico. Cambiar masa, forma o tamaño prepara otro ensayo."
          />
          <div className="or-buttons">
            <button
              onClick={() => tune({ a: MERCURY.a, e: MERCURY.e, mass: 1 })}
            >
              Mercurio real
            </button>
            <a href="#or-views">Volver al visor ↑</a>
          </div>
          <div className="rl-control-grid">
            <div className="rl-control-card">
              <div className="rl-control-label">
                <label htmlFor="or-e">Excentricidad · forma</label>
                <output>{n(e, 4)}</output>
                <Info name="Cambiar la excentricidad">
                  Cero sería un círculo, sin una dirección de perihelio
                  definida. Acá usamos órbitas excéntricas: al subir e, con a
                  fijo, el planeta se acerca más al Sol en el perihelio y se
                  aleja más en el afelio. Aumenta el giro relativista por
                  vuelta.
                </Info>
              </div>
              <input
                id="or-e"
                type="range"
                min="0.05"
                max="0.7"
                step="any"
                value={e}
                aria-valuetext={n(e, 4)}
                onChange={(ev) => tune({ e: +ev.target.value })}
              />
              <div className="or-buttons">
                <button onClick={() => tune({ e: 0.1 })}>
                  Poco alargada · 0,10
                </button>
                <button onClick={() => tune({ e: 0.6 })}>
                  Muy alargada · 0,60
                </button>
              </div>
              <p>
                Perihelio: {n(orbit.perihelion / AU, 3)} UA · Afelio:{' '}
                {n(orbit.aphelion / AU, 3)} UA. El tamaño a y la masa se
                mantienen.
              </p>
            </div>
            <div className="rl-control-card">
              <div className="rl-control-label">
                <label htmlFor="or-a">Semieje mayor · tamaño orbital</label>
                <output>{n(a, 4)} UA</output>
                <Info name="Cambiar el tamaño orbital">
                  a es la mitad de la suma de los radios mínimo y máximo. Una UA
                  es la unidad astronómica, unos 150 millones de km. Reducir a,
                  a igual masa y excentricidad, aumenta la precesión por vuelta
                  y reduce el período. El visor reencuadra: leé también las
                  distancias físicas.
                </Info>
              </div>
              <input
                id="or-a"
                type="range"
                min="0.25"
                max="1"
                step="any"
                value={a}
                aria-valuetext={`${n(a, 4)} unidades astronómicas`}
                onChange={(ev) => tune({ a: +ev.target.value })}
              />
              <div className="or-buttons">
                <button onClick={() => tune({ a: MERCURY.a })}>
                  Tamaño de Mercurio
                </button>
                <button onClick={() => tune({ a: 2 * MERCURY.a })}>
                  Doble tamaño
                </button>
              </div>
              <p>
                El avance por vuelta baja aproximadamente como 1/a. Por siglo
                también importa cuántas vueltas caben.
              </p>
            </div>
            <div className="rl-control-card">
              <div className="rl-control-label">
                <label htmlFor="or-mass">Masa central</label>
                <output>{n(mass, 2)} M☉</output>
                <Info name="Cambiar la masa central">
                  M☉ es una masa solar. Cambiamos GM manteniendo los radios
                  extremos de la órbita: eso requiere otra energía y momento
                  angular iniciales. No se simula que el Sol gane masa durante
                  una órbita. A igual a y e, más masa da más precesión por
                  vuelta.
                </Info>
              </div>
              <input
                id="or-mass"
                type="range"
                min="0.5"
                max="2"
                step="0.01"
                value={mass}
                onChange={(ev) => tune({ mass: +ev.target.value })}
              />
              <div className="or-buttons">
                <button onClick={() => tune({ mass: 1 })}>
                  Una masa solar
                </button>
                <button onClick={() => tune({ mass: 2 })}>
                  Dos masas solares
                </button>
              </div>
              <p>
                Al cambiar masa, forma o tamaño, se inicia otro ensayo. Los
                descubrimientos del reto se conservan.
              </p>
            </div>
            <div className="rl-control-card">
              <h3>
                Una lupa para un giro minúsculo{' '}
                <Info name="Ampliación visual">
                  Multiplicamos por 100.000 únicamente φ−χ en el dibujo de
                  Einstein. Las distancias y todas las cifras físicas se
                  conservan. El gráfico por siglo usa sus propias unidades y
                  tampoco cambia. No multiplicamos la gravedad ni alteramos la
                  velocidad de la luz.
                </Info>
              </h3>
              <div
                className="or-buttons"
                role="group"
                aria-label="Ampliación del giro"
              >
                <button
                  aria-pressed={!s.setup.expanded}
                  onClick={() => tune({ expanded: false })}
                >
                  Giro real
                </button>
                <button
                  aria-pressed={s.setup.expanded}
                  onClick={() => tune({ expanded: true })}
                >
                  Ampliar giro ×100.000
                </button>
              </div>
              <p>
                {s.setup.expanded
                  ? 'Lupa activa: la separación visible permite seguir las marcas del perihelio.'
                  : 'Sin lupa: en estas escalas del Sistema Solar casi no vas a distinguir las curvas a simple vista.'}
              </p>
              <p>
                Acumulado después de diez vueltas:{' '}
                <strong>{n(orbit.delta * ARCSEC * CYCLES, 4)}″</strong>, con o
                sin ampliación.
              </p>
            </div>
            <div className="rl-control-card or-wide">
              <div className="rl-control-label">
                <label htmlFor="or-phase">Recorrido · vueltas radiales</label>
                <output>{n(s.setup.progress * CYCLES)} / 10</output>
              </div>
              <input
                id="or-phase"
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={s.setup.progress}
                aria-valuetext={`${n(s.setup.progress * CYCLES)} de diez vueltas radiales`}
                onChange={(ev) =>
                  dispatch({ type: 'time', value: +ev.target.value })
                }
              />
              <div className="or-buttons">
                <button
                  className="rl-primary"
                  onClick={() => dispatch({ type: 'play' })}
                >
                  {s.playing
                    ? 'Pausar recorrido'
                    : s.setup.progress === 1
                      ? 'Repetir recorrido'
                      : 'Iniciar recorrido'}
                </button>
                <button onClick={() => dispatch({ type: 'time', value: 1 })}>
                  Completar diez vueltas
                </button>
                <button onClick={() => dispatch({ type: 'time', value: 0 })}>
                  Volver al inicio
                </button>
              </div>
              <p>
                De perihelio a perihelio: una vuelta radial. La reproducción
                explora la fase χ a ritmo constante; no representa la rapidez
                real del planeta ni un reloj.
              </p>
            </div>
          </div>
        </section>
        <section
          id="or-challenges"
          className="rl-challenges"
          aria-labelledby="or-challenges-title"
        >
          <div className="rl-section-heading">
            <div>
              <p className="rl-eyebrow">PREDECÍ / COMPARÁ / EXPLICÁ</p>
              <h2 id="or-challenges-title">Cuatro pistas para descubrirlo.</h2>
            </div>
            <span>{s.completed.length} / 4 descubrimientos</span>
          </div>
          <div className="rl-lessons" role="group" aria-label="Elegir reto">
            {LESSONS.map((l, i) => (
              <button
                key={l.title}
                aria-pressed={s.index === i}
                onClick={() => start(i)}
              >
                <span>
                  0{i + 1} {s.completed.includes(i) ? '✓' : ''}
                </span>
                {l.title}
              </button>
            ))}
          </div>
          <div className="rl-challenge-body">
            <div>
              <p className="rl-eyebrow">RETO 0{s.index + 1}</p>
              <h3 id="or-question" tabIndex={-1}>
                {lesson.question}
              </h3>
              <fieldset className="rl-predictions">
                <legend>Tu predicción</legend>
                {lesson.choices.map((choice, i) => (
                  <label key={choice}>
                    <input
                      type="radio"
                      name="or-prediction"
                      checked={s.prediction === i}
                      onChange={() => dispatch({ type: 'predict', choice: i })}
                    />
                    {choice}
                  </label>
                ))}
              </fieldset>
            </div>
            <div>
              <h3>Probalo en las órbitas.</h3>
              <p>{lesson.hint}</p>
              <a className="or-jump" href="#or-controls">
                Ir a los controles ↑
              </a>
              <ul className="rl-observation-list">
                {lesson.steps.map((step, i) => (
                  <li key={step} data-done={checks[i]}>
                    {checks[i] ? '✓' : '○'} {step}
                  </li>
                ))}
              </ul>
              <div className="rl-challenge-actions">
                <button
                  className="rl-primary"
                  onClick={() => dispatch({ type: 'check' })}
                >
                  Comprobar descubrimiento
                </button>
                <button onClick={() => start(s.index)}>
                  Reiniciar este reto
                </button>
              </div>
              <p className="rl-feedback" role="status">
                {s.feedback}
              </p>
              {done && (
                <>
                  <p>{lesson.meaning}</p>
                  <button className="rl-next" onClick={next}>
                    {s.index === 3
                      ? 'Volver al primer reto ↺'
                      : 'Siguiente reto →'}
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
        <section id="or-science" className="rl-science">
          <p className="rl-eyebrow">UNA ÓRBITA / UNA PRUEBA DE LA GRAVEDAD</p>
          <h2>¿Por qué importó tanto Mercurio?</h2>
          <p>
            La órbita de Mercurio ya tenía una precesión explicada en gran parte
            por las perturbaciones de otros planetas. Quedaba un pequeño
            residuo. En 1915, la relatividad general de Einstein explicó un
            aporte de unos 43″ por siglo, sin introducir otro planeta para
            producirlo. La geometría del espacio-tiempo tenía una consecuencia
            que se podía contrastar.
          </p>
          <details open>
            <summary>La fórmula que conecta los controles</summary>
            <div className="or-formula">Δϖ ≈ 6πGM / [a(1 − e²)c²]</div>
            <p>
              Δϖ es el avance por vuelta, en radianes. G es la constante
              gravitatoria; M, la masa central; a, el semieje mayor; e, la
              excentricidad; c, la velocidad de la luz. Más M, menos a o más e
              aumentan el avance. Es la aproximación de primer orden en campo
              débil: la trayectoria de arriba usa la ecuación de Schwarzschild
              integrada.
            </p>
            <p>
              Con tus variables: fórmula aproximada{' '}
              {n(orbit.leading * ARCSEC, 5)}″/vuelta; integración{' '}
              {n(orbit.delta * ARCSEC, 5)}″/vuelta. En el Sistema Solar
              coinciden a esta precisión.
            </p>
          </details>
          <details>
            <summary>Cómo se calcula la trayectoria y qué se idealiza</summary>
            <p>
              Definimos p = a(1−e²), una longitud, y q = GM/(pc²). Usamos r =
              p/(1 + e cos χ) y dφ/dχ = [1 − q(6 + 2e cos χ)]⁻½. Integramos
              numéricamente el exceso dφ/dχ − 1 con Simpson, conservando
              precisión para el giro diminuto de Mercurio. Una vuelta radial
              corresponde a χ = 2π.
            </p>
            <p>
              Sol esférico, estático y sin rotación; planeta de masa
              despreciable. No se incluyen otros planetas, achatamiento solar,
              pérdida de energía ni efectos de espín. El período por vuelta se
              integra en tiempo coordenado de Schwarzschild. Esta experiencia no
              es una efeméride de precisión del Sistema Solar.
            </p>
          </details>
          <details>
            <summary>
              ¿Este fue el trabajo por el que Einstein recibió el Nobel?
            </summary>
            <p>
              El Nobel de Física de 1921 reconoció sus aportes a la física
              teórica y especialmente la ley del efecto fotoeléctrico. Ese
              fenómeno conecta la frecuencia de la luz con la energía de
              electrones emitidos por un material. Es otra pregunta, del mundo
              cuántico que ya podés explorar en el laboratorio del especial.
            </p>
            <a href="/efecto-fotoelectrico/">
              Explorar el efecto fotoeléctrico →
            </a>
            <br />
            <a
              href="https://www.nobelprize.org/prizes/physics/1921/summary/"
              target="_blank"
              rel="noreferrer"
            >
              La explicación oficial del Nobel ↗
            </a>
          </details>
          <details>
            <summary>Fuentes para seguir investigando</summary>
            <ul>
              <li>
                <a
                  href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/mercuryfact.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  NASA · parámetros orbitales de Mercurio
                </a>
              </li>
              <li>
                <a
                  href="https://ssd.jpl.nasa.gov/astro_par.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  JPL · constantes astronómicas
                </a>
              </li>
              <li>
                <a
                  href="https://pgda.gsfc.nasa.gov/products/66"
                  target="_blank"
                  rel="noreferrer"
                >
                  NASA/MESSENGER · Mercurio y pruebas de la gravedad
                </a>
              </li>
              <li>
                <a
                  href="https://link.aps.org/accepted/10.1103/PhysRevD.92.044048"
                  target="_blank"
                  rel="noreferrer"
                >
                  Hopper y colaboradores · ecuaciones orbitales de
                  Schwarzschild, sección II
                </a>
              </li>
            </ul>
          </details>
        </section>
        <section className="rl-continue">
          <p className="rl-eyebrow">DE UNA ÓRBITA A UN CAMINO DE LUZ</p>
          <h2>La gravedad también cambia lo que vemos.</h2>
          <p>
            Las órbitas y la luz comparten una geometría. En la lente
            gravitacional podés seguir rayos que se curvan alrededor de un
            agujero negro.
          </p>
          <a className="or-jump" href="/lente-gravitacional/">
            Explorar la lente gravitacional →
          </a>
        </section>
        <EinsteinNavigation current="orbita-que-no-se-cierra" footer />
        <MoreLabs current="orbita-que-no-se-cierra" />
      </main>
      <footer className="rl-footer">
        <a href="/einstein/">Volver al especial Einstein ↗</a>
        <span>Una diferencia pequeña puede cambiar una teoría.</span>
      </footer>
    </div>
  )
}
