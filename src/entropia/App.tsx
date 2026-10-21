import { useReducer, useState } from 'react'
import type { ReactNode } from 'react'
import HorizonMap from './HorizonMap'
import Formula from './Formula'
import { entropyModel, MAX_MASS, MIN_MASS } from './physics'
import { scientific, YEAR } from '../hawking/physics'
import { initialState, LESSONS, lessonStatus, reducer } from './learning'

const n = (value: number, digits = 2) =>
  value.toLocaleString('es-AR', { maximumFractionDigits: digits })
function Info({ name, children }: { name: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <details
      className="en-help"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setOpen(true)
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setOpen(false)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpen(false)
      }}
    >
      <summary aria-label={`Información: ${name}`}>?</summary>
      <div className="en-tip" role="note">
        <strong>{name}</strong>
        <p>{children}</p>
        <button
          className="en-tip-close"
          onClick={() => setOpen(false)}
          aria-label={`Cerrar información: ${name}`}
        >
          Cerrar ×
        </button>
      </div>
    </details>
  )
}
function Ratio({ name, value, children }: { name: string; value: number; children: ReactNode }) {
  return (
    <div className="en-ratio">
      <div>
        <span>{name}</span>
        <Info name={name}>{children}</Info>
      </div>
      <strong>
        {n(value)}
        <small> ×</small>
      </strong>
      <div className="en-ratio-track">
        <span style={{ width: `${Math.min(100, (value / 8) * 100)}%` }} />
        <i />
      </div>
    </div>
  )
}

