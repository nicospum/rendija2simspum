import { useEffect, useReducer, useState } from 'react'
import Info from '../components/ui/InfoPopover'
import {
  LabMission,
  LabNavigation,
  MoreLabs,
} from '../components/ui/LabJourney'
import EinsteinNavigation from '../einstein/EinsteinNavigation'
import { MATERIALS, snapshot, spectrum } from './physics'
import type { Setup } from './physics'
import { initialState, LESSONS, observations, reducer } from './learning'
import { n } from './format'
import Scene from './Scene'
export default function PhotoelectricApp() {
  const [s, dispatch] = useReducer(reducer, undefined, () => initialState()),
    [energy, setEnergy] = useState(false),
    [visible, setVisible] = useState(!document.hidden)
  const m = snapshot(s.setup),
    light = spectrum(s.setup.frequency),
    lesson = LESSONS[s.index],
    done = s.completed.includes(s.index),
    checks = observations(s)
  const tune = (patch: Partial<Setup>) => dispatch({ type: 'tune', patch })
  const start = (index: number) => dispatch({ type: 'lesson', index })
  const next = () => {
    start((s.index + 1) % 4)
    requestAnimationFrame(() => {
      document
        .getElementById('pe-challenges')
        ?.scrollIntoView({ block: 'start' })
      document.getElementById('pe-question')?.focus({ preventScroll: true })
    })
  }
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
  const first = s.records[0] ? snapshot(s.records[0].setup) : null,
    last = s.records[1] ? snapshot(s.records[1].setup) : null
  return (
    <div className="rl-shell pe-shell">
      <a className="rl-skip" href="#pe-controls">
        Ir a los controles
      </a>
      <header className="rl-header">
        <a className="rl-brand" href="/">
          ∿ SPUM <small>EXPERIMENTOS</small>
        </a>
        <a href="/einstein/">Especial Einstein ↗</a>
      </header>
      <main>
        <EinsteinNavigation current="efecto-fotoelectrico" />
        <section className="rl-intro">
          <div>
            <p className="rl-eyebrow">LABORATORIO 14 / FÍSICA CUÁNTICA</p>
            <h1>
              El efecto
              <br />
              <em>fotoeléctrico.</em>
            </h1>
          </div>
          <div>
            <p className="rl-eyebrow">
              EINSTEIN / EL NOBEL Y LOS CUANTOS DE LUZ
            </p>
            <h2>
              ¿Más luz alcanza
              <br />
              para arrancar un electrón?
            </h2>
            <p>
              Iluminá un metal. Cambiá el color, subí el brillo y probá otra
              superficie. Descubrí por qué la cantidad de luz y la energía de
              cada fotón cuentan historias diferentes.
            </p>
            <a href="#pe-challenges">Empezar con una predicción ↓</a>
          </div>
        </section>
        <LabNavigation
          links={[
            ['Las vistas', '#pe-views'],
            ['Controles', '#pe-controls'],
            ['Retos', '#pe-challenges'],
            ['Por qué', '#pe-science'],
          ]}
        />
        <LabMission
          index={s.index}
          title={lesson.title}
          instruction={lesson.hint}
          href="#pe-challenges"
          result={
            done
              ? 'Reto completado. Probá otras condiciones o seguí al siguiente.'
              : undefined
          }
          onNext={done ? next : undefined}
        />
        <section
          id="pe-views"
          className="rl-observatory"
          aria-label="Emisión de electrones y reparto de energía"
        >
          <div className="rl-observatory-heading">
            <div>
              <p className="rl-eyebrow">
                UNA MISMA LUZ / DOS FORMAS DE ENTENDERLA
              </p>
              <h2>La energía llega de a un fotón.</h2>
            </div>
            <span className="rl-state">
              {s.setup.brightness === 0
                ? 'FUENTE APAGADA'
                : m.emitting
                  ? 'HAY EMISIÓN'
                  : 'NO HAY EMISIÓN'}
              <br />
              {m.material.name} · {n(s.setup.frequency, 0)} THz
            </span>
          </div>
          <div className="pe-transport">
            <div className="pe-buttons">
              <button onClick={() => dispatch({ type: 'play' })}>
                {s.playing ? 'Pausar dibujo' : 'Animar flujo'}
              </button>
              <button
                className="rl-primary"
                onClick={() => dispatch({ type: 'record' })}
              >
                Registrar medición
              </button>
              <a href="#pe-controls">Cambiar las variables ↓</a>
            </div>
            <p>
              La pausa detiene el dibujo. Los valores muestran el estado
              estacionario de la fuente y el metal.
            </p>
            <p role="status">
              {s.feedback.startsWith('Medición guardada') ? s.feedback : ''}
            </p>
          </div>
          <div
            className="rl-mobile-views"
            role="group"
            aria-label="Elegir vista en celular"
          >
            <button aria-pressed={!energy} onClick={() => setEnergy(false)}>
              La celda
            </button>
            <button aria-pressed={energy} onClick={() => setEnergy(true)}>
              La energía
            </button>
          </div>
          <div className="rl-views">
            {[false, true].map((isEnergy, i) => (
              <article
                className="rl-frame"
                data-active={energy === isEnergy}
                key={String(isEnergy)}
              >
                <div className="rl-frame-heading">
                  <div>
                    <span>
                      0{i + 1} /{' '}
                      {isEnergy
                        ? 'LO QUE APORTA CADA FOTÓN'
                        : 'LO QUE LE PASA AL METAL'}
                    </span>
                    <h3>
                      {isEnergy ? 'La energía' : 'La celda fotoeléctrica'}
                    </h3>
                  </div>
                  <Info
                    name={
                      isEnergy
                        ? 'Cómo leer el reparto de energía'
                        : 'Qué son los puntos del visor'
                    }
                  >
                    {isEnergy
                      ? 'La barra usa una escala fija en eV. El fotón aporta hf; la función trabajo φ fija cuánto cuesta salir. Solo si hf supera φ hay energía cinética disponible. El gráfico muestra la recta Kmáx = hf−φ por encima del umbral. Las líneas tenues corresponden a otros materiales. A brillo cero, el círculo hueco indica un valor potencial, no electrones emitidos.'
                      : 'La luz incide en el metal y los puntos turquesa representan fotoelectrones. Son muestras de flujos enormes, no un conteo uno a uno de fotones y electrones. La rapidez de los electrones representa la máxima permitida por hf−φ, en movimiento libre. Los tamaños y tiempos están ampliados; los fotones y electrones no comparten una escala temporal. Un electrón real también puede salir con menos energía.'}
                  </Info>
                </div>
                <Scene setup={s.setup} time={s.time} energy={isEnergy} />
                <p className="rl-frame-caption">
                  {isEnergy
                    ? m.emitting
                      ? `El fotón aporta ${n(m.photonEv)} eV; salir cuesta ${n(m.material.work)} eV; sobran hasta ${n(m.kineticMax)} eV para el electrón.`
                      : s.setup.brightness === 0
                        ? 'La fuente está apagada. La barra y la recta describen la energía que tendrían los fotones del ajuste seleccionado.'
                        : `La energía por fotón no supera el umbral del ${m.material.name.toLowerCase()}. Aumentar el brillo no cambia esa energía.`
                    : 'Fotones: color de la fuente. Electrones: turquesa. El medidor indica corriente ideal; la animación es una representación de flujos, no una filmación microscópica.'}
                </p>
              </article>
            ))}
          </div>
          <div
            className="pe-inline-controls"
            role="group"
            aria-label="Controles junto al visor"
          >
            <div>
              <label htmlFor="pe-live-frequency">
                Frecuencia del visor{' '}
                <output>{n(s.setup.frequency, 0)} THz</output>
              </label>
              <input
                id="pe-live-frequency"
                type="range"
                min="350"
                max="1600"
                step="any"
                value={s.setup.frequency}
                onChange={(ev) => tune({ frequency: +ev.target.value })}
              />
            </div>
            <div>
              <label htmlFor="pe-live-brightness">
                Brillo del visor <output>{n(s.setup.brightness, 0)}%</output>
              </label>
              <input
                id="pe-live-brightness"
                type="range"
                min="0"
                max="100"
                step="1"
                value={s.setup.brightness}
                onChange={(ev) => tune({ brightness: +ev.target.value })}
              />
            </div>
            <div className="pe-live-material">
              <label htmlFor="pe-live-material">Material del visor</label>
              <select
                id="pe-live-material"
                value={s.setup.material}
                onChange={(ev) =>
                  tune({ material: ev.target.value as Setup['material'] })
                }
              >
                {Object.entries(MATERIALS).map(([key, material]) => (
                  <option key={key} value={key}>
                    {material.name} · φ = {n(material.work)} eV
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="pe-readings" aria-live="polite">
            <div>
              <span>
                Energía por fotón{' '}
                <Info name="Frecuencia y energía">
                  E = hf. f mide oscilaciones por segundo; 1 THz equivale a un
                  billón de Hz. Un electrón-volt (eV) es una unidad de energía.
                  La frecuencia fija la energía individual; el brillo de este
                  laboratorio fija la potencia total incidente.
                </Info>
              </span>
              <strong style={{ color: light.color }}>
                {n(m.photonEv, 3)} <small>eV</small>
              </strong>
              <p>
                {light.band} · {n(m.wavelength, 0)} nm.
              </p>
            </div>
            <div>
              <span>Energía cinética máxima</span>
              <strong>
                {m.emitting ? (
                  <>
                    {n(m.kineticMax, 3)} <small>eV</small>
                  </>
                ) : (
                  'Sin emisión'
                )}
              </strong>
              <p>
                {m.emitting
                  ? `Rapidez máxima: ${n(m.speed / 1000, 0)} km/s, sin campos posteriores.`
                  : s.setup.brightness === 0
                    ? 'No llegan fotones: el brillo está en cero.'
                    : `Cada fotón debe superar ${n(m.material.work)} eV para producir transporte.`}
              </p>
            </div>
            <div>
              <span>
                Corriente ideal{' '}
                <Info name="De electrones a corriente">
                  I = eηP/(hf), solo por encima del umbral. Suponemos una
                  eficiencia ilustrativa constante η = 10% y colección completa.
                  No es una predicción calibrada para una superficie real: su
                  eficiencia cambia con frecuencia, estado de la superficie y
                  geometría. A frecuencia fija, la corriente es proporcional al
                  brillo.
                </Info>
              </span>
              <strong>
                {n(m.current * 1e9)} <small>nA</small>
              </strong>
              <p>
                {n(m.emissionRate / 1e9, 1)} mil millones de electrones/s en
                este modelo.
              </p>
            </div>
          </div>
          <p className="rl-map-note">
            Modelo ideal de un fotón por interacción, luz monocromática y
            superficies nominales. Puntos y velocidades de reproducción son
            representativos.{' '}
            <Info name="Qué idealiza la simulación">
              No se simulan distribuciones reales de energía, calentamiento,
              carga espacial, reflexión espectral, potenciales de contacto ni
              absorción de varios fotones. La eficiencia del 10% es una elección
              didáctica. Un metal real puede tener otra función trabajo según su
              superficie. El colector y el circuito representan una medición
              ideal en régimen estacionario.
            </Info>
          </p>
        </section>
        <section
          id="pe-controls"
          className="rl-controls"
          aria-labelledby="pe-controls-title"
        >
          <div className="rl-section-heading">
            <div>
              <p className="rl-eyebrow">FRECUENCIA / BRILLO / MATERIAL</p>
              <h2 id="pe-controls-title">Tres controles. Tres preguntas.</h2>
            </div>
            <a href="#pe-views">Ver lo que cambia ↑</a>
          </div>
          <div className="pe-control-grid">
            <div className="rl-control-card">
              <div className="rl-control-label">
                <label htmlFor="pe-frequency">Frecuencia de la luz</label>
                <output>{n(s.setup.frequency, 0)} THz</output>
              </div>
              <input
                id="pe-frequency"
                type="range"
                min="350"
                max="1600"
                step="any"
                value={s.setup.frequency}
                aria-valuetext={`${n(s.setup.frequency, 0)} terahercios, ${n(m.wavelength, 0)} nanómetros`}
                onChange={(ev) => tune({ frequency: +ev.target.value })}
              />
              <div className="pe-buttons">
                <button onClick={() => tune({ frequency: 450 })}>
                  Rojo · 450 THz
                </button>
                <button onClick={() => tune({ frequency: 650 })}>
                  Azul · 650 THz
                </button>
                <button onClick={() => tune({ frequency: 1000 })}>
                  UV · 1.000 THz
                </button>
              </div>
              <p>
                Subir la frecuencia aumenta hf. El brillo y el material se
                mantienen. El UV y el infrarrojo usan colores simbólicos porque
                no son visibles.
              </p>
              <Info name="Por qué cambia también la cantidad de fotones">
                Acá brillo significa potencia incidente fija, no flujo de
                fotones fijo. Si subís la frecuencia sin cambiar la potencia,
                cada fotón lleva más energía y llegan menos por segundo: Φ =
                P/(hf). Esta diferencia aparece en el cuarto reto.
              </Info>
            </div>
            <div className="rl-control-card">
              <div className="rl-control-label">
                <label htmlFor="pe-brightness">
                  Brillo · potencia incidente
                </label>
                <output>{n(s.setup.brightness, 0)}%</output>
              </div>
              <input
                id="pe-brightness"
                type="range"
                min="0"
                max="100"
                step="1"
                value={s.setup.brightness}
                aria-valuetext={`${n(s.setup.brightness, 0)} por ciento, ${n(m.power * 1e6)} microwatts`}
                onChange={(ev) => tune({ brightness: +ev.target.value })}
              />
              <div className="pe-buttons">
                <button onClick={() => tune({ brightness: 25 })}>
                  Brillo 25%
                </button>
                <button onClick={() => tune({ brightness: 50 })}>
                  Brillo 50%
                </button>
                <button onClick={() => tune({ brightness: 100 })}>
                  Brillo 100%
                </button>
              </div>
              <p>
                Potencia incidente: {n(m.power * 1e6)} µW. A frecuencia fija,
                más brillo significa más fotones por segundo, con la misma
                energía individual.
              </p>
              <p>Flujo incidente: {n(m.photonRate / 1e12)} ×10¹² fotones/s.</p>
            </div>
            <div className="rl-control-card">
              <h3>
                Material de la superficie{' '}
                <Info name="Qué es la función trabajo">
                  φ es la energía mínima para extraer un electrón de la
                  superficie al vacío. No es la energía de ionización de un
                  átomo aislado. Acá usamos valores nominales de enseñanza; la
                  orientación cristalina, la contaminación y el estado
                  superficial modifican valores reales.
                </Info>
              </h3>
              <div
                className="pe-buttons"
                role="group"
                aria-label="Elegir material"
              >
                {Object.entries(MATERIALS).map(([key, material]) => (
                  <button
                    key={key}
                    aria-pressed={s.setup.material === key}
                    onClick={() => tune({ material: key as Setup['material'] })}
                  >
                    {material.name} · {material.symbol}
                  </button>
                ))}
              </div>
              <p>
                Función trabajo: <strong>{n(m.material.work)} eV</strong>.
                Frecuencia umbral: <strong>{n(m.threshold, 1)} THz</strong>.
              </p>
              <p>
                Cambiar el metal mueve el umbral y la recta de energía. La
                frecuencia y el brillo de la fuente se conservan.
              </p>
              <button
                className="pe-threshold"
                onClick={() => tune({ frequency: m.threshold + 25 })}
              >
                Probar justo sobre este umbral
              </button>
            </div>
          </div>
          <div className="pe-buttons">
            <button
              className="rl-primary"
              onClick={() => dispatch({ type: 'record' })}
            >
              Medir desde los controles
            </button>
            <a href="#pe-records">Comparar mis mediciones ↓</a>
            <a href="#pe-views">Volver a las vistas ↑</a>
          </div>
        </section>
        <section
          id="pe-records"
          className="pe-records"
          aria-labelledby="pe-records-title"
        >
          <p className="rl-eyebrow">OBSERVAR / GUARDAR / COMPARAR</p>
          <h2 id="pe-records-title">Tu mesa de mediciones.</h2>
          <p>
            Guardamos las dos últimas condiciones distintas. Las mediciones
            conservan sus valores aunque sigas moviendo los controles.
          </p>
          <div className="pe-record-grid">
            {s.records.length ? (
              s.records.map((record, i) => {
                const r = snapshot(record.setup)
                return (
                  <article
                    key={`${record.setup.material}-${record.setup.frequency}-${record.setup.brightness}`}
                  >
                    <p className="rl-eyebrow">
                      MEDICIÓN 0{i + 1} / {r.material.name.toUpperCase()}
                    </p>
                    <h3>
                      {n(record.setup.frequency, 0)} THz · brillo{' '}
                      {record.setup.brightness}%
                    </h3>
                    <dl>
                      <div>
                        <dt>Energía por fotón</dt>
                        <dd>{n(r.photonEv, 3)} eV</dd>
                      </div>
                      <div>
                        <dt>Función trabajo</dt>
                        <dd>{n(r.material.work)} eV</dd>
                      </div>
                      <div>
                        <dt>Energía cinética máxima</dt>
                        <dd>
                          {r.emitting
                            ? `${n(r.kineticMax, 3)} eV`
                            : 'Sin emisión'}
                        </dd>
                      </div>
                      <div>
                        <dt>Corriente ideal</dt>
                        <dd>{n(r.current * 1e9)} nA</dd>
                      </div>
                    </dl>
                  </article>
                )
              })
            ) : (
              <p className="pe-empty">
                Todavía no hay mediciones. Elegí una condición y tocá “Registrar
                medición”. Después cambiá una sola variable y medí de nuevo.
              </p>
            )}
          </div>
          {first && last && (
            <p className="pe-comparison" role="status">
              {first.emitting && last.emitting
                ? `Segunda respecto de la primera: corriente ×${n(last.current / first.current)}; cambio de energía máxima ${last.kineticMax - first.kineticMax >= 0 ? '+' : ''}${n(last.kineticMax - first.kineticMax, 3)} eV.`
                : first.emitting
                  ? `La segunda condición deja de emitir; la primera tenía ${n(first.current * 1e9)} nA.`
                  : last.emitting
                    ? `La primera no emitía. La segunda sí: ${n(last.current * 1e9)} nA y hasta ${n(last.kineticMax, 3)} eV por electrón.`
                    : 'Ninguna de las dos condiciones produce emisión en este modelo.'}
            </p>
          )}
        </section>
        <section
          id="pe-challenges"
          className="rl-challenges"
          aria-labelledby="pe-challenges-title"
        >
          <div className="rl-section-heading">
            <div>
              <p className="rl-eyebrow">PREDECÍ / MEDÍ / EXPLICÁ</p>
              <h2 id="pe-challenges-title">Cuatro descubrimientos con luz.</h2>
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
              <h3 id="pe-question" tabIndex={-1}>
                {lesson.question}
              </h3>
              <fieldset className="rl-predictions">
                <legend>Tu predicción</legend>
                {lesson.choices.map((choice, i) => (
                  <label key={choice}>
                    <input
                      type="radio"
                      name="pe-prediction"
                      checked={s.prediction === i}
                      onChange={() => dispatch({ type: 'predict', choice: i })}
                    />
                    {choice}
                  </label>
                ))}
              </fieldset>
            </div>
            <div>
              <h3>Hacé las dos mediciones.</h3>
              <p>{lesson.hint}</p>
              <a className="pe-jump" href="#pe-controls">
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
        <section id="pe-science" className="rl-science">
          <p className="rl-eyebrow">UNA IDEA QUE CAMBIÓ LA FÍSICA</p>
          <h2>El color no es solo un color.</h2>
          <p>
            La gran pista era que la energía máxima de los electrones dependía
            de la frecuencia de la luz, no de su intensidad. Einstein propuso en
            1905 que la energía se intercambia en cuantos hf. Así pudo explicar
            el umbral y el reparto de energía, que una descripción clásica de
            absorción continua no explicaba adecuadamente.
          </p>
          <details open>
            <summary>La fórmula, símbolo por símbolo</summary>
            <div className="pe-formula">hf = φ + Kmáx</div>
            <dl className="pe-symbols">
              <div>
                <dt>h · constante de Planck</dt>
                <dd>Conecta la frecuencia con la energía de un fotón.</dd>
              </div>
              <div>
                <dt>f · frecuencia</dt>
                <dd>
                  La controla la fuente; subirla aumenta la energía individual.
                </dd>
              </div>
              <div>
                <dt>φ · función trabajo</dt>
                <dd>
                  La fija la superficie. Es la energía mínima necesaria para
                  salir.
                </dd>
              </div>
              <div>
                <dt>Kmáx · energía cinética máxima</dt>
                <dd>
                  El mayor sobrante posible para un electrón que sale. Si hf no
                  supera φ, no hay transporte fotoeléctrico en este ideal.
                </dd>
              </div>
            </dl>
            <p>
              Umbral: f₀ = φ/h. El brillo no aparece en esa condición: cambia
              cuántos fotones llegan, no la energía de cada uno. La ley da una
              energía máxima; los electrones reales pueden salir con energías
              menores.
            </p>
          </details>
          <details>
            <summary>Cómo se mide la energía y qué predice el modelo</summary>
            <p>
              En un experimento se puede aplicar un potencial que frene a los
              electrones. Cuando ni los más energéticos llegan al colector,
              eVfreno = Kmáx.{' '}
              {m.emitting
                ? `Con tus ajustes, el potencial de frenado ideal sería ${n(m.stopping, 3)} V.`
                : 'En la condición actual no hay electrones emitidos para medir ese frenado.'}{' '}
              Acá mostramos su valor calculado; el circuito del visor representa
              colección ideal sin barrera de frenado.
            </p>
            <p>
              Los valores de función trabajo elegidos son sodio 2,46 eV, zinc
              4,31 eV y plata 4,73 eV. Son valores nominales de enseñanza, no
              constantes universales de cada elemento. La corriente usa una
              eficiencia ilustrativa fija del 10% y Pmáx = 1 µW sobre el metal;
              no predice la curva de un dispositivo real.
            </p>
          </details>
          <details>
            <summary>Hertz, Einstein, Millikan y el Nobel</summary>
            <p>
              Hertz observó el fenómeno en 1887. Otros investigadores estudiaron
              sus regularidades. Einstein publicó su explicación en 1905 y
              Millikan contrastó cuantitativamente la relación entre frecuencia
              y energía. El Nobel de Física de 1921, recibido en 1922, destacó
              especialmente la ley del efecto fotoeléctrico.
            </p>
            <p>
              La importancia fue más allá de un aparato: la luz intercambia
              energía en cantidades ligadas a su frecuencia. Esa idea ayudó a
              construir la física cuántica. Los fotocátodos convierten luz en
              emisión de electrones y permiten detectar señales luminosas muy
              débiles.
            </p>
            <a
              href="https://www.nobelprize.org/prizes/physics/1921/summary/"
              target="_blank"
              rel="noreferrer"
            >
              Nobel · motivo oficial del premio ↗
            </a>
            <br />
            <a
              href="https://doi.org/10.1103/PhysRev.7.355"
              target="_blank"
              rel="noreferrer"
            >
              Millikan · publicación experimental de 1916 ↗
            </a>
          </details>
          <details>
            <summary>Fuentes, constantes y límites</summary>
            <ul>
              <li>
                <a
                  href="https://physics.nist.gov/cuu/pdf/all.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  NIST · constantes CODATA 2022
                </a>
              </li>
              <li>
                <a
                  href="https://openstax.org/books/university-physics-volume-3/pages/6-2-photoelectric-effect"
                  target="_blank"
                  rel="noreferrer"
                >
                  OpenStax/Rice · tabla de funciones trabajo y efecto
                  fotoeléctrico
                </a>
              </li>
              <li>
                <a
                  href="https://www.nobelprize.org/prizes/physics/1921/ceremony-speech/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Nobel · contexto histórico y observaciones
                </a>
              </li>
            </ul>
            <p>
              La simulación no modela calentamiento, fotoemisión multifotónica,
              distribuciones angulares, potenciales de contacto ni rendimiento
              espectral real. Los colores visibles son aproximados; UV e
              infrarrojo están identificados con colores simbólicos.
            </p>
          </details>
        </section>
        <section className="rl-continue">
          <p className="rl-eyebrow">DE LA ENERGÍA A LA INTERFERENCIA</p>
          <h2>¿Y cómo viaja esa misma luz?</h2>
          <p>
            La luz produce interferencia al propagarse y detecciones
            individuales al intercambiar energía. Seguí con la doble rendija
            para explorar otra cara de la física cuántica.
          </p>
          <a className="pe-jump" href="/doble-rendija/">
            Explorar la doble rendija →
          </a>
        </section>
        <EinsteinNavigation current="efecto-fotoelectrico" />
        <MoreLabs current="efecto-fotoelectrico" />
      </main>
      <footer className="rl-footer">
        <a href="/einstein/">Volver al especial Einstein ↗</a>
        <span>Más luz y más energía no significan lo mismo.</span>
      </footer>
    </div>
  )
}
