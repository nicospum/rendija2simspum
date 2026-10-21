import { useId } from 'react'
import { measurement, snapshot } from './physics'
import type { Frame, Setup } from './physics'
const n = (v: number, digits = 3) =>
  (Math.abs(v) < 0.5 * 10 ** -digits ? 0 : v).toLocaleString('es-AR', {
    maximumFractionDigits: digits,
  })
function limits(s: Setup, frame: Frame, sample: Setup | null) {
  const m = snapshot(s, frame),
    points = [
      m.trainCenter - m.length / 2,
      m.trainCenter + m.length / 2,
      m.platformCenter,
      m.passengerCenter,
      ...m.pulses.map((p) => p.emission.x),
      ...m.pulses.filter((p) => p.active).map((p) => p.x),
    ]
  if (sample) points.push(...measurement(sample, frame).events.map((e) => e.x))
  return { min: Math.min(...points), max: Math.max(...points) }
}
export default function Scene({
  setup,
  frame,
  sample,
}: {
  setup: Setup
  frame: Frame
  sample: Setup | null
}) {
  const id = useId().replace(/:/g, ''),
    m = snapshot(setup, frame),
    own = limits(setup, frame, sample)
  const other = limits(setup, frame === 'anden' ? 'tren' : 'anden', sample)
  const span =
    Math.max(own.max - own.min, other.max - other.min) + setup.length * 0.4
  const scale = Math.min(1.1, 500 / span),
    center = (own.max + own.min) / 2
  const x = (position: number) => 300 + (position - center) * scale
  const left = x(m.trainCenter - m.length / 2),
    right = x(m.trainCenter + m.length / 2),
    width = right - left
  const recorded = sample ? measurement(sample, frame) : null
  const color = frame === 'anden' ? '#f3bb86' : '#89e3dd'
  return (
    <svg
      viewBox="0 0 600 330"
      role="img"
      aria-label={`Tren desde el ${frame === 'anden' ? 'andén' : 'vagón'}. Longitud instantánea ${n(m.length, 1)} metros. Tiempo de este sistema ${n(m.time * 1e6)} microsegundos. ${m.pulses.filter((p) => p.received).length} señales recibidas aquí.`}
    >
      <defs>
        <pattern
          id={`${id}-grid`}
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M30 0H0V30"
            fill="none"
            stroke="#b3d6d31c"
            strokeWidth=".8"
          />
        </pattern>
        <linearGradient id={`${id}-body`} x2="0" y2="1">
          <stop stopColor="#315c71" stopOpacity=".9" />
          <stop offset="1" stopColor="#102735" stopOpacity=".75" />
        </linearGradient>
        <filter
          id={`${id}-glow`}
          x="-150%"
          y="-150%"
          width="400%"
          height="400%"
        >
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <rect width="600" height="330" fill={`url(#${id}-grid)`} />
      {Array.from({ length: 16 }, (_, i) => (
        <path
          key={i}
          d={`M${i * 40} 215l18 22`}
          stroke="#54768a"
          strokeWidth="3"
          opacity=".5"
        />
      ))}
      <path d="M0 214H600M0 229H600" stroke="#7296a6" strokeWidth="2" />
      <rect
        x={left}
        y="105"
        width={width}
        height="84"
        rx="15"
        fill={`url(#${id}-body)`}
        stroke="#a0d5db"
        strokeWidth="1.5"
      />
      <path
        d={`M${left + 8} 178H${right - 8}`}
        stroke="#87dcd4"
        strokeWidth="3"
        opacity=".7"
      />
      {[0.15, 0.38, 0.62, 0.85].map((f) => (
        <g key={f}>
          <rect
            x={left + width * f - width * 0.065}
            y="119"
            width={width * 0.13}
            height="24"
            rx="4"
            fill="#9ceee2"
            opacity=".28"
          />
          <circle
            cx={left + width * f}
            cy="202"
            r="8"
            fill="#0a1522"
            stroke="#7799aa"
            strokeWidth="2"
          />
        </g>
      ))}
      <path d={`M${left} 92v-8H${right}v8`} stroke="#a1e4df" fill="none" />
      <text
        x={Math.max(150, Math.min(450, (left + right) / 2))}
        y="72"
        fill="#d1ece8"
        fontSize="16"
        textAnchor="middle"
      >
        {n(m.length, 1)} m · longitud simultánea
      </text>
      {recorded && (
        <g stroke={recorded.valid ? '#adedd9' : '#f7bb85'}>
          <path
            d={`M${x(recorded.events[0].x)} 45v-13H${x(recorded.events[1].x)}v13`}
            fill="none"
            strokeWidth="2"
            strokeDasharray={recorded.valid ? undefined : '5 4'}
          />
          <text
            x={Math.max(
              150,
              Math.min(
                450,
                (x(recorded.events[0].x) + x(recorded.events[1].x)) / 2,
              ),
            )}
            y="21"
            fill="currentColor"
            stroke="none"
            fontSize="14"
            textAnchor="middle"
          >
            Marcas guardadas · {n(recorded.distance, 1)} m
          </text>
        </g>
      )}
      {m.pulses.map((p, i) => {
        const tint = i === 0 ? '#f5c77d' : '#e8a8bd'
        return (
          <g key={p.label}>
            <path
              d={`M${x(p.emission.x)} 101V192`}
              stroke={tint}
              strokeDasharray="3 5"
              opacity=".45"
            />
            <circle
              cx={x(p.emission.x)}
              cy="100"
              r={p.emitted ? 6 : 4}
              fill={p.emitted ? tint : '#122432'}
              stroke={tint}
            />
            <text
              x={x(p.emission.x)}
              y="89"
              fill={tint}
              fontSize="16"
              textAnchor="middle"
            >
              {p.label}
            </text>
            {p.active && (
              <>
                <path
                  d={`M${x(p.emission.x)} 155H${x(p.x)}`}
                  stroke={tint}
                  strokeWidth="2"
                  opacity=".65"
                />
                <circle
                  cx={x(p.x)}
                  cy="155"
                  r="12"
                  fill={tint}
                  filter={`url(#${id}-glow)`}
                />
                <circle cx={x(p.x)} cy="155" r="5" fill="#fff8e4" />
                <text
                  x={x(p.x)}
                  y="177"
                  fill={tint}
                  fontSize="13"
                  textAnchor="middle"
                >
                  {p.label} {p.side === -1 ? '→' : '←'}
                </text>
              </>
            )}
          </g>
        )
      })}
      <g stroke="#91e4db" fill="none">
        <circle cx={x(m.passengerCenter)} cy="155" r="9" />
        <path d={`M${x(m.passengerCenter)} 165v83`} strokeDasharray="3 5" />
      </g>
      <g stroke="#f3bb86" fill="none">
        <circle cx={x(m.platformCenter)} cy="155" r="13" />
        <path d={`M${x(m.platformCenter)} 168v103`} strokeDasharray="3 5" />
      </g>
      <text
        x={x(m.passengerCenter)}
        y="264"
        fill="#a7eee3"
        fontSize="15"
        textAnchor="middle"
      >
        P · pasajero
      </text>
      <text
        x={x(m.platformCenter)}
        y="291"
        fill="#f3c89b"
        fontSize="15"
        textAnchor="middle"
      >
        E · andén
      </text>
      <path d="M25 309H575" stroke="#58788a" />
      <text x="25" y="327" fill="#a8c5d1" fontSize="12">
        x → · {n(100 / scale, 0)} m por 100 unidades gráficas · misma escala
        entre paneles
      </text>
      {setup.beta !== 0 && (
        <path
          d={
            (frame === 'anden' ? 1 : -1) * setup.beta > 0
              ? 'M510 58h50m-7-6 7 6-7 6'
              : 'M560 58h-50m7-6-7 6 7 6'
          }
          stroke={color}
          strokeWidth="2"
          fill="none"
        />
      )}
    </svg>
  )
}
