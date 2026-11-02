import { useId } from 'react'
import type { KeyboardEvent } from 'react'
import { useSvgScrub } from '../../shared/useSvgScrub'
import './page.css'

interface CurvePoint {
  emitted: number
  entropy: number
  average: number
  bound: number
  thermal: number
  remaining: number
}

export default function PageScene({
  n,
  emitted,
  points,
  sumLocal,
  onEmitted,
  view,
  onView,
  showThermal,
  showAverage,
  revealedUntil = n,
  inspection = 'whole',
}: {
  n: number
  emitted: number
  points: readonly CurvePoint[]
  sumLocal: number
  onEmitted: (k: number) => void
  view: 'partition' | 'curve'
  onView: (value: 'partition' | 'curve') => void
  showThermal: boolean
  showAverage: boolean
  revealedUntil?: number
  inspection?: 'whole' | 'separate'
}) {
  const id = useId().replace(/:/g, '')
  const k = Math.max(0, Math.min(n, Math.round(emitted)))
  const current = points.find((p) => p.emitted === k)
  const revealed = Math.max(k, Math.min(n, Math.round(revealedUntil)))
  const visiblePoints = points.filter((p) => p.emitted <= revealed)
  const select = (value: number) => onEmitted(Math.max(0, Math.min(n, Math.round(value))))
  const scrub = useSvgScrub((p) => select(((p.x - 64) / 392) * n))
  const keys = (event: KeyboardEvent<SVGElement>) => {
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? n
          : event.key === 'ArrowRight' || event.key === 'ArrowUp'
            ? k + 1
            : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
              ? k - 1
              : undefined
    if (next !== undefined) {
      event.preventDefault()
      select(next)
    }
  }
  const buttonKey = (event: KeyboardEvent<SVGGElement>, value: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      select(value)
    }
  }
  const x = (value: number) => 64 + (392 * value) / n
  const y = (value: number) => 250 - (190 * value) / n
  const line = (field: 'entropy' | 'average' | 'bound' | 'thermal' | 'remaining') =>
    (field === 'entropy' ? visiblePoints : points)
      .map((p) => `${x(p.emitted)},${y(p[field])}`)
      .join(' ')
  const fmt = (value: number) =>
    value.toLocaleString('es-AR', { maximumFractionDigits: 2 })
  return (
    <div className="pg-scene">
      <div
        className="md-view-tabs pg-view-tabs"
        role="group"
        aria-label="Vista de la información"
      >
        <button aria-pressed={view === 'partition'} onClick={() => onView('partition')}>
          Repartir los qubits
        </button>
        <button aria-pressed={view === 'curve'} onClick={() => onView('curve')}>
          Dibujar la curva
        </button>
      </div>
      <svg
        className="pg-visual"
        viewBox="0 0 500 315"
        role="group"
        aria-label={
          view === 'partition'
            ? `Reparto del mismo estado puro: ${n - k} qubits en B y ${k} en R. Tocá B para pasar uno a R o arrastrá el control.`
            : `Entropía calculada de R en bits. Se han separado ${k} de ${n} qubits. Arrastrá el punto verde para cambiar el reparto.`
        }
      >
        <defs>
          <radialGradient id={`${id}-reservoir`}>
            <stop offset=".2" stopColor="#080c1b" />
            <stop offset=".74" stopColor="#17162c" />
            <stop offset="1" stopColor="#7764ad" />
          </radialGradient>
          <linearGradient id={`${id}-radiation`} x2="0" y2="1">
            <stop stopColor="#284c52" />
            <stop offset="1" stopColor="#19263d" />
          </linearGradient>
          <linearGradient id={`${id}-curve`} x2="0" y2="1">
            <stop stopColor="#a0edcf" stopOpacity=".3" />
            <stop offset="1" stopColor="#a0edcf" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="500" height="315" fill="#171c31" />
        {view === 'partition' ? (
          <>
            <text className="pg-label" x="250" y="27" textAnchor="middle">
              B + R: un mismo estado puro
            </text>
            <path
              d="M73 69Q250 35 427 69"
              fill="none"
              stroke="#ffd58c"
              strokeDasharray="4 6"
              opacity=".6"
            />
            <g
              className={`pg-region ${k === n ? 'pg-region-disabled' : ''}`}
              role="button"
              tabIndex={k < n ? 0 : -1}
              aria-disabled={k === n}
              aria-label="Pasar un qubit de B a R"
              onClick={() => k < n && select(k + 1)}
              onKeyDown={(event) => k < n && buttonKey(event, k + 1)}
            >
              <circle
                cx="128"
                cy="139"
                r="69"
                fill={`url(#${id}-reservoir)`}
                stroke="#bba5ff"
                strokeWidth="2"
              />
              <circle
                cx="128"
                cy="139"
                r="54"
                fill="none"
                stroke="#8a75b7"
                opacity=".45"
              />
              {Array.from({ length: n - k }, (_, i) => {
                const angle = (2 * Math.PI * i) / Math.max(n - k, 1) - Math.PI / 2
                return (
                  <g
                    key={i}
                    transform={`translate(${128 + (n - k === 1 ? 0 : 33) * Math.cos(angle)},${139 + (n - k === 1 ? 0 : 33) * Math.sin(angle)})`}
                  >
                    <rect
                      x="-8"
                      y="-8"
                      width="16"
                      height="16"
                      rx="4"
                      fill="#bba5ff"
                      stroke="#e2d9ff"
                    />
                    <path d="M-3 0H3" stroke="#2d2448" strokeWidth="2" />
                  </g>
                )
              })}
              {k === n && (
                <text
                  className="pg-label"
                  x="128"
                  y="146"
                  textAnchor="middle"
                  fill="#bba5ff"
                >
                  Sin qubits
                </text>
              )}
              <text className="pg-region-name" x="128" y="231" textAnchor="middle">
                B · quedan {n - k}
              </text>
            </g>
            <g
              className={`pg-region ${k === 0 ? 'pg-region-disabled' : ''}`}
              role="button"
              tabIndex={k > 0 ? 0 : -1}
              aria-disabled={k === 0}
              aria-label="Devolver un qubit de R a B"
              onClick={() => k > 0 && select(k - 1)}
              onKeyDown={(event) => k > 0 && buttonKey(event, k - 1)}
            >
              <rect
                x="274"
                y="71"
                width="190"
                height="137"
                rx="18"
                fill={`url(#${id}-radiation)`}
                stroke={inspection === 'whole' ? '#a0edcf' : '#647b8b'}
                strokeWidth={inspection === 'whole' ? 3 : 1}
                strokeDasharray={inspection === 'separate' ? '4 6' : undefined}
              />
              {Array.from({ length: n }, (_, i) => (
                <g
                  key={i}
                  transform={`translate(${302 + (i % 4) * 44},${109 + Math.floor(i / 4) * 58})`}
                >
                  <rect
                    x="-12"
                    y="-12"
                    width="24"
                    height="24"
                    rx="6"
                    fill={i < k ? '#a0edcf' : '#253647'}
                    stroke={
                      i < k
                        ? inspection === 'separate'
                          ? '#ffd58c'
                          : '#d6ffef'
                        : '#647b8b'
                    }
                    strokeWidth={i < k && inspection === 'separate' ? 4 : 1}
                    strokeDasharray={i < k ? undefined : '3 4'}
                    opacity={i < k ? 1 : 0.45}
                  />
                  {i < k && (
                    <text x="0" y="5" textAnchor="middle" fontSize="15" fill="#153e3c">
                      {i + 1}
                    </text>
                  )}
                </g>
              ))}
              <text className="pg-region-name" x="369" y="231" textAnchor="middle">
                R · reunidos {k}
              </text>
            </g>
            <path
              d="M213 139H252m-8-7 8 7-8 7"
              fill="none"
              stroke="#ffd58c"
              strokeWidth="3"
            />
            <path
              d="M64 267H456"
              stroke="#676887"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d={`M64 267H${x(k)}`}
              stroke="#a0edcf"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {Array.from({ length: n + 1 }, (_, i) => (
              <path key={i} d={`M${x(i)} 261V273`} stroke="#c9bedb" />
            ))}
            <circle cx={x(k)} cy="267" r="11" fill="#a0edcf" />
            <circle
              cx={x(k)}
              cy="267"
              r="44"
              fill="transparent"
              className="pg-handle"
              role="slider"
              tabIndex={0}
              aria-label="Cambiar reparto de qubits desde la escena"
              aria-valuemin={0}
              aria-valuemax={n}
              aria-valuenow={k}
              aria-valuetext={`${k} qubits en R y ${n - k} en B`}
              {...scrub}
              onKeyDown={keys}
            />
          </>
        ) : (
          <>
            <text className="pg-label" x="64" y="28">
              S(R) · bits
            </text>
            {[0, n / 2, n].map((value) => (
              <g key={value}>
                <path
                  d={`M64 ${y(value)}H456`}
                  stroke="#756d90"
                  strokeDasharray="3 6"
                  opacity=".5"
                />
                <text x="48" y={y(value) + 6} textAnchor="end" className="pg-axis-label">
                  {value}
                </text>
              </g>
            ))}
            <path d="M64 50V250H456" fill="none" stroke="#b7b0cd" strokeWidth="1.5" />
            {showThermal && (
              <polyline
                points={line('thermal')}
                stroke="#ffad9e"
                strokeWidth="3"
                fill="none"
              />
            )}
            <polyline
              points={line('bound')}
              stroke="#85829a"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4 6"
            />
            {showAverage && (
              <polyline
                points={line('average')}
                stroke="#ffd58c"
                strokeWidth="3"
                fill="none"
                strokeDasharray="7 4"
              />
            )}
            <polygon
              points={`64,250 ${line('entropy')} ${x(revealed)},250`}
              fill={`url(#${id}-curve)`}
            />
            <polyline
              points={line('entropy')}
              stroke="#a0edcf"
              strokeWidth="4"
              fill="none"
              strokeLinejoin="round"
            />
            {visiblePoints.map((p) => (
              <circle
                key={p.emitted}
                cx={x(p.emitted)}
                cy={y(p.entropy)}
                r="3.5"
                fill="#a0edcf"
              />
            ))}
            <path
              d={`M${x(k)} 50V250`}
              stroke="#e2d9f5"
              strokeDasharray="3 5"
              opacity=".5"
            />
            <circle
              cx={x(k)}
              cy={y(current?.entropy ?? 0)}
              r="10"
              fill="#a0edcf"
              stroke="#effff7"
              strokeWidth="2"
            />
            <circle
              cx={x(k)}
              cy={y(current?.entropy ?? 0)}
              r="44"
              fill="transparent"
              className="pg-handle"
              role="slider"
              tabIndex={0}
              aria-label="Cambiar reparto desde la curva de Page"
              aria-valuemin={0}
              aria-valuemax={n}
              aria-valuenow={k}
              aria-valuetext={`${k} qubits en R; entropía ${fmt(current?.entropy ?? 0)} bits`}
              {...scrub}
              onKeyDown={keys}
            />
            {Array.from({ length: n + 1 }, (_, i) => (
              <text
                key={i}
                x={x(i)}
                y="273"
                className="pg-axis-label"
                textAnchor="middle"
              >
                {i}
              </text>
            ))}
            <text x="456" y="295" textAnchor="end" className="pg-axis-caption">
              Qubits en R →
            </text>
          </>
        )}
      </svg>
      {view === 'partition' ? (
        <p className="pg-legend pg-partition-hint">
          Tocá B: pasar uno. R: devolver. Cuadros = qubits del modelo.
        </p>
      ) : (
        <div className="pg-legend" aria-label="Leyenda de curvas">
          <span>
            <i className="pg-fine" />
            Estado elegido
          </span>
          {showThermal && (
            <span>
              <i className="pg-thermal" />
              Independientes
            </span>
          )}
          {showAverage && (
            <span>
              <i className="pg-average" />
              Promedio de Page
            </span>
          )}
          <span>
            <i className="pg-bound" />
            Límite por tamaño
          </span>
        </div>
      )}
      <p className="pg-accessible-detail">
        En este reparto, S(R)={fmt(current?.entropy ?? 0)} bits. La suma de entropías
        individuales es {fmt(sumLocal)} bits. Mover el reparto conserva el estado
        conjunto.
      </p>
    </div>
  )
}
