import { useId } from 'react'
import { gamma, MIRROR_DISTANCE, snapshot } from './physics'
import type { Frame, Setup } from './physics'

const n = (v: number, digits = 3) =>
  v.toLocaleString('es-AR', { maximumFractionDigits: digits })
export default function Scene({
  setup,
  frame,
  guide,
}: {
  setup: Setup
  frame: Frame
  guide: boolean
}) {
  const id = useId().replace(/:/g, '')
  const m = snapshot(setup, frame)
  // Both panels use the same spatial scale. Fit one complete round trip at every supported speed.
  const travel = 2 * gamma(setup.beta) * setup.beta * MIRROR_DISTANCE
  const scale = Math.min(1.18, 380 / Math.max(travel, 1))
  const origin = m.moving ? (m.beta >= 0 ? 70 : 450) : 260
  const px = (x: number) => origin + x * scale
  const py = (y: number) => 264 - y * scale
  const [start, reflection, end] = m.events
  const path = `${px(start.x)},${py(start.y)} ${px(reflection.x)},${py(reflection.y)} ${px(end.x)},${py(end.y)}`
  const elapsed =
    setup.fraction <= 0.5
      ? `${px(start.x)},${py(0)} ${px(m.point.x)},${py(m.point.y)}`
      : `${px(start.x)},${py(0)} ${px(reflection.x)},${py(reflection.y)} ${px(m.point.x)},${py(m.point.y)}`
  const color = frame === 'nave' ? '#89e3dd' : '#f3bb86'
  const clock = px(m.point.x)
  return (
    <>
      <svg
        viewBox="0 0 520 340"
        role="img"
        aria-label={`Reloj de la ${setup.follow === 'nave' ? 'nave' : 'estación'} desde la ${frame === 'nave' ? 'nave' : 'estación'}. Trayecto ${m.moving && setup.beta > 0 ? 'diagonal' : 'vertical'}, tiempo asignado ${n(m.point.t * 1e6)} microsegundos. La luz viaja a c.`}
      >
        <defs>
          <pattern
            id={`${id}-grid`}
            width="26"
            height="26"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M26 0H0V26"
              fill="none"
              stroke="#a9cbd51c"
              strokeWidth=".8"
            />
          </pattern>
          <radialGradient id={`${id}-glow`}>
            <stop stopColor={color} stopOpacity=".16" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <filter
            id={`${id}-light`}
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <rect width="520" height="340" fill={`url(#${id}-grid)`} />
        <ellipse
          cx="260"
          cy="200"
          rx="240"
          ry="170"
          fill={`url(#${id}-glow)`}
        />
        <path d="M30 291H490" stroke="#496174" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${70 + i * 76} 286v10`} stroke="#617788" />
        ))}
        <text
          x="30"
          y="320"
          fill="#b6cbd5"
          fontSize="15"
          fontFamily="monospace"
        >
          x → · escala {n(76 / scale, 0)} m / división
        </text>
        {guide && (
          <>
            {m.events.map((e, i) => (
              <g key={i} opacity=".22" stroke={color}>
                <path
                  d={`M${px(e.x) - 15} ${py(0)}h30M${px(e.x) - 15} ${py(MIRROR_DISTANCE)}h30`}
                  strokeWidth="4"
                />
                <path
                  d={`M${px(e.x)} ${py(0)}V${py(MIRROR_DISTANCE)}`}
                  strokeDasharray="3 6"
                />
              </g>
            ))}
            <polyline
              points={path}
              stroke={color}
              strokeWidth="2"
              strokeDasharray="6 7"
              fill="none"
              opacity=".45"
            />
          </>
        )}
        <polyline
          points={elapsed}
          stroke={color}
          strokeWidth="9"
          opacity=".16"
          fill="none"
        />
        <polyline
          points={elapsed}
          stroke={color}
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d={`M${clock - 24} ${py(0) + 7}h48M${clock - 24} ${py(MIRROR_DISTANCE) - 7}h48`}
          stroke={color}
          strokeWidth="2"
          opacity=".5"
        />
        <path
          d={`M${clock - 24} ${py(0)}h48M${clock - 24} ${py(MIRROR_DISTANCE)}h48`}
          stroke={color}
          strokeWidth="5"
        />
        <path
          d={`M${clock + 36} ${py(0)}V${py(MIRROR_DISTANCE)}m-4 0h8m-8 ${MIRROR_DISTANCE * scale}h8`}
          stroke="#b6cbd5"
          opacity=".65"
        />
        <circle
          cx={clock}
          cy={py(m.point.y)}
          r="12"
          fill={color}
          filter={`url(#${id}-light)`}
        />
        <circle
          cx={clock}
          cy={py(m.point.y)}
          r="5"
          fill="#fff6df"
          stroke={color}
          strokeWidth="2"
        />
        {m.moving && setup.beta > 0 && (
          <path
            d={
              m.beta > 0
                ? `M${clock - 22} 52h44m-7-6 7 6-7 6`
                : `M${clock + 22} 52h-44m7-6-7 6 7 6`
            }
            stroke={color}
            fill="none"
            strokeWidth="2"
          />
        )}
      </svg>
      <div className="rl-frame-facts">
        <span>
          <small>Tiempo asignado aquí</small>
          <strong>
            {n(m.point.t * 1e6)} <em>µs</em>
          </strong>
        </span>
        <span>
          <small>Camino del tic completo</small>
          <strong>
            {n(m.pathLength, 1)} <em>m</em>
          </strong>
        </span>
      </div>
      <p className="rl-frame-caption">
        {m.moving && setup.beta > 0
          ? 'Los espejos se desplazan mientras la luz va y vuelve.'
          : 'El reloj seguido está en reposo: la luz sube y baja.'}{' '}
        Separación: 150 m. Luz: c.
      </p>
    </>
  )
}
