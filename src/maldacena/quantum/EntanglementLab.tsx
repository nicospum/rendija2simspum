import { useState } from 'react'
import LabFrame from '../LabFrame'
import type { Lesson } from '../LabFrame'
import { useSvgScrub } from '../../shared/useSvgScrub'
import { scrubKey } from '../../shared/sceneInteraction'
import Info from '../../components/ui/InfoPopover'
import { quantumModel, samplePairs, observationKeys } from './physics'
import type { Basis, QuantumState } from './physics'
import './quantum.css'

const QUANTUM_LESSONS: readonly Lesson[] = [
  {
    title: 'Un par predecible',
    question:
      'Prepará el par |00⟩: A da 0 y B da 0 en Z. ¿Qué debería aparecer al medirlos juntos?',
    choices: [
      'Siempre 00',
      'Cuatro resultados igualmente probables',
      'Una señal que viaja de A a B',
    ],
    answer: 0,
    hint: 'Elegí «Sin entrelazar», después «Ambos en Z» y «Medir 200 pares nuevos». 00 significa resultado 0 en A y 0 en B.',
    meaning:
      'El estado producto |00⟩ tiene resultados definidos en Z. Tener dos sistemas no implica que estén entrelazados. Cambiar la base de medida puede crear incertidumbre de resultados sin crear entrelazamiento.',
  },
  {
    title: 'Juntos, pero impredecibles',
    question: 'Al pasar de |00⟩ al estado de Bell, ¿qué cambia en Z/Z?',
    choices: [
      'Cada lado puede elegirse para enviar un mensaje',
      'Cada lado es incierto, pero los resultados coinciden',
      'Los dos resultados dejan de estar relacionados',
    ],
    answer: 1,
    hint: 'Medí 200 pares sin entrelazar y otros 200 con «Máximo entrelazamiento», ambos en Z/Z.',
    meaning:
      'En el estado (|00⟩+|11⟩)/√2, cada lado tiene probabilidad ½, pero juntos dan 00 o 11. Las coincidencias por sí solas no distinguen entrelazamiento de una mezcla clásica: vamos a cambiar de base.',
  },
  {
    title: 'La prueba de otra base',
    question: 'La mezcla de 00 y 11 coincide con Bell en Z. ¿Qué pasa al medir en X/X?',
    choices: [
      'Siguen siendo indistinguibles',
      'Bell da coincidencia perfecta; la mezcla da 50 %',
      'La mezcla permite controlar el resultado remoto',
    ],
    answer: 1,
    hint: 'Elegí «Máximo entrelazamiento». Medí «Estado puro» y «Mezcla clásica» con «Ambos en Z»; repetí ambos con «Ambos en X». La tabla guarda las cuatro comparaciones.',
    meaning:
      'En X/X el estado de Bell conserva las coincidencias; la mezcla clásica reparte ¼ en cada resultado. Comparten el mismo estado local, pero no el estado conjunto. Esta comparación específica no es un ensayo de Bell ni prueba toda interpretación cuántica.',
  },
  {
    title: 'El todo y una parte',
    question:
      'En el estado de Bell puro, ¿cuánta entropía tiene A y cuánta el conjunto AB?',
    choices: [
      'A: 0 bits; AB: 1 bit',
      'A: 1 bit; AB: 0 bits',
      'A: 1 bit; AB: 2 bits siempre',
    ],
    answer: 1,
    hint: 'Con «Estado puro» y «Máximo entrelazamiento», tocá A (o B) y después «Ver el conjunto AB».',
    meaning:
      'El estado conjunto puro tiene entropía de von Neumann cero. Al describir solo una parte, su estado reducido es mixto y tiene un bit. Esa entropía no cuenta los resultados de una base elegida: describe el estado. Ignorar una parte puede ocultar información accesible en las correlaciones.',
  },
]
const REQUIRED = [
  ['product'],
  ['product', 'bell'],
  ['pure-Z', 'mixture-Z', 'pure-X', 'mixture-X'],
  ['local', 'whole'],
]
const LABELS: Record<string, string> = {
  product: 'Medir |00⟩ en Z/Z',
  bell: 'Medir Bell en Z/Z',
  'pure-Z': 'Medir Bell en Z/Z',
  'mixture-Z': 'Medir mezcla en Z/Z',
  'pure-X': 'Medir Bell en X/X',
  'mixture-X': 'Medir mezcla en X/X',
  local: 'Inspeccionar A o B con Bell puro',
  whole: 'Inspeccionar el conjunto AB con Bell puro',
}
const setup = (i: number): QuantumState => ({
  theta: i >= 2 ? 45 : 0,
  preparation: 'pure',
  basisA: 'Z',
  basisB: 'Z',
})
const fmt = (v: number) => v.toLocaleString('es-AR', { maximumFractionDigits: 2 })
export default function EntanglementLab() {
  const [lesson, setLesson] = useState(0)
  const [state, setState] = useState<QuantumState>(() => setup(0))
  const [prediction, setPrediction] = useState<number | null>(null)
  const [marks, setMarks] = useState<string[]>([])
  const [counts, setCounts] = useState([0, 0, 0, 0])
  const [references, setReferences] = useState<
    Record<string, { expected: number; measured: number }>
  >({})
  const [inspected, setInspected] = useState<'A' | 'B' | 'AB'>('AB')
  const m = quantumModel(state.theta, state.preparation, state.basisA, state.basisB)
  const count = counts.reduce((a, b) => a + b, 0)
  const tune = (patch: Partial<QuantumState>) => {
    setState((s) => ({ ...s, ...patch }))
    setCounts([0, 0, 0, 0])
  }
  const record = (action: 'sample' | 'local' | 'whole') =>
    setMarks((old) => [...new Set([...old, ...observationKeys(lesson, state, action)])])
  const measure = (number: number) => {
    const next = samplePairs(m.probabilities, number)
    setCounts(next)
    if (number >= 200) {
      record('sample')
      if (lesson === 2 && state.theta === 45 && state.basisA === state.basisB)
        setReferences((old) => ({
          ...old,
          [`${state.preparation}-${state.basisA}`]: {
            expected: m.same,
            measured: (next[0] + next[3]) / number,
          },
        }))
    }
  }
  const inspect = (part: 'A' | 'B' | 'AB') => {
    setInspected(part)
    record(part === 'AB' ? 'whole' : 'local')
  }
  const restore = () => {
    setState(setup(lesson))
    setCounts([0, 0, 0, 0])
    setMarks([])
    setReferences({})
    setInspected('AB')
  }
  const choose = (index: number) => {
    setLesson(index)
    setState(setup(index))
    setPrediction(null)
    setMarks([])
    setCounts([0, 0, 0, 0])
    setReferences({})
    setInspected('AB')
  }
  const drag = useSvgScrub((point) =>
    tune({
      theta: Math.round(Math.max(0, Math.min(45, ((point.x - 200) / 200) * 45))),
    }),
  )
  const changeBasis = (part: 'A' | 'B', basis: Basis) =>
    tune(part === 'A' ? { basisA: basis } : { basisB: basis })
  return (
    <LabFrame
      id="entrelazados"
      title="El todo sabe más que sus partes."
      intro="A y B son dos sistemas cuánticos, cada uno con dos resultados posibles: 0 o 1. Prepará pares nuevos, elegí cómo medirlos y compará lo que sabés de cada parte con lo que sabés del conjunto."
      lessons={QUANTUM_LESSONS}
      lesson={lesson}
      onLesson={choose}
      prediction={prediction}
      onPredict={setPrediction}
      steps={REQUIRED[lesson].map((key) => ({
        label: LABELS[key],
        done: marks.includes(key),
      }))}
      onRestore={restore}
      readout={
        <>
          <strong>
            {inspected === 'AB' ? 'Conjunto AB' : `Solo ${inspected}`}:{' '}
            {fmt(inspected === 'AB' ? m.totalEntropy : m.localEntropy)} bits de entropía
            del estado
          </strong>
          {inspected === 'AB' ? (
            <span>
              En AB, coincidencia prevista: {fmt(m.same * 100)} % · muestra:{' '}
              {count
                ? fmt(((counts[0] + counts[3]) / count) * 100) +
                  ' % en ' +
                  count +
                  ' pares'
                : 'todavía sin medir'}
            </span>
          ) : (
            <span>
              Probabilidades de {inspected} en{' '}
              {inspected === 'A' ? state.basisA : state.basisB}: 0 →{' '}
              {fmt((inspected === 'A' ? m.probabilityA0 : m.probabilityB0) * 100)} % · 1 →{' '}
              {fmt((1 - (inspected === 'A' ? m.probabilityA0 : m.probabilityB0)) * 100)}{' '}
              %.
            </span>
          )}
        </>
      }
      controls={
        <>
          <details className="q-before-measuring">
            <summary>¿Qué son A/B, Z/X y Bell?</summary>
            <p>
              A y B nombran las dos partes de cada par. Un qubit es un sistema de dos
              niveles; los círculos son símbolos, no bolitas que se mandan mensajes. En
              00, el primer resultado es de A y el segundo, de B.
            </p>
            <p>
              Z y X son dos formas diferentes de medir cada qubit, como elegir qué
              pregunta le hacemos. El botón junto a cada círculo cambia esa elección.
              «Máximo entrelazamiento» prepara aquí el estado llamado Bell; «Mezcla
              clásica» prepara al azar 00 o 11, sin la coherencia del estado de Bell.
            </p>
            <p>
              Tocá A o B para leer sus probabilidades locales. Mirá AB para comparar ambos
              registros. Cambiar la forma de medir B no cambia las probabilidades de A:
              las coincidencias se conocen reuniendo los registros. Al medir 200 pares se
              preparan 200 copias nuevas, no se mide 200 veces el mismo par.
            </p>
          </details>
          <label htmlFor="quantum-theta">Preparación θ: {state.theta}°</label>
          <input
            id="quantum-theta"
            type="range"
            min="0"
            max="45"
            step="1"
            value={state.theta}
            onChange={(e) => tune({ theta: +e.target.value })}
          />
          <p>
            θ cambia el estado preparado; no gira los analizadores. Con «Estado puro», a
            0° es |00⟩ y a 45° es Bell. Los botones de abajo permiten comparar esos
            extremos sin ajustar la barra con precisión.
          </p>
          <div className="spum-console-buttons">
            <button onClick={() => tune({ theta: 0 })}>Sin entrelazar</button>
            <button onClick={() => tune({ theta: 45 })}>Máximo entrelazamiento</button>
          </div>
          <div className="spum-console-buttons">
            <button
              aria-pressed={state.preparation === 'pure'}
              onClick={() => tune({ preparation: 'pure' })}
            >
              Estado puro
            </button>
            <button
              aria-pressed={state.preparation === 'mixture'}
              onClick={() => tune({ preparation: 'mixture' })}
            >
              Mezcla clásica
            </button>
            <button onClick={() => tune({ basisA: 'Z', basisB: 'Z' })}>Ambos en Z</button>
            <button onClick={() => tune({ basisA: 'X', basisB: 'X' })}>Ambos en X</button>
          </div>
          <div className="spum-console-buttons">
            <button onClick={() => measure(1)}>Medir un par nuevo</button>
            <button onClick={() => measure(200)}>Medir 200 pares nuevos</button>
            <button onClick={() => inspect('AB')}>Ver el conjunto AB</button>
          </div>
          {lesson === 2 && (
            <table className="q-reference-table">
              <caption>Tu comparación · coincidencias</caption>
              <thead>
                <tr>
                  <th>Preparación / base</th>
                  <th>Predicción</th>
                  <th>Muestra</th>
                </tr>
              </thead>
              <tbody>
                {['pure-Z', 'mixture-Z', 'pure-X', 'mixture-X'].map((key) => (
                  <tr key={key}>
                    <th>
                      {key.startsWith('pure') ? 'Bell' : 'Mezcla'} ·{' '}
                      {key.endsWith('Z') ? 'Z/Z' : 'X/X'}
                    </th>
                    <td>
                      {references[key] ? fmt(references[key].expected * 100) + ' %' : '—'}
                    </td>
                    <td>
                      {references[key]
                        ? fmt(references[key].measured * 100) + ' %'
                        : 'sin medir'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p>
            Cambiar preparación o analizadores inicia una muestra nueva. Los pasos del
            reto recuerdan comparaciones ya realizadas.
          </p>
        </>
      }
      explanation={
        <>
          <h2>Dos cosas distintas: estado y resultados.</h2>
          <p>
            Una medida produce resultados al azar según la regla de Born. La entropía de
            von Neumann describe el estado, no el número de resultados de una base. Por
            eso un estado puro puede tener entropía cero y aun así dar resultados
            impredecibles.
          </p>
          <p>
            Preparamos cos(θ)|00⟩ + sin(θ)|11⟩. Al ignorar B, A tiene probabilidades
            propias p = cos²θ y 1−p. Su entropía es −p log₂p − (1−p) log₂(1−p). La mezcla
            clásica elimina los términos de coherencia del estado conjunto; conserva los
            estados locales.
          </p>
          <p>
            Los círculos representan sistemas abstractos de dos niveles, no esferas que
            envían mensajes. Cambiar el analizador de B no modifica las probabilidades
            locales de A. Para comparar correlaciones hay que reunir los registros por
            comunicación ordinaria.
          </p>
          <Info name="Bases Z y X">
            Una base elige qué resultados distingue el aparato. Z mide en |0⟩, |1⟩; X mide
            en (|0⟩+|1⟩)/√2 y (|0⟩−|1⟩)/√2. En X, las etiquetas 0 y 1 de las barras
            representan + y −. Cambiar la base no prepara un estado nuevo: cambia cómo lo
            medimos; cada ensayo sí usa copias recién preparadas.
          </Info>
          <p>
            Conexión con Maldacena: necesitaremos distinguir la información de una región
            de la del sistema completo. Dos qubits enseñan esa distinción; no simulan un
            agujero negro ni la correspondencia AdS/CFT.
          </p>
        </>
      }
      sources={[
        {
          label: 'Preskill · Caltech: estados, conjuntos y sistemas compuestos',
          url: 'https://www.preskill.caltech.edu/ph229/notes/chap2.pdf',
        },
      ]}
    >
      <div className="q-scene-legend">
        <span className="q-hint-long">
          Tocá A o B para mirar una parte · tocá Z/X para cambiar su base
        </span>
        <span className="q-hint-short">Tocá A/B · girá Z/X · arrastrá θ</span>
      </div>
      <svg
        className="q-pair-scene"
        viewBox="0 0 600 400"
        role="group"
        aria-label="Dos qubits y sus probabilidades conjuntas calculadas"
      >
        <defs>
          <radialGradient id="qaGlow">
            <stop stopColor="#5fe0cd" stopOpacity=".35" />
            <stop offset="1" stopColor="#0c273d" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="qbGlow">
            <stop stopColor="#c79cfa" stopOpacity=".4" />
            <stop offset="1" stopColor="#0c273d" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="125" cy="135" r="110" fill="url(#qaGlow)" />
        <circle cx="475" cy="135" r="110" fill="url(#qbGlow)" />
        <path
          d={`M185 135 Q300 ${135 - Math.sin((state.theta * Math.PI) / 90) * 75} 415 135 M185 135 Q300 ${135 + Math.sin((state.theta * Math.PI) / 90) * 75} 415 135`}
          fill="none"
          stroke={state.preparation === 'pure' ? '#b1e6db' : '#799da9'}
          strokeWidth="3"
          strokeDasharray={state.preparation === 'mixture' ? '6 7' : undefined}
          opacity=".65"
        />
        <text x="300" y="114" textAnchor="middle" fill="#dcecf0" fontSize="21">
          {state.preparation === 'pure' ? 'Estado conjunto puro' : 'Mezcla de 00 y 11'}
        </text>
        {[
          { part: 'A' as const, x: 125, basis: state.basisA, color: '#7febd8' },
          { part: 'B' as const, x: 475, basis: state.basisB, color: '#d5b3ff' },
        ].map(({ part, x, basis, color }) => (
          <g key={part}>
            <g
              role="button"
              tabIndex={0}
              aria-label={`Inspeccionar sistema ${part}`}
              onClick={() => inspect(part)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  inspect(part)
                }
              }}
              className="q-svg-button"
            >
              <circle
                cx={x}
                cy="135"
                r="61"
                fill="#12354b"
                stroke={color}
                strokeWidth={inspected === part ? 4 : 2}
              />
              <text x={x} y="143" fill={color} textAnchor="middle" fontSize="42">
                {part}
              </text>
            </g>
            <g
              role="button"
              tabIndex={0}
              aria-label={`Analizador ${part}: ${basis}. Cambiar base`}
              onClick={() => changeBasis(part, basis === 'Z' ? 'X' : 'Z')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  changeBasis(part, basis === 'Z' ? 'X' : 'Z')
                }
              }}
              className="q-svg-button"
            >
              <rect x={x - 56} y="194" width="112" height="96" fill="transparent" />
              <rect
                x={x - 48}
                y="205"
                width="96"
                height="44"
                rx="14"
                fill="#214459"
                stroke={color}
              />
              <text x={x} y="233" textAnchor="middle" fill={color} fontSize="24">
                Base {basis} ↻
              </text>
            </g>
          </g>
        ))}
        <line x1="200" x2="400" y1="184" y2="184" stroke="#587d91" strokeWidth="6" />
        <g
          role="slider"
          tabIndex={0}
          aria-label="Cambiar preparación desde la escena"
          aria-valuemin={0}
          aria-valuemax={45}
          aria-valuenow={state.theta}
          className="q-drag"
          {...drag}
          onKeyDown={(e) => {
            const value = scrubKey(e.key, state.theta, 0, 45, 1)
            if (value !== undefined) {
              e.preventDefault()
              tune({ theta: value })
            }
          }}
        >
          <circle
            cx={200 + (state.theta / 45) * 200}
            cy="184"
            r="48"
            fill="transparent"
          />
          <circle cx={200 + (state.theta / 45) * 200} cy="184" r="18" fill="#f6d18e" />
          <text x="300" y="221" textAnchor="middle" fontSize="16" fill="#f6d18e">
            θ = {state.theta}° · arrastrá
          </text>
        </g>
        {m.probabilities.map((p, i) => (
          <g key={i}>
            <rect x={66 + i * 130} y="280" width="78" height="76" rx="4" fill="#244056" />
            <rect
              x={66 + i * 130}
              y={356 - p * 76}
              width="78"
              height={p * 76}
              rx="3"
              fill={i === 0 || i === 3 ? '#83e8d3' : '#d6b6ff'}
            />
            {count > 0 && (
              <line
                x1={72 + i * 130}
                x2={138 + i * 130}
                y1={356 - (counts[i] / count) * 76}
                y2={356 - (counts[i] / count) * 76}
                stroke="#fff"
                strokeWidth="3"
              />
            )}
            <text
              x={105 + i * 130}
              y="273"
              textAnchor="middle"
              fill="#edf5f6"
              fontSize="18"
            >
              {fmt(p * 100)} %
            </text>
            <text
              x={105 + i * 130}
              y="382"
              textAnchor="middle"
              fill="#edf5f6"
              fontSize="20"
            >
              {['00', '01', '10', '11'][i]}
            </text>
          </g>
        ))}
      </svg>
      <div className="q-prob-label">
        Prob. {state.basisA}/{state.basisB} · blanco: muestra · X: 0/1 = +/−.
      </div>
      <div className="q-scene-actions">
        <button onClick={() => measure(200)}>Medir 200 pares nuevos</button>
        <button onClick={() => inspect('AB')}>Ver el conjunto AB</button>
      </div>
      {count > 0 && (
        <div className="q-sample" role="status">
          Muestra aleatoria de {count} pares:{' '}
          {counts.map((n, i) => `${['00', '01', '10', '11'][i]}: ${n}`).join(' · ')}.
          Puede fluctuar respecto de las barras.
        </div>
      )}
    </LabFrame>
  )
}
