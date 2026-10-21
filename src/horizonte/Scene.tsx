import { photonRadius, model, makePulse, RECEIVER, lightSpeed } from './physics'
import type { Pulse, Setup } from './physics'

const mapRadius = (x: number) => (x <= 1 ? 86 * x : 86 + 98 * Math.log(x))
export function SignalColor(g: number | null) {
  return g === null
    ? '#d58bff'
    : `rgb(255,${Math.round(65 + 180 * Math.min(1, g))},${Math.round(55 + 150 * Math.min(1, g))})`
}
export default function Scene({
  setup,
  pulses,
}: {
  setup: Setup
  pulses: Pulse[]
}) {
  const m = model(setup),
    cy = 214,
    cx = 205
  const probeX = m.radius === null ? null : cx + mapRadius(m.radius)
  const live = pulses
    .filter(
      (p) =>
        p.emitted <= setup.time &&
        (p.arrival === null || p.arrival > setup.time),
    )
    .slice(-45)
  return (
    <div className="hz-space-stage">
      <svg
        viewBox="80 35 590 360"
        role="img"
        aria-label={`Mapa causal de la sonda. ${m.radius === null ? 'Terminó el tramo de caída mostrado; la antena sigue escuchando.' : `Radio ${m.radius.toFixed(2)} veces el horizonte. ${m.radius < 1 ? 'Dentro' : m.radius === 1 ? 'En el horizonte' : 'Fuera'}.`}`}
      >
        <defs>
          <radialGradient id="hz-dark">
            <stop stopColor="#03060c" />
            <stop offset=".93" stopColor="#030810" />
            <stop offset="1" stopColor="#12313e" />
          </radialGradient>
          <radialGradient id="hz-halo">
            <stop offset=".55" stopColor="#0f354600" />
            <stop offset=".65" stopColor="#72d3ce50" />
            <stop offset=".7" stopColor="#3a89982a" />
            <stop offset="1" stopColor="#0f354600" />
          </radialGradient>
          <linearGradient id="hz-line">
            <stop stopColor="#9de1da" stopOpacity=".1" />
            <stop offset="1" stopColor="#9de1da" stopOpacity=".8" />
          </linearGradient>
        </defs>
        <rect width="720" height="430" fill="#060e1a" />
        {Array.from({ length: 95 }, (_, i) => (
          <circle
            key={i}
            cx={(i * 137.23 + 31) % 720}
            cy={(i * i * 39.17 + 17) % 430}
            r={i % 9 === 0 ? 1.2 : 0.6}
            fill="#8ba5bc"
            opacity={0.2 + (i % 5) * 0.12}
          />
        ))}
        <g fill="none" stroke="#47718b" strokeOpacity=".22">
          {[1.5, 2, 4, 8, 20].map((x) => (
            <circle
              key={x}
              cx={cx}
              cy={cy}
              r={mapRadius(x)}
              strokeDasharray="3 9"
            />
          ))}
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i * Math.PI) / 8
            return (
              <path
                key={i}
                d={`M${cx + 86 * Math.cos(a)} ${cy + 86 * Math.sin(a)}L${cx + 410 * Math.cos(a)} ${cy + 410 * Math.sin(a)}`}
              />
            )
          })}
        </g>
        <circle cx={cx} cy={cy} r="132" fill="url(#hz-halo)" />
        <circle
          cx={cx}
          cy={cy}
          r="86"
          fill="url(#hz-dark)"
          stroke="#8de0d5"
          strokeWidth="1.5"
        />
        <path
          d={`M${cx + 86} ${cy}H${cx + mapRadius(RECEIVER)}`}
          stroke="url(#hz-line)"
          strokeDasharray="5 7"
        />
        <g
          transform={`translate(${cx + mapRadius(RECEIVER)},${cy})`}
          fill="none"
          stroke="#b4e9e0"
          strokeWidth="2"
        >
          <path d="M-12-18Q7 0-12 18M-6-11Q6 0-6 11M0 0H19M19-23V23M12 23H26" />
        </g>
        <text
          x={cx + mapRadius(RECEIVER) - 25}
          y={cy + 52}
          fontSize="18"
          fill="#bdcddd"
        >
          ANTENA
        </text>
        <text
          x={cx + mapRadius(RECEIVER) - 20}
          y={cy + 76}
          fontSize="16"
          fill="#87a5b8"
        >
          20 rs
        </text>
        <text
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          fill="#779baa"
          fontSize="17"
        >
          INTERIOR
        </text>
        {live.map((p) => {
          const x = photonRadius(p, setup.time)
          return x === null ? null : (
            <g
              key={p.id}
              transform={`translate(${cx + mapRadius(x)},${cy + (p.manual ? -10 : 9)})`}
            >
              <circle r="9" fill={SignalColor(p.frequency)} opacity=".12" />
              <circle
                r={p.manual ? 3.5 : 2.5}
                fill={SignalColor(p.frequency)}
              />
            </g>
          )
        })}
        {probeX !== null && (
          <g transform={`translate(${probeX},${cy})`}>
            <path
              d="M-14 0L2-8L16-6L16 6L2 8Z"
              stroke="#d1f2ed"
              strokeWidth="1.6"
              fill="#193e4c"
            />
            <circle cx="5" r="3" fill="#87e0da" />
            {setup.mode === 'hover' && (
              <path
                d="M18-4L29-7M18 0H33M18 4L29 7"
                stroke="#ffd39a"
                strokeWidth="2"
              />
            )}
            <path d="M0-18V-53" stroke="#a4cbc9" strokeDasharray="3 4" />
            <text y="-66" textAnchor="middle" fontSize="18" fill="#e0f0ef">
              SONDA
            </text>
          </g>
        )}
      </svg>
      <div className="hz-map-tag">
        <span>MAPA CAUSAL · NO ES UNA FOTOGRAFÍA</span>
        <b>
          {m.radius === null
            ? 'LA ANTENA SIGUE ESCUCHANDO'
            : m.radius <= 1
              ? 'EN EL LÍMITE / INTERIOR'
              : setup.mode === 'hover'
                ? 'SONDA SOSTENIDA · MOTOR ENCENDIDO'
                : 'CAÍDA LIBRE · MOTOR APAGADO'}
        </b>
      </div>
      <div className="hz-horizon-label">
        Horizonte de sucesos <span>r = rs</span>
      </div>
      <div className="hz-position-label">
        {m.radius === null
          ? 'Fin del tramo de sonda'
          : `r = ${m.radius.toFixed(2).replace('.', ',')} rs`}
      </div>
    </div>
  )
}

