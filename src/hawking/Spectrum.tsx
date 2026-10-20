import { useEffect, useState } from 'react'
import { K, LOG_PEAK, scientific, spectrumFraction } from './physics'
import type { blackHole } from './physics'

type Reading = ReturnType<typeof blackHole>
export default function Spectrum({ current, reference }: { current: Reading; reference: Reading }) {
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 600px)').matches)
  useEffect(() => {
    const query = window.matchMedia('(max-width: 600px)')
    const update = () => setCompact(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  const peak = K * current.temperatureK * LOG_PEAK
  const refPeak = K * reference.temperatureK * LOG_PEAK
  // Both curves use the same energy and absolute power axes. Never normalize each separately.
  const low = Math.floor(Math.log10(Math.min(peak, refPeak))) - 2
  const high = Math.ceil(Math.log10(Math.max(peak, refPeak))) + 1
  const maximum = Math.max(current.powerW, reference.powerW) * 0.85
  const left = compact ? 105 : 90,
    right = compact ? 475 : 640,
    top = 24,
    bottom = compact ? 210 : 178
  const intervals = compact ? 2 : 4
  const samples = Math.max(240, (high - low) * 50)
  const points = (reading: Reading) =>
    Array.from({ length: samples + 1 }, (_, i) => {
      const logE = low + ((high - low) * i) / samples
      const y = spectrumFraction(10 ** logE, reading.temperatureK) * reading.powerW
      return `${i === 0 ? 'M' : 'L'}${left + ((right - left) * i) / samples},${bottom - (y / maximum) * (bottom - top)}`
    }).join(' ')
  return (
    <section className="hk-spectrum" aria-labelledby="hk-spectrum-title">
      <div className="hk-panel-heading">
        <div>
          <p className="hk-eyebrow">LA ENERGÍA QUE SALE</p>
          <h2 id="hk-spectrum-title">Un espectro, no un color</h2>
        </div>
        <span className="hk-model-tag">FOTONES IDEALES</span>
      </div>
      <p className="hk-chart-caption">
        Potencia por intervalo de ln(E), en W. Eje de energía logarítmico. Ambas curvas comparten
        escala.
      </p>
      <svg
        viewBox={compact ? '0 0 500 280' : '0 0 680 224'}
        role="img"
        aria-label={`Espectro calculado: máximo actual en ${scientific(peak, 'J')}; referencia en ${scientific(refPeak, 'J')}`}
      >
        <defs>
          <linearGradient id="hk-spectrum-fill" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#e9b76b" stopOpacity=".24" />
            <stop offset="1" stopColor="#e9b76b" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((tick) => (
          <g key={tick}>
            <path d={`M${left} ${bottom - tick * (bottom - top)}H${right}`} stroke="#27363e" />
            <text x={left - 10} y={bottom - tick * (bottom - top) + 4} textAnchor="end">
              {tick === 0 ? '0' : scientific(maximum * tick)}
            </text>
          </g>
        ))}
        {Array.from({ length: intervals + 1 }, (_, i) => (
          <g key={i}>
            <path d={`M${left + ((right - left) * i) / intervals} ${bottom}v5`} stroke="#65767c" />
            <text
              x={left + ((right - left) * i) / intervals}
              y={compact ? 240 : 202}
              textAnchor="middle"
            >
              {scientific(10 ** (low + ((high - low) * i) / intervals))}
            </text>
          </g>
        ))}
        <path
          d={`${points(current)} L${right},${bottom} L${left},${bottom} Z`}
          fill="url(#hk-spectrum-fill)"
        />
        <path
          d={points(reference)}
          stroke="#85acb1"
          strokeWidth="2"
          strokeDasharray="5 5"
          fill="none"
        />
        <path d={points(current)} stroke="#e9b76b" strokeWidth="2.5" fill="none" />
        <text x={compact ? 485 : 650} y={compact ? 275 : 221} textAnchor="end">
          Energía del fotón (J) →
        </text>
      </svg>
      <div className="hk-chart-legend">
        <span>
          <i />
          Ahora
        </span>
        <span>
          <i />
          Referencia
        </span>
        <span>
          Pico actual: <strong>{scientific(peak, 'J')}</strong>
        </span>
      </div>
      <p className="hk-footnote">
        El tono dorado identifica la curva; no es luz visible. El espectro real incluye factores de
        cuerpo gris y otras especies de partículas.
      </p>
    </section>
  )
}
