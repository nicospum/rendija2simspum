import { eventAt, snapshot } from './physics'
import type { Setup } from './physics'
import { n } from './format'
export default function Scene({
  setup,
  kind,
  signals,
}: {
  setup: Setup
  kind: 'trip' | 'diagram'
  signals: boolean
}) {
  const m = snapshot(setup),
    // Each segment is exactly straight: include the joints, without sampling across them.
    past = [...new Set([0, m.out, m.leave, m.t])]
      .filter((t) => t <= m.t)
      .sort((a, b) => a - b)
      .map((t) => eventAt(setup, t))
  const earth = 105,
    scale = 270 / setup.duration,
    x = (value: number) => earth + value * scale,
    y = (t: number) => 345 - t * scale
  if (kind === 'diagram')
    return (
      <svg
        viewBox="0 0 580 400"
        role="img"
        aria-label={`Espacio-tiempo en el sistema de casa. Casa acumula ${n(m.t)} años y nave ${n(m.own)}. Ahora remoto asignado: ${n(m.assignedEarth)} años.`}
      >
        <defs>
          <pattern
            id="gv-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path d="M24 0H0V24" fill="none" stroke="#5d91a0" opacity=".1" />
          </pattern>
        </defs>
        <rect x="60" y="45" width="475" height="320" fill="url(#gv-grid)" />
        <g stroke="#628899" fill="none">
          <path d="M70 345H535m-8-5 8 5-8 5M105 365V45m-5 8 5-8 5 8" />
        </g>
        <g fill="#b2cbd4" fontSize="13">
          <text x="111" y="40">
            tiempo en casa · años
          </text>
          <text x="336" y="382">
            distancia · años luz →
          </text>
          <text x="76" y="350">
            0
          </text>
          <text x="59" y={y(setup.duration) + 5}>
            {n(setup.duration)}
          </text>
          <text x="385" y="335">
            c = 1 al/año
          </text>
          <text x={x(setup.duration / 2)} y="365" textAnchor="middle">
            {n(setup.duration / 2)}
          </text>
        </g>
        <path
          d={`M${earth} 345V${y(setup.duration)}`}
          stroke="#f2bd8c"
          strokeWidth="4"
          opacity=".3"
        />
        <path
          d={`M${earth} 345L${x(m.distance)} ${y(m.out)}V${y(m.leave)}L${earth} ${y(setup.duration)}`}
          stroke="#8ee5da"
          strokeWidth="3"
          fill="none"
          opacity=".3"
        />
        <path d={`M${earth} 345V${y(m.t)}`} stroke="#f2bd8c" strokeWidth="4" />
        <polyline
          points={past.map((p) => `${x(p.x)},${y(p.t)}`).join(' ')}
          stroke="#a1f1df"
          strokeWidth="4"
          fill="none"
        />
        <path
          d={`M${earth} ${y(m.t)}H${x(m.x)}`}
          stroke="#8baaba"
          strokeDasharray="3 5"
        />
        <path
          d={`M${earth} ${y(m.assignedEarth)}L${x(m.x)} ${y(m.t)}`}
          stroke="#eab4de"
          strokeWidth="2"
          strokeDasharray="6 4"
        />
        {signals && (
          <path
            d={`M${x(m.received.x)} ${y(m.received.t)}L${earth} ${y(m.t)}`}
            stroke="#f1df9c"
            strokeWidth="2"
            strokeDasharray="3 4"
          />
        )}
        <circle cx={earth} cy={y(m.t)} r="6" fill="#f2bd8c" />
        <circle
          cx={x(m.x)}
          cy={y(m.t)}
          r="7"
          fill="#a1f1df"
          stroke="#163c48"
          strokeWidth="3"
        />
        <circle cx={earth} cy={y(m.assignedEarth)} r="5" fill="#eab4de" />
        <g fill="#c2d8df" fontSize="13">
          <text x={x(m.distance) + 14} y={y(m.out) + 5}>
            {m.stop > 0 ? `Espera · ${n(m.stop)} años` : 'Cambio de rumbo'}
          </text>
          <text x={earth + 14} y={y(setup.duration) - 14}>
            Reencuentro
          </text>
          <text x="117" y="369">
            Salida
          </text>
        </g>
        <g fontSize="12">
          <text x="358" y="105" fill="#f2bd8c">
            ━━ Casa
          </text>
          <text x="358" y="130" fill="#a1f1df">
            ━━ Nave
          </text>
          <text x="358" y="155" fill="#eab4de">
            ┄ Ahora comóvil
          </text>
          {signals && (
            <text x="358" y="180" fill="#f1df9c">
              ┄ Mensaje que llega
            </text>
          )}
        </g>
      </svg>
    )
  const mapX = (distance: number) =>
      75 + (distance / (setup.duration * 0.5)) * 400,
    sx = mapX(m.x),
    end = mapX(m.distance),
    direction = m.velocity < 0 ? -1 : 1,
    homeRadius = Math.min(31, (end - 75) / 2.5),
    destinationRadius = Math.min(25, (end - 75) / 3)
  return (
    <svg
      viewBox="0 0 580 400"
      role="img"
      aria-label={`Viaje en el sistema de casa: ${m.phase}. Nave a ${n(m.x)} años luz de casa. Distancia máxima ${n(m.distance)} años luz.`}
    >
      <defs>
        <radialGradient id="gv-earth">
          <stop stopColor="#79d2d2" />
          <stop offset="1" stopColor="#234768" />
        </radialGradient>
        <linearGradient id="gv-route">
          <stop stopColor="#f1ba8b" />
          <stop offset="1" stopColor="#9ee9df" />
        </linearGradient>
      </defs>
      {Array.from({ length: 36 }, (_, i) => (
        <circle
          key={i}
          cx={25 + ((i * 137) % 530)}
          cy={35 + ((i * 79) % 265)}
          r={i % 5 === 0 ? 1.8 : 0.8}
          fill="#b9d9e4"
          opacity={0.15 + (i % 4) * 0.1}
        />
      ))}
      <path
        d={`M75 175H${end}M${end} 210H75`}
        stroke="url(#gv-route)"
        strokeWidth="2"
        fill="none"
        opacity=".45"
      />
      <path
        d={`M${end - 8} 170l8 5-8 5M83 205l-8 5 8 5`}
        stroke="#94c6c9"
        fill="none"
      />
      <g transform={`translate(75 192) scale(${homeRadius / 31})`}>
        <circle r="31" fill="url(#gv-earth)" />
        <path
          d="m-13-21 15 4 5 10-9 8 3 17-11 6-8-21Z"
          fill="#91c49c"
          opacity=".65"
        />
      </g>
      <circle
        cx={end}
        cy="192"
        r={destinationRadius}
        fill="none"
        stroke="#648f9e"
        strokeDasharray="3 5"
      />
      <path d={`M${end} 177v30m-9-15h18`} stroke="#8dbac4" />
      {end < 195 && (
        <path d={`M${end} 223V237H195V244`} fill="none" stroke="#648f9e" />
      )}
      <text x="75" y="258" textAnchor="middle" fill="#f2bd8c" fontSize="15">
        Casa
      </text>
      <text
        x={Math.max(195, end)}
        y="258"
        textAnchor="middle"
        fill="#b8d6df"
        fontSize="14"
      >
        Destino · {n(m.distance)} al
      </text>
      <g transform={`translate(${sx},${m.velocity < 0 ? 210 : 145})`}>
        <ellipse rx="29" ry="29" fill="#98e8dc" opacity=".07" />
        <g transform={`scale(${direction},1)`}>
          <path
            d="M-22-10H9L29 0 9 10H-22l-7-10Z"
            fill="#c5efdf"
            stroke="#effff5"
          />
          <path d="M-19-6H5V6H-19Z" fill="#28677a" />
          {m.velocity !== 0 && <path d="m-29-5-17 5 17 5" fill="#f1b17e" />}
        </g>
      </g>
      <g fill="#a4c7d2" fontSize="13">
        <text x="32" y="54">
          SISTEMA INERCIAL DE CASA
        </text>
        <text x="32" y="80">
          {m.phase} · v = {n(m.velocity)} c
        </text>
        <text x="32" y="310">
          Distancia actual: {n(m.x)} años luz
        </text>
        <text x="32" y="337">
          Unidades físicas; viaje muy ralentizado
        </text>
      </g>
      <rect x="32" y="362" width="516" height="3" rx="2" fill="#304c5b" />
      <rect
        x="32"
        y="362"
        width={516 * setup.progress}
        height="3"
        rx="2"
        fill="#9ee9df"
      />
    </svg>
  )
}