export function LightFutures({ setup }: { setup: Setup }) {
  const x = model(setup).radius
  if (x === null)
    return (
      <div className="hz-futures hz-ended">
        <h3>El tramo de la sonda terminó.</h3>
        <p>
          Volvé a un radio de la caída para explorar sus caminos de luz. La
          antena puede seguir recibiendo mensajes emitidos antes.
        </p>
      </div>
    )
  const test = makePulse({ ...setup, mode: 'fall', time: 0 }, 'diagram')!
  const p = { ...test, emitted: 0, radius: x }
  const maxR = x <= 1.3 ? 2 : 6
  const maxT = x <= 1.3 ? 1.5 : 3
  const X = (r: number) => 50 + (r / maxR) * 440,
    Y = (t: number) => 275 - (t / maxT) * 210
  const curve = (out: boolean) => {
    const points = []
    for (let i = 0; i <= 75; i++) {
      const t = (i / 75) * maxT,
        r = photonRadius(p, t, out)
      if (r === null || r < 0.03 || r > maxR) break
      points.push(`${points.length ? 'L' : 'M'}${X(r)} ${Y(t)}`)
    }
    return points.join(' ')
  }
  return (
    <div className="hz-futures">
      <svg
        viewBox="0 0 520 350"
        role="img"
        aria-label={`Futuros de luz en r=${x.toFixed(2)} rs. ${x < 1 ? 'Ambas direcciones radiales llevan hacia radios menores.' : x === 1 ? 'La dirección saliente permanece en el horizonte.' : 'La dirección saliente aumenta su radio.'}`}
      >
        <rect
          x="50"
          y="40"
          width={440 / maxR}
          height="235"
          fill="#355064"
          opacity=".25"
        />
        {(maxR === 2 ? [0, 0.5, 1, 1.5, 2] : [0, 1, 2, 3, 4, 5, 6]).map((r) => (
          <g key={r}>
            <path
              d={`M${X(r)} 40V275`}
              stroke={r === 1 ? '#91e1d5' : '#253c4d'}
              strokeDasharray={r === 1 ? '6 5' : '2 8'}
            />
            <text
              x={X(r)}
              y="300"
              textAnchor="middle"
              fill="#b8cbd4"
              fontSize="18"
            >
              {r}
            </text>
          </g>
        ))}
        <path
          d="M50 275V37M43 49L50 37L57 49M50 275H495M483 268L495 275L483 282"
          stroke="#8faebe"
          fill="none"
        />
        <text x="65" y="30" fill="#bdd4dc" fontSize="18">
          FUTURO · ΔT (rs/c)
        </text>
        <text x="400" y="328" fill="#bdd4dc" fontSize="17">
          radio / rs
        </text>
        <text x={X(1) + 6} y="65" fill="#9fe8de" fontSize="16">
          horizonte
        </text>
        {[maxT / 3, (maxT * 2) / 3, maxT].map((t) => (
          <text
            key={t}
            x="28"
            y={Y(t) + 5}
            textAnchor="middle"
            fill="#b5c6d8"
            fontSize="18"
          >
            {t}
          </text>
        ))}
        <path d={curve(true)} fill="none" stroke="#ffd095" strokeWidth="3" />
        <path
          d={curve(false)}
          fill="none"
          stroke="#9ebae2"
          strokeWidth="2"
          strokeDasharray="5 4"
        />
        <circle cx={X(x)} cy="275" r="5" fill="#ecf4ee" />
      </svg>
      <div className="hz-rays-legend">
        <span>━ Dirección local saliente</span>
        <span>┄ Dirección local entrante</span>
      </div>
      <p>
        {x < 1
          ? 'Dentro, los dos caminos futuros van hacia radios menores.'
          : x === 1
            ? 'En el horizonte, la dirección saliente queda en r = rs.'
            : 'Fuera, la luz apuntada hacia afuera puede aumentar su radio.'}{' '}
        Las curvas se calculan desde el punto actual.
      </p>
      <p className="hz-speed">
        dr/dT saliente = {lightSpeed(x).toFixed(2).replace('.', ',')} · Esta
        velocidad de coordenadas no es una medición local de c.
      </p>
    </div>
  )
}
