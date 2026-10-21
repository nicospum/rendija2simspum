import { useEffect, useState } from 'react'
import Info from '../components/ui/InfoPopover'
import {
  LabMission,
  LabNavigation,
  MoreLabs,
} from '../components/ui/LabJourney'
import { BlackHoleNavigation } from '../series/BlackHoleNavigation'
import BlackHoleNotebook from '../series/BlackHoleNotebook'
import { readCompleted } from '../series/progress'
import { useBlackHoleProgress } from '../series/usePassport'
import DiskView from './DiskView'
import StarView from './StarView'
import { DEFAULT, model } from './physics'
import type { Setup } from './physics'
import { LESSONS, checkAnswer, observe, observed } from './learning'
import type { Learning } from './learning'
import { scientific } from '../hawking/physics'

const number = (x: number, digits = 2) =>
  x.toLocaleString('es-AR', { maximumFractionDigits: digits })
const initialLearning: Learning = {
  index: 0,
  prediction: null,
  observations: [],
  completed: [],
}

export default function AccretionApp() {
  const [state, setState] = useState(() => ({
    setup: { ...DEFAULT },
    learning: { ...initialLearning, completed: readCompleted('acrecion') },
  }))
  const [feedback, setFeedback] = useState('')
  const [reference, setReference] = useState(false)
  const [playing, setPlaying] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [visible, setVisible] = useState(!document.hidden)
  useBlackHoleProgress('acrecion', state.learning.completed)
  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])
  const { setup, learning } = state
  const lesson = LESSONS[learning.index]
  const shown = reference ? lesson.setup : setup
  const m = model(shown)
  const ready = observed(learning.index, learning.observations)
  const complete = learning.completed.includes(learning.index)
  const update = (patch: Partial<Setup>) => {
    setFeedback('')
    setState((s) => {
      const setup = { ...s.setup, ...patch }
      return {
        setup,
        learning: {
          ...s.learning,
          observations: observe(
            s.learning.index,
            setup,
            s.learning.observations,
          ),
        },
      }
    })
  }
  const start = (index: number) => {
    setState((s) => ({
      setup: { ...LESSONS[index].setup },
      learning: {
        ...s.learning,
        index,
        prediction: null,
        observations: observe(index, LESSONS[index].setup, []),
      },
    }))
    setReference(false)
    setFeedback('')
  }
  const check = () => {
    const status = checkAnswer(learning)
    setFeedback(
      status === 'predict'
        ? 'Elegí una predicción; podés revisarla después de probar.'
        : status === 'try'
          ? `Todavía falta comparar. ${lesson.hint}`
          : status === 'revise'
            ? `Ya hiciste la comparación. Revisá tu respuesta: ${lesson.meaning}`
            : `¡Descubrimiento completo! ${lesson.meaning}`,
    )
    if (status === 'complete')
      setState((s) => ({
        ...s,
        learning: {
          ...s.learning,
          completed: [...new Set([...s.learning.completed, s.learning.index])],
        },
      }))
  }
  return (
    <div className="bh-lab ac-shell">
      <a className="ac-skip" href="#ac-controls">
        Ir a los controles
      </a>
      <header className="ac-header">
        <a className="ac-brand" href="/">
          ∿ SPUM <small>EXPERIMENTOS</small>
        </a>
        <a href="/agujeros-negros/">Especial agujeros negros ↗</a>
      </header>
      <main>
        <BlackHoleNavigation current="acrecion" />
        <section className="ac-intro">
          <div>
            <p className="ac-eyebrow">LABORATORIO 06 / DETECCIÓN Y ACRECIÓN</p>
            <h1>
              Cómo vemos
              <br />
              <em>lo invisible.</em>
            </h1>
          </div>
          <div>
            <p className="ac-eyebrow">EL AGUJERO ES OSCURO. SUS PISTAS, NO.</p>
            <p>
              Encendé el gas, mirá cómo viaja su luz y usá una estrella para
              pesar algo que no podés ver.
            </p>
            <a href="#ac-challenges">Cuatro preguntas para descubrirlo ↓</a>
          </div>
        </section>
        <LabNavigation
          links={[
            ['Visor', '#spum-mission'],
            ['Controles', '#ac-controls'],
            ['Retos', '#ac-challenges'],
            ['La física', '#ac-physics'],
          ]}
        />
        <LabMission
          title={lesson.title}
          instruction={lesson.hint}
          index={learning.index}
          href="#ac-challenges"
          result={
            complete
              ? 'Reto completado. Podés seguir explorando o pasar al siguiente.'
              : ready
                ? 'Comparación realizada. Volvé a tu predicción y comprobala.'
                : undefined
          }
          onNext={complete ? () => start((learning.index + 1) % 4) : undefined}
        />
        <section className="ac-workbench" aria-label="Mesa de observación">
          <div className="ac-visual">
            <div className="ac-toolbar">
              <div role="group" aria-label="Elegir la pista que observamos">
                <button
                  aria-pressed={shown.view === 'disk'}
                  disabled={reference}
                  onClick={() => update({ view: 'disk' })}
                >
                  01 · El disco
                </button>
                <button
                  aria-pressed={shown.view === 'star'}
                  disabled={reference}
                  onClick={() => update({ view: 'star' })}
                >
                  02 · La estrella
                </button>
              </div>
              <button
                onClick={() => setPlaying((p) => !p)}
                aria-pressed={!playing}
              >
                {playing ? 'Pausar' : 'Reanudar'} movimiento
              </button>
            </div>
            <div className="ac-stage" id="ac-view">
              {shown.view === 'disk' ? (
                <DiskView setup={shown} playing={playing && visible} />
              ) : (
                <StarView
                  key={`${shown.mass}-${learning.index}-${reference}`}
                  mass={shown.mass}
                  playing={playing && visible}
                />
              )}
              {shown.view === 'disk' && (
                <div className="ac-image-label">
                  <span>
                    {shown.lens ? 'LUZ CURVADA' : 'COMPARACIÓN · LUZ RECTA'}
                  </span>
                  <span>
                    {shown.inclination}° /{' '}
                    {shown.gas === 0 ? 'SIN GAS' : 'DISCO ACTIVO'}
                  </span>
                </div>
              )}
              {shown.view === 'disk' && shown.gas === 0 && (
                <p className="ac-no-gas">
                  No hay disco luminoso.
                  <br />
                  <span>
                    La masa sigue ahí. Buscá la otra pista: una estrella.
                  </span>
                </p>
              )}
              {reference && (
                <strong className="ac-reference-badge">
                  REFERENCIA DEL RETO
                </strong>
              )}
            </div>
            {shown.view === 'disk' && shown.gas > 0 && (
              <div className="ac-direction">
                {shown.inclination > 5 ? <><span>Izquierda · gas que se acerca</span><span>Derecha · gas que se aleja</span></> :
                  <span>De frente: el giro no acerca un lado ni aleja el otro.</span>}
              </div>
            )}
            <div className="ac-image-notes">
              {shown.view === 'disk' ? (
                <>
                  <span>
                    Sombra{' '}
                    <Info name="Sombra y horizonte">
                      La región oscura central corresponde a direcciones cuyos
                      rayos terminan capturados, cuando no encuentran antes el
                      disco. rs es el radio del horizonte, rs = 2GM/c². El horizonte está en r = rs; la sombra aparente es
                      mayor. El borde luminoso del gas empieza en 3 rs, la
                      órbita circular estable más interna de este modelo.
                    </Info>
                  </span>
                  <span>
                    Gas y arcos{' '}
                    <Info name="El disco no se levanta">
                      El gas ocupa un plano entre 3 y 14 rs. Los arcos aparecen
                      porque la luz de la parte posterior se curva. Cambiá la
                      inclinación y compará con luz recta.
                    </Info>
                  </span>
                  <span>
                    Colores{' '}
                    <Info name="Colores y brillo">
                      Colores representativos: naranja indica menor frecuencia
                      recibida y azul mayor frecuencia. No es una fotografía en
                      luz visible. El brillo depende del flujo térmico y del
                      factor relativista g⁴; la exposición y la escala de
                      colores son didácticas.
                    </Info>
                  </span>
                </>
              ) : (
                <span>
                  ¿Una estrella alcanza?{' '}
                  <Info name="De una órbita a una masa">
                    La órbita permite medir masa encerrada. Identificarla como
                    un agujero negro requiere además evidencias de que esa masa
                    está confinada en una región muy pequeña y descartar
                    alternativas. Esta órbita ideal no es una observación real.
                  </Info>
                </span>
              )}
            </div>
            <p className="ac-caption">
              {shown.view === 'disk'
                ? 'rs = radio del horizonte. Cámara a 28 rs · disco de 3 a 14 rs · movimiento ralentizado · colores y fondo estelar ilustrativos. Al cambiar la masa, la vista conserva su tamaño en rs.'
                : 'Radio fijo: 100 UA · referencia de 4 millones de soles · 1 s de animación = 0,2 años. Cambiar la masa reinicia la comparación.'}
            </p>
          </div>
          <aside
            className="ac-controls"
            id="ac-controls"
            aria-label="Controles del laboratorio"
          >
            <p className="ac-eyebrow">CAMBIÁ UNA COSA. BUSCÁ LA PISTA.</p>
            <fieldset disabled={reference}>
              <legend>Tu observatorio</legend>
              <label htmlFor="ac-gas">
                Alimentación de gas <output>{shown.gas} %</output>
              </label>
              <input
                id="ac-gas"
                type="range"
                min="0"
                max="100"
                step="1"
                value={shown.gas}
                onChange={(e) => update({ gas: +e.target.value })}
              />
              <p>
                0 apaga el disco. 100 % = 10⁻³ M☉ por año. Cambia el suministro
                estacionario, no vacía un disco en tiempo real.
              </p>
              <label htmlFor="ac-angle">
                Inclinación del disco <output>{shown.inclination}°</output>
              </label>
              <input
                id="ac-angle"
                type="range"
                min="0"
                max="82"
                step="1"
                value={shown.inclination}
                onChange={(e) => update({ inclination: +e.target.value })}
              />
              <p>
                0°: de frente. 82°: casi de canto. Solo afecta la imagen del
                disco.
              </p>
              <label htmlFor="ac-mass">
                Masa invisible{' '}
                <output>{number(shown.mass, 1)} millones M☉</output>
              </label>
              <input
                id="ac-mass"
                type="range"
                min="1"
                max="8"
                step="0.1"
                value={shown.mass}
                onChange={(e) => update({ mass: +e.target.value })}
              />
              <p>
                El tamaño físico del horizonte y el período de la estrella
                cambian. El disco se encuadra en unidades del horizonte.
              </p>
              <label className="ac-switch">
                <input
                  type="checkbox"
                  checked={shown.lens}
                  onChange={(e) => update({ lens: e.target.checked })}
                />
                Curvar la luz{' '}
                <Info name="Una comparación controlada">
                  Activado: geodésicas de Schwarzschild. Desactivado: rayos
                  rectos para comparar la geometría; no representa una solución
                  alternativa de la relatividad. El disco y la masa se
                  mantienen.
                </Info>
              </label>
              <label className="ac-switch">
                <input
                  type="checkbox"
                  checked={shown.doppler}
                  onChange={(e) => update({ doppler: e.target.checked })}
                />
                Movimiento relativista{' '}
                <Info name="La velocidad también cambia la luz">
                  Incluye el cambio de frecuencia por movimiento orbital y su
                  efecto en la intensidad. Al desactivarlo queda el corrimiento
                  gravitacional de un emisor estático: es una comparación
                  artificial para aislar el efecto del movimiento.
                </Info>
              </label>
            </fieldset>
            <p className="ac-control-reading">
              {shown.view === 'disk'
                ? `Gas: ${scientific(m.temperature, 'K')} · horizonte: ${scientific(m.rs / 1000, 'km')}`
                : `A 100 UA, una vuelta tarda ${number(m.period * 365.25, 1)} días.`}
            </p>
            {shown.view === 'star' && <p>En esta vista, probá la masa. El gas y la inclinación afectan a la imagen del disco.</p>}
            <a className="ac-test" href="#ac-view">
              Ver el resultado ↑
            </a>
            <button
              className="ac-compare"
              aria-pressed={reference}
              onClick={() => setReference((r) => !r)}
            >
              {reference ? 'Volver a mi prueba' : 'Comparar con el inicio'}
            </button>
            <button className="ac-reset" onClick={() => start(learning.index)}>
              Reiniciar este reto ↻
            </button>
          </aside>
        </section>
        <section
          className="ac-metrics"
          aria-label="Resultados físicos actuales"
        >
          <div>
            <span>
              Temperatura máxima del gas{' '}
              <Info name="Temperatura efectiva">
                Se calcula a partir del flujo de un disco delgado ideal: T =
                (F/σ)¼. El máximo está a 4,08 rs. No es la temperatura de
                Hawking. Al aumentar el suministro, la temperatura crece como
                Ṁ¼; a suministro fijo y r/rs fijo, disminuye como M⁻½.
              </Info>
            </span>
            <strong>{scientific(m.temperature, 'K')}</strong>
            <small>
              {shown.gas === 0
                ? 'Sin gas en el modelo'
                : 'Gas exterior · antes del corrimiento'}
            </small>
          </div>
          <div>
            <span>
              Luminosidad emitida{' '}
              <Info name="Qué luminosidad contamos">
                Potencia térmica emitida por las dos caras del disco, entre 3 y
                14 rs, en la aproximación newtoniana. No es la potencia que
                recibe la cámara: faltan captura y transferencia relativista
                para esa integral. Crece proporcionalmente al suministro.
              </Info>
            </span>
            <strong>{scientific(m.luminosity, 'W')}</strong>
            <small>Disco finito · no luminosidad observada</small>
          </div>
          <div>
            <span>
              Contraste Doppler local{' '}
              <Info name="Un número para comparar">
                Cociente de intensidades bolométricas de dos emisores opuestos a
                6 rs, con velocidades tangenciales vistas a esta inclinación:
                [(1+β sin i)/(1−β sin i)]⁴. Es un diagnóstico local; no el
                contraste máximo medido en la imagen curva.
              </Info>
            </span>
            <strong>
              {shown.gas === 0 ? '—' : `${number(m.contrast, 1)} ×`}
            </strong>
            <small>
              {shown.gas === 0
                ? 'No hay emisión para comparar'
                : 'Referencia local a 6 rs'}
            </small>
          </div>
          <div>
            <span>
              Período de la estrella{' '}
              <Info name="El reloj que pesa la masa">
                T = 2π√(a³/GM). La órbita circular de radio fijo 100 UA
                permanece lejos del horizonte en todo el rango: usamos la
                aproximación de Kepler, sin precesión relativista.
              </Info>
            </span>
            <strong>{number(m.period * 365.25, 1)} días</strong>
            <small>Radio fijo 100 UA · T ∝ M⁻½</small>
          </div>
        </section>
        <section id="ac-challenges" className="ac-challenges">
          <div className="ac-section-heading">
            <div>
              <p className="ac-eyebrow">PREDECIR / PROBAR / EXPLICAR</p>
              <h2>Cuatro pistas, una idea nueva.</h2>
            </div>
            <span>{learning.completed.length} / 4 descubrimientos</span>
          </div>
          <div
            className="ac-lesson-tabs"
            role="group"
            aria-label="Elegir reto educativo"
          >
            {LESSONS.map((l, i) => (
              <button
                key={l.title}
                aria-pressed={learning.index === i}
                onClick={() => start(i)}
              >
                <span>
                  {learning.completed.includes(i) ? '✓' : `0${i + 1}`}
                </span>
                {l.title}
              </button>
            ))}
          </div>
          <div className="ac-lesson-body">
            <div>
              <p className="ac-eyebrow">RETO {learning.index + 1} / 4</p>
              <h3>{lesson.question}</h3>
              <div
                className="ac-predictions"
                role="radiogroup"
                aria-label="Tu predicción"
              >
                {lesson.choices.map((choice, i) => (
                  <label key={choice}>
                    <input
                      type="radio"
                      name="ac-prediction"
                      checked={learning.prediction === i}
                      onChange={() => {
                        setFeedback('')
                        setState((s) => ({
                          ...s,
                          learning: { ...s.learning, prediction: i },
                        }))
                      }}
                    />
                    {choice}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3>Ahora probalo.</h3>
              <p>{lesson.hint}</p>
              <a
                className="ac-test"
                href="#ac-controls"
                onClick={() => setReference(false)}
              >
                Ir a los controles ↑
              </a>
              <p className="ac-progress">
                {ready
                  ? '✓ Comparación realizada'
                  : '○ Falta comparar los estados del reto'}
              </p>
              <button className="ac-primary" onClick={check}>
                Comprobar mi explicación
              </button>
              {feedback && (
                <p className="ac-feedback" role="status">
                  {feedback}
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
        <section id="ac-physics" className="ac-physics">
          <div>
            <p className="ac-eyebrow">LA FÍSICA DETRÁS DE LA IMAGEN</p>
            <h2>
              La luz es una pista.
              <br />
              <em>El movimiento, otra.</em>
            </h2>
            <p>
              El agujero negro no necesita un disco para existir. Si hay gas
              caliente, podemos estudiar su radiación. Si hay una estrella
              cercana, su órbita revela la masa encerrada. Reunir evidencias
              permite descartar otras explicaciones.
            </p>
            <p>
              El disco se calienta al disipar energía orbital: no estamos viendo
              luz que sale del interior. Hawking describe otro fenómeno,
              cuántico, muchísimo más débil para estas masas.
            </p>
            <a href="/hawking/">¿Y la radiación de Hawking? →</a>
          </div>
          <div className="ac-formulas">
            <details open>
              <summary>Cómo se calcula el brillo</summary>
              <p className="ac-equation">
                F(r) = 3GMṀ / (8πr³) · [1 − √(rᵢₙ/r)]
              </p>
              <p>
                M es la masa, Ṁ el suministro de gas y rᵢₙ = 3 rs. La
                temperatura efectiva cumple F = σT⁴. Es un disco delgado
                estacionario con torque nulo en el borde interior, con
                emisividad newtoniana aproximada.
              </p>
              <p className="ac-equation">I observado = g⁴ · I emitido</p>
              <p>
                g es el cociente entre la frecuencia recibida y la emitida,
                calculado con movimiento orbital y corrimiento gravitacional.
                Esta relación corresponde a intensidad integrada sobre
                frecuencias.
              </p>
            </details>
            <details>
              <summary>Cómo se calcula la masa invisible</summary>
              <p className="ac-equation">M = 4π²a³ / (GT²)</p>
              <p>
                Si medimos el radio a y el período T de una órbita
                aproximadamente circular, inferimos la masa central. Aquí
                dejamos a = 100 UA para aislar el efecto de M.
              </p>
            </details>
            <details>
              <summary>Qué representa y qué simplifica</summary>
              <p>
                Agujero negro sin giro ni carga. Rayos integrados con la métrica
                de Schwarzschild, usando el mismo integrador del laboratorio de
                lente. Primera intersección con un disco opaco de espesor nulo;
                hasta tres cruces del plano y resolución finita.
              </p>
              <p>
                No simula magnetohidrodinámica, turbulencia real, crecimiento de
                masa, espectros observados ni un disco relativista de
                Novikov–Thorne. La textura orbital, la exposición y los colores
                ayudan a leer el modelo. La comparación con luz recta es
                artificial. No hay chorros ni giro Kerr.
              </p>
            </details>
            <details>
              <summary>Fuentes y para seguir aprendiendo</summary>
              <ul>
                <li>
                  <a
                    href="https://svs.gsfc.nasa.gov/13326/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    NASA · disco de acreción, perspectiva y refuerzo Doppler
                  </a>
                </li>
                <li>
                  <a
                    href="https://science.nasa.gov/universe/black-holes/anatomy/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    NASA · horizonte, disco y sombra
                  </a>
                </li>
                <li>
                  <a
                    href="https://academic.oup.com/mnras/article/456/4/3915/1031079"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Sądowski y colaboradores (2016), sección 2 · flujo del disco
                    delgado
                  </a>
                </li>
                <li>
                  <a
                    href="https://doi.org/10.1086/152990"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Page y Thorne (1974) · contexto del modelo relativista
                    completo
                  </a>
                </li>
              </ul>
            </details>
          </div>
        </section>
        <BlackHoleNotebook current="acrecion" />
        <MoreLabs current="acrecion" />
      </main>
      <footer className="ac-footer">
        SPUM · EXPERIMENTOS PARA ENTENDER{' '}
        <a href="/">Volver a todos los laboratorios ↗</a>
      </footer>
    </div>
  )
}