export default function EntropyApp() {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState())
  const [unit, setUnit] = useState<'k' | 'si' | 'bits'>('k')
  const model = entropyModel(state.mass, state.emitted)
  const lesson = LESSONS.find((l) => l.id === state.lesson)!
  const status = lessonStatus(state)
  const fractionLeft = (1 - state.emitted) ** 2
  const radiationFraction = model.radiationOverK / model.initial.entropyOverK
  const totalFraction = model.totalOverK / model.initial.entropyOverK
  const entropy =
    unit === 'k' ? model.current.entropyOverK : unit === 'si' ? model.entropyJK : model.entropyBits
  const tryLesson = () => dispatch({ type: 'try' })
  return (
    <div className="en-shell">
      <a className="en-skip" href="#en-controls">
        Ir a los controles
      </a>
      <header className="en-header">
        <a className="en-brand" href="/">
          ∿ SPUM <small>EXPERIMENTOS</small>
        </a>
        <nav aria-label="Navegación del laboratorio">
          <a href="#en-challenges">Los retos</a>
          <a href="#en-formula">La fórmula</a>
          <a href="/">Todos los labs ↗</a>
        </nav>
      </header>
      <main>
        <section className="en-intro">
          <div>
            <p className="en-eyebrow">LABORATORIO 05 / BEKENSTEIN–HAWKING</p>
            <h1>
              La información también
              <br />
              <em>tiene una superficie.</em>
            </h1>
          </div>
          <div>
            <p className="en-kicker">Entropía de agujeros negros</p>
            <h2>¿Por qué importa el área?</h2>
            <p>
              Agrandá el horizonte, compará su superficie y seguí la entropía cuando pierde masa.
              Una ecuación une gravedad, física cuántica y termodinámica.
            </p>
            <a href="#en-challenges">Empezá con una predicción ↓</a>
          </div>
        </section>
        <div className="en-model-note">
          <span>MODELO SEMICLÁSICO</span>
          <p>
            Schwarzschild, sin giro ni carga. Valores en SI y geometría calculada. La trama es
            didáctica; no representa microestados observados.{' '}
            <a href="#en-limits">Qué calculamos ↓</a>
          </p>
        </div>
        <nav className="en-mobile-nav" aria-label="Accesos rápidos">
          <a href="#en-map">Horizonte</a>
          <a href="#en-controls">Controles</a>
          <a href="#en-formula">Fórmula</a>
          <a href="#en-challenges">Retos</a>
        </nav>
        <div className="en-lab-grid">
          <section id="en-map" className="en-panel en-horizon">
            <div className="en-section-top">
              <div>
                <p className="en-eyebrow">01 / EL ÁREA QUE CUENTA</p>
                <h2>Una frontera. Una entropía.</h2>
              </div>
              <span className="en-live">CÁLCULO EN VIVO</span>
            </div>
            <HorizonMap model={model} />
            <div className="en-metrics">
              <div>
                <div className="en-stat-label">
                  Radio del horizonte{' '}
                  <Info name="Radio areal">
                    rₛ = 2GM/c². La esfera del mapa usa este radio y una escala fija; no es la
                    sombra óptica ampliada que se observa por lente gravitacional.
                  </Info>
                </div>
                <strong>
                  {n(model.current.radiusM / 1000, 1)} <small>km</small>
                </strong>
              </div>
              <div>
                <div className="en-stat-label">
                  Área A{' '}
                  <Info name="Área del horizonte">
                    A = 4πrₛ². Es la superficie de una sección espacial del horizonte. El cuadrado
                    del mapa conserva su proporción de área; no es un despliegue de la esfera sin
                    distorsión.
                  </Info>
                </div>
                <strong>
                  {scientific(model.current.areaM2 / 1e6)} <small>km²</small>
                </strong>
              </div>
              <div className="en-entropy-metric">
                <div className="en-stat-label">
                  {unit === 'k'
                    ? 'Entropía S/kB'
                    : unit === 'si'
                      ? 'Entropía S (J/K)'
                      : 'Entropía expresada en bits'}
                  <Info name="Qué mide la entropía">
                    La entropía termodinámica caracteriza cuántas configuraciones microscópicas son
                    compatibles con una descripción macroscópica. No es una cuenta de estrellas ni
                    de materia visible. Expresarla en bits no convierte el horizonte en un disco
                    rígido.
                  </Info>
                </div>
                <strong>{scientific(entropy)}</strong>
              </div>
            </div>
            <div className="en-unit-switch">
              <span>La misma entropía, otras unidades</span>
              <div className="en-buttons">
                {(
                  [
                    ['k', 'S/kB'],
                    ['si', 'J/K'],
                    ['bits', 'Bits'],
                  ] as const
                ).map(([key, label]) => (
                  <button key={key} aria-pressed={unit === key} onClick={() => setUnit(key)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>
          <aside id="en-controls" className="en-panel en-controls">
            <p className="en-eyebrow">CAMBIÁ ALGO. MIRÁ QUÉ PASA.</p>
            <h2>Probá con tus manos.</h2>
            <div className={`en-control ${state.lesson === 'area' ? 'en-highlight' : ''}`}>
              <div className="en-control-title">
                <label htmlFor="en-mass">Masa inicial</label>
                <Info name="Masa inicial">
                  M₀ es la masa antes de la emisión ideal. La masa actual es M = M₀(1 − f). El
                  control es lineal y acotado: de 5 a 20 masas solares. La cámara conserva la
                  escala.
                </Info>
                <output htmlFor="en-mass">{n(state.mass, 1)} M☉</output>
              </div>
              <input
                id="en-mass"
                type="range"
                min={MIN_MASS}
                max={MAX_MASS}
                step="0.1"
                value={state.mass}
                aria-valuetext={`${n(state.mass, 1)} masas solares`}
                onChange={(e) => dispatch({ type: 'mass', value: Number(e.target.value) })}
              />
              <div className="en-range-ends">
                <span>5 M☉</span>
                <span>20 M☉</span>
              </div>
              <div className="en-buttons">
                <button
                  onClick={() => dispatch({ type: 'mass', value: state.mass / 2 })}
                  disabled={state.mass / 2 < MIN_MASS}
                >
                  Masa ÷2
                </button>
                <button onClick={() => dispatch({ type: 'mass', value: 10 })}>10 M☉</button>
                <button
                  onClick={() => dispatch({ type: 'mass', value: state.mass * 2 })}
                  disabled={state.mass * 2 > MAX_MASS}
                >
                  Masa ×2
                </button>
              </div>
              <p>Sin emisión: duplicar M duplica rₛ y cuadruplica A y S.</p>
            </div>
            <div className={`en-control ${state.lesson === 'evaporate' ? 'en-highlight' : ''}`}>
              <div className="en-control-title">
                <label htmlFor="en-emitted">Fracción de masa emitida</label>
                <Info name="Emisión ideal">
                  f es la fracción de masa inicial convertida en energía radiada: E = fM₀c². No es
                  un reloj ni la cantidad de partículas dibujadas. Consideramos fotones de cuerpo
                  negro en vacío, sin acreción ni fondo cósmico.
                </Info>
                <output htmlFor="en-emitted">{n(state.emitted * 100)} %</output>
              </div>
              <input
                id="en-emitted"
                type="range"
                min="0"
                max="0.5"
                step="0.005"
                value={state.emitted}
                aria-valuetext={`${n(state.emitted * 100)} por ciento de la masa inicial emitida`}
                onChange={(e) => dispatch({ type: 'emitted', value: Number(e.target.value) })}
              />
              <div className="en-range-ends">
                <span>0 % · estado inicial</span>
                <span>50 % · límite del recorrido</span>
              </div>
              <div className="en-buttons">
                <button onClick={() => dispatch({ type: 'emitted', value: 0 })}>Sin emisión</button>
                <button onClick={() => dispatch({ type: 'emitted', value: 0.25 })}>
                  Emitir 25 %
                </button>
                <button onClick={() => dispatch({ type: 'emitted', value: 0.5 })}>
                  Emitir 50 %
                </button>
              </div>
              <p>
                Ahora quedan <b>{n(state.mass * (1 - state.emitted))} M☉</b> y{' '}
                <b>{n(fractionLeft * 100)} %</b> de la entropía inicial.
              </p>
            </div>
            <div className="en-temperature">
              <span>
                Temperatura de Hawking{' '}
                <Info name="Más chico, más caliente">
                  T = ℏc³/(8πGMkB). Al perder masa el agujero negro se calienta, aunque su entropía
                  disminuye. Este vínculo permite comprobar dE = T dS para la sucesión de estados de
                  Schwarzschild.
                </Info>
              </span>
              <strong>{scientific(model.current.temperatureK, 'K')}</strong>
              <p>
                {n(model.current.temperatureK / model.initial.temperatureK)} × la temperatura
                inicial · <a href="/hawking/">Explorá la radiación ↗</a>
              </p>
            </div>
            <a className="en-inline-link" href="#en-challenges">
              Elegí uno de los cuatro retos ↓
            </a>
          </aside>
        </div>
        <section className="en-comparison en-panel">
          <div>
            <p className="en-eyebrow">UNA REFERENCIA QUE NO SE MUEVE</p>
            <h2>¿Crecen al mismo ritmo?</h2>
            <p>
              Todo se compara con un agujero negro de <b>10 M☉ sin emisión</b>. Cada barra usa la
              misma escala de 0 a 8; la marca punteada es 1×.
            </p>
          </div>
          <div className="en-ratios">
            <Ratio name="Radio" value={model.radiusRatio}>
              Proporcional a la masa actual. Duplicar la masa duplica el radio.
            </Ratio>
            <Ratio name="Área" value={model.areaRatio}>
              Proporcional al cuadrado de la masa actual. Duplicar la masa cuadruplica el área.
            </Ratio>
            <Ratio name="Entropía" value={model.entropyRatio}>
              Crece exactamente como el área en este modelo. La unidad elegida no altera esta
              proporción.
            </Ratio>
            <Ratio name="Volumen asociado*" value={model.associatedVolumeRatio}>
              Volumen euclídeo 4πrₛ³/3, usado solo como comparación geométrica. No define un volumen
              interior único en espacio-tiempo curvo.
            </Ratio>
          </div>
        </section>
        <Formula
          model={model}
          patch={state.patch}
          onPatch={(value) => dispatch({ type: 'patch', value })}
        />
        <section id="en-ledger" className="en-panel en-ledger">
          <div className="en-section-top">
            <div>
              <p className="en-eyebrow">03 / NO PIERDAS DE VISTA EL EXTERIOR</p>
              <h2>
                Un horizonte más chico.
                <br />
                <em>Una cuenta más grande.</em>
              </h2>
            </div>
            <Info name="Qué entropía estamos sumando">
              Sumamos entropía de Bekenstein–Hawking y entropía térmica de radiación ideal. No es la
              entropía fina de von Neumann del estado total: esa pregunta lleva a la paradoja de la
              información y a la curva de Page.
            </Info>
          </div>
          <div className="en-ledger-layout">
            <div>
              <p>
                Al evaporarse, el agujero negro pierde entropía. La segunda ley generalizada pide
                contar también lo que queda afuera.
              </p>
              <button
                className="en-radiation-toggle"
                aria-pressed={state.includeRadiation}
                onClick={() =>
                  dispatch({
                    type: 'radiation',
                    value: !state.includeRadiation,
                  })
                }
              >
                <span aria-hidden="true">{state.includeRadiation ? '✓' : '+'}</span>
                {state.includeRadiation ? 'Radiación incluida' : 'Incluir la radiación'}
              </button>
              <p className="en-small">
                Esta selección cambia la contabilidad, no la masa ni el proceso.
              </p>
              <div className="en-ledger-equation">
                ΔS<sub>rad</sub> = ⁴⁄₃ (S₀ − S<sub>BH</sub>)
              </div>
              <p className="en-small">
                Modelo de fotones de cuerpo negro en vacío: dSrad = 4 dErad/(3T). Se integra usando
                la temperatura cambiante del agujero negro; no una temperatura fija.
              </p>
            </div>
            <div className="en-ledger-bars" aria-live="polite">
              <p className="en-eyebrow">PORCENTAJE DE LA ENTROPÍA INICIAL S₀</p>
              <div className="en-ledger-row">
                <div>
                  <span>Antes de emitir</span>
                  <b>100 %</b>
                </div>
                <div className="en-ledger-track">
                  <span style={{ width: '75%' }} />
                </div>
              </div>
              <div className="en-ledger-row">
                <div>
                  <span>Ahora: agujero negro</span>
                  <b>{n(fractionLeft * 100)} %</b>
                </div>
                <div className="en-ledger-track">
                  <span style={{ width: `${fractionLeft * 75}%` }} />
                </div>
              </div>
              <div
                className={`en-ledger-row en-radiation-row ${state.includeRadiation ? '' : 'en-excluded'}`}
              >
                <div>
                  <span>Radiación exterior {state.includeRadiation ? '' : '· sin contar'}</span>
                  <b>{state.includeRadiation ? `${n(radiationFraction * 100)} %` : '—'}</b>
                </div>
                <div className="en-ledger-track">
                  <span
                    style={{
                      width: `${state.includeRadiation ? radiationFraction * 75 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="en-ledger-row en-total-row">
                <div>
                  <span>
                    {state.includeRadiation
                      ? 'Suma: horizonte + radiación'
                      : 'Contando solo el horizonte'}
                  </span>
                  <b>{n((state.includeRadiation ? totalFraction : fractionLeft) * 100)} %</b>
                </div>
                <div className="en-ledger-track">
                  <span style={{ width: `${fractionLeft * 75}%` }} />
                  {state.includeRadiation && (
                    <span
                      className="en-radiation-segment"
                      style={{ width: `${radiationFraction * 75}%` }}
                    />
                  )}
                </div>
              </div>
              <p className="en-ledger-verdict">
                {state.emitted === 0
                  ? 'Todavía no hubo emisión: mové la fracción para comparar.'
                  : state.includeRadiation
                    ? `La suma aumenta ${n((totalFraction - 1) * 100)} %. La pérdida del horizonte no es la pérdida del sistema completo.`
                    : `El horizonte pierde ${n(model.lostFraction * 100)} %. Falta contar la radiación para evaluar la suma.`}
              </p>
            </div>
          </div>
          <details className="en-time-detail">
            <summary>¿Cuánto tiempo representa y qué simplifica?</summary>
            <p>
              Emitir {n(state.emitted * 100)} % de M₀ corresponde a {n(model.ageFraction * 100)} %
              de la vida ideal de este modelo:{' '}
              {scientific((model.initial.lifetimeS * model.ageFraction) / YEAR, 'años')}. El control
              selecciona estados, sin acelerar un reloj físico. Un agujero negro de estas masas
              absorbe más energía del fondo cósmico actual que la que emite por Hawking: este
              recorrido presupone vacío y ausencia de acreción. Se omiten factores de cuerpo gris,
              otras especies y el final de evaporación. El factor 4/3 es propio de esta
              aproximación, no una constante universal de la radiación real de agujeros negros.
            </p>
          </details>
        </section>
        <section id="en-challenges" className="en-panel en-challenges">
          <div className="en-section-top">
            <div>
              <p className="en-eyebrow">04 / APRENDER HACIENDO</p>
              <h2>Cuatro preguntas para descubrir la ley.</h2>
            </div>
            <span className="en-progress" aria-label="Retos explorados">
              {state.completed.length} / 4 explorados
            </span>
          </div>
          <div className="en-lesson-tabs" aria-label="Elegir reto">
            {LESSONS.map((l, i) => (
              <button
                key={l.id}
                aria-pressed={state.lesson === l.id}
                onClick={() => dispatch({ type: 'lesson', id: l.id })}
              >
                <span>{state.completed.includes(l.id) ? '✓' : `0${i + 1}`}</span>
                {l.name}
              </button>
            ))}
          </div>
          <div className="en-challenge-body">
            <div>
              <p className="en-eyebrow">PREDECÍ ANTES DE PROBAR</p>
              <h3>{lesson.title}</h3>
              <p>{lesson.question}</p>
              <div className="en-choices">
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
            </div>
            <div className="en-challenge-action">
              <p>{lesson.hint}</p>
              <button
                className="en-primary"
                disabled={state.prediction === null}
                onClick={tryLesson}
              >
                {lesson.action} ↗
              </button>
              <a className="en-inline-link" href={lesson.target}>
                Ver el cambio en el laboratorio ↑
              </a>
              <button className="en-restore" onClick={() => dispatch({ type: 'restore' })}>
                Volver a la referencia del reto
              </button>
              <div className="en-feedback" aria-live="polite">
                {status === 'observed' && state.prediction !== null ? (
                  <>
                    <strong>
                      {state.prediction === lesson.answer
                        ? 'Tu predicción coincide con el modelo.'
                        : 'La comparación invita a revisar tu predicción.'}
                    </strong>
                    <p>{lesson.meaning}</p>
                  </>
                ) : (
                  <>
                    <strong>
                      {status === 'exploring'
                        ? 'Estás explorando otras condiciones.'
                        : 'Prepará tu comparación.'}
                    </strong>
                    <p>
                      {status === 'exploring'
                        ? 'Volvé a la referencia para aislar el cambio del reto, o seguí probando libremente.'
                        : 'Elegí una predicción y usá el atajo o mové el control indicado. Los retos comparan relaciones del modelo; no son una validación experimental.'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
        <section id="en-science" className="en-science">
          <div>
            <p className="en-eyebrow">POR QUÉ CAMBIÓ NUESTRA IDEA DEL UNIVERSO</p>
            <h2>
              ¿Qué guarda
              <br />
              <em>la oscuridad?</em>
            </h2>
            <p>
              Entropía no significa simplemente “desorden”. En física estadística relaciona una
              descripción macroscópica con la multiplicidad de configuraciones compatibles: S = kB
              ln Ω. Identificar los grados de libertad microscópicos de un agujero negro sigue
              siendo una pregunta de gravedad cuántica.
            </p>
          </div>
          <div className="en-history">
            <article>
              <span>1973 / BEKENSTEIN</span>
              <h3>Lo que cae no puede desaparecer de la cuenta.</h3>
              <p>
                Si un objeto con entropía cruza el horizonte, contar solo el exterior parece violar
                la segunda ley. Bekenstein propuso asociar entropía al área y considerar también al
                agujero negro.
              </p>
            </article>
            <article>
              <span>1974–1975 / HAWKING</span>
              <h3>La temperatura fija el coeficiente.</h3>
              <p>
                Su cálculo cuántico predice radiación térmica. Al combinar esa temperatura con dE =
                T dS, se obtiene S = kB A/(4ℓP²). No es una corrección a la incertidumbre de
                Heisenberg.
              </p>
            </article>
            <article>
              <span>LA PREGUNTA QUE SIGUE ABIERTA</span>
              <h3>Termodinámica no es lo mismo que información recuperada.</h3>
              <p>
                La ley de área conecta tres teorías y motiva preguntas sobre información y
                holografía. Estos dibujos no prueban una estructura de píxeles del horizonte, ni
                calculan una curva de Page.
              </p>
            </article>
          </div>
        </section>
        <section id="en-limits" className="en-panel en-limits">
          <div>
            <h2>Qué calculamos. Qué representa el dibujo.</h2>
            <p>
              Evaluamos rₛ, A, S y T en una sucesión de estados de Schwarzschild. El mapa es una
              proyección geométrica ortográfica, con escala fija; halo, colores y trama ayudan a
              leerla. No simula lente gravitacional, un disco de acreción ni luz visible emitida
              desde el horizonte. La lupa de Planck es un ejemplo algebraico separado.
            </p>
            <p>
              La suma del exterior usa entropía térmica aproximada, no entropía cuántica fina. La
              evaporación es ideal, en vacío y limitada a perder como máximo la mitad de la masa
              inicial. La fórmula de área tiene un amplio fundamento teórico; este laboratorio no
              constituye una medición de entropía o radiación de un agujero negro astrofísico.
            </p>
          </div>
          <div>
            <p className="en-eyebrow">FUENTES PARA SEGUIR</p>
            <a href="https://doi.org/10.1103/PhysRevD.7.2333" target="_blank" rel="noreferrer">
              Bekenstein · Black Holes and Entropy (1973) ↗
            </a>
            <a href="https://doi.org/10.1007/BF02345020" target="_blank" rel="noreferrer">
              Hawking · Particle Creation by Black Holes (1975) ↗
            </a>
            <a href="https://doi.org/10.12942/lrr-2001-6" target="_blank" rel="noreferrer">
              Wald · The Thermodynamics of Black Holes ↗
            </a>
            <a href="https://arxiv.org/abs/1603.02866" target="_blank" rel="noreferrer">
              Radiación de cuerpo negro y el factor 4/3 ↗
            </a>
            <a
              href="https://github.com/nicospum/rendija2simspum/blob/master/docs/ENTROPIA_LABORATORIO.md"
              target="_blank"
              rel="noreferrer"
            >
              Ecuaciones, supuestos y pruebas del laboratorio ↗
            </a>
          </div>
        </section>
      </main>
      <footer className="en-footer">
        <a className="en-brand" href="/">
          ∿ SPUM
        </a>
        <p>La curiosidad no tiene última página.</p>
        <a href="/lente-gravitacional/">Seguí con lente gravitacional ↗</a>
      </footer>
    </div>
  )
}
