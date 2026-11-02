import { useState } from 'react'
import { countingModel } from './physics'
import './quantum.css'
const QUESTIONS = [
  {
    title: 'Conocer todo',
    question:
      'Si conocés las cuatro variables, ¿cuántas configuraciones siguen siendo compatibles?',
    choices: ['Una; incertidumbre cero', 'Dieciséis, aunque ya las conozca', 'Ninguna'],
    answer: 0,
    hint: 'Revelá las cuatro casillas tocándolas o con «Mostrar todas».',
    meaning:
      'Una configuración conocida tiene probabilidad uno: −log₂1 = 0 bits de incertidumbre.',
  },
  {
    title: 'Cuatro posibilidades',
    question:
      'Dos variables ocultas e independientes, con 0 y 1 equiprobables: ¿cuánta incertidumbre?',
    choices: ['Cuatro bits', 'Dos bits: log₂4', 'Cero, porque son clásicas'],
    answer: 1,
    hint: 'Elegí dos variables, ocultalas y usá «0 y 1 iguales».',
    meaning:
      'Las cuatro configuraciones 00, 01, 10 y 11 tienen probabilidad ¼. H = log₂4 = 2 bits.',
  },
  {
    title: 'Las probabilidades importan',
    question:
      'Si el 1 pasa a tener probabilidad 90 %, ¿qué ocurre con las mismas cuatro posibilidades?',
    choices: [
      'La incertidumbre baja de dos bits',
      'Sube necesariamente a cuatro bits',
      'No cambia: solo importa contar',
    ],
    answer: 0,
    hint: 'Con dos variables ocultas, compará «0 y 1 iguales» con «1 más probable».',
    meaning:
      'Hay cuatro posibilidades, pero no son equiprobables. H = −Σ pᵢ log₂pᵢ ≈ 0,938 bits. log₂Ω solo coincide con H cuando las Ω posibilidades tienen igual probabilidad.',
  },
  {
    title: 'Volver al horizonte',
    question:
      '¿Estas casillas muestran los componentes microscópicos de un agujero negro?',
    choices: [
      'Sí, son una fotografía de bits del horizonte',
      'Son un modelo de información, no celdas físicas observadas',
      'Sí, cada casilla es exactamente un área de Planck',
    ],
    answer: 1,
    hint: 'Tocá «Comparar con el horizonte» y separá el modelo de información de la ley de área.',
    meaning:
      'La ley de Bekenstein–Hawking asigna entropía al área. No identifica por sí sola microestados ni prueba una cuadrícula microscópica. Aquí contamos registros clásicos independientes para aprender qué significa información parcial.',
  },
]
const pretty = (v: number) => v.toLocaleString('es-AR', { maximumFractionDigits: 3 })
export default function CountingBridge() {
  const [bits, setBits] = useState(4)
  const [visible, setVisible] = useState([true, true, true, false])
  const [probability, setProbability] = useState(0.5)
  const [lesson, setLesson] = useState(0)
  const [prediction, setPrediction] = useState<number | null>(null)
  const [touched, setTouched] = useState(false)
  const [compared, setCompared] = useState(false)
  const [sawUniform, setSawUniform] = useState(false)
  const revealed = visible.filter(Boolean).length
  const m = countingModel(bits, revealed, probability)
  const l = QUESTIONS[lesson]
  const ready =
    touched &&
    (lesson === 0
      ? revealed === bits
      : lesson === 1
        ? bits === 2 && revealed === 0 && probability === 0.5
        : lesson === 2
          ? bits === 2 && revealed === 0 && probability === 0.9 && sawUniform
          : compared)
  const selectLesson = (i: number) => {
    setLesson(i)
    setPrediction(null)
    setTouched(false)
    setCompared(false)
    setSawUniform(false)
    setBits(i === 0 ? 4 : 2)
    setVisible(i === 0 ? [true, true, true, false] : [false, false])
    setProbability(0.5)
  }
  const reveal = (value: boolean[]) => {
    setVisible(value)
    setTouched(true)
    if (bits === 2 && value.every((v) => !v) && probability === 0.5) setSawUniform(true)
  }
  const probabilityTo = (p: number) => {
    if (bits === 2 && revealed === 0 && probability === 0.5) setSawUniform(true)
    setProbability(p)
    setTouched(true)
  }
  const maskString = (hidden: string) => {
    let index = 0
    return visible.map((v, i) => (v ? String(i % 2) : hidden[index++])).join('')
  }
  return (
    <section
      id="information-bridge"
      className="q-counting"
      aria-labelledby="q-count-title"
    >
      <p className="q-eyebrow">PUENTE HACIA MALDACENA / INFORMACIÓN PARCIAL</p>
      <h2 id="q-count-title">Contar lo que no vemos.</h2>
      <p>
        Un registro de juguete guarda 0 y 1. Tocá una casilla para revelarla u
        ocultarla: cambia lo que sabés, no el objeto. Las variables ocultas son
        independientes y comparten la probabilidad elegida.
      </p>
      <div className="q-count-workspace">
        <div>
          <div className="q-register" aria-label="Registro de variables binarias">
            {visible.map((known, i) => (
              <button
                key={i}
                aria-label={`${known ? 'Ocultar' : 'Revelar'} variable ${i + 1}`}
                aria-pressed={known}
                onClick={() => reveal(visible.map((v, j) => (i === j ? !v : v)))}
              >
                {known ? i % 2 : '?'}
                <small>{known ? 'conocida' : 'oculta'}</small>
              </button>
            ))}
          </div>
          <div className="q-count-readout" role="status">
            <strong>
              {m.possibilities} configuraci
              {m.possibilities === 1 ? 'ón compatible' : 'ones compatibles'}
            </strong>
            <span>
              H = {pretty(m.entropyBits)} bits · H ln 2 = {pretty(m.entropyNats)} nats
            </span>
            <span>
              {m.hidden} variables ocultas.{' '}
              {probability === 0.5
                ? 'Equiprobables: H = log₂Ω.'
                : 'Probabilidades desiguales: H = −Σ pᵢ log₂pᵢ.'}
            </span>
          </div>
          <div
            className="q-configurations"
            aria-label="Configuraciones compatibles y sus probabilidades"
          >
            {m.rows
              .filter((r) => r.probability > 0)
              .map((row) => (
                <div
                  key={row.value}
                  className="q-configuration"
                  style={{
                    background: `linear-gradient(90deg,#315a62 ${row.probability * 100}%,#142d3d ${row.probability * 100}%)`,
                  }}
                >
                  <b>{maskString(row.value)}</b>
                  <span>{pretty(row.probability * 100)} %</span>
                </div>
              ))}
          </div>
          <p className="q-small-note">
            Probabilidades exactas condicionadas a lo revelado. El color indica su peso;
            no son mediciones ni píxeles del espacio.
          </p>
        </div>
        <div className="q-count-controls">
          <div className="q-scene-actions">
            <button
              aria-pressed={bits === 2}
              onClick={() => {
                setBits(2)
                reveal([false, false])
              }}
            >
              Dos variables
            </button>
            <button
              aria-pressed={bits === 4}
              onClick={() => {
                setBits(4)
                reveal([false, false, false, false])
              }}
            >
              Cuatro variables
            </button>
          </div>
          <label htmlFor="q-revealed">
            Variables reveladas: {revealed} de {bits}
          </label>
          <input
            id="q-revealed"
            type="range"
            min="0"
            max={bits}
            step="1"
            value={revealed}
            onChange={(e) =>
              reveal(Array.from({ length: bits }, (_, i) => i < +e.target.value))
            }
          />
          <div className="q-scene-actions">
            <button onClick={() => reveal(Array(bits).fill(false))}>
              Ocultar todas
            </button>
            <button onClick={() => reveal(Array(bits).fill(true))}>
              Mostrar todas
            </button>
          </div>
          <label htmlFor="q-probability">
            Probabilidad de 1 en cada variable oculta: {Math.round(probability * 100)} %
          </label>
          <input
            id="q-probability"
            type="range"
            min=".1"
            max=".9"
            step=".1"
            value={probability}
            onChange={(e) => probabilityTo(+e.target.value)}
          />
          <div className="q-scene-actions">
            <button onClick={() => probabilityTo(0.5)}>0 y 1 iguales</button>
            <button onClick={() => probabilityTo(0.9)}>1 más probable</button>
          </div>
          <details>
            <summary>¿Qué significan bits y nats?</summary>
            <p>
              Un bit usa logaritmo en base 2; un nat usa logaritmo natural. Para
              posibilidades equiprobables, H en nats = ln Ω. Multiplicar por kB daría
              unidades de entropía física en un modelo estadístico apropiado; este
              registro no es un agujero negro.
            </p>
          </details>
        </div>
      </div>
      <div className="q-mini-challenges">
        <label htmlFor="q-count-lesson">Cuatro preguntas de información</label>
        <select
          id="q-count-lesson"
          value={lesson}
          onChange={(e) => selectLesson(+e.target.value)}
        >
          {QUESTIONS.map((q, i) => (
            <option value={i} key={q.title}>
              {i + 1}/4 · {q.title}
            </option>
          ))}
        </select>
        <h3>{l.question}</h3>
        <div className="q-mini-live">
          <div
            className="q-mini-live-register"
            aria-label="Registro junto a la pregunta"
          >
            {visible.map((known, i) => (
              <button
                key={i}
                aria-label={`${known ? 'Ocultar' : 'Revelar'} variable ${i + 1} junto a la pregunta`}
                aria-pressed={known}
                onClick={() => reveal(visible.map((v, j) => (i === j ? !v : v)))}
              >
                {known ? i % 2 : '?'}
              </button>
            ))}
          </div>
          <p role="status">
            <strong>
              {m.possibilities} posibilidades · H = {pretty(m.entropyBits)} bits
            </strong>
            <br />
            Probabilidad de 1: {Math.round(probability * 100)} %
          </p>
          {lesson === 0 && (
            <button onClick={() => reveal(Array(bits).fill(true))}>
              Completar el registro conocido
            </button>
          )}
          {lesson === 1 && (
            <button
              onClick={() => {
                setBits(2)
                reveal([false, false])
                probabilityTo(0.5)
              }}
            >
              Probar dos variables ocultas
            </button>
          )}
          {lesson === 2 && (
            <div className="q-scene-actions">
              <button onClick={() => probabilityTo(0.5)}>Comparar 50 %</button>
              <button onClick={() => probabilityTo(0.9)}>Comparar 90 %</button>
            </div>
          )}
        </div>

        <p>{l.hint}</p>
        <div className="q-predictions">
          {l.choices.map((c, i) => (
            <button
              key={c}
              aria-pressed={prediction === i}
              onClick={() => setPrediction(i)}
            >
              {c}
            </button>
          ))}
        </div>
        {lesson === 3 && (
          <button
            className="q-compare-horizon"
            onClick={() => {
              setCompared(true)
              setTouched(true)
            }}
          >
            Comparar con el horizonte
          </button>
        )}
        <div className="q-count-feedback" role="status">
          {prediction === null
            ? 'Elegí una idea y probá el cambio. Podés corregir tu predicción.'
            : !ready
              ? 'Tu idea está elegida. ' + l.hint
              : prediction !== l.answer
                ? 'Mirá las posibilidades y sus pesos: el resultado invita a revisar tu idea. ' +
                  l.meaning
                : '✓ Comparación comprendida. ' + l.meaning}
        </div>
        {ready && prediction === l.answer && lesson < 3 && (
          <button onClick={() => selectLesson(lesson + 1)}>
            Siguiente pregunta de información →
          </button>
        )}
      </div>
      <p className="q-small-note">
        Este puente calcula entropía de Shannon de registros clásicos. Las casillas no
        son celdas físicas observadas, microestados identificados ni entrelazamiento.
      </p>
      <a className="q-next-link" href="/entrelazados/">
        Ahora probá algo distinto: el todo sabe más que sus partes →
      </a>
    </section>
  )
}
