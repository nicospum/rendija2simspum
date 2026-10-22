import { useSvgScrub } from '../shared/useSvgScrub'
import { scrubKey } from '../shared/sceneInteraction'
import { starYears } from './interaction'
import { useEffect, useState } from 'react'
import { orbitalPeriodYears } from './physics'

export default function StarView({
  mass,
  playing,
  onExplore,
}: {
  mass: number
  playing: boolean
  onExplore?: () => void
}) {
  const [years, setYears] = useState(0)
  useEffect(() => {
    if (!playing) return
    let frame = 0,
      previous = 0
    const advance = (now: number) => {
      if (previous)
        setYears((t) => t + Math.min((now - previous) / 1000, 0.05) * 0.2)
      previous = now
      frame = requestAnimationFrame(advance)
    }
    frame = requestAnimationFrame(advance)
    return () => cancelAnimationFrame(frame)
  }, [playing])
  const drag = useSvgScrub((p) => {
    const t = starYears(p.x, p.y, years, mass)
    if (t !== null) {
      onExplore?.()
      setYears(t)
    }
  })
  const phase = (2 * Math.PI * years) / orbitalPeriodYears(mass)
  const reference = (2 * Math.PI * years) / orbitalPeriodYears(4)
  return (
    <div className="ac-star">
      <svg
        viewBox="155 45 410 390"
        role={onExplore ? 'group' : 'img'}
        aria-label={`Órbita circular de radio fijo 100 UA. Período actual ${orbitalPeriodYears(mass).toFixed(3)} años; referencia de 4 millones de soles ${orbitalPeriodYears(4).toFixed(3)} años.`}
      >
        <defs>
          <radialGradient id="ac-star-glow">
            <stop stopColor="#ffd39a" />
            <stop offset="1" stopColor="#fb9c5600" />
          </radialGradient>
        </defs>
        <g stroke="#263544" fill="none">
          <path d="M120 235H600M360 45V425" strokeDasharray="3 8" />
          <circle cx="360" cy="235" r="155" />
          <path d="M360 235H515" stroke="#eac390" strokeDasharray="5 6" />
        </g>
        <text x="402" y="222" fill="#b5c6d8" fontSize="18">
          100 UA
        </text>
        <circle cx="360" cy="235" r="25" fill="#02050b" stroke="#6b8293" />
        <text
          x="360"
          y="285"
          textAnchor="middle"
          fill="#b5c6d8"
          fontSize="13"
        >
          masa invisible
        </text>
        <circle
          cx={360 + 155 * Math.cos(reference)}
          cy={235 + 155 * Math.sin(reference)}
          r="12"
          fill="none"
          stroke="#8ed9cf"
          strokeWidth="2"
        />
        <circle
          cx={360 + 155 * Math.cos(phase)}
          cy={235 + 155 * Math.sin(phase)}
          r="28"
          fill="url(#ac-star-glow)"
        />
        <circle
          cx={360 + 155 * Math.cos(phase)}
          cy={235 + 155 * Math.sin(phase)}
          r="6"
          fill="#ffe4b4"
        />
        {onExplore && (
          <circle
            {...drag}
            cx={360 + 155 * Math.cos(phase)}
            cy={235 + 155 * Math.sin(phase)}
            r="7"
            fill="transparent"
            stroke="transparent"
            strokeWidth="44"
            vectorEffect="non-scaling-stroke"
            className="spum-object-handle"
            role="slider"
            tabIndex={0}
            aria-label="Recorrer la órbita de la estrella"
            aria-valuemin={0}
            aria-valuemax={Math.max(years, orbitalPeriodYears(mass))}
            aria-valuenow={years}
            aria-valuetext={`${years.toFixed(3)} años transcurridos`}
            onKeyDown={(e) => {
              const t = scrubKey(
                e.key,
                years,
                0,
                Math.max(years, orbitalPeriodYears(mass)),
                orbitalPeriodYears(mass) / 40,
              )
              if (t !== undefined) {
                e.preventDefault()
                onExplore()
                setYears(t)
              }
            }}
          />
        )}
      </svg>
      <p className="bh-star-time">
        Tiempo explorado:{' '}
        {years.toLocaleString('es-AR', { maximumFractionDigits: 3 })} años ·
        Período:{' '}
        {orbitalPeriodYears(mass).toLocaleString('es-AR', {
          maximumFractionDigits: 3,
        })}{' '}
        años.
      </p>
      <div className="ac-orbit-legend">
        <span>● Estrella · {mass} millones M☉</span>
        <span>◯ Referencia · 4 millones M☉</span>
      </div>
      <p>
        Símbolo central ampliado · órbita ideal vista desde arriba.
        <br />
        El radio permanece fijo. Al cambiar la masa, ambas fases vuelven a
        compararse desde cero.
      </p>
    </div>
  )
}
