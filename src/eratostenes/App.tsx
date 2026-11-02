import { useReducer, useState } from 'react'
import SceneConsole from '../components/ui/SceneConsole'
import { LabMission, LabNavigation, MoreLabs } from '../components/ui/LabJourney'
import { latitudeAtDistance, snapshot } from './physics'
import type { Measurement, Setup } from './physics'
import { initialState, LESSONS, observations, reducer } from './learning'
import Scene from './Scene'
import { n } from './format'

function Result({ m }: { m: Measurement }) {
  return (
    <>
      <p
        className="er-equation"
        aria-label="Circunferencia igual a trescientos sesenta grados por distancia dividido por diferencia angular"
      >
        C ≈ <span>360° × {n(m.distance, 0)} km</span> / {n(m.separation, 2)}°
      </p>
      {m.estimatedC === null ? (
        <p>
          No se puede estimar: los sitios no aportan una diferencia angular. Separalos y
          volvé a medir.
        </p>
      ) : (
        <>
          <strong className="er-result">
            {n(m.estimatedC, 0)} <small>km de circunferencia</small>
          </strong>
          <p>Lecturas redondeadas; cálculo con los valores completos.</p>
          <p>
            Ese arco entra aproximadamente {n(360 / m.separation, 2)} veces en una vuelta
            de 360°. Multiplicamos la distancia por esa misma proporción.
          </p>
          {m.setup.angularError > 0 && (
            <p className="er-interval">
              Con ±{n(m.setup.angularError, 2)}°:{' '}
              {m.upperC === null
                ? 'sin cota superior finita; el margen alcanza al ángulo medido'
                : `${n(m.lowerC!, 0)} a ${n(m.upperC, 0)} km posibles`}
            </p>
          )}
        </>
      )}
    </>
  )
}

