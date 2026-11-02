import { useMemo, useState } from 'react'
import LabFrame from '../LabFrame'
import type { Lesson } from '../LabFrame'
import { thermalModel, integratedLength, CENTRAL_CHARGE, G3 } from './physics'
import { useSvgScrub } from '../../shared/useSvgScrub'
import { intervalAtEdgeX, intervalAtPlotX, roundedInterval } from './interaction'
import type { KeyboardEvent } from 'react'
const n = (v: number, d = 2) => v.toLocaleString('es-AR', { maximumFractionDigits: d })
const LESSONS: readonly Lesson[] = [
  {
    title: 'Volver al frío',
    question: 'Si bajás la temperatura a cero, ¿qué recupera el intervalo?',
    choices: [
      'El resultado del vacío de AdS',
      'Entropía local cero para cualquier intervalo',
      'Una evaporación de Schwarzschild',
    ],
    answer: 0,
    hint: 'Tocá «T=0,16» para registrar el estado cálido y después «T=0», con la misma longitud 2. Cada ajuste elige un estado estacionario nuevo.',
    meaning:
      'Al bajar T, la escala térmica crece y el resultado tiende al vacío. La región sigue teniendo entropía de entrelazamiento: vacío no significa ausencia de correlaciones.',
  },
  {
    title: 'Chico frente a grande',
    question: 'A T=0,24, ¿qué intervalo se acerca más al horizonte?',
    choices: [
      'El de longitud 0,5',
      'El de longitud 6',
      'Ambos llegan exactamente al horizonte',
    ],
    answer: 1,
    hint: 'A T=0,24 compará ℓ=0,5 y ℓ=6. La línea rosa marca el horizonte en coordenadas z.',
    meaning:
      'Una región grande respecto de la escala térmica explora mayor profundidad. La curva se aproxima al horizonte desde el exterior y no lo cruza.',
  },
  {
    title: 'Separar la contribución térmica',
    question: 'Para un intervalo grande, ¿cómo cambia la entropía al agrandarlo un poco?',
    choices: [
      'Disminuye',
      'Crece aproximadamente con su longitud',
      'Se vuelve exactamente cero',
    ],
    answer: 1,
    hint: 'Con T=0,32, compará ℓ=4 y ℓ=6. Activá «Ver pendiente térmica» para comparar ΔS/Δℓ con s térmica.',
    meaning:
      'A escalas grandes, S contiene un término aproximadamente extensivo: s·ℓ, con s=πcCFT T/3. El estado global térmico no es el estado puro del capítulo de dos qubits.',
  },
  {
    title: 'Otro agujero negro',
    question:
      'En este modelo BTZ, al duplicar la temperatura de 0,08 a 0,16, ¿qué pasa con el radio areal del horizonte?',
    choices: [
      'Se duplica; el parámetro de masa se cuadruplica',
      'Se reduce a la mitad como en Schwarzschild',
      'El horizonte queda igual',
    ],
    answer: 0,
    hint: 'Usá T=0,08 y T=0,16 manteniendo ℓ=2. Leé r₊/L y el parámetro m, en unidades L=1.',
    meaning:
      'Aquí r₊=2πT y m=r₊². BTZ tiene 2+1 dimensiones y constante cosmológica negativa. La regla de Schwarzschild «más masa, más frío» no se traslada a esta familia.',
  },
]
export default function ThermalLab() {
  const [lesson, setLesson] = useState(0),
    [prediction, setPrediction] = useState<number | null>(null)
  const [ell, setEll] = useState(2),
    [temperature, setTemperature] = useState(0.16),
    [view, setView] = useState<'geometry' | 'entropy'>('geometry')
  const [marks, setMarks] = useState<string[]>([]),
    [slope, setSlope] = useState(false)
  const setup = (index: number) => {
    setEll(index === 1 ? 0.5 : index === 2 ? 4 : 2)
    setTemperature(index === 1 ? 0.24 : index === 2 ? 0.32 : index === 3 ? 0.08 : 0.16)
    setMarks([])
    setSlope(false)
    setView(index === 2 ? 'entropy' : 'geometry')
  }
  const change = (length: number, t: number, showSlope = slope) => {
    const model = thermalModel(length, t)
    setEll(model.ell)
    setTemperature(model.t)
    if (model.t !== 0.32) setSlope(false)
    setMarks((old) => [
      ...new Set([
        ...old,
        ...(lesson === 0 && model.ell === 2 && model.t === 0.16 ? ['warm'] : []),
        ...(lesson === 0 && model.ell === 2 && model.t === 0 ? ['cold'] : []),
        ...(lesson === 1 && model.t === 0.24 && model.ell === 0.5 ? ['short'] : []),
        ...(lesson === 1 && model.t === 0.24 && model.ell === 6 ? ['long'] : []),
        ...(lesson === 2 && model.t === 0.32 && model.ell === 4 ? ['four'] : []),
        ...(lesson === 2 && model.t === 0.32 && model.ell === 6 ? ['six'] : []),
        ...(lesson === 2 && showSlope && model.t === 0.32 ? ['slope'] : []),
        ...(lesson === 3 && model.ell === 2 && model.t === 0.08 ? ['low'] : []),
        ...(lesson === 3 && model.ell === 2 && model.t === 0.16 ? ['high'] : []),
      ]),
    ])
  }
  const m = thermalModel(ell, temperature),
    numerical = useMemo(() => integratedLength(ell, temperature), [ell, temperature])
  const required = [
    ['warm', 'cold'],
    ['short', 'long'],
    ['four', 'six', 'slope'],
    ['low', 'high'],
  ][lesson]
  const labels: Record<string, string> = {
    warm: 'ℓ=2 con T=0,16',
    cold: 'ℓ=2 con T=0',
    short: 'ℓ=0,5 con T=0,24',
    long: 'ℓ=6 con T=0,24',
    four: 'ℓ=4 con T=0,32',
    six: 'ℓ=6 con T=0,32',
    slope: 'Comparar la pendiente térmica',
    low: 'ℓ=2 con T=0,08',
    high: 'ℓ=2 con T=0,16',
  }
  const scaleX = 44,
    scaleZ = 90,
    y0 = 50,
    cx = 250
  const dragEnd = useSvgScrub((p) => change(intervalAtEdgeX(p.x), temperature))
  const dragPlot = useSvgScrub((p) => change(intervalAtPlotX(p.x), temperature))
  const lengthKey = (e: KeyboardEvent<SVGElement>) => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      e.preventDefault()
      change(
        e.key === 'Home'
          ? 0.5
          : e.key === 'End'
            ? 6
            : roundedInterval(ell + (e.key === 'ArrowLeft' ? -0.1 : 0.1)),
        temperature,
      )
    }
  }
  const dragHeat = useSvgScrub((p) =>
    change(ell, Math.round(Math.max(0, Math.min(0.32, (285 - p.y) / 650)) * 100) / 100),
  )
  const points = Array.from({ length: 161 }, (_, i) => {
    const x = -ell / 2 + (ell * i) / 160
    return `${cx + x * scaleX},${y0 + m.zAt(x) * scaleZ}`
  }).join(' ')
  const finiteGap = m.geometricEntropy - m.entropy
  const finiteGapLabel = finiteGap > 0 && finiteGap < 0.0001 ? '<0,0001' : n(finiteGap, 4)
  const deltaSlope = (thermalModel(6, 0.32).entropy - thermalModel(4, 0.32).entropy) / 2
  return (
    <LabFrame
      id="frontera-caliente"
      title="Calentar la frontera."
      intro="Una temperatura en la frontera. Un horizonte en el interior. Compará estados térmicos y descubrí qué cambia en esta familia de agujeros negros."
      lessons={LESSONS}
      lesson={lesson}
      onLesson={(i) => {
        setLesson(i)
        setPrediction(null)
        setup(i)
      }}
      prediction={prediction}
      onPredict={setPrediction}
      steps={required.map((key) => ({ label: labels[key], done: marks.includes(key) }))}
      onRestore={() => setup(lesson)}
      readout={
        <>
          <strong>
            {temperature === 0
              ? 'Vacío: sin horizonte a z finito'
              : `T=${n(temperature)} · horizonte zₕ=${n(m.zh)}`}{' '}
            · ℓ={n(ell)}
          </strong>
          <p>
            {lesson === 3
              ? `Radio físico r₊/L=${n(m.horizonRadius)} · parámetro de masa m=${n(m.massParameter)}.`
              : lesson === 1
                ? temperature === 0
                  ? `Curva z*=${n(m.depth, 4)} · sin horizonte a z finito en el vacío.`
                  : `Curva z*=${n(m.depth, 4)} · horizonte zₕ=${n(m.zh, 4)} · separación en z=${n(m.zh - m.depth, 6)} (>0).`
                : lesson === 2 && slope
                  ? `Entre ℓ=4 y 6: ΔS/Δℓ=${n(deltaSlope)} · tendencia térmica s=${n(m.entropyDensity)} (T=0,32).`
                  : `S frontera=${n(m.entropy)} · curva/(4G₃)=${n(m.geometricEntropy)} · diferencia de corte=${finiteGapLabel} nats.`}
          </p>
        </>
      }
      controls={
        <>
          <label htmlFor="btz-temperature">
            Temperatura T · unidades del modelo <output>{n(temperature)}</output>
          </label>
          <input
            id="btz-temperature"
            type="range"
            min="0"
            max="0.32"
            step="0.01"
            value={temperature}
            onChange={(e) => change(ell, +e.target.value)}
          />
          <p>Esta escala no está en kelvin ni en grados Celsius.</p>
          <label htmlFor="btz-length">
            Longitud del intervalo ℓ <output>{n(ell)}</output>
          </label>
          <input
            id="btz-length"
            type="range"
            min="0.5"
            max="6"
            step="0.1"
            value={ell}
            onChange={(e) => change(+e.target.value, temperature)}
          />
          <p className="spum-console-impact">
            r₊/L={n(m.horizonRadius)} · m={n(m.massParameter)} · profundidad z*=
            {n(m.depth)}. Unidades naturales, L=1.
          </p>
          <details>
            <summary>Cómo leer la temperatura, el horizonte y S</summary>
            <p>
              ℓ es el ancho de la región verde de la frontera. T elige su temperatura en
              unidades del modelo, no en grados Celsius. Cada ajuste compara un estado
              estacionario nuevo; no es un vídeo de formación o evaporación.
            </p>
            <p>
              La línea coral marca el horizonte. zₕ dice dónde está en el mapa; r₊/L mide
              su tamaño físico en unidades L. Al calentar, el número zₕ disminuye y la
              línea sube en el mapa, aunque r₊ crece: coordenada y tamaño no son lo mismo.
              BTZ es el nombre de este modelo de agujero negro con una geometría distinta
              a Schwarzschild.
            </p>
            <p>
              S CFT calcula la entropía de la región desde la teoría de frontera;
              curva/(4G₃) la calcula desde su geometría interior. S se expresa en nats: 1
              nat equivale a unos 1,44 bits de información. Su pequeña diferencia se debe
              al corte finito usado en la curva.
            </p>
          </details>
          <div className="spum-console-buttons">
            {(lesson === 0
              ? [0.16, 0]
              : lesson === 1
                ? [0.24]
                : lesson === 2
                  ? [0.32]
                  : [0.08, 0.16]
            ).map((t) => (
              <button key={t} onClick={() => change(ell, t)}>
                T={n(t)}
              </button>
            ))}
            {lesson === 1 &&
              [0.5, 6].map((l) => (
                <button key={l} onClick={() => change(l, 0.24)}>
                  Intervalo {n(l)}
                </button>
              ))}
            {lesson === 2 &&
              [4, 6].map((l) => (
                <button key={l} onClick={() => change(l, 0.32)}>
                  Intervalo {l}
                </button>
              ))}
          </div>
          {lesson === 2 && (
            <button
              aria-pressed={slope}
              onClick={() => {
                setSlope(!slope)
                if (!slope) setView('entropy')
                change(ell, !slope ? 0.32 : temperature, !slope)
              }}
            >
              Ver pendiente térmica
            </button>
          )}
          {lesson === 2 && slope && (
            <p>
              Entre ℓ=4 y 6 a T=0,32: ΔS/Δℓ={n(deltaSlope)}; s térmica=
              {n(thermalModel(6, 0.32).entropyDensity)}. La aproximación mejora para
              intervalos grandes. Activar esta comparación fija T=0,32.
            </p>
          )}
        </>
      }
      explanation={
        <>
          <h3>El calor también tiene geometría</h3>
          <p>
            Mostramos un corte espacial del exterior BTZ no giratorio, con frontera no
            compacta. La barra de temperatura compara soluciones estacionarias: no
            representa un agujero negro formándose, ni evaporación acelerada.
          </p>
          <p>
            Para un intervalo único de una CFT₂ térmica en una línea infinita:{' '}
            <code>S=(cCFT/3) ln[(β/(πε)) sinh(πℓ/β)]</code>, β=1/T. Usamos cCFT=
            {CENTRAL_CHARGE}, L=1 y G₃={G3}; cCFT es una carga central, no la velocidad de
            la luz. La constante aditiva se fija a cero en nuestro esquema.
          </p>
          <p>
            La curva une extremos en z=ε=0,025. Su longitud exacta es{' '}
            <code>2L asinh[(zₕ/ε) sinh(ℓ/(2zₕ))]</code>. Integral independiente:{' '}
            {n(numerical, 6)}; fórmula: {n(m.exactLength, 6)}. La igualdad con el
            logaritmo CFT se obtiene en el límite de corte pequeño; el error finito se
            muestra arriba.
          </p>
          <p>
            En esta coordenada, el horizonte está en zₕ=1/(2πT): al calentar, se acerca al
            borde del dibujo, aunque su radio areal r₊ crece. La posición en píxeles no
            mide tamaño físico. A T=0 no hay horizonte a z finito en este límite planar.
          </p>
          <p>
            Este capítulo extiende la comparación de Ryu–Takayanagi a estados térmicos. No
            calcula una curva de Page ni demuestra recuperación de información o que
            nuestro universo tenga una frontera AdS.
          </p>
        </>
      }
      sources={[
        {
          label: 'Ryu–Takayanagi · entropía térmica y geometría',
          url: 'https://arxiv.org/abs/hep-th/0603001',
        },
        {
          label: 'Calabrese–Cardy · entropía de un intervalo',
          url: 'https://arxiv.org/abs/hep-th/0405152',
        },
        {
          label: 'Bañados–Teitelboim–Zanelli · agujero negro en 2+1',
          url: 'https://arxiv.org/abs/hep-th/9204099',
        },
      ]}
    >
      <div className="md-view-tabs" role="group" aria-label="Vista térmica">
        <button aria-pressed={view === 'geometry'} onClick={() => setView('geometry')}>
          Interior y horizonte
        </button>
        <button aria-pressed={view === 'entropy'} onClick={() => setView('entropy')}>
          Entropía del intervalo
        </button>
      </div>
      <svg
        viewBox="0 0 500 340"
        role="group"
        aria-label={
          view === 'geometry'
            ? 'Exterior BTZ en coordenadas x,z; arrastrá el extremo verde o el termómetro coral'
            : 'Entropía frente a longitud: vacío y temperatura actual'
        }
      >
        <defs>
          <linearGradient id="btz-fill" x2="0" y2="1">
            <stop stopColor="#514177" />
            <stop offset="1" stopColor="#172638" />
          </linearGradient>
        </defs>
        <rect width="500" height="340" fill="url(#btz-fill)" />
        {view === 'geometry' ? (
          <>
            {[1, 2, 3, 4].map((z) => (
              <g key={z} opacity=".4">
                <path
                  d={`M35 ${y0 + z * scaleZ}H440`}
                  stroke="#9c91be"
                  strokeDasharray="3 6"
                />
                <text x="10" y={y0 + z * scaleZ + 4} fill="#d4cee3" fontSize="12">
                  {z}
                </text>
              </g>
            ))}
            <text x="35" y="24" fill="#ded7f5" fontSize="14">
              FRONTERA · x →
            </text>
            <path d="M35 46H440" stroke="#bba5ff" strokeWidth="2" />
            <path
              d={`M${cx - (ell / 2) * scaleX} ${y0}H${cx + (ell / 2) * scaleX}`}
              stroke="#a0edcf"
              strokeWidth="5"
            />
            {temperature > 0 && y0 + m.zh * scaleZ <= 322 && (
              <>
                <rect
                  x="35"
                  y={y0 + m.zh * scaleZ}
                  width="405"
                  height={340 - y0 - m.zh * scaleZ}
                  fill="#0b1022"
                  opacity=".85"
                />
                <path
                  d={`M35 ${y0 + m.zh * scaleZ}H440`}
                  stroke="#ffad9e"
                  strokeWidth="2"
                  strokeDasharray="7 4"
                />
                <text x="40" y={y0 + m.zh * scaleZ + 18} fill="#ffad9e" fontSize="13">
                  Horizonte · zₕ={n(m.zh)}
                </text>
              </>
            )}
            {temperature > 0 && y0 + m.zh * scaleZ > 322 && (
              <text x="38" y="324" fill="#ffad9e" fontSize="13">
                Horizonte más abajo: zₕ={n(m.zh)} ↓
              </text>
            )}
            {temperature === 0 && (
              <text x="38" y="324" fill="#bba5ff" fontSize="13">
                T=0: límite de vacío · sin horizonte finito
              </text>
            )}
            <polyline points={points} fill="none" stroke="#a0edcf" strokeWidth="4" />
            <circle
              cx={cx + (ell / 2) * scaleX}
              cy={y0 + m.eps * scaleZ}
              r="10"
              fill="#a0edcf"
            />
            <circle
              cx={cx + (ell / 2) * scaleX}
              cy={y0 + m.eps * scaleZ}
              r="40"
              fill="transparent"
              role="slider"
              tabIndex={0}
              aria-label="Arrastrar longitud del intervalo térmico"
              aria-valuemin={0.5}
              aria-valuemax={6}
              aria-valuenow={ell}
              style={{ touchAction: 'none', cursor: 'ew-resize' }}
              {...dragEnd}
              onKeyDown={lengthKey}
            />
            <text x="410" y="25" fill="#ffad9e" fontSize="13">
              T
            </text>
            <path
              d="M467 78V285"
              stroke="#87718b"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d={`M467 ${285 - temperature * 650}V285`}
              stroke="#ffad9e"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <circle cx="467" cy={285 - temperature * 650} r="12" fill="#ffad9e" />
            <rect
              x="420"
              y="63"
              width="80"
              height="241"
              fill="transparent"
              role="slider"
              tabIndex={0}
              aria-label="Termómetro de la frontera"
              aria-valuemin={0}
              aria-valuemax={0.32}
              aria-valuenow={temperature}
              style={{ touchAction: 'none', cursor: 'ns-resize' }}
              {...dragHeat}
              onKeyDown={(e) => {
                if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
                  e.preventDefault()
                  change(
                    ell,
                    e.key === 'Home'
                      ? 0
                      : e.key === 'End'
                        ? 0.32
                        : Math.round(
                            (temperature + (e.key === 'ArrowUp' ? 0.01 : -0.01)) * 100,
                          ) / 100,
                  )
                }
              }}
            />
          </>
        ) : (
          <>
            <text x="35" y="28" fill="#ddd2f4" fontSize="14">
              S DEL INTERVALO · cCFT=60
            </text>
            <path d="M45 50V286H470" fill="none" stroke="#9385ad" />
            {([0, temperature] as const).map((t, i) => (
              <polyline
                key={i}
                points={Array.from({ length: 101 }, (_, j) => {
                  const l = 0.5 + (j * 5.5) / 100
                  return `${45 + (l / 6) * 405},${286 - (thermalModel(l, t).entropy / 260) * 220}`
                }).join(' ')}
                stroke={i ? '#ffad9e' : '#bba5ff'}
                strokeDasharray={i ? undefined : '5 4'}
                strokeWidth="3"
                fill="none"
              />
            ))}
            <circle
              cx={45 + (ell / 6) * 405}
              cy={286 - (m.entropy / 260) * 220}
              r="8"
              fill="#ffad9e"
            />
            <circle
              cx={45 + (ell / 6) * 405}
              cy={286 - (m.entropy / 260) * 220}
              r="40"
              fill="transparent"
              role="slider"
              tabIndex={0}
              aria-label="Cambiar longitud desde el gráfico de entropía"
              aria-valuemin={0.5}
              aria-valuemax={6}
              aria-valuenow={ell}
              style={{ touchAction: 'none', cursor: 'ew-resize' }}
              {...dragPlot}
              onKeyDown={lengthKey}
            />
            <text x="65" y="91" fill="#ddd2f4" fontSize="14">
              Arrastrá el punto coral para cambiar ℓ.
            </text>
            <text x="58" y="311" fill="#bba5ff" fontSize="13">
              Punteada: vacío
            </text>
            <text x="250" y="311" fill="#ffad9e" fontSize="13">
              Coral: T actual · ℓ →
            </text>
            <text x="65" y="68" fill="#a0edcf" fontSize="18">
              Exceso sobre vacío: {n(m.excess)}
            </text>
          </>
        )}
      </svg>
    </LabFrame>
  )
}
