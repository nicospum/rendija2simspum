import { HEIGHT, light, snapshot } from './physics'
import type { Setup } from './physics'
import { n } from './format'
export default function Scene({
  setup,
  outside,
}: {
  setup: Setup
  outside: boolean
}) {
  const m = snapshot(setup)
  if (setup.instrument === 'luz') {
    const unit = setup.zoom ? 1e-15 : 1,
      scale = 110 / Math.max(1, m.light.fullDrop / unit),
      x = (f: number) => 80 + 420 * f,
      y = (metres: number) => 170 - (metres / unit) * scale
    const path = (end: number, cabin = false) =>
      Array.from({ length: 51 }, (_, i) => {
        const f = (end * i) / 50,
          p = light(setup, f)
        return `${x(f)},${y(cabin ? p.cabinY : outside ? 0 : p.insideY)}`
      }).join(' ')
    return (
      <svg
        viewBox="0 0 580 410"
        role="img"
        aria-label={`${outside ? 'Referencia libre local' : 'Cabina'}: desvío interior ${n(m.light.drop * 1e15)} femtómetros, pulso en ${n(setup.progress * 100, 0)} por ciento del ancho. Escala vertical ${setup.zoom ? 'ampliada en femtómetros' : 'en metros, sin ampliar'}.`}
      >
        <defs>
          <pattern
            id={`as-light-grid-${outside}`}
            width="35"
            height="35"
            patternUnits="userSpaceOnUse"
          >
            <path d="M35 0H0V35" fill="none" stroke="#658394" opacity=".15" />
          </pattern>
        </defs>
        <rect
          x="60"
          y="45"
          width="480"
          height="280"
          fill={`url(#as-light-grid-${outside})`}
        />
        <path
          d="M80 50V325M80 170H520m-8-5 8 5-8 5"
          stroke="#7996a5"
          fill="none"
        />
        <g fill="#b7d0da" fontSize="13">
          <text x="30" y="30">
            ALTURA · {setup.zoom ? 'FEMTÓMETROS' : 'METROS'}
          </text>
          <text x="328" y="355">
            distancia horizontal · m
          </text>
          <text x="56" y="175">
            0
          </text>
          <text x="80" y="347">
            0
          </text>
          <text x="495" y="347">
            {n(setup.width)}
          </text>
          <text x="31" y={y(unit) + 5}>
            +1
          </text>
          <text x="31" y={y(-unit) + 5}>
            −1
          </text>
        </g>
        <polyline
          points={path(1)}
          fill="none"
          stroke="#f1d68d"
          strokeWidth="2"
          opacity=".25"
        />
        <polyline
          points={path(setup.progress)}
          fill="none"
          stroke="#ffe4a0"
          strokeWidth="3"
        />
        {outside && (
          <>
            <polyline
              points={path(1, true)}
              fill="none"
              stroke="#92dfd7"
              strokeDasharray="5 4"
              opacity=".4"
            />
            <polyline
              points={path(setup.progress, true)}
              fill="none"
              stroke="#92dfd7"
              strokeWidth="2"
            />
            <circle
              cx={x(setup.progress)}
              cy={y(m.light.cabinY)}
              r="5"
              fill="#92dfd7"
            />
          </>
        )}
        <circle
          cx={x(setup.progress)}
          cy={y(outside ? 0 : m.light.insideY)}
          r="11"
          fill="#ffe4a0"
          opacity=".12"
        />
        <circle
          cx={x(setup.progress)}
          cy={y(outside ? 0 : m.light.insideY)}
          r="5"
          fill="#ffe4a0"
        />
        <g fontSize="12">
          <text x="310" y="65" fill="#ffe4a0">
            ━━ Pulso de luz
          </text>
          {outside && (
            <text x="310" y="88" fill="#92dfd7">
              ┄ Nivel emisor de la cabina
            </text>
          )}
          <text x="30" y="388" fill="#98d9d3">
            {setup.zoom
              ? 'ESCALA VERTICAL AMPLIADA · 1 fm = 10⁻¹⁵ m'
              : 'ESCALA EN METROS · EL DESVÍO ES IMPERCEPTIBLE'}
          </text>
        </g>
      </svg>
    )
  }
  const endDisplacement = 0.5 * m.cabinAcceleration * m.duration * m.duration,
    min = Math.min(0, endDisplacement) - 0.25,
    max = Math.max(3.3, endDisplacement + 3.3),
    scale = outside ? 250 / (max - min) : 75
  const y = (worldY: number) =>
    outside ? 340 - (worldY - min) * scale : 340 - worldY * scale
  const floor = outside ? m.cabinY : 0,
    ball = outside ? m.ballWorldY : m.ballY,
    top = y(floor + 3.15),
    bottom = y(floor)
  return (
    <svg
      viewBox="120 40 400 335"
      role="img"
      aria-label={`${outside ? 'Exterior' : 'Interior'}: altura relativa de ambas pelotas ${n(m.ballY)} metros, balanza ${n(m.normal)} newtons. Cabina desplazada ${n(m.cabinY)} metros en la referencia exterior.`}
    >
      <defs>
        <linearGradient id={`as-cabin-${outside}`} x2="0" y2="1">
          <stop stopColor="#183f50" />
          <stop offset="1" stopColor="#102a3b" />
        </linearGradient>
      </defs>
      {outside && (
        <>
          <g stroke="#426072" opacity=".35">
            {[100, 180, 260, 340].map((yy) => (
              <path key={yy} d={`M45 ${yy}H535`} />
            ))}
          </g>
          <rect
            x="155"
            y={y(3.15)}
            width="260"
            height={3.15 * scale}
            fill="none"
            stroke="#7b9aa6"
            strokeDasharray="4 6"
            opacity=".5"
          />
        </>
      )}
      {setup.scenario === 'suelo' && (
        <path d={`M285 35V${top}`} stroke="#94aeb8" strokeWidth="3" />
      )}
      <rect
        x="155"
        y={top}
        width="260"
        height={bottom - top}
        rx="12"
        fill={`url(#as-cabin-${outside})`}
        stroke="#84babf"
        strokeWidth="2"
      />
      <path d={`M155 ${bottom}H415`} stroke="#bedbdc" strokeWidth="6" />
      <path
        d={`M175 ${top + 12}V${bottom - 12}M395 ${top + 12}V${bottom - 12}`}
        stroke="#456576"
      />
      {[230, 300].map((xx, i) => (
        <g key={xx}>
          <path
            d={`M${xx} ${y(floor + HEIGHT)}V${y(ball)}`}
            stroke={i ? '#9ae5da' : '#eeba83'}
            opacity=".5"
            strokeDasharray="3 5"
          />
          <circle
            cx={xx}
            cy={y(floor + HEIGHT) - 9}
            r="9"
            fill="none"
            stroke={i ? '#9ae5da' : '#eeba83'}
            strokeDasharray="2 3"
            opacity=".5"
          />
          <circle
            cx={xx}
            cy={y(ball) - 10}
            r="10"
            fill={i ? '#9ae5da' : '#eeba83'}
          />
          <text
            x={xx}
            y={y(ball) - 28}
            textAnchor="middle"
            fill={i ? '#b2eee5' : '#f0c69d'}
            fontSize="13"
          >
            {i ? `${n(setup.mass)} kg` : '1 kg'}
          </text>
        </g>
      ))}
      <rect
        x="337"
        y={bottom - 13}
        width="53"
        height="10"
        rx="3"
        fill="#74949f"
      />
      <rect
        x="354"
        y={bottom - 34}
        width="20"
        height="19"
        rx="3"
        fill="#c1dee1"
      />
      <text
        x="364"
        y={bottom + 24}
        textAnchor="middle"
        fill="#9ae5da"
        fontSize="12"
      >
        Balanza
      </text>
      {m.proper > 0 && (
        <g>
          <path
            d={`M440 ${bottom - 25}v-75m-5 8 5-8 5 8`}
            fill="none"
            stroke="#9ae5da"
            strokeWidth="2"
          />
          <text x="450" y={bottom - 80} fill="#9ae5da" fontSize="12">
            Apoyo
          </text>
        </g>
      )}
      {setup.scenario === 'cohete' && (
        <>
          <path
            d={`M260 ${bottom + 6}l25 20 25-20`}
            fill="#f3ba85"
            opacity=".8"
          />
          <text x="450" y={bottom + 24} fill="#f3ba85" fontSize="12">
            Motor ↑
          </text>
        </>
      )}
      {setup.scenario === 'caida' && outside && (
        <path
          d="M480 110v70m-6-8 6 8 6-8"
          fill="none"
          stroke="#efbc89"
          strokeWidth="3"
        />
      )}
    </svg>
  )
}