export default function App() {
  const [s, dispatch] = useReducer(reducer, undefined, () => initialState()),
    [view, setView] = useState<'planet' | 'shadows'>('planet'),
    [city, setCity] = useState<'A' | 'B'>('B')
  const m = snapshot(s.setup),
    l = LESSONS[s.index],
    checks = observations(s)
  const tune = (patch: Partial<Setup>) => dispatch({ type: 'tune', patch })
  const start = (index: number) => {
    dispatch({ type: 'lesson', index })
    setView(index === 2 ? 'shadows' : 'planet')
    setCity('B')
  }
  const distance = (value: number) => {
    setCity('B')
    tune({ latitudeB: latitudeAtDistance(s.setup, value) })
  }
  const measure = () => dispatch({ type: 'measure' })
  const last = s.records[s.records.length - 1]
  return (
    <div className="er-shell">
      <a className="er-skip" href="#er-views">
        Ir al experimento
      </a>
      <header className="er-header">
        <a href="/" aria-label="SPUM, volver a todos los experimentos">
          ∿ SPUM <small>EXPERIMENTOS</small>
        </a>
        <a href="/">← Todos los laboratorios</a>
      </header>
      <main>
        <section className="er-intro">
          <div>
            <p className="er-eyebrow">LABORATORIO 18 · ERATÓSTENES</p>
            <h1>
              Dos sombras.
              <br />
              <em>Una Tierra.</em>
            </h1>
          </div>
          <div>
            <p className="er-eyebrow">UN PALO, UNA SOMBRA Y UNA GRAN PREGUNTA</p>
            <h2>¿Podés medir el planeta sin darle la vuelta?</h2>
            <p>
              Mové dos sitios, medí sus sombras y reconstruí el tamaño del mundo. Un
              pequeño ángulo puede contar una historia enorme.
            </p>
            <a data-scene-play href="#er-views">
              Medir mi primera sombra ↓
            </a>
          </div>
        </section>
        <LabNavigation
          light
          links={[
            ['Escena', '#er-views'],
            ['Controles', '#er-controls'],
            ['Cuatro retos', '#er-challenges'],
            ['La historia', '#er-science'],
          ]}
        />
        <LabMission
          light
          index={s.index}
          title={l.title}
          instruction={l.hint}
          href="#er-challenges"
          saved={s.completed.includes(s.index)}
          result={s.verified ? 'Comparación completada en este intento.' : undefined}
          onNext={s.verified ? () => start((s.index + 1) % 4) : undefined}
        />
        <section
          id="er-views"
          className="er-workspace"
          data-scene-workspace
          aria-label="Tierra, sombras y retos conectados"
        >
          <div className="spum-live-stage">
            <div className="er-viewbar" role="group" aria-label="Elegir vista">
              <button aria-pressed={view === 'planet'} onClick={() => setView('planet')}>
                El planeta
              </button>
              <button
                aria-pressed={view === 'shadows'}
                onClick={() => setView('shadows')}
              >
                Las sombras
              </button>
              <span>{s.completed.length}/4 hallazgos</span>
            </div>
            <div className="er-scene">
              <Scene
                setup={s.setup}
                view={view}
                activeCity={city}
                onSelectCity={setCity}
                onCity={(value) =>
                  tune(city === 'A' ? { latitudeA: value } : { latitudeB: value })
                }
                onHeight={(height) => tune({ height })}
              />
            </div>
            <p className="er-scene-prompt">
              {view === 'planet'
                ? `Arrastrá el aro ${city} por el borde. El Sol ilumina ambos sitios en paralelo.`
                : 'Estirá la punta de un palo. Ambas lupas usan la misma escala ajustada.'}
            </p>
            <div className="er-live-readings" aria-label="Lecturas actuales del montaje">
              <div
                data-help-title="Distancia por la superficie"
                data-help-body="Es la longitud del arco entre los dos sitios sobre el mismo meridiano. No es la línea recta que atravesaría el planeta. En esta simulación, la cinta virtual la calcula con el radio del mundo; en una medición real habría que conocer esa distancia por separado."
                tabIndex={0}
              >
                <span>ARCO d</span>
                <strong>
                  {n(m.distance, 0)} <small>km</small>
                </strong>
              </div>
              <div
                data-help-title="Diferencia angular"
                data-help-body="Restamos los ángulos cenitales firmados de ambos sitios y tomamos la magnitud. Si las sombras apuntan a lados opuestos, sus magnitudes se suman. Bajo los supuestos de la escena, el resultado coincide con el ángulo entre las verticales en el centro del planeta."
                tabIndex={0}
              >
                <span>ÁNGULO Δθ</span>
                <strong>{n(m.separation, 2)}°</strong>
              </div>
              <div
                data-help-title="Altura de los palos"
                data-help-body="Ambos palos están verticales respecto del suelo local y tienen la misma altura elegida. La longitud de cada sombra dividida por esta altura determina su ángulo. Cambiar la altura no cambia el tamaño del planeta."
                tabIndex={0}
              >
                <span>PALOS h</span>
                <strong>
                  {n(s.setup.height, 2)} <small>m</small>
                </strong>
              </div>
            </div>
          </div>
          <SceneConsole
            viewHref="#er-views"
            challengeHref="#er-challenges"
            hint="Mismo meridiano, mismo instante de mediodía solar y rayos paralelos. Arrastrá sólo el aro o la punta del palo; el fondo permite desplazar la página. Los controles y las flechas del teclado ofrecen la misma acción. Medir guarda el montaje; los pasos requieren mantener A y el Sol en 23,44° y cambiar sólo la variable pedida. «Volver al montaje del reto» recupera esa referencia sin borrar las mediciones."
            challenge={{
              index: s.index,
              lessons: LESSONS,
              question: l.question,
              choices: l.choices,
              prediction: s.prediction,
              steps: l.steps.map((label, i) => ({ label, done: checks[i] })),
              verified: s.verified,
              feedback: s.feedback,
              meaning: l.meaning,
              onPredict: (choice) => dispatch({ type: 'predict', choice }),
              onLesson: start,
              onCheck: () => dispatch({ type: 'check' }),
              onRestore: () => start(s.index),
            }}
          >
            <div className="spum-console-buttons er-presets">
              {s.index === 0 && <button onClick={() => distance(0)}>Mismo lugar</button>}
              {s.index === 3 && (
                <button onClick={() => distance(400)}>Separar 400 km</button>
              )}
              {s.index !== 2 && (
                <button onClick={() => distance(800)}>Separar 800 km</button>
              )}
              {s.index === 1 && (
                <button onClick={() => distance(1600)}>Separar 1600 km</button>
              )}
              {s.index === 2 && (
                <>
                  <button onClick={() => tune({ height: 1 })}>Palos de 1 m</button>
                  <button onClick={() => tune({ height: 2 })}>Palos de 2 m</button>
                </>
              )}
            </div>
            <div
              className="spum-console-buttons er-city"
              role="group"
              aria-label="Sitio que se puede mover"
            >
              <button
                aria-pressed={city === 'A'}
                onClick={() => {
                  setCity('A')
                  setView('planet')
                }}
              >
                Mover A
              </button>
              <button
                aria-pressed={city === 'B'}
                onClick={() => {
                  setCity('B')
                  setView('planet')
                }}
              >
                Mover B
              </button>
            </div>
            <div className="spum-console-row">
              <label htmlFor="er-latitude">Latitud del sitio {city}</label>
              <output>
                {n(city === 'A' ? s.setup.latitudeA : s.setup.latitudeB, 2)}°
              </output>
            </div>
            <input
              id="er-latitude"
              type="range"
              min="-35"
              max="55"
              step="any"
              value={city === 'A' ? s.setup.latitudeA : s.setup.latitudeB}
              onChange={(e) =>
                tune(
                  city === 'A'
                    ? { latitudeA: +e.target.value }
                    : { latitudeB: +e.target.value },
                )
              }
            />
            <div className="spum-console-row">
              <label htmlFor="er-height">Altura de ambos palos</label>
              <output>{n(s.setup.height, 2)} m</output>
            </div>
            <input
              id="er-height"
              type="range"
              min="0.5"
              max="3"
              step="0.05"
              value={s.setup.height}
              onChange={(e) => tune({ height: +e.target.value })}
            />
            {s.index === 3 && (
              <>
                <div className="spum-console-row">
                  <label htmlFor="er-error">Margen de la diferencia angular</label>
                  <output>±{n(s.setup.angularError, 2)}°</output>
                </div>
                <input
                  id="er-error"
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={s.setup.angularError}
                  onChange={(e) => tune({ angularError: +e.target.value })}
                />
                <p>
                  Margen acotado, sin azar. Para este reto compará ambas bases con ±0,2°.
                </p>
              </>
            )}
            <div className="spum-console-buttons">
              <button
                className="er-measure"
                onClick={measure}
                data-help-title="Guardar una observación"
                data-help-body="Registra distancia, ángulos, sombras y condiciones actuales; después calcula la circunferencia por proporción. Mover un control sin registrar no completa un paso. Las dos comparaciones requeridas se conservan; una exploración extra se reemplaza por la siguiente."
              >
                Medir y guardar ↗
              </button>
              <button onClick={() => tune({ ...l.setup })}>
                Volver al montaje del reto
              </button>
            </div>
            <div className="er-live-result" aria-live="polite">
              {last ? (
                <>
                  <span className="er-eyebrow">
                    ÚLTIMA MEDICIÓN GUARDADA · NO ES UNA LECTURA EN VIVO
                  </span>
                  <Result m={last} />
                </>
              ) : (
                <p>
                  La cinta mide el arco; las sombras dan el ángulo. Tocá «Medir y guardar»
                  para calcular la vuelta completa.
                </p>
              )}
            </div>
            <details className="er-explore">
              <summary>Explorar la posición del Sol</summary>
              <p>
                Es su declinación al mediodía solar. La esfera y su radio permanecen
                fijos. Cambiarla modifica ambas sombras, pero la diferencia angular sigue
                midiendo la separación de los sitios.
              </p>
              <label htmlFor="er-sun">
                Declinación solar: {n(s.setup.declination, 2)}°
              </label>
              <input
                id="er-sun"
                type="range"
                min="-23.44"
                max="23.44"
                step="0.01"
                value={s.setup.declination}
                onChange={(e) => tune({ declination: +e.target.value })}
              />
            </details>
          </SceneConsole>
        </section>
        <section className="er-notebook" aria-label="Mediciones del reto">
          <div>
            <p className="er-eyebrow">TU CUADERNO DE CAMPO</p>
            <h2>Compará lo que mediste.</h2>
            <p>
              Se conservan las dos observaciones pedidas y la última exploración extra.
              Cambiar de reto o reiniciarlo limpia este cuaderno. Los hallazgos duran esta
              visita.
            </p>
          </div>
          <div className="er-records">
            {s.records.length === 0 ? (
              <p>Aún no hay mediciones. Volvé al visor y guardá la primera.</p>
            ) : (
              s.records.map((r, i) => (
                <article key={r.key}>
                  <h3>
                    {r.key === 'explore' ? 'Exploración extra' : `Observación ${i + 1}`}
                  </h3>
                  <p>
                    A: {n(r.setup.latitudeA, 2)}° · B: {n(r.setup.latitudeB, 2)}° · Sol:{' '}
                    {n(r.setup.declination, 2)}°
                  </p>
                  <p>
                    Palos: {n(r.setup.height, 2)} m · Sombras firmadas A/B (N+/S−):{' '}
                    {n(r.shadowA, 3)} / {n(r.shadowB, 3)} m
                  </p>
                  <Result m={r} />
                </article>
              ))
            )}
          </div>
        </section>
        <section id="er-science" className="er-story">
          <p className="er-eyebrow">DE UNA SOMBRA A UN PLANETA · SIGLO III A. C.</p>
          <h2>
            El mundo era enorme.
            <br />
            La idea cabía en un triángulo.
          </h2>
          <div className="er-story-grid">
            <article>
              <h3>¿Quién fue?</h3>
              <p>
                Eratóstenes, estudioso de la Alejandría antigua, estimó la circunferencia
                comparando la dirección del Sol en Alejandría y Siene. Un ángulo pequeño y
                la distancia entre lugares permitían inferir la vuelta entera.
              </p>
            </article>
            <article>
              <h3>¿Probó que era redonda?</h3>
              <p>
                Ya había argumentos de una Tierra esférica antes de él. Su cálculo usó esa
                geometría y un Sol lejano. Las sombras aportan evidencia en ese contexto:
                dos sombras, por sí solas y sin esos supuestos, no descartan cualquier
                otro modelo imaginable.
              </p>
            </article>
            <article>
              <h3>¿Qué tan exacto fue?</h3>
              <p>
                Fue una estimación extraordinaria para su época. Pero la longitud del
                estadio antiguo y los detalles transmitidos por fuentes posteriores son
                discutidos: no le asignamos un porcentaje histórico de precisión
                definitivo.
              </p>
            </article>
          </div>
          <a
            href="https://oceanservice.noaa.gov/education/tutorial_geodesy/geo02_hist.html"
            target="_blank"
            rel="noreferrer"
          >
            NOAA · historia de la medición de la Tierra ↗
          </a>
          <details>
            <summary>Fórmula, supuestos y límites de esta simulación</summary>
            <p>
              θ = arctan(s/h), conservando el signo de la sombra. Δθ = |θB − θA| y C =
              360° × d / Δθ. Mismo meridiano y mediodía solar común; no necesariamente las
              12 del reloj civil. Distancia de arco, no cuerda. Sol lejano, rayos
              paralelos, palos radiales y suelo local ideal.
            </p>
            <p>
              El mundo didáctico es una esfera fija de 40.000 km de circunferencia; el
              valor inferido sale de sus medidas virtuales. La Tierra real no es una
              esfera perfecta. No se modelan relieve, refracción atmosférica, disco solar
              ni errores de distancia. El margen angular da cotas, no una distribución de
              probabilidad. Los palos del planeta están aumentados y las lupas usan una
              escala común que puede ajustarse.
            </p>
            <a
              href="https://gml.noaa.gov/grad/solcalc/solareqns.PDF"
              target="_blank"
              rel="noreferrer"
            >
              NOAA · posición solar y ángulo cenital ↗
            </a>
          </details>
        </section>
        <section className="er-real">
          <p className="er-eyebrow">DEL VISOR AL PATIO</p>
          <h2>Esto también se puede hacer afuera.</h2>
          <p>
            Un palo vertical, su altura, la sombra y otra escuela en un lugar conocido.
            Hay que acordar la fecha, el mediodía solar y cómo medir la distancia. El reto
            real es controlar los supuestos y estimar el error, además de obtener un
            número.
          </p>
          <a
            href="https://cesar.esa.int/index.php?Section=News&Id=161"
            target="_blank"
            rel="noreferrer"
          >
            ESA · una repetición entre escuelas ↗
          </a>
        </section>
        <MoreLabs current="eratostenes" light />
      </main>
      <footer className="er-footer">
        <a href="/">SPUM · Aprender midiendo</a>
        <span>Geometría real, mundo idealizado.</span>
      </footer>
    </div>
  )
}
