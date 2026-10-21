import { useId, useMemo } from 'react'
import { ARCSEC, AU, CYCLES, gainFor, point } from './physics'
import type { Orbit } from './physics'
const n = (v: number, d = 2) =>
  v.toLocaleString('es-AR', {
    maximumFractionDigits: d,
    minimumFractionDigits: d,
  })
export default function Scene({
  orbit,
  progress,
  relativistic,
  expanded,
}: {
  orbit: Orbit
  progress: number
  relativistic: boolean
  expanded: boolean
}) {
  const id = useId().replace(/:/g, ''),
    gain = gainFor({ ...orbit.setup, expanded }),
    scale = 211 / orbit.aphelion
  const xy = (x: number, y: number) =>
    `${(300 + x * scale).toFixed(2)},${(252 - y * scale).toFixed(2)}`
  const paths = useMemo(
    () =>
      Array.from({ length: CYCLES }, (_, cycle) =>
        Array.from({ length: 161 }, (_, j) => {
          const p = point(orbit, cycle + j / 160, relativistic, gain)
          return `${j ? 'L' : 'M'}${(300 + p.x * scale).toFixed(2)},${(252 - p.y * scale).toFixed(2)}`
        }).join(' '),
      ),
    [orbit, relativistic, gain, scale],
  )
  const cycles = progress * CYCLES,
    whole = Math.floor(cycles),
    planet = point(orbit, cycles, relativistic, gain),
    peri = point(orbit, whole, relativistic, gain)
  const liveCount = Math.max(2, Math.ceil((cycles - whole) * 160) + 1)
  const live = Array.from({ length: liveCount }, (_, j) => {
    const p = point(
      orbit,
      whole + ((cycles - whole) * j) / (liveCount - 1),
      relativistic,
      gain,
    )
    return `${j ? 'L' : 'M'}${xy(p.x, p.y)}`
  }).join(' ')
  const color = relativistic ? '#edb77d' : '#7ccecf'
  return (
    <svg
      className="or-scene"
      viewBox="0 0 600 520"
      role="img"
      aria-label={`${relativistic ? 'Einstein: perihelio que avanza' : 'Newton: elipse que se cierra'}. ${n(cycles)} vueltas radiales exploradas. Giro físico acumulado ${n(planet.advance * ARCSEC, 4)} segundos de arco. ${relativistic && expanded ? 'Giro ampliado cien mil veces.' : 'Giro sin ampliar.'}`}
    >
      <defs>
        <radialGradient id={`${id}-space`}>
          <stop stopColor="#1b3443" />
          <stop offset="1" stopColor="#091724" />
        </radialGradient>
        <radialGradient id={`${id}-sun`}>
          <stop stopColor="#fff8dc" />
          <stop offset=".48" stopColor="#ffcf78" />
          <stop offset="1" stopColor="#d88040" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="600" height="520" fill={`url(#${id}-space)`} />
      {Array.from({ length: 65 }, (_, i) => (
        <circle
          key={i}
          cx={(i * 137 + 29) % 600}
          cy={(i * 89 + 17) % 500}
          r={i % 7 === 0 ? 1.4 : 0.7}
          fill="#adc6d2"
          opacity={0.15 + (i % 4) * 0.1}
        />
      ))}
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <circle
          key={r}
          cx="300"
          cy="252"
          r={211 * r}
          fill="none"
          stroke="#678798"
          strokeOpacity=".14"
        />
      ))}
      <path
        d="M65 252H535M300 30V474"
        stroke="#7798aa"
        strokeOpacity=".18"
        strokeDasharray="3 9"
      />
      <path
        d={`M300 252 ${xy(orbit.perihelion, 0)}`}
        fill="none"
        stroke="#76919d"
        strokeDasharray="4 6"
      />
      <path
        d={paths[0]}
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity=".22"
        strokeDasharray="3 6"
      />
      {paths.slice(0, whole).map((path, i) => (
        <path
          key={i}
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="1.7"
          opacity={0.2 + 0.055 * i}
        />
      ))}
      {whole < CYCLES && (
        <path d={live} fill="none" stroke={color} strokeWidth="2.4" />
      )}
      <path
        d={`M300 252 ${xy(peri.x, peri.y)}`}
        stroke={color}
        strokeWidth="1.2"
      />
      {Array.from({ length: whole + 1 }, (_, i) => {
        const p = point(orbit, i, relativistic, gain)
        return (
          <circle
            key={i}
            cx={300 + p.x * scale}
            cy={252 - p.y * scale}
            r={i === whole ? 5 : 2.6}
            fill={color}
          />
        )
      })}
      <circle cx="300" cy="252" r="40" fill={`url(#${id}-sun)`} />
      <circle cx="300" cy="252" r="11" fill="#ffe1a1" />
      <text x="300" y="290" textAnchor="middle" fill="#eacda1" fontSize="12">
        SOL · {n(orbit.setup.mass, 1)} M☉
      </text>
      <circle
        cx={300 + planet.x * scale}
        cy={252 - planet.y * scale}
        r="13"
        fill={color}
        opacity=".15"
      />
      <circle
        cx={300 + planet.x * scale}
        cy={252 - planet.y * scale}
        r="5.5"
        fill="#fff5dd"
        stroke={color}
        strokeWidth="2"
      />
      <text x="24" y="31" fill={color} fontSize="12" letterSpacing="1.5">
        {relativistic
          ? 'EL PERIHELIO AVANZA'
          : 'EL PERIHELIO CONSERVA SU DIRECCIÓN'}
      </text>
      <text x="24" y="488" fill="#b9cdd5" fontSize="12">
        {relativistic && expanded
          ? 'GIRO ×100.000 · RADIO SIN AMPLIAR'
          : 'GIRO REAL · SIN AMPLIACIÓN ANGULAR'}
      </text>
      <text x="24" y="507" fill="#92aab7" fontSize="11">
        Radio del aro exterior: {n(orbit.aphelion / AU, 3)} UA · tamaños de
        cuerpos simbólicos
      </text>
    </svg>
  )
}
