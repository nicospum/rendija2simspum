import { useId, useState } from 'react'
import { useSvgScrub } from '../../shared/useSvgScrub'
import { scrubKey } from '../../shared/sceneInteraction'
import {
  curvePoints,
  intervalFromEndpoint,
  model,
  settings,
  CENTRAL_CHARGE,
  ENTROPY_AXIS_MAX,
  G3,
  MIN_CUTOFF,
  MAX_CUTOFF,
  type GeometrySettings,
} from './physics'
import type { LabKind } from './learning'
import './geometry.css'

const n = (v: number, digits = 2) =>
  v.toLocaleString('es-AR', { maximumFractionDigits: digits })
const px = (x: number) => 320 + x * 70
const py = (z: number) => 64 + z * 100
const path = (points: { x: number; z: number }[]) =>
  points
    .map(
      (p, i) =>
        `${i ? 'L' : 'M'}${px(p.x).toFixed(2)},${py(p.z).toFixed(2)}`,
    )
    .join(' ')

function Endpoint({
  side,
  setup,
  onChange,
}: {
  side: 'left' | 'right'
  setup: GeometrySettings
  onChange: (value: GeometrySettings) => void
}) {
  const x = setup.center + ((side === 'left' ? -1 : 1) * setup.interval) / 2
  const minimum = side === 'left' ? -3 : -0.3
  const maximum = side === 'left' ? 0.3 : 3
  const move = (value: number) =>
    onChange(intervalFromEndpoint(setup, side, value))
  const drag = useSvgScrub((p) => move((p.x - 320) / 70))
  return (
    <g
      {...drag}
      className="geo-handle"
      role="slider"
      tabIndex={0}
      aria-label={`Extremo ${side === 'left' ? 'izquierdo' : 'derecho'} del intervalo`}
      aria-valuemin={minimum}
      aria-valuemax={maximum}
      aria-valuenow={Number(x.toFixed(3))}
      aria-valuetext={`x=${n(x)}; longitud ${n(setup.interval)}`}
      onKeyDown={(event) => {
        const next = scrubKey(event.key, x, minimum, maximum, 0.1)
        if (next !== undefined) {
          event.preventDefault()
          move(next)
        }
      }}
    >
      <circle className="geo-hit" cx={px(x)} cy={py(setup.cutoff)} />
      <circle
        className="geo-grip"
        cx={px(x)}
        cy={py(setup.cutoff)}
        r="12"
      />
      <text
        x={px(x)}
        y={py(setup.cutoff) - 22}
        textAnchor="middle"
        className="geo-end-label"
      >
        {side === 'left' ? 'A' : 'B'}
      </text>
    </g>
  )
}

