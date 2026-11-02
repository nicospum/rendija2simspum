import { useReducer, useState } from 'react'
import SceneConsole from '../components/ui/SceneConsole'
import { LabMission, LabNavigation, MoreLabs } from '../components/ui/LabJourney'
import { JourneyNavigation } from '../maldacena/LabFrame'
import Apparatus, { LocalCards, ScoreBar, QuantumSum } from './Scene'
import {
  BELL_ANGLES,
  PAIRS,
  PAIR_LABELS,
  card,
  interval,
  quantum,
  stats,
} from './physics'
import type { Angles, Pair, Sweep } from './physics'
import { LESSONS, initialState, observations, reducer } from './learning'
import { n, signed } from './format'

const seed = () => Math.floor(Math.random() * 4294967296)
function Trial({ trial }: { trial: Sweep }) {
  const q = quantum(trial.angles),
    ci = interval(trial.rows)!
  return (
    <div className="bl-trial">
      <h3>Cuatro preguntas, un mismo montaje.</h3>
      <p className="md-small">
        Ensayo nuevo: {trial.n} pares por combinación, {n(trial.n * 4, 0)} en total. No se
        descartó ninguna salida.
      </p>
      <div className="bl-table-wrap">
        <table>
          <caption>
            Ángulos y correlaciones registrados · E = (iguales − distintos) / N
          </caption>
          <thead>
            <tr>
              <th>Par</th>
              <th>Ángulos</th>
              <th aria-label="Iguales y distintos">= / ≠</th>
              <th aria-label="Correlación observada">E</th>
              <th aria-label="Signo en la suma">S</th>
            </tr>
          </thead>
          <tbody>
            {trial.rows.map((counts, i) => {
              const m = stats(counts),
                [a, b] = PAIRS[i]
              return (
                <tr key={i}>
                  <th>{PAIR_LABELS[i]}</th>
                  <td>
                    {n(trial.angles[a], trial.angles[a] % 1 === 0 ? 0 : 1)}° /{' '}
                    {n(trial.angles[b], trial.angles[b] % 1 === 0 ? 0 : 1)}°
                  </td>
                  <td>
                    {m.same} / {m.different}
                  </td>
                  <td
                    data-help-title={`E observado de ${PAIR_LABELS[i]}`}
                    data-help-body={`Promedio de productos de esta fila: (iguales−distintos)/${trial.n}. La predicción exacta es ${signed(q.correlations[i], 3)}; la muestra puede fluctuar. No es un porcentaje de coincidencias.`}
                  >
                    {signed(m.E!, 3)}
                  </td>
                  <td>{i === 3 ? '−' : '+'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <ScoreBar exact={q.S} observed={ci.estimate} lower={ci.lower} upper={ci.upper} />
      <p className="bl-interval">
        Cota simultánea 95 % de este ensayo:{' '}
        <strong>
          [{signed(ci.lower, 3)}; {signed(ci.upper, 3)}]
        </strong>
        .
      </p>
      <p className="md-small">
        Hoeffding conservadora, para los tamaños fijados antes de medir. No es un p-valor
        ni una prueba de la naturaleza. Volver a medir reemplaza el ensayo; repetir hasta
        obtener una cifra deseada no conserva esa cobertura para el resultado
        seleccionado.
      </p>
    </div>
  )
}
export default function App() {
  const [s, dispatch] = useReducer(reducer, undefined, () => initialState()),
    [view, setView] = useState<'experiment' | 'cards' | 'score'>('experiment')
  const l = LESSONS[s.index],
    checks = observations(s),
    [ai, bi] = PAIRS[s.pair],
    q = quantum(s.angles),
    c = card(s.card),
    current = stats(s.run?.counts ?? [0, 0, 0, 0]),
    pSame = (1 + q.correlations[s.pair]) / 2
  const start = (index: number) => {
    dispatch({ type: 'lesson', index })
    setView(index === 1 ? 'cards' : index === 2 ? 'score' : 'experiment')
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLSelectElement>(
          '#bl-views select[aria-label="Elegir reto junto a la escena"]',
        )
        ?.focus({ preventScroll: true }),
    )
  }
  const angle = (index: number, value: number) =>
    dispatch({ type: 'angle', index, value })
  const bPreset = (value: number) => {
    setView('experiment')
    dispatch({ type: 'preset', angles: [0, s.angles[1], value, s.angles[3]] })
  }
  const sample = (size: 1 | 200) => dispatch({ type: 'sample', size, seed: seed() })
  return (
    <div className="md-shell bl-shell">
      <a className="md-skip" href="#bl-views">
        Ir al experimento
      </a>
      <header className="md-header">
        <a href="/">∿ SPUM</a>
        <a href="/maldacena/">RECORRIDO MALDACENA ↗</a>
      </header>
      <main>
        <JourneyNavigation />
        <section className="md-intro bl-intro">
          <p className="md-eyebrow">LABORATORIO 19 · DESIGUALDADES DE BELL</p>
          <h1>
            ¿Las partículas traen
            <br />
            <em>las respuestas escritas?</em>
          </h1>
          <p>
            Una fuente envía un fotón a A y otro a B. Girá sus filtros y compará los
            resultados: ¿podrían traer las respuestas preparadas? Primero jugá con las
            coincidencias; después poné a prueba el límite que descubrió Bell.
          </p>
          <a className="md-primary" data-scene-play href="#bl-views">
            Entrar, girar y poner a prueba ↓
          </a>
          <p className="md-small">
            Cada pareja es nueva. Dos salidas por detector, sin pérdidas en este modelo
            ideal. Las mediciones reales de Bell van mucho más allá de esta simulación.
          </p>
        </section>
        <LabNavigation
          links={[
            ['Escena', '#bl-views'],
            ['Controles', '#bl-controls'],
            ['Cuatro retos', '#bl-challenges'],
            ['Qué significa', '#bl-understand'],
          ]}
        />
        <LabMission
          index={s.index}
          title={l.title}
          instruction={l.hint}
          href="#bl-challenges"
          saved={s.completed.includes(s.index)}
          result={
            s.verified
              ? 'Explicación contrastada con las observaciones de este intento.'
              : undefined
          }
          onNext={s.verified ? () => start((s.index + 1) % 4) : undefined}
        />
        <section
          className="md-workspace bl-workspace"
          id="bl-views"
          data-scene-workspace
          aria-label="Bell: analizadores, tarjetas y reto conectados"
        >
          <div className="spum-live-stage md-stage">
            <div className="md-view-tabs" role="group" aria-label="Elegir vista">
              <button
                aria-pressed={view === 'experiment'}
                onClick={() => setView('experiment')}
              >
                Experimento
              </button>
              <button aria-pressed={view === 'cards'} onClick={() => setView('cards')}>
                Tarjetas locales
              </button>
              <button aria-pressed={view === 'score'} onClick={() => setView('score')}>
                Suma CHSH
              </button>
            </div>
            {view === 'experiment' && (
              <p className="bl-scene-key">
                Un fotón a A, otro a B. ₀/₁: orientaciones; +/−: salidas, no cargas.
              </p>
            )}
            <div className="md-drawing bl-drawing">
              {view === 'experiment' ? (
                <Apparatus
                  angles={s.angles}
                  pair={s.pair}
                  last={s.last}
                  event={s.event}
                  onAngle={angle}
                  onEmit={() => sample(1)}
                />
              ) : view === 'cards' ? (
                <LocalCards
                  index={s.card}
                  onCard={(index) => dispatch({ type: 'card', index })}
                />
              ) : (
                <QuantumSum
                  angles={s.angles}
                  trial={s.trial}
                  onInspect={(pair) => {
                    dispatch({ type: 'pair', pair })
                    setView('experiment')
                  }}
                />
              )}
            </div>
            {view === 'experiment' ? (
              <div className="bl-live" aria-label="Lecturas del par activo">
                <div className="bl-angle-readout">
                  <span>
                    A{ai === 0 ? '₀' : '₁'} <b>{n(s.angles[ai], 1)}°</b>
                  </span>
                  <span>{PAIR_LABELS[s.pair]}</span>
                  <span>
                    B{bi === 2 ? '₀' : '₁'} <b>{n(s.angles[bi], 1)}°</b>
                  </span>
                </div>
                <div
                  className="bl-e-line"
                  data-help-title="Qué mide una correlación E"
                  data-help-body="Cada detección tiene dos resultados ±1. Su producto vale +1 si coinciden y −1 si difieren. E es el promedio: +1 siempre iguales, 0 mitad y mitad en promedio, −1 siempre distintos. No es el porcentaje local de +."
                >
                  <span>E del modelo</span>
                  <strong>{signed(q.correlations[s.pair], 3)}</strong>
                  <span>{n(pSame * 100, 1)} % iguales</span>
                </div>
                <div
                  className="bl-e-track"
                  role="meter"
                  aria-label="Correlación exacta del par activo"
                  aria-valuemin={-1}
                  aria-valuemax={1}
                  aria-valuenow={q.correlations[s.pair]}
                >
                  <i style={{ left: `${(q.correlations[s.pair] + 1) * 50}%` }} />
                </div>
                <div className="bl-e-ends">
                  <span>−1 · distintos</span>
                  <span>0 · mitad iguales</span>
                  <span>+1 · iguales</span>
                </div>
                <div
                  className="bl-live-sample"
                  role="status"
                  aria-live="polite"
                  data-help-title="Tus detecciones, separadas de la predicción"
                  data-help-body="Medidos cuenta parejas de fotones de este montaje. Cada pareja aporta una salida en A y otra en B: el primer signo del último resultado es A. Iguales compara ambas listas; A ve + usa sólo su propia lista. Las frecuencias de una muestra pequeña pueden alejarse mucho de sus probabilidades. Medir 200 reemplaza la colección; cambiar una orientación limpia los datos activos."
                >
                  <p>
                    <strong>Medidos: {current.N} pares</strong>
                    <span>
                      {s.last === null
                        ? 'Tocá la fuente.'
                        : `Último: ${['++', '+−', '−+', '−−'][s.last]} (A, B)`}
                    </span>
                  </p>
                  <p>
                    {current.N === 0 ? (
                      'Iguales: sin datos · E observado: sin datos'
                    ) : (
                      <>
                        Iguales: <b>{n((current.same / current.N) * 100, 1)} %</b> · E
                        observado: <b>{signed(current.E!, 3)}</b>
                      </>
                    )}
                  </p>
                  <p>
                    A ve +:{' '}
                    <b>
                      {current.aPlus === null
                        ? 'sin datos'
                        : `${n(current.aPlus * 100, 1)} %`}
                    </b>{' '}
                    · esperado: 50 %.
                  </p>
                </div>
                {s.index !== 2 && (
                  <p className="bl-quick-context">Atajos: A₀=0°, elegí B₀ y medí.</p>
                )}
                <div className="bl-quick-controls" aria-label="Medir junto a la escena">
                  {s.index !== 2 && (
                    <>
                      <button
                        onClick={() => bPreset(0)}
                        data-help-title="Comparar los filtros alineados"
                        data-help-body="Prepara A₀B₀ con A₀=0° y B₀=0°. Si cambia el montaje, limpia los datos activos; repetir el mismo atajo los conserva. Las referencias del reto se conservan. En esta fuente ideal ambas salidas siempre coinciden, aunque cada lado siga siendo azaroso."
                      >
                        B a 0°
                      </button>
                      <button
                        onClick={() => bPreset(s.index === 3 ? 90 : 45)}
                        data-help-title="Preparar el segundo montaje de comparación"
                        data-help-body={`Prepara A₀B₀ con A₀=0° y B₀=${s.index === 3 ? '90' : '45'}°. Si cambia el montaje, limpia los datos activos; repetir el mismo atajo los conserva. Las referencias se conservan. Después medí otro lote: compará las coincidencias entre ambas listas y la frecuencia local de A.`}
                      >
                        B a {s.index === 3 ? '90' : '45'}°
                      </button>
                    </>
                  )}
                  <button
                    className="bl-quick-measure"
                    onClick={() => sample(200)}
                    data-help-title="Medir 200 parejas nuevas"
                    data-help-body="Reemplaza tu colección exploratoria por 200 parejas nuevas con los ángulos actuales. Mirá los medidos, el porcentaje de iguales y A ve + junto a la escena. No cambia la predicción ni añade datos al ensayo de cuatro combinaciones CHSH."
                  >
                    Medir 200 pares
                  </button>
                </div>
              </div>
            ) : view === 'cards' ? (
              <div className="bl-card-score">
                <ScoreBar exact={c.S} local />
                <p>
                  Mezclar esta tarjeta con su inversa da 50/50 local, sin cambiar estos
                  productos.
                </p>
              </div>
            ) : null}
          </div>
          <SceneConsole
            viewHref="#bl-views"
            challengeHref="#bl-challenges"
            hint="Arrastrá el punto del borde del analizador o usá flechas. La fuente se puede tocar para medir un par nuevo. A₀B₀… eligen una de cuatro combinaciones; cada lado tiene dos orientaciones, pero sólo se usa una por pareja. Cambiar un ángulo borra los datos activos. Las tarjetas son un modelo algebraico distinto, no polarizadores clásicos. El dibujo no representa señales entre detectores ni tiempos de propagación."
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
            {view === 'cards' ? (
              <>
                <div className="spum-console-buttons">
                  {s.index === 1 ? (
                    <button onClick={() => dispatch({ type: 'saveCard' })}>
                      Guardar tarjeta
                    </button>
                  ) : (
                    <button onClick={() => start(1)}>Ir al reto de tarjetas</button>
                  )}
                  <button onClick={() => dispatch({ type: 'card', index: s.card ^ 15 })}>
                    Invertir las cuatro (S se conserva)
                  </button>
                </div>
                <p>
                  La tarjeta es un plan de cuatro respuestas, preparado antes de elegir
                  una pregunta por lado. No son cuatro mediciones del mismo par. Ninguna
                  respuesta consulta la orientación elegida en la otra estación.
                </p>
                <details>
                  <summary>¿Por qué ninguna tarjeta supera 2?</summary>
                  <p>
                    S=A₀B₀+A₀B₁+A₁B₀−A₁B₁=A₀(B₀+B₁)+A₁(B₀−B₁). Uno de los paréntesis
                    siempre es cero y el otro vale ±2. A₀ y A₁ sólo cambian el signo.
                  </p>
                  <p>
                    Una mezcla conserva el límite si sus pesos son independientes de las
                    preguntas elegidas. Mezclar cada tarjeta con su complemento global al
                    50 % hace que cada salida local sea 50/50; ese azar no elimina el
                    límite.
                  </p>
                  <div className="bl-table-wrap">
                    <table>
                      <caption>Las 16 estrategias deterministas</caption>
                      <thead>
                        <tr>
                          <th>Tarjeta</th>
                          <th>A₀ A₁ B₀ B₁</th>
                          <th>S</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 16 }, (_, i) => {
                          const v = card(i)
                          return (
                            <tr key={i}>
                              <td>{i + 1}</td>
                              <td>
                                {v.answers.map((x) => (x === 1 ? '+' : '−')).join('  ')}
                              </td>
                              <td>{signed(v.S, 0)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </details>
              </>
            ) : (
              <>
                <details
                  className="bl-one-pair"
                  open={s.index !== 2 && view === 'experiment'}
                >
                  <summary>Un par: ángulos y detecciones</summary>
                  <div
                    className="bl-pairs"
                    role="group"
                    aria-label="Elegir combinación de ajustes"
                  >
                    {PAIR_LABELS.map((label, i) => (
                      <button
                        key={label}
                        aria-pressed={s.pair === i}
                        onClick={() => dispatch({ type: 'pair', pair: i as Pair })}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="md-small">
                    A y B son las estaciones. ₀ y ₁ son dos orientaciones guardadas en
                    cada una; sólo se usa una por lado en cada pareja. A₀B₁ elige la
                    primera orientación de A y la segunda de B.
                  </p>
                  <div className="spum-console-row">
                    <label htmlFor="bl-angle-a">
                      Orientación A{ai === 0 ? '₀' : '₁'}
                    </label>
                    <output>{n(s.angles[ai], 1)}°</output>
                  </div>
                  <input
                    id="bl-angle-a"
                    type="range"
                    min="-90"
                    max="90"
                    step="0.5"
                    value={s.angles[ai]}
                    onChange={(e) => angle(ai, +e.target.value)}
                  />
                  <div className="spum-console-row">
                    <label htmlFor="bl-angle-b">
                      Orientación B{bi === 2 ? '₀' : '₁'}
                    </label>
                    <output>{n(s.angles[bi], 1)}°</output>
                  </div>
                  <input
                    id="bl-angle-b"
                    type="range"
                    min="-90"
                    max="90"
                    step="0.5"
                    value={s.angles[bi]}
                    onChange={(e) => angle(bi, +e.target.value)}
                  />
                  <div className="spum-console-buttons">
                    <button onClick={() => sample(1)} disabled={current.N >= 4096}>
                      Emitir un par
                    </button>
                    <button className="bl-main-button" onClick={() => sample(200)}>
                      Lote nuevo · 200 pares
                    </button>
                  </div>
                  <div
                    className="bl-current-sample"
                    aria-label="Datos exploratorios del par activo"
                  >
                    <h3>Tu colección de {current.N} pares</h3>
                    <div className="bl-outcomes">
                      {['++', '+−', '−+', '−−'].map((label, i) => (
                        <div key={label}>
                          <span>{label}</span>
                          <strong>{s.run?.counts[i] ?? 0}</strong>
                        </div>
                      ))}
                    </div>
                    <p className="md-small">
                      Primer signo: A; segundo: B. ++ y −− son iguales; +− y −+,
                      distintos. Cada pareja aporta un solo resultado a esta tabla.
                    </p>
                    <p>
                      Iguales: {current.same} · Distintos: {current.different}
                      <br />E observado:{' '}
                      {current.N > 0 && (
                        <>
                          ({current.same} − {current.different}) / {current.N} ={' '}
                        </>
                      )}
                      <b>{current.E === null ? 'sin datos' : signed(current.E, 3)}</b>
                    </p>
                    <p
                      className="bl-marginal"
                      data-help-title="Lo que A puede ver por su cuenta"
                      data-help-body="A ve sólo su propia lista. En el estado Φ+ su probabilidad de + es 50 %, cualquiera que sea la orientación remota. Una frecuencia de un lote finito puede apartarse de 50 %; eso no es un mensaje. La correlación exige emparejar después las listas de A y B."
                    >
                      A+ en esta muestra:{' '}
                      <b>
                        {current.aPlus === null
                          ? 'sin datos'
                          : `${n(current.aPlus * 100, 1)} %`}
                      </b>
                      <br />
                      Predicción local A+ y B+: 50 % en todos los ángulos.
                    </p>
                    <p className="md-small">
                      «Lote nuevo» reemplaza esta colección; emitir de a uno agrega pares
                      hasta 4096. Estos datos exploratorios no se incorporan al ensayo
                      CHSH.
                    </p>
                  </div>
                </details>
                <div className="bl-four-settings">
                  <h3>Las cuatro preguntas de Bell</h3>
                  <p>
                    CHSH es esta suma de cuatro correlaciones: S = E₀₀ + E₀₁ + E₁₀ − E₁₁.
                    Cada E pertenece al mismo conjunto de cuatro orientaciones.
                  </p>
                  <p className="md-small">
                    E compara ambas listas: +1 siempre iguales, 0 mitad iguales en
                    promedio, −1 siempre distintos. Cada ensayo mide las cuatro
                    combinaciones: 4 × 50 = 200 parejas o 4 × 1000 = 4000 parejas.
                  </p>
                  <div className="spum-console-buttons">
                    <button
                      onClick={() => {
                        setView('score')
                        dispatch({ type: 'preset', angles: [...BELL_ANGLES] as Angles })
                      }}
                    >
                      Ángulos de Bell
                    </button>
                    <button
                      onClick={() => {
                        setView('score')
                        dispatch({ type: 'preset', angles: [0, 0, 0, 0] })
                      }}
                    >
                      Todos a 0°
                    </button>
                  </div>
                  <p>
                    Predicción exacta de este montaje: <strong>S={signed(q.S, 3)}</strong>
                    . Límite local: −2 a +2.
                  </p>
                  <div className="spum-console-buttons">
                    <button
                      onClick={() => {
                        setView('score')
                        dispatch({ type: 'sweep', n: 50, seed: seed() })
                      }}
                    >
                      4 × 50 pares
                    </button>
                    <button
                      onClick={() => {
                        setView('score')
                        dispatch({ type: 'sweep', n: 1000, seed: seed() })
                      }}
                    >
                      4 × 1000 pares
                    </button>
                  </div>
                  {s.trial ? (
                    <Trial trial={s.trial} />
                  ) : (
                    <p className="md-small">
                      Aún no hay un ensayo completo con este montaje. Cada botón genera
                      cuatro lotes nuevos; girar un analizador limpia esta tabla.
                    </p>
                  )}
                </div>
                <div
                  className="bl-saved-trials"
                  aria-label="Comparación de ensayos guardados junto al control"
                >
                  {(s.evidence.small || s.evidence.large) && (
                    <p className="bl-saved-context">
                      Referencias guardadas con ángulos de Bell: A₀=0°, A₁=45°, B₀=22,5°,
                      B₁=−22,5°. No son datos de un montaje que hayas cambiado después.
                    </p>
                  )}
                  {(['small', 'large'] as const)
                    .map((key) => s.evidence[key]?.trial)
                    .filter((t): t is Sweep => Boolean(t))
                    .map((t) => {
                      const ci = interval(t.rows)!
                      return (
                        <article key={t.n}>
                          <strong>{t.n} por combinación</strong>
                          <p>
                            S observado {signed(ci.estimate, 3)}
                            <br />
                            Cota 95 % [{signed(ci.lower, 3)}; {signed(ci.upper, 3)}]
                          </p>
                        </article>
                      )
                    })}
                </div>
              </>
            )}
          </SceneConsole>
        </section>
        <section className="md-notebook bl-evidence">
          <p className="md-eyebrow">
            REFERENCIAS DE ESTE RETO · SE CONSERVA LO OBSERVADO
          </p>
          <h2>Que la comparación quede a la vista.</h2>
          <p>
            Estos registros conservan su montaje aunque después explores otro. Cambiar de
            reto o reiniciarlo limpia las referencias; los hallazgos duran esta visita.
          </p>
          <div className="bl-evidence-grid">
            {Object.entries(s.evidence).length === 0 ? (
              <p>Todavía falta medir o guardar una tarjeta.</p>
            ) : (
              Object.entries(s.evidence).map(([key, r]) => {
                const ci = r.trial ? interval(r.trial.rows) : null
                return (
                  <article key={key}>
                    <h3>{r.label}</h3>
                    <p>{r.text}</p>
                    {r.trial && ci && (
                      <>
                        <ScoreBar
                          exact={quantum(r.trial.angles).S}
                          observed={ci.estimate}
                          lower={ci.lower}
                          upper={ci.upper}
                        />
                        <p>
                          Intervalo del ensayo guardado: [{signed(ci.lower, 3)};{' '}
                          {signed(ci.upper, 3)}].
                        </p>
                      </>
                    )}
                  </article>
                )
              })
            )}
          </div>
        </section>
        <section id="bl-understand" className="md-notebook">
          <p className="md-eyebrow">DE UNA TARJETA A UNA PREGUNTA SOBRE LA NATURALEZA</p>
          <h2>
            El límite sale de las reglas.
            <br />
            La sorpresa sale de medir.
          </h2>
          <div className="bl-explain-grid">
            <article>
              <h3>¿Qué descubrió Bell?</h3>
              <p>
                Bell mostró que ciertas correlaciones cuánticas son incompatibles con
                modelos locales bajo hipótesis precisas. CHSH convirtió esa idea en una
                combinación de cuatro correlaciones que se puede medir. La cota se refiere
                a localidad e independencia de ajustes, no a que todo azar sea cuántico.
              </p>
            </article>
            <article>
              <h3>¿Qué hicieron los experimentos?</h3>
              <p>
                Experimentos con sistemas entrelazados han violado desigualdades de Bell.
                Las pruebas modernas controlan detección, separación de eventos, elección
                de ajustes y análisis estadístico. Nuestro mundo ideal de dos canales
                perfectos no reproduce ni certifica esas condiciones.
              </p>
            </article>
            <article>
              <h3>¿Y Maldacena?</h3>
              <p>
                Este laboratorio enseña a distinguir información local y correlaciones
                conjuntas. El puente holográfico trabaja después con entropía de
                entrelazamiento y geometría. S no es una entropía ni una medida del tamaño
                de un agujero de gusano.
              </p>
              <a href="/holografia/">Seguir hacia información y geometría ↗</a>
            </article>
          </div>
          <details>
            <summary>Fórmulas, supuestos y fuentes científicas</summary>
            <p>
              Estado Φ+=(|HH⟩+|VV⟩)/√2, analizadores lineales ideales con dos salidas ±1.
              P(++ )=P(−−)=½cos²(a−b), P(+−)=P(−+)=½sin²(a−b); E=cos[2(a−b)]. Las
              marginales son ½. S=E₀₀+E₀₁+E₁₀−E₁₁; a₀=0°, a₁=45°, b₀=22,5°, b₁=−22,5° da
              2√2.
            </p>
            <p>
              Los modelos locales permiten información compartida en el origen y
              respuestas dependientes del ajuste propio, sin consultar el ajuste remoto.
              Se supone independencia entre esa información y la elección de ajustes. Las
              tarjetas deterministas cubren los extremos; las mezclas conservan |S|≤2. La
              simulación calcula distribuciones conjuntas: no implementa un mecanismo
              local oculto para producir los resultados cuánticos.
            </p>
            <p>
              Para cuatro lotes independientes de tamaño prefijado, se usa una cota
              simultánea conservadora de Hoeffding al 95 %: εᵢ=√[2 ln(8/0,05)/nᵢ] en cada
              Eᵢ. Se recorta cada intervalo a [−1,1] y se combinan con los signos de S. No
              se usa para decidir la aprobación de los retos, ni se promete cobertura al
              seleccionar resultados mediante paradas opcionales. Los puntos y destellos
              representan detecciones, no trayectorias individuales ni tiempos de
              propagación.
            </p>
            <ul>
              <li>
                <a
                  href="https://journals.aps.org/ppf/abstract/10.1103/PhysicsPhysiqueFizika.1.195"
                  target="_blank"
                  rel="noreferrer"
                >
                  Bell · 1964 ↗
                </a>
              </li>
              <li>
                <a
                  href="https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.23.880"
                  target="_blank"
                  rel="noreferrer"
                >
                  Clauser, Horne, Shimony y Holt · 1969 ↗
                </a>
              </li>
              <li>
                <a
                  href="https://arxiv.org/abs/1511.03189"
                  target="_blank"
                  rel="noreferrer"
                >
                  Shalm y colaboradores · prueba de 2015 ↗
                </a>
              </li>
              <li>
                <a
                  href="https://doi.org/10.1080/01621459.1963.10500830"
                  target="_blank"
                  rel="noreferrer"
                >
                  Hoeffding · 1963 ↗
                </a>
              </li>
            </ul>
          </details>
          <a className="md-return-to-scene" data-scene-play href="#bl-views">
            Volver a mi escena y mi reto ↑
          </a>
        </section>
        <MoreLabs current="bell" />
      </main>
      <footer className="md-footer">
        <a href="/entrelazados/">Antes: Entrelazados ↗</a>
        <a href="/maldacena/">Especial Maldacena ↗</a>
        <a href="/">Todos los laboratorios ↗</a>
      </footer>
    </div>
  )
}
