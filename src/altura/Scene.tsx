import { useSvgScrub } from '../shared/useSvgScrub'
import { scrubKey } from '../shared/sceneInteraction'
import {
  chartProgress,
  satelliteProgress,
  towerHeight,
} from './interaction'
import SceneAction from '../components/ui/SceneAction'
import {
  DAY,
  R,
  heightPosition,
  heightFromPosition,
  snapshot,
} from './physics'
import type { Setup } from './physics'
import { amount, n, signed } from './format'
function Dial({
  x,
  y,
  progress,
  color,
}: {
  x: number
  y: number
  progress: number
  color: string
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="26" fill="#112c3d" stroke={color} />
      <circle
        r="21"
        fill="none"
        stroke={color}
        pathLength="100"
        strokeDasharray={`${progress * 100} 100`}
        strokeWidth="3"
        transform="rotate(-90)"
      />
      <path d="M0 0V-13M0 0H9" stroke="#e5ece3" strokeWidth="2" />
      <circle r="2" fill="#e5ece3" />
    </g>
  )
}
export default function Scene({
  setup,
  chart,
  onHeight,
  onProgress,
  onMotion,
}: {
  setup: Setup
  chart: boolean
  onHeight?: (height: number) => void
  onProgress?: (progress: number) => void
  onMotion?: () => void
}) {
  const m = snapshot(setup),
    factor = setup.mode === 'gps' ? 1e6 : 1e9,
    unit = setup.mode === 'gps' ? 'µs' : 'ns'
  const place = useSvgScrub((p) => {
    if (setup.mode === 'torre') {
      const h = towerHeight(p.y)
      if (h !== null) onHeight?.(h)
    } else {
      const f = satelliteProgress(setup, p.x, p.y)
      if (f !== null) onProgress?.(f)
    }
  })
  const plot = useSvgScrub((p) => {
    const f = chartProgress(p.x)
    if (f !== null) onProgress?.(f)
  })
  const timeKey = (e: import('react').KeyboardEvent<SVGCircleElement>) => {
    const v = scrubKey(e.key, setup.progress, 0, 1, 0.01)
    if (v !== undefined) {
      e.preventDefault()
      onProgress?.(v)
    }
  }
  if (chart) {
    const full = setup.days * DAY,
      expanded = setup.expanded
    const entries = expanded
      ? [
          { label: 'Gravedad', rate: m.gravity, color: '#e9bd8d' },
          { label: 'Movimiento', rate: m.motion, color: '#c6a5e5' },
          { label: 'Balance físico', rate: m.total, color: '#8ce2d8' },
          ...(setup.corrected
            ? [{ label: 'Lectura ajustada', rate: 0, color: '#e5e8bb' }]
            : []),
        ]
      : [
          { label: 'Referencia', rate: 1, color: '#e9bd8d' },
          { label: 'Reloj elevado', rate: 1 + m.total, color: '#8ce2d8' },
        ]
    const multiplier = expanded ? factor : 1,
      values = entries.map((e) => e.rate * full * multiplier),
      high = expanded
        ? Math.max(setup.mode === 'gps' ? 1 : 0.01, ...values) * 1.18
        : full * 1.1,
      low = expanded ? Math.min(0, ...values) * 1.18 : 0
    const px = (t: number) => 85 + (t / full) * 445,
      py = (v: number) => 315 - ((v - low) / (high - low)) * 240
    return (
      <svg
        viewBox="0 0 600 410"
        role={onHeight ? 'group' : 'img'}
        aria-label={`${expanded ? 'Diferencias ampliadas' : 'Tiempos sin ampliar'}. Desfase físico ${signed(m.physicalOffset * factor)} ${unit}, lectura ${signed(m.readoutOffset * factor)} ${unit}.`}
      >
        <defs>
          <pattern
            id="al-grid"
            width="35"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M35 0H0V30"
              stroke="#7292a5"
              fill="none"
              opacity=".15"
            />
          </pattern>
        </defs>
        <rect x="85" y="60" width="445" height="255" fill="url(#al-grid)" />
        <path
          d={`M85 60V315H540M85 ${py(0)}H540`}
          stroke="#6d91a0"
          fill="none"
        />
        <g fill="#b8d0d9" fontSize="13">
          <text x="30" y="32">
            {expanded ? `DESFASE · ${unit}` : 'TIEMPO ACUMULADO · s'}
          </text>
          <text x="360" y="350">
            tiempo de referencia · días
          </text>
          <text x="74" y="334">
            0
          </text>
          <text x="525" y="334">
            {n(setup.days)}
          </text>
          <text x="75" y={py(0) + 4} textAnchor="end">
            0
          </text>
          <text x="75" y="80" textAnchor="end">
            {amount(high)}
          </text>
          {low < 0 && (
            <text x="75" y="315" textAnchor="end">
              {amount(low)}
            </text>
          )}
        </g>
        {entries.map((e) => (
          <g key={e.label}>
            <path
              d={`M85 ${py(0)}L530 ${py(e.rate * full * multiplier)}`}
              stroke={e.color}
              fill="none"
              opacity=".22"
              strokeWidth="2"
            />
            <path
              d={`M85 ${py(0)}L${px(m.elapsed)} ${py(e.rate * m.elapsed * multiplier)}`}
              stroke={e.color}
              fill="none"
              strokeWidth="3"
            />
            <circle
              cx={px(m.elapsed)}
              cy={py(e.rate * m.elapsed * multiplier)}
              r="5"
              fill={e.color}
            />
          </g>
        ))}
        {entries.map((e, i) => (
          <text
            key={e.label}
            x={30 + (i % 2) * 270}
            y={377 + Math.floor(i / 2) * 22}
            fill={e.color}
            fontSize="13"
          >
            ━━ {e.label}
          </text>
        ))}
        {onProgress && (
          <circle
            {...plot}
            cx={px(m.elapsed)}
            cy={py(
              expanded
                ? m.total * m.elapsed * factor
                : (1 + m.total) * m.elapsed,
            )}
            r="7"
            fill="transparent"
            stroke="transparent"
            strokeWidth="44"
            vectorEffect="non-scaling-stroke"
            className="spum-object-handle"
            role="slider"
            tabIndex={0}
            aria-label="Recorrer el gráfico de los relojes"
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuenow={setup.progress}
            aria-valuetext={`${n(m.elapsed / DAY)} días de referencia`}
            onKeyDown={timeKey}
          />
        )}
      </svg>
    )
  }
  if (setup.mode === 'gps') {
    const ratio = m.radius / R,
      earthRadius = Math.min(62, 170 / ratio),
      orbit = earthRadius * ratio,
      a = m.angle - 0.8,
      x = 280 + orbit * Math.cos(a),
      y = 205 + orbit * Math.sin(a)
    return (
      <svg
        viewBox="0 0 600 410"
        role={onHeight ? 'group' : 'img'}
        aria-label={`Satélite a ${n(setup.height / 1000)} kilómetros; velocidad ${n(m.velocity)} metros por segundo. Desfase físico ${signed(m.physicalOffset * 1e6)} microsegundos.`}
      >
        <defs>
          <radialGradient id="al-earth">
            <stop stopColor="#6db9b7" />
            <stop offset=".55" stopColor="#31778b" />
            <stop offset="1" stopColor="#102d50" />
          </radialGradient>
        </defs>
        {Array.from({ length: 40 }, (_, i) => (
          <circle
            key={i}
            cx={25 + ((i * 149) % 550)}
            cy={25 + ((i * 73) % 340)}
            r={i % 7 === 0 ? 1.7 : 0.8}
            fill="#d2e9ed"
            opacity={0.15 + (i % 4) * 0.12}
          />
        ))}
        <circle
          cx="280"
          cy="205"
          r={orbit}
          fill="none"
          stroke="#74a5b5"
          strokeDasharray="3 6"
        />
        <g transform={`translate(280 205) scale(${earthRadius / 60})`}>
          <circle r="60" fill="url(#al-earth)" />
          <path
            d="M-31-42-6-36 8-18-1-4 14 9 0 33-9 29-9 9-24 2-27-12-43-19Z"
            fill="#89b896"
            opacity=".75"
          />
          <path
            d="M27-22 51-13 46 9 27 21 11 9Z"
            fill="#93bb94"
            opacity=".6"
          />
          <ellipse
            rx="57"
            ry="20"
            fill="none"
            stroke="#b2e4e0"
            opacity=".2"
          />
          <path
            d="M-45-28Q0-48 45-28M-45 28Q0 8 45 28"
            fill="none"
            stroke="#e6f4e0"
            opacity=".25"
          />
        </g>
        <path
          d={`M280 205L${x} ${y}`}
          stroke="#7499a8"
          strokeDasharray="3 7"
          opacity=".5"
        />
        <g
          transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI + 90})`}
        >
          <rect
            x="-9"
            y="-12"
            width="18"
            height="24"
            rx="3"
            fill="#dcbf83"
            stroke="#fff0bc"
          />
          <path d="M-9 0H-40M9 0H40" stroke="#b8d9e0" />
          <path
            d="M-40-13H-15V13H-40ZM15-13H40V13H15Z"
            fill="#306a90"
            stroke="#83c2d5"
          />
          <path
            d="M-30-13V13M28-13V13M-40 0H-15M15 0H40"
            stroke="#79b5c9"
            strokeWidth=".7"
          />
        </g>
        <circle
          cx={280 - earthRadius * 0.7}
          cy={205 + earthRadius * 0.7}
          r="5"
          fill="#efbf8c"
        />
        <g fill="#bcd2dc" fontSize="13">
          <text x="30" y="30">
            {setup.motion === 'circular'
              ? 'ÓRBITA CIRCULAR IDEAL'
              : setup.motion === 'quieto'
                ? 'RELOJ SOSTENIDO A ALTURA FIJA'
                : 'RAPIDEZ ELEGIDA · ALTURA FIJA'}
          </text>
          <text x="30" y="55">
            h = {n(setup.height / 1000)} km · v = {n(m.velocity / 1000)}{' '}
            km/s
          </text>
          <text x="30" y="375" fill="#efbf8c">
            ● Superficie: referencia
          </text>
          <text x="285" y="375" fill="#a1e6db">
            ● Elevado: {signed(m.physicalOffset * factor)} {unit}
          </text>
          <text x="30" y="400">
            Tierra esférica, sin rotación. Distancias relativas; encuadre
            automático.
          </text>
        </g>
        {onProgress &&
          (setup.motion === 'circular' ? (
            <circle
              {...place}
              cx={x}
              cy={y}
              r="9"
              fill="transparent"
              stroke="transparent"
              strokeWidth="44"
              vectorEffect="non-scaling-stroke"
              className="spum-object-handle"
              role="slider"
              tabIndex={0}
              aria-label="Recorrer la órbita del satélite"
              aria-valuemin={0}
              aria-valuemax={1}
              aria-valuenow={setup.progress}
              onKeyDown={timeKey}
            />
          ) : (
            onMotion && (
              <SceneAction
                x={x}
                y={y}
                label="Poner el reloj en órbita circular"
                onActivate={onMotion}
              />
            )
          ))}
      </svg>
    )
  }
  const rise = heightPosition(setup.height) * 2.6,
    upper = 310 - rise
  return (
    <svg
      viewBox="0 0 600 410"
      role={onHeight ? 'group' : 'img'}
      aria-label={`Reloj elevado a ${n(setup.height)} metros; desfase ${signed(m.physicalOffset * 1e9)} nanosegundos. Altura dibujada en escala logarítmica.`}
    >
      <defs>
        <linearGradient id="al-sky" x2="0" y2="1">
          <stop stopColor="#183b51" />
          <stop offset="1" stopColor="#0f2936" />
        </linearGradient>
      </defs>
      <rect
        x="30"
        y="35"
        width="540"
        height="305"
        rx="12"
        fill="url(#al-sky)"
      />
      <g fill="#85b3c4" opacity=".14">
        <ellipse cx="120" cy="90" rx="59" ry="11" />
        <ellipse cx="270" cy="55" rx="43" ry="8" />
      </g>
      <path
        d="M30 340 90 322 145 334 225 319 290 333 360 324 430 337 510 320 570 340V355H30Z"
        fill="#3b675f"
      />
      <path
        d={`M380 340V${upper + 30}H420V340M380 ${upper + 30}H420M380 339 420 ${upper + 30}M420 339 380 ${upper + 30}`}
        stroke="#6c929e"
        fill="none"
      />
      <path
        d={`M170 310H470M400 ${upper}H470M470 310V${upper}`}
        stroke="#90b9c3"
        strokeDasharray="4 5"
      />
      <Dial x={170} y={310} progress={setup.progress} color="#efbf8c" />
      <Dial x={400} y={upper} progress={setup.progress} color="#9ce6da" />
      <g fontSize="20" textAnchor="middle">
        <text x="170" y="277" fill="#efbf8c">
          Referencia
        </text>
        <text
          x="400"
          y={upper < 90 ? upper + 48 : upper - 35}
          fill="#a6ece0"
        >
          {n(setup.height)} m
        </text>
        <text x="170" y="378" fill="#efbf8c">
          0 ns
        </text>
        <text x="400" y="378" fill="#a6ece0">
          {signed(m.physicalOffset * 1e9)} ns
        </text>
      </g>
      {onHeight && (
        <>
          <circle
            cx="400"
            cy={upper}
            r="33"
            fill="none"
            stroke="#a6ece0"
            strokeDasharray="3 5"
          />
          <circle
            {...place}
            cx="400"
            cy={upper}
            r="10"
            fill="transparent"
            stroke="transparent"
            strokeWidth="44"
            vectorEffect="non-scaling-stroke"
            className="spum-object-handle"
            role="slider"
            tabIndex={0}
            aria-label="Subir o bajar el reloj"
            aria-valuemin={0}
            aria-valuemax={4000}
            aria-valuenow={setup.height}
            aria-valuetext={`${n(setup.height)} metros, escala logarítmica`}
            onKeyDown={(e) => {
              const v = scrubKey(
                e.key,
                heightPosition(setup.height),
                0,
                100,
                1,
              )
              if (v !== undefined) {
                e.preventDefault()
                onHeight(Math.max(0, Math.min(4000, heightFromPosition(v))))
              }
            }}
          />
        </>
      )}
      <text x="30" y="402" fill="#a9c7d3" fontSize="12">
        Altura en escala logarítmica. Aros: avance del ensayo, no desfase.
      </text>
    </svg>
  )
}