export default function GeodesicScene({
  kind,
  setup,
  reference,
  onChange,
}: {
  kind: LabKind
  setup: GeometrySettings
  reference: GeometrySettings
  onChange: (value: GeometrySettings) => void
}) {
  const [view, setView] = useState<'space' | 'measure'>('space')
  const id = useId().replace(/:/g, '')
  const m = model(setup),
    ref = model(reference)
  const points = curvePoints(setup)
  const centerDrag = useSvgScrub((p) =>
    onChange(settings({ ...setup, center: (p.x - 320) / 70 })),
  )
  // The handle uses a logarithmic ruler, separate from the coordinate line.
  // It gives the small-cutoff regime enough finger travel on a phone.
  const cutoffY =
    82 +
    (Math.log(setup.cutoff / MIN_CUTOFF) /
      Math.log(MAX_CUTOFF / MIN_CUTOFF)) *
      160
  const cutoffDrag = useSvgScrub((p) =>
    onChange(
      settings({
        ...setup,
        cutoff:
          MIN_CUTOFF *
          Math.exp(((p.y - 82) / 160) * Math.log(MAX_CUTOFF / MIN_CUTOFF)),
      }),
    ),
  )
  const maxLength = Math.ceil(Math.max(m.straightLength, 1))
  const plotX = (t: number) => 70 + 490 * t
  const plotY = (length: number) => 282 - (205 * length) / maxLength
  return (
    <div className="geo-scene">
      <div
        className="geo-view-tabs"
        role="group"
        aria-label="Elegir vista de la geometría"
      >
        <button
          aria-pressed={view === 'space'}
          onClick={() => setView('space')}
        >
          {kind === 'geometry' ? 'Mapa de caminos' : 'Interior AdS₃'}
        </button>
        <button
          aria-pressed={view === 'measure'}
          onClick={() => setView('measure')}
        >
          {kind === 'geometry' ? 'Medir distancias' : 'Frontera CFT₂'}
        </button>
      </div>
      {view === 'space' ? (
        <svg
          viewBox="0 0 640 350"
          role="group"
          aria-label={`Rebanada espacial de AdS. Intervalo ${n(setup.interval)}; corte ${n(setup.cutoff)}; profundidad máxima ${n(m.radius)}`}
        >
          <defs>
            <linearGradient id={`${id}-depth`} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#20294a" />
              <stop offset="1" stopColor="#082c36" />
            </linearGradient>
            <linearGradient id={`${id}-region`} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#8ce5d5" stopOpacity=".2" />
              <stop offset="1" stopColor="#91a5fa" stopOpacity=".025" />
            </linearGradient>
          </defs>
          <rect
            x="8"
            y="8"
            width="624"
            height="334"
            rx="18"
            fill={`url(#${id}-depth)`}
          />
          {[
            0.04,
            0.04 * Math.exp(0.5),
            0.04 * Math.exp(1),
            0.04 * Math.exp(1.5),
            0.04 * Math.exp(2),
            0.04 * Math.exp(2.5),
            0.04 * Math.exp(3),
            0.04 * Math.exp(3.5),
            0.04 * Math.exp(4),
          ].map((z) => (
            <line
              key={z}
              x1="35"
              x2="570"
              y1={py(z)}
              y2={py(z)}
              stroke="#c2bdf4"
              strokeOpacity=".11"
            />
          ))}
          {[-3, -2, -1, 0, 1, 2, 3].map((x) => (
            <g key={x}>
              <line
                x1={px(x)}
                x2={px(x)}
                y1="64"
                y2="300"
                stroke="#c2bdf4"
                strokeOpacity=".08"
              />
              <text
                x={px(x)}
                y="326"
                textAnchor="middle"
                className="geo-tick"
              >
                {x}
              </text>
            </g>
          ))}
          <line
            x1="35"
            x2="570"
            y1="64"
            y2="64"
            stroke="#ccc6ff"
            strokeWidth="2"
            strokeDasharray="3 5"
          />
          <text x="35" y="39" className="geo-caption">
            Frontera ideal z=0
          </text>
          <text x="570" y="326" className="geo-tick">
            x
          </text>
          <path
            d={`${path(points)} L${px(m.left)},${py(setup.cutoff)} Z`}
            fill={`url(#${id}-region)`}
          />
          <path
            d={path(curvePoints(reference))}
            fill="none"
            stroke="#ac98e8"
            strokeWidth="2"
            strokeDasharray="6 7"
            opacity=".75"
          />
          <line
            x1={px(m.left)}
            x2={px(m.right)}
            y1={py(setup.cutoff)}
            y2={py(setup.cutoff)}
            stroke="#f4b78c"
            strokeWidth="4"
          />
          <path
            d={path(points)}
            fill="none"
            stroke="#8cf3d9"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <line
            x1="35"
            x2="600"
            y1={py(setup.cutoff)}
            y2={py(setup.cutoff)}
            stroke="#ef9fc7"
            strokeDasharray="5 6"
            opacity=".6"
          />
          <g
            {...centerDrag}
            className="geo-handle"
            role="slider"
            tabIndex={0}
            aria-label="Mover el centro del intervalo"
            aria-valuemin={-1}
            aria-valuemax={1}
            aria-valuenow={setup.center}
            onKeyDown={(e) => {
              const v = scrubKey(e.key, setup.center, -1, 1, 0.1)
              if (v !== undefined) {
                e.preventDefault()
                onChange(settings({ ...setup, center: v }))
              }
            }}
          >
            <circle
              className="geo-hit"
              cx={px(setup.center)}
              cy={py(setup.cutoff) + 45}
            />
            <path
              d={`M${px(setup.center) - 15},${py(setup.cutoff) + 45}h30m-25-5-5 5 5 5m20-10 5 5-5 5`}
              fill="none"
              stroke="#f6caa6"
              strokeWidth="3"
            />
          </g>
          <g
            {...cutoffDrag}
            className="geo-handle geo-cutoff"
            role="slider"
            tabIndex={0}
            aria-label="Mover el corte regulador"
            aria-valuemin={MIN_CUTOFF}
            aria-valuemax={MAX_CUTOFF}
            aria-valuenow={setup.cutoff}
            onKeyDown={(e) => {
              const v = scrubKey(
                e.key,
                setup.cutoff,
                MIN_CUTOFF,
                MAX_CUTOFF,
                0.01,
              )
              if (v !== undefined) {
                e.preventDefault()
                onChange(settings({ ...setup, cutoff: v }))
              }
            }}
          >
            <line
              x1="600"
              x2="600"
              y1="82"
              y2="242"
              stroke="#ef9fc7"
              opacity=".45"
            />
            <circle className="geo-cutoff-hit" cx="600" cy={cutoffY} />
            <circle cx="600" cy={cutoffY} r="10" fill="#ef9fc7" />
            <text
              x="598"
              y="43"
              textAnchor="middle"
              className="geo-caption"
            >
              ε
            </text>
          </g>
          <Endpoint side="left" setup={setup} onChange={onChange} />
          <Endpoint side="right" setup={setup} onChange={onChange} />
          <text
            x={px(setup.center)}
            y={py(m.radius) + 30}
            textAnchor="middle"
            className="geo-caption"
          >
            Profundidad z={n(m.radius)}
          </text>
        </svg>
      ) : kind === 'geometry' ? (
        <svg
          viewBox="0 0 640 350"
          role="img"
          aria-label={`Distancia acumulada: recta ${n(m.straightLength)} L; geodésica ${n(m.length)} L. Parámetro angular en el eje horizontal, no tiempo.`}
        >
          <rect
            x="8"
            y="8"
            width="624"
            height="334"
            rx="18"
            fill="#10233a"
          />
          <text x="45" y="40" className="geo-caption">
            La regla física suma cada tramo
          </text>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <g key={t}>
              <line
                x1="70"
                x2="560"
                y1={plotY(t * maxLength)}
                y2={plotY(t * maxLength)}
                stroke="#a1b5c9"
                opacity=".14"
              />
              <text
                x="54"
                y={plotY(t * maxLength) + 5}
                textAnchor="end"
                className="geo-tick"
              >
                {n(t * maxLength, 1)}
              </text>
            </g>
          ))}
          <path
            d={`M${plotX(0)},${plotY(0)}L${plotX(1)},${plotY(m.straightLength)}`}
            stroke="#f4b78c"
            strokeWidth="4"
            fill="none"
          />
          <path
            d={points
              .map(
                (p, i) =>
                  `${i ? 'L' : 'M'}${plotX(p.progress)},${plotY(p.length)}`,
              )
              .join(' ')}
            stroke="#8cf3d9"
            strokeWidth="4"
            fill="none"
          />
          <text x="65" y="319" className="geo-tick">
            Salida A
          </text>
          <text x="555" y="319" textAnchor="end" className="geo-tick">
            Llegada B
          </text>
          <text x="320" y="341" textAnchor="middle" className="geo-tick">
            Avance del parámetro de cada camino; no tiempo
          </text>
        </svg>
      ) : (
        <svg
          viewBox="0 0 640 350"
          role="img"
          aria-label={`Intervalo de frontera: S CFT asintótica ${n(m.cft)} nats; longitud regulada dividida por 4G3 ${n(m.bulk)} nats. Diferencia ${n(m.difference, 3)}.`}
        >
          <rect
            x="8"
            y="8"
            width="624"
            height="334"
            rx="18"
            fill="#10233a"
          />
          <text x="40" y="40" className="geo-caption">
            Una región en una línea infinita
          </text>
          <line
            x1="40"
            x2="600"
            y1="85"
            y2="85"
            stroke="#9b9bbf"
            strokeWidth="2"
          />
          <line
            x1={px(m.left)}
            x2={px(m.right)}
            y1="85"
            y2="85"
            stroke="#f4b78c"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <text
            x={px(setup.center)}
            y="124"
            textAnchor="middle"
            className="geo-caption"
          >
            A · longitud ℓ={n(setup.interval)}
          </text>
          <text x="40" y="174" className="geo-caption">
            Frontera · logaritmo asintótico
          </text>
          <rect
            x="40"
            y="185"
            width={(510 * m.cft) / ENTROPY_AXIS_MAX}
            height="25"
            rx="6"
            fill="#f4b78c"
          />
          <text x="40" y="248" className="geo-caption">
            Interior · longitud regulada / 4G₃
          </text>
          <rect
            x="40"
            y="259"
            width={(510 * m.bulk) / ENTROPY_AXIS_MAX}
            height="25"
            rx="6"
            fill="#8cf3d9"
          />
          <text x="40" y="321" className="geo-tick">
            Misma escala: 0 a {ENTROPY_AXIS_MAX} nats. cCFT={CENTRAL_CHARGE}
            ; G₃={n(G3, 4)}.
          </text>
        </svg>
      )}
      <div className="geo-legend">
        <span>
          <i className="geo-a" />
          {kind === 'geometry' ? 'Recta del dibujo' : 'Frontera CFT'}
        </span>
        <span>
          <i className="geo-b" />
          {kind === 'geometry' ? 'Geodésica espacial' : 'Interior AdS'}
        </span>
        {view === 'space' && (
          <span>
            <i className="geo-ref" />
            Referencia ℓ={n(ref.interval)}
          </span>
        )}
      </div>
      <p className="geo-instruction">
        {view === 'space'
          ? 'Arrastrá A o B para agrandar. ↔ mueve el conjunto. La manija rosa cambia el corte. También podés usar Tab y las flechas.'
          : kind === 'geometry'
            ? 'Una línea más larga en la hoja puede medir menos según la métrica. El eje vertical usa longitudes físicas en unidades L.'
            : 'La barra compara dos fórmulas con el mismo corte. Acercar ε a cero reduce su diferencia; no estamos simulando una CFT microscópica.'}
      </p>
    </div>
  )
}
