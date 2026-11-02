import { useId, useState } from 'react'
import LabFrame from '../LabFrame'
import GeodesicScene from './GeodesicScene'
import {
  CENTRAL_CHARGE,
  G3,
  model,
  settings,
  MIN_INTERVAL,
  MAX_INTERVAL,
  MIN_CUTOFF,
  MAX_CUTOFF,
  type GeometrySettings,
} from './physics'
import {
  DUALITY_LESSONS,
  GEOMETRY_LESSONS,
  initialTrial,
  measure,
  reference,
  steps,
  type LabKind,
} from './learning'
import './geometry.css'

const n = (value: number, digits = 3) =>
  value.toLocaleString('es-AR', { maximumFractionDigits: digits })

export function GeometryExperience({ kind }: { kind: LabKind }) {
  const [trial, setTrial] = useState(() => initialTrial(kind))
  const id = useId()
  const lessons = kind === 'geometry' ? GEOMETRY_LESSONS : DUALITY_LESSONS
  const baseline = reference(kind, trial.lesson)
  const visualReference =
    kind === 'duality' ? { ...baseline, interval: 2, center: 0 } : baseline
  const m = model(trial.setup),
    ref = model(visualReference)
  const change = (value: GeometrySettings) =>
    setTrial((t) => ({ ...t, setup: settings(value) }))
  const patch = (value: Partial<GeometrySettings>) =>
    change({ ...trial.setup, ...value })
  const onLesson = (index: number) => setTrial(initialTrial(kind, index))
  const lastRecord = trial.records[trial.records.length - 1]
  const currentRecorded =
    lastRecord &&
    lastRecord.interval === trial.setup.interval &&
    lastRecord.center === trial.setup.center &&
    lastRecord.cutoff === trial.setup.cutoff
  const controls = (
    <div className="geo-controls">
      <label htmlFor={`${id}-interval`}>
        Longitud del intervalo ℓ{' '}
        <output>{n(trial.setup.interval, 2)}</output>
      </label>
      <input
        id={`${id}-interval`}
        type="range"
        min={MIN_INTERVAL}
        max={MAX_INTERVAL}
        step="0.1"
        value={trial.setup.interval}
        onChange={(e) => patch({ interval: Number(e.target.value) })}
      />
      <label htmlFor={`${id}-center`}>
        Centro del intervalo <output>{n(trial.setup.center, 2)}</output>
      </label>
      <input
        id={`${id}-center`}
        type="range"
        min="-1"
        max="1"
        step="0.1"
        value={trial.setup.center}
        onChange={(e) => patch({ center: Number(e.target.value) })}
      />
      <label htmlFor={`${id}-cutoff`}>
        Corte regulador ε <output>{n(trial.setup.cutoff, 3)}</output>
      </label>
      <input
        id={`${id}-cutoff`}
        type="range"
        min={MIN_CUTOFF}
        max={MAX_CUTOFF}
        step="0.01"
        value={trial.setup.cutoff}
        onChange={(e) => patch({ cutoff: Number(e.target.value) })}
      />
      <button
        className="geo-measure"
        onClick={() => setTrial((t) => measure(t))}
      >
        {kind === 'geometry'
          ? 'Medir los dos caminos'
          : 'Registrar esta comparación'}
      </button>
      <div className="geo-actions">
        {kind === 'geometry' ? (
          <>
            <button onClick={() => patch({ interval: 2, cutoff: 0.2 })}>
              ℓ=2 · ε=0,2
            </button>
            <button onClick={() => patch({ interval: 3, cutoff: 0.2 })}>
              Separar a ℓ=3
            </button>
            <button onClick={() => patch({ interval: 2, cutoff: 0.04 })}>
              Acercar corte a 0,04
            </button>
            <button onClick={() => patch({ interval: 4, cutoff: 0.2 })}>
              Intervalo ℓ=4
            </button>
          </>
        ) : (
          <>
            <button onClick={() => patch({ interval: 4 })}>
              Duplicar a ℓ=4
            </button>
            <button onClick={() => patch({ center: 1 })}>
              Mover el intervalo a +1
            </button>
            <button onClick={() => patch({ cutoff: 0.3 })}>
              Corte 0,3
            </button>
            <button onClick={() => patch({ cutoff: 0.1 })}>
              Corte 0,1
            </button>
            <button onClick={() => patch({ cutoff: 0.03 })}>
              Corte 0,03
            </button>
            <button onClick={() => patch({ cutoff: 0.02 })}>
              Corte 0,02
            </button>
          </>
        )}
      </div>
      <p role="status">
        {currentRecorded
          ? `Esta lectura está registrada. Guardaste ${trial.measurements} ${trial.measurements === 1 ? 'comparación' : 'comparaciones'} en este reto.`
          : lastRecord
            ? `Lectura en vivo sin registrar. Tu última medida usó ℓ=${n(lastRecord.interval)}, centro=${n(lastRecord.center)} y ε=${n(lastRecord.cutoff)}.`
            : 'Las cifras cambian en vivo. Tocá el botón de medir para guardar una comparación y avanzar en el reto.'}
      </p>
      <p>
        Las asas cambian las mismas variables que estas barras. El fondo
        conserva su escala. Cambiar ε modifica el regulador; cambiar ℓ
        modifica la región estudiada.
      </p>
      <details className="geo-control-help">
        <summary>Qué cambia cada mando y qué significa la unidad</summary>
        <p>
          ℓ es el ancho de la región entre A y B. El centro mueve ambas puntas sin
          cambiar ese ancho. ε es el corte: mantiene las puntas separadas de la frontera
          ideal z=0 para poder calcular una distancia finita. Reducir ε incluye más
          recorrido cerca de esa frontera; no mueve una pared física.
        </p>
        <p>
          {kind === 'geometry'
            ? 'Las distancias se expresan en L, la unidad de longitud del modelo. Una geodésica es el camino de menor distancia según la regla de esta geometría.'
            : 'S mide entropía de una región: información que falta al ignorar el resto. Usamos nats, una unidad de información: 1 nat equivale a unos 1,44 bits. Frontera e interior son los dos cálculos del mismo ejemplo; la cifra interior se aproxima a la de frontera cuando ε es pequeño.'}
        </p>
        {kind === 'duality' && (
          <p>
            Con cCFT=60, pasar de ℓ=2 a ℓ=4 suma 13,86 nats a la fórmula de frontera.
            Mirá el incremento, no esperes que el número total se duplique.
          </p>
        )}
        <p>
          Explorar mueve el dibujo y actualiza sus cifras. Medir guarda esas
          condiciones; las comparaciones anteriores quedan en «Mis últimas medidas».
        </p>
      </details>
      <details className="geo-numerical">
        <summary>Comprobar el cálculo</summary>
        <p>
          Integral numérica independiente: ∫ds={n(m.lengthNumeric, 5)} L;
          fórmula={n(m.length, 5)} L. Error de integración &lt;
          {m.numericalError < 1e-5 ? '0,00001' : n(m.numericalError, 5)} L.
        </p>
      </details>
      {!!trial.records.length && (
        <details>
          <summary>Mis últimas medidas</summary>
          <ol>
            {trial.records.map((record, index) => {
              const sample = model(record)
              return (
                <li key={index}>
                  ℓ={n(record.interval)}; centro={n(record.center)}; ε=
                  {n(record.cutoff)}.{' '}
                  {kind === 'geometry'
                    ? `Geodésica ${n(sample.length)} L; recta ${n(sample.straightLength)} L.`
                    : `Sfrontera=${n(sample.cft)}; Sinterior=${n(sample.bulk)}; ΔSinterior=${n(sample.deltaBulk)} nats.`}
                </li>
              )
            })}
          </ol>
        </details>
      )}
    </div>
  )
  const readout = (
    <div className="geo-readout">
      <div className="geo-metrics">
        <div>
          <span>
            {kind === 'geometry'
              ? 'Geodésica espacial'
              : 'Frontera · S asintótica'}
          </span>
          <strong>
            {n(kind === 'geometry' ? m.length : m.cft)}{' '}
            {kind === 'geometry' ? 'L' : 'nats'}
          </strong>
        </div>
        <div>
          <span>
            {kind === 'geometry'
              ? 'Recta sobre el corte'
              : 'Interior · longitud / 4G₃'}
          </span>
          <strong>
            {n(kind === 'geometry' ? m.straightLength : m.bulk)}{' '}
            {kind === 'geometry' ? 'L' : 'nats'}
          </strong>
        </div>
      </div>
      {kind === 'geometry' ? (
        <p>
          ℓ={n(trial.setup.interval, 2)} · ε={n(trial.setup.cutoff, 2)} · Profundidad:{' '}
          {n(ref.radius)} → {n(m.radius)}.
        </p>
      ) : (
        <>
          <p>
            ℓ={n(trial.setup.interval, 2)} · ε={n(trial.setup.cutoff, 2)} ·{' '}
            <strong>Diferencia: {n(m.difference, 5)} nats</strong>
            <span className="geo-residual-description">
              {' '}
              Corte finito frente al límite logarítmico.
            </span>
          </p>
          {trial.lesson === 3 && (
            <p>
              ΔS (2→ℓ): CFT {n(m.deltaCft)} · AdS {n(m.deltaBulk)} nats.
            </p>
          )}
        </>
      )}
    </div>
  )
  return (
    <LabFrame
      id={kind === 'geometry' ? 'espacio-con-frontera' : 'dos-lenguajes'}
      title={
        kind === 'geometry'
          ? 'Un espacio con frontera'
          : 'Dos lenguajes, una misma respuesta'
      }
      intro={
        kind === 'geometry'
          ? '¿La línea recta siempre es el camino más corto? Mové dos puntos y descubrí una geometría donde el papel engaña a la regla.'
          : 'Elegí una región de la frontera. Calculá su entropía con un logaritmo y comparala con una longitud en el interior: una primera ventana a AdS/CFT.'
      }
      lessons={lessons}
      lesson={trial.lesson}
      onLesson={onLesson}
      prediction={trial.prediction}
      onPredict={(prediction) => setTrial((t) => ({ ...t, prediction }))}
      steps={steps(trial)}
      onRestore={() =>
        setTrial((t) => ({
          ...initialTrial(kind, t.lesson),
          prediction: t.prediction,
        }))
      }
      controls={controls}
      readout={readout}
      explanation={
        kind === 'geometry' ? (
          <>
            <h2>El dibujo no es la regla.</h2>
            <p>
              Esta es una rebanada de <strong>tiempo constante</strong> de
              AdS₃. Solo dibujamos sus dos coordenadas espaciales, x y z;
              AdS₃ tiene 2+1 dimensiones. z crece hacia abajo en el mapa.
              Las curvas son caminos espaciales, no trayectorias de fotones
              ni un vídeo de caída.
            </p>
            <p className="geo-formula">ds² = L² (dx² + dz²) / z²</p>
            <div className="geo-explain-grid">
              <article>
                <h3>¿Por qué gana el arco?</h3>
                <p>
                  La misma longitud en píxeles pesa más cerca de z=0. La
                  línea horizontal permanece en la zona costosa; la curva
                  baja, atraviesa el interior y vuelve a subir. Las líneas
                  horizontales tenues separan tramos verticales de 0,5 L
                  cada uno: se amontonan cerca del borde del dibujo.
                </p>
              </article>
              <article>
                <h3>¿Qué corta el corte?</h3>
                <p>
                  La frontera ideal está en z=0. Mantenemos ambos extremos a
                  z=ε para obtener longitudes finitas. No se dibuja una
                  pared ni un borde material del universo. La frontera sigue
                  estando a distancia infinita en esta geometría espacial.
                </p>
              </article>
            </div>
            <p className="geo-formula">
              R = √[(ℓ/2)² + ε²] · longitud = 2L asinh(ℓ/2ε)
            </p>
            <p>
              El arco es una porción de círculo ortogonal a la frontera
              ideal, pero sus extremos regulados están en (xA, ε) y (xB, ε).
              Por eso su radio no es exactamente ℓ/2. La recta mide Lℓ/ε.
              Trabajamos en unidades L=1; cada cifra es calculada, no una
              animación prefabricada.
            </p>
            <h3>La pregunta que viene</h3>
            <p>
              ¿Qué tendría que ver esta longitud con la información que
                falta al observar una sola región? En la siguiente
                sección, una relación de holografía conecta ambas cuentas.
            </p>
          </>
        ) : (
          <>
            <h2>Una igualdad necesita un diccionario.</h2>
            <p>
              Maldacena propuso una equivalencia entre ciertas teorías
              cuánticas y teorías de gravedad/cuerdas en espacios AdS.
              Exploramos un caso introductorio: un intervalo del vacío de
              una CFT₂ sobre una línea infinita y una rebanada de AdS₃. CFT₂
              tiene 1+1 dimensiones; AdS₃, 2+1. No simulamos los campos
              microscópicos de una CFT ni demostramos toda la conjetura.
            </p>
            <p className="geo-formula">
              Sfrontera = (cCFT/3) ln(ℓ/ε) + constante
              <br />
              Sinterior = longitud / (4G₃) · cCFT = 3L/(2G₃)
            </p>
            <p>
              Fijamos L=ℏ=velocidad de la luz=1 y cCFT={CENTRAL_CHARGE}; de
              ahí G₃={n(G3, 4)}. La letra cCFT es la{' '}
              <strong>carga central</strong>, no la velocidad de la luz.
              Estos parámetros están vinculados, por eso no aparecen como
              barras independientes. La constante aditiva se fija a cero en
              la convención de comparación.
            </p>
            <div className="geo-explain-grid">
              <article>
                <h3>La diferencia no se esconde</h3>
                <p>
                  Con extremos a z=ε, la longitud exacta contiene
                  asinh(ℓ/2ε). La expresión logarítmica es su límite cuando
                  ε/ℓ es pequeño. En el visor se mantiene visible el residuo
                  a corte finito y se comprueba por integración
                  independiente.
                </p>
              </article>
              <article>
                <h3>Una entropía de una parte</h3>
                <p>
                  El estado global del vacío es puro; una región puede tener
                  entropía de entrelazamiento al ignorar el resto. Esta no
                  es la suma térmica de fotones del capítulo Hawking.
                  Medimos en nats (logaritmo natural), no en bits.
                </p>
              </article>
            </div>
            <h3>
              Una relación concreta, no una proyección de nuestro universo
            </h3>
            <p>
              Ryu y Takayanagi relacionan entropía de entrelazamiento y
              superficies mínimas en el régimen gravitatorio adecuado. En
              AdS₃ esa superficie es una curva. La correspondencia abarca
              observables y correlaciones; este par de gráficos solo ilustra
              una de sus relaciones. No es un holograma óptico ni una
              confirmación experimental de que nuestro universo tenga una
              pared de información.
            </p>
          </>
        )
      }
      sources={
        kind === 'geometry'
          ? [
              {
                label: 'Natsuume · AdS/CFT Duality User Guide',
                url: 'https://arxiv.org/abs/1409.3575',
              },
              {
                label: 'Ryu–Takayanagi · geometría de AdS₃ y entropía',
                url: 'https://arxiv.org/abs/hep-th/0603001',
              },
            ]
          : [
              {
                label: 'Maldacena · propuesta original de AdS/CFT',
                url: 'https://arxiv.org/abs/hep-th/9711200',
              },
              {
                label: 'Ryu–Takayanagi · entropía holográfica (2006)',
                url: 'https://arxiv.org/abs/hep-th/0603001',
              },
              {
                label: 'Calabrese–Cardy · intervalo único en una CFT',
                url: 'https://arxiv.org/abs/hep-th/0405152',
              },
            ]
      }
    >
      <GeodesicScene
        kind={kind}
        setup={trial.setup}
        reference={visualReference}
        onChange={change}
      />
    </LabFrame>
  )
}

export default function GeometryLab() {
  return <GeometryExperience kind="geometry" />
}
