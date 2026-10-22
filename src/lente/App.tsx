import ChallengeGuide from '../components/ui/ChallengeGuide'
import Info from '../components/ui/InfoPopover'
import { BlackHoleNavigation } from '../series/BlackHoleNavigation'
import BlackHoleNotebook from '../series/BlackHoleNotebook'
import { readCompleted } from '../series/progress'
import { useBlackHoleProgress } from '../series/usePassport'
import { LabMission, LabNavigation, MoreLabs } from '../components/ui/LabJourney'
import { useMemo, useReducer, useState } from 'react'
import ObserverView from './ObserverView'
import Diagram from './Diagram'
import { initialState, LESSONS, lessonStatus, reducer } from './learning'
import {
  AU,
  backgroundDirection,
  CRITICAL_B,
  degrees,
  geometry,
  OBSERVER_DISTANCE,
  radians,
  SKY_DISTANCE,
  traceRay,
} from './physics'
import { useTransfer } from './useTransfer'

const number = (value: number, digits = 2) =>
  value.toLocaleString('es-AR', { maximumFractionDigits: digits })
export default function LensApp() {
  const [state, dispatch] = useReducer(reducer, undefined, () =>
    initialState('bend', readCompleted('lente-gravitacional').map(i => LESSONS[i].id)),
  )
  useBlackHoleProgress('lente-gravitacional', state.completed, LESSONS)
  const [grid, setGrid] = useState(false)
  const { result, pending, error } = useTransfer(state)
  // Both views retain the same committed calculation while a new worker is running.
  const setup = {
    ...state,
    mass: result?.model.mass ?? state.mass,
    gravity: result?.model.gravity ?? state.gravity,
  }
  const g = geometry(setup.mass)
  const ref = geometry(state.reference.mass)
  const ray = useMemo(
    () => traceRay({ mass: setup.mass, gravity: setup.gravity }, radians(state.rayAngle)),
    [setup.mass, setup.gravity, state.rayAngle],
  )
  const neighbors = useMemo(
    () =>
      [-1.5, 1.5].map((delta) =>
        traceRay(
          { mass: setup.mass, gravity: setup.gravity },
          radians(Math.min(70, Math.max(0, state.rayAngle + delta))),
        ),
      ),
    [setup.mass, setup.gravity, state.rayAngle],
  )
  const lesson = LESSONS.find((item) => item.id === state.lesson)!
  const lessonIndex = LESSONS.findIndex((item) => item.id === state.lesson)
  const status = lessonStatus(state)
  const aligned = Math.abs(setup.source + setup.yaw) < 0.2
  const endpoint = backgroundDirection(ray.phi, state.azimuth, radians(state.yaw))
  const sourceDot =
    -Math.cos(radians(state.source)) * endpoint.x + Math.sin(radians(state.source)) * endpoint.y
  const sourceSeparation = degrees(Math.acos(Math.max(-1, Math.min(1, sourceDot))))
  const outcome =
    ray.outcome === 'sky'
      ? 'Alcanza el fondo'
      : ray.outcome === 'captured'
        ? 'Termina en el horizonte'
        : 'Límite numérico'
  return (
    <div className="bh-lab ln-shell">
      <a className="ln-skip" href="#ln-controls">
        Ir a los controles
      </a>
      <header className="ln-header">
        <a className="ln-brand" href="/" aria-label="SPUM, todos los laboratorios">
          <span>∿</span> SPUM <small>EXPERIMENTOS</small>
        </a>
        <nav aria-label="Navegación del laboratorio">
          <a href="#ln-challenges">Los retos</a>
          <a href="#ln-science">La explicación</a>
          <a href="/">Todos los labs ↗</a>
        </nav>
      </header>
      <main>
        <BlackHoleNavigation current="lente-gravitacional" />
        <section className="ln-intro">
          <div>
            <p className="ln-eyebrow">LABORATORIO 04 / RELATIVIDAD GENERAL</p>
            <h1>
              ¿Podés ver lo que hay
              <br />
              <em>detrás de la oscuridad?</em>
            </h1>
          </div>
          <div>
            <p className="ln-kicker">Lente gravitacional</p>
            <h2>Una fuente. Más de un camino.</h2>
            <p>
              La gravedad cambia de dónde parece venir la luz. Tocá una dirección, seguí su
              recorrido y descubrí cómo se forma la imagen.
            </p>
            <a href="#ln-challenges">Empezá con una predicción ↓</a>
          </div>
        </section>
        <div className="ln-model-banner">
          <span>TRAZADO RELATIVISTA</span>
          <p>
            Schwarzschild, sin giro ni carga. Cámara estática y fuentes de prueba sobre una esfera.
            Las trayectorias se integran numéricamente; brillo y colores son ilustrativos.{' '}
            <a href="#ln-limits">Ver límites ↓</a>
          </p>
        </div>

        <LabNavigation
          links={[
            ['Imagen', '#ln-views'],
            ['Recorrido', '#ln-paths'],
            ['Controles', '#ln-controls'],
            ['Retos', '#ln-challenges'],
          ]}
        />
        <LabMission
          title={lesson.question}
          instruction={lesson.hint}
          index={lessonIndex}
          href="#ln-challenges"
          result={
            status === 'observed' && !pending
              ? state.lesson === 'capture'
                ? `Rayo elegido: ${outcome}.`
                : `Radio ×${number(g.rs / ref.rs)} · Sombra ${setup.gravity ? number(degrees(g.shadowAngle)) : '0'}° · Fuente ${number(Math.abs(setup.source + setup.yaw), 1)}°`
              : undefined
          }
          onNext={
            state.completed.includes(state.lesson) &&
            state.prediction === lesson.answer &&
            status === 'observed' &&
            !pending
              ? () =>
                  dispatch({ type: 'lesson', id: LESSONS[(lessonIndex + 1) % LESSONS.length].id })
              : undefined
          }
        />
        <section className="ln-views" id="ln-views" aria-label="Dos vistas de la misma luz">
          <article className="ln-observer-panel">
            <div className="ln-view-heading">
              <div>
                <p className="ln-eyebrow">01 / LO QUE VEMOS</p>
                <h2>La imagen del observador</h2>
              </div>
              <span className="ln-live-tag">CÁLCULO EN TIEMPO REAL</span>
            </div>
            <ObserverView
              transfer={result}
              setup={setup}
              grid={grid}
              pending={pending}
              onPick={(angle, azimuth) => dispatch({ type: 'pick', angle, azimuth })}
            />
            <div className="ln-image-tools">
              <div className="ln-segmented" aria-label="Comparar la gravedad">
                <button
                  aria-pressed={!state.gravity}
                  onClick={() => dispatch({ type: 'gravity', value: false })}
                >
                  Sin lente
                </button>
                <button
                  aria-pressed={state.gravity}
                  onClick={() => dispatch({ type: 'gravity', value: true })}
                >
                  Con lente
                </button>
              </div>
              <button aria-pressed={grid} onClick={() => setGrid(!grid)}>
                {grid ? 'Ocultar cuadrícula' : 'Mostrar cuadrícula'}
              </button>
            </div>
            <p className="ln-caption ln-inset">
              La cuadrícula, las estrellas y la fuente dorada pertenecen a la misma esfera de fondo
              en ambas imágenes. La sombra es un conjunto de direcciones sin luz de ese fondo; no es
              una esfera negra dibujada delante.
            </p>
            <div className="ln-readings" aria-live={pending ? 'off' : 'polite'}>
              <div>
                <span>
                  {setup.gravity ? 'Radio del horizonte' : 'Escala rₛ de referencia'}{' '}
                  <Info name="Horizonte y sombra">
                    rₛ = 2GM/c². El horizonte es una frontera causal. La sombra aparente se calcula
                    con las direcciones capturadas; su tamaño angular es distinto del tamaño físico
                    del horizonte.
                  </Info>
                </span>
                <strong>
                  {number(g.rs / AU, 4)} <small>UA</small>
                </strong>
                <p>Radio {number(setup.mass / state.reference.mass)} veces la referencia</p>
              </div>
              <div>
                <span>Semiancho de la sombra</span>
                <strong>
                  {setup.gravity ? number(degrees(g.shadowAngle)) : '0'}
                  <small>°</small>
                </strong>
                <p>
                  {setup.gravity
                    ? 'Ángulo medido por la cámara estática'
                    : 'Control sin campo gravitatorio'}
                </p>
              </div>
              <div>
                <span>Fuente respecto del eje</span>
                <strong>
                  {number(Math.abs(setup.source + setup.yaw), 1)}
                  <small>°</small>
                </strong>
                <p>
                  {aligned ? 'Alineada con cámara y centro' : 'Desalineada: buscá arcos e imágenes'}
                </p>
              </div>
            </div>
            <div className="ln-live-explanation" aria-live="polite">
              <span className="ln-eyebrow">CONECTÁ LA IMAGEN CON EL RECORRIDO</span>
              <h3>
                {pending
                  ? 'Actualizando ambas vistas…'
                  : !setup.gravity
                    ? 'Sin gravedad, los caminos son rectos.'
                    : aligned
                      ? 'La alineación transforma la fuente en un anillo.'
                      : 'La misma fuente puede llegar desde varias direcciones.'}
              </h3>
              <p>
                {!setup.gravity
                  ? 'Activá la lente conservando fuente y cámara. La posición aparente puede cambiar aunque la fuente no se mueva.'
                  : aligned
                    ? `El primer anillo de la fuente alineada está cerca de ${number(degrees(result?.ring ?? 0))}° del centro. Tocá ese aro y mirá cómo el rayo llega al lado opuesto de la esfera.`
                    : 'La fuente dorada permanece en la esfera de fondo. La curvatura puede producir imágenes a ambos lados. Alineala para recuperar la simetría circular.'}
              </p>
              {aligned && setup.gravity && result && !pending && (
                <button
                  className="ln-ring-pick"
                  onClick={() => {
                    dispatch({ type: 'pick', angle: degrees(result.ring), azimuth: 0 })
                    document.getElementById('ln-views')?.scrollIntoView({ block: 'start' })
                  }}
                >
                  Seguir un rayo del anillo ↑
                </button>
              )}
            </div>
          </article>
          <article className="ln-path-panel" id="ln-paths">
            <div className="ln-view-heading">
              <div>
                <p className="ln-eyebrow">02 / CÓMO LLEGA LA LUZ</p>
                <h2>Seguí el rayo</h2>
              </div>
              <Info name="Las dos vistas">
                La imagen usa una tabla de geodésicas integrada para cada ángulo radial y
                reutilizada por simetría esférica. El diagrama integra directamente la dirección
                elegida con la misma ecuación. La flecha conceptual cámara → origen es un rastreo
                inverso; la luz recibida viaja al revés.
              </Info>
            </div>
            <Diagram setup={setup} ray={ray} neighbors={neighbors} />
            <div className={`ln-ray-outcome ln-${ray.outcome}`}>
              <span>RAYO ELEGIDO · α = {number(state.rayAngle, 1)}°</span>
              <strong>{outcome}</strong>
              <p>
                {!setup.gravity
                  ? 'Línea recta hasta el fondo de referencia.'
                  : ray.outcome === 'captured'
                    ? 'Esta dirección no recibe luz del fondo. Ningún rayo sale del interior.'
                    : ray.outcome === 'sky'
                      ? `Pasa a un mínimo de ${number(ray.minRadius, 3)} rₛ antes de volver al fondo.`
                      : 'Muy cerca del umbral, la luz puede dar muchas vueltas. No confundimos un cálculo limitado con una captura confirmada.'}
              </p>
              {setup.gravity && (
                <small>
                  b / bcrítico = {number(ray.b / CRITICAL_B, 3)} ·{' '}
                  {ray.b < CRITICAL_B
                    ? 'dentro del umbral de captura'
                    : 'fuera del umbral de captura'}
                </small>
              )}
              {ray.outcome === 'sky' && (
                <p>
                  Separación de la fuente dorada en el fondo: {number(sourceSeparation, 2)}°. Un
                  valor cercano a cero conecta este píxel con esa fuente.
                </p>
              )}
            </div>
          </article>
        </section>
        {error && (
          <p className="ln-error" role="alert">
            {error}
          </p>
        )}

        <section className="ln-controls" id="ln-controls" aria-labelledby="ln-controls-title">
          <div className="ln-controls-title">
            <p className="ln-eyebrow">TU PREGUNTA, TUS VARIABLES</p>
            <h2 id="ln-controls-title">Cambiá una cosa. Mirá las dos vistas.</h2>
            <p>
              La cámara está a <strong>{number(OBSERVER_DISTANCE / AU, 3)} UA</strong> del centro;
              el fondo, a <strong>{number(SKY_DISTANCE / AU, 3)} UA</strong>. Esas distancias
              físicas quedan fijas al cambiar la masa.
            </p>
          </div>
          <ChallengeGuide
            index={lessonIndex}
            title={lesson.title}
            prediction={state.prediction === null ? undefined : lesson.choices[state.prediction]}
            steps={[{ label: lesson.hint, done: status === 'observed' && !pending }]}
            saved={state.completed.includes(state.lesson)}
            automatic
            challengeHref="#ln-challenges"
            viewHref="#ln-views"
            help="M☉ es una masa solar; UA es la distancia media Tierra–Sol. La fuente es la estrella dorada. Tocá la imagen para elegir un rayo y seguí ese mismo rayo en el diagrama. «Sin lente» sirve de referencia: no cambia la fuente."
          />
          <div className="ln-control-grid">
            <div className="ln-control">
              <div>
                <label htmlFor="ln-source">
                  Posición de la fuente <output>{number(state.source, 1)}°</output>
                </label>
                <Info name="Posición de la fuente">
                  Movés una única fuente sobre la esfera de fondo. Con fuente y cámara en 0°, ambas
                  se alinean con el agujero negro. El anillo sale de la simetría de las geodésicas,
                  sin añadir un aro gráfico.
                </Info>
              </div>
              <input
                id="ln-source"
                aria-valuetext={`${number(state.source, 1)} grados sobre la esfera de fondo`}
                type="range"
                min="-18"
                max="18"
                step="0.2"
                value={state.source}
                onChange={(e) => dispatch({ type: 'source', value: Number(e.target.value) })}
              />
              <p>
                Desalineación actual: {number(Math.abs(state.source + state.yaw), 1)}°.{' '}
                {Math.abs(state.source + state.yaw) < 0.2
                  ? 'Fuente alineada: con lente aparece el anillo.'
                  : 'Llevala a cero respecto de la cámara para recuperar la simetría.'}
              </p>
              <button onClick={() => dispatch({ type: 'source', value: -state.yaw })}>
                Alinear con la cámara
              </button>
            </div>
            <div className="ln-control">
              <div>
                <label htmlFor="ln-camera">
                  Posición de la cámara <output>{number(state.yaw, 1)}°</output>
                </label>
                <Info name="Posición de la cámara">
                  Comparás posiciones estáticas de la cámara alrededor del centro, a igual radio.
                  Siempre mira al agujero negro. No simulamos una cámara viajando con velocidad,
                  aberración relativista ni un efecto Doppler por su movimiento.
                </Info>
              </div>
              <input
                id="ln-camera"
                aria-valuetext={`${number(state.yaw, 1)} grados de posición de cámara`}
                type="range"
                min="-18"
                max="18"
                step="0.2"
                value={state.yaw}
                onChange={(e) => dispatch({ type: 'yaw', value: Number(e.target.value) })}
              />
              <p>El mismo fondo cambia de aspecto cuando cambiás el punto de vista.</p>
              <button onClick={() => dispatch({ type: 'yaw', value: 0 })}>
                Volver a cámara 0°
              </button>
            </div>
            <div className="ln-control">
              <div>
                <label htmlFor="ln-ray">
                  Dirección del rayo <output>{number(state.rayAngle, 1)}°</output>
                </label>
                <Info name="Dirección del rayo">
                  α es el ángulo local respecto de apuntar al centro. b = rcam sin(α)/√(1 −
                  rₛ/rcam). El umbral de captura es bcrítico = 3√3 rₛ/2 para estos rayos entrantes.
                  En α = 0 el rayo es radial.
                </Info>
              </div>
              <input
                id="ln-ray"
                aria-valuetext={`${number(state.rayAngle, 1)} grados respecto de apuntar al centro`}
                type="range"
                min="0"
                max="70"
                step="0.1"
                value={state.rayAngle}
                onChange={(e) => dispatch({ type: 'rayAngle', value: Number(e.target.value) })}
              />
              <p>Tocá cualquier píxel o elegí un ángulo. Si sale del visor, seguí el diagrama.</p>
              <p className="ln-control-impact">
                {outcome}.{' '}
                {ray.outcome === 'sky'
                  ? `Separación de la fuente en el fondo: ${number(sourceSeparation, 2)}°.`
                  : ray.outcome === 'captured'
                    ? 'Esta dirección no recibe luz de la esfera de fondo.'
                    : 'El origen queda sin resolver dentro del límite numérico.'}
              </p>
              <button onClick={() => dispatch({ type: 'pick', angle: state.rayAngle, azimuth: 0 })}>
                Usar corte horizontal
              </button>
            </div>
            <div className="ln-control">
              <div>
                <label htmlFor="ln-mass">
                  Masa del agujero negro <output>{number(state.mass * 4)} millones M☉</output>
                </label>
                <Info name="Masa y escala">
                  Entre 2 y 8 millones de masas solares nominales. La cámara y el fondo conservan su
                  distancia en metros. Por eso cambian el radio físico y los ángulos. Si todas las
                  distancias escalaran también con M, la geometría adimensional sería la misma.
                </Info>
              </div>
              <input
                id="ln-mass"
                aria-valuetext={`${number(state.mass * 4)} millones de masas solares nominales`}
                type="range"
                min="0.5"
                max="2"
                step="0.01"
                value={state.mass}
                onChange={(e) => dispatch({ type: 'mass', value: Number(e.target.value) })}
              />
              <p>
                ×{number(state.mass)} de la masa de referencia · rₛ ={' '}
                {number(geometry(state.mass).rs / AU, 4)} UA.
              </p>
              <p className="ln-control-impact">
                Con lente, semisombra: {number(degrees(geometry(state.mass).shadowAngle))}°. Las
                distancias físicas se conservan.
              </p>
              <button onClick={() => dispatch({ type: 'mass', value: 1 })}>
                Restaurar masa de referencia
              </button>
            </div>
          </div>
          <button className="ln-text-button" onClick={() => dispatch({ type: 'restore' })}>
            ↺ Restaurar condiciones del reto
          </button>
        </section>

        <section className="ln-challenges" id="ln-challenges" aria-labelledby="ln-challenges-title">
          <div className="ln-section-heading">
            <div>
              <p className="ln-eyebrow">PREDECIR · CAMBIAR · COMPARAR</p>
              <h2 id="ln-challenges-title">Cuatro formas de descubrir la lente.</h2>
            </div>
            <span className="ln-progress">{state.completed.length} / 4 descubrimientos</span>
          </div>
          <div className="ln-lesson-nav" aria-label="Elegir reto">
            {LESSONS.map((item, i) => (
              <button
                key={item.id}
                aria-pressed={state.lesson === item.id}
                onClick={() => dispatch({ type: 'lesson', id: item.id })}
              >
                <span>{state.completed.includes(item.id) ? '✓' : `0${i + 1}`}</span>
                {item.name}
              </button>
            ))}
          </div>
          <div className="ln-lesson-body">
            <div>
              <p className="ln-eyebrow">PRIMERO, TU PREDICCIÓN</p>
              <h3>{lesson.title}</h3>
              <p>{lesson.question}</p>
              <div className="ln-predictions">
                {lesson.choices.map((choice, i) => (
                  <button
                    key={choice}
                    aria-pressed={state.prediction === i}
                    onClick={() => dispatch({ type: 'predict', value: i })}
                  >
                    {choice}
                  </button>
                ))}
              </div>
              <div className="ln-lesson-actions">
                <button className="ln-primary" onClick={() => dispatch({ type: 'try' })}>
                  {lesson.action} ↗
                </button>
                <button onClick={() => dispatch({ type: 'restore' })}>Restaurar</button>
              </div>
              <p className="ln-caption">{lesson.hint} La huella se guarda al comparar y revisar tu predicción.</p>
            </div>
            <div className="ln-lesson-result" aria-live={pending ? 'off' : 'polite'}>
              <p className="ln-eyebrow">
                {pending
                  ? 'INTEGRANDO'
                  : status === 'observed'
                    ? 'RELACIÓN EXPLORADA'
                    : status === 'changed'
                      ? 'EXPLORACIÓN LIBRE'
                      : 'REFERENCIA PREPARADA'}
              </p>
              <h3>
                {pending
                  ? 'Calculando el cambio…'
                  : status === 'observed'
                    ? state.prediction === null
                      ? 'Esto predice el modelo.'
                      : state.prediction === lesson.answer
                        ? 'Tu predicción coincide con el modelo.'
                        : 'El resultado invita a cambiar de idea.'
                    : status === 'changed'
                      ? 'Compará, y después aislá una condición.'
                      : '¿Qué esperás ver?'}
              </h3>
              <p>
                {status === 'observed'
                  ? lesson.meaning
                  : status === 'changed'
                    ? 'Podés explorar todas las variables. Para relacionar un resultado con una sola causa, restaurá la referencia o aplicá el botón del reto.'
                    : 'Elegí una predicción y aplicá el cambio. Después volvé a las dos vistas: el número y el dibujo tienen que contar la misma historia.'}
              </p>
              <div className="ln-result-factors">
                <span>
                  Radio del horizonte<strong>×{number(g.rs / ref.rs)}</strong>
                </span>
                <span>
                  Sombra angular
                  <strong>{setup.gravity ? number(degrees(g.shadowAngle)) : '0'}°</strong>
                </span>
                <span>
                  Fuente respecto del eje
                  <strong>{number(Math.abs(state.source + state.yaw), 1)}°</strong>
                </span>
                <span>
                  Rayo elegido<strong>{outcome}</strong>
                </span>
              </div>
              <a href="#ln-views">Ver la imagen y seguir los caminos ↑</a>
            </div>
          </div>
          <p className="ln-caption ln-lesson-note">
            Cada reto prepara una referencia independiente. La selección de un píxel no modifica la
            fuente ni la masa. El progreso cuenta relaciones exploradas en el modelo, no
            comprobaciones experimentales ni una calificación.
          </p>
        </section>

        <section className="ln-science" id="ln-science">
          <div>
            <p className="ln-eyebrow">POR QUÉ IMPORTA</p>
            <h2>
              La luz también revela
              <br />
              <em>lo que no brilla.</em>
            </h2>
            <p>
              Una imagen no es un mapa directo de dónde están las cosas. La geometría entre fuente y
              observador altera las direcciones de llegada. Estudiar esa distorsión permite
              investigar la masa que la produce.
            </p>
            <p>
              Un anillo de esta fuente alineada es distinto de un disco de acreción. Acá no hay gas
              caliente, ni radiación de Hawking: el agujero negro desvía la luz de un fondo luminoso
              de prueba.
            </p>
            <a
              href="https://www.esa.int/gsp/ACT/phy/Projects/Blackholes/WebGL/"
              target="_blank"
              rel="noreferrer"
            >
              ESA: cómo funciona el trazado inverso ↗
            </a>
          </div>
          <div className="ln-next">
            <p className="ln-eyebrow">PRÓXIMO EN LA SERIE</p>
            <h3>Cómo vemos lo invisible</h3>
            <p>
              Ahora iluminamos el entorno con gas caliente. Compará el disco de acreción desde
              distintos ángulos y usá una estrella testigo para inferir la masa que no vemos.
              La luz y las órbitas aportan pistas diferentes.
            </p>
            <a href="/acrecion/">Explorar detección y acreción ↗</a>
          </div>
        </section>
        <section className="ln-limits" id="ln-limits">
          <p className="ln-eyebrow">QUÉ CALCULAMOS Y HASTA DÓNDE</p>
          <h2>La física detrás del visor</h2>
          <details>
            <summary>Modelo, ecuaciones y precisión</summary>
            <div>
              <p>
                Schwarzschild estático, rₛ = 2GM/c², u = rₛ/r. Integramos u″ + u = 3u²/2 mediante
                RK4, con paso angular 0,004 rad. El primer integral es (u′)² + u² − u³ = (rₛ/b)². La
                esfera de fotones está en r = 1,5 rₛ; el parámetro crítico es b = 3√3 rₛ/2.
              </p>
              <p>
                La imagen reutiliza una tabla radial de 1536 geodésicas con interpolación y mayor
                resolución cerca del umbral. El diagrama calcula la dirección elegida directamente.
                Puede haber diferencias subpíxel cerca de anillos muy finos. El límite es 12π de
                avance angular: direcciones que no se resuelven se señalan numéricamente; el extremo
                sin resolver de la tabla se oscurece, sin afirmar una captura.{' '}
                {result
                  ? `En la tabla actual: ${result.unresolved} muestras sin origen de fondo resuelto.`
                  : ''}
              </p>
              <p>
                No hay giro Kerr, plasma, disco, acreción, difracción, polarización, fotometría
                calibrada, retardos temporales ni radiación de Hawking. Colores y brillo son una
                representación del fondo, no un espectro observado. La cuadrícula representa
                coordenadas de ese fondo; no una malla física del espacio-tiempo.
              </p>
              <p>
                Las fuentes están sobre una esfera de radio físico fijo. La cámara está dentro de
                ella, fuera de la esfera de fotones, en cada posición estática comparada. La masa
                elegida es didáctica, no una inferencia de un agujero negro observado.
              </p>
              <a
                href="https://www.damtp.cam.ac.uk/user/tong/gr/six.pdf"
                target="_blank"
                rel="noreferrer"
              >
                David Tong: Schwarzschild y geodésicas ↗
              </a>
              <a
                href="https://github.com/nicospum/rendija2simspum/blob/master/docs/LENTE_GRAVITACIONAL.md"
                target="_blank"
                rel="noreferrer"
              >
                Derivación, arquitectura y pruebas ↗
              </a>
            </div>
          </details>
        </section>
        <BlackHoleNotebook current="lente-gravitacional" />
        <MoreLabs current="lente-gravitacional" />
      </main>
      <footer className="ln-footer">
        <a href="/">∿ SPUM / EXPERIMENTOS</a>
        <span>La curiosidad también curva el camino.</span>
        <div>
          <a href="/prisma/">Prisma</a>
          <a href="/doble-rendija/">Doble rendija</a>
          <a href="/hawking/">Hawking</a>
        </div>
      </footer>
    </div>
  )
}
