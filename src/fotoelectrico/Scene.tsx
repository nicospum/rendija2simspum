import { useId } from 'react'
import { MATERIALS, snapshot, spectrum, stream, H_EV } from './physics'
import type { Setup } from './physics'
import { n } from './format'
export default function Scene({
  setup,
  time,
  energy,
}: {
  setup: Setup
  time: number
  energy: boolean
}) {
  const id = useId().replace(/:/g, ''),
    m = snapshot(setup),
    light = spectrum(setup.frequency)
  if (energy) {
    const scale = 440 / 7,
      x = (f: number) => 60 + ((f - 350) / 1250) * 480,
      y = (k: number) => 410 - (k / 4.5) * 170
    return (
      <svg
        viewBox="0 0 600 470"
        role="img"
        aria-label={`Reparto de energía. Cada fotón tiene ${n(m.photonEv)} eV; el ${m.material.name} necesita ${n(m.material.work)} eV. ${m.emitting ? `Energía cinética máxima ${n(m.kineticMax)} eV.` : 'No hay emisión.'}`}
      >
        <text x="32" y="35" fill="#bbd0da" fontSize="14">
          UN FOTÓN / UN REPARTO DE ENERGÍA
        </text>
        <rect x="65" y="83" width="440" height="42" rx="5" fill="#203a4b" />
        <rect
          x="65"
          y="83"
          width={Math.min(m.photonEv, m.material.work) * scale}
          height="42"
          rx="3"
          fill={light.color}
          opacity=".7"
        />
        {m.surplus > 0 && (
          <rect
            x={65 + m.material.work * scale}
            y="83"
            width={m.surplus * scale}
            height="42"
            fill="#efbb7e"
          />
        )}
        <path
          d={`M${65 + m.material.work * scale} 65V141`}
          stroke="#e6eff1"
          strokeWidth="2"
          strokeDasharray="4 5"
        />
        <text x="65" y="65" fill={light.color} fontSize="16">
          hf = {n(m.photonEv)} eV
        </text>
        <text
          x={65 + m.material.work * scale}
          y="161"
          fill="#dfebef"
          textAnchor="middle"
          fontSize="13"
        >
          φ = {n(m.material.work)} eV
        </text>
        <text
          x="32"
          y="197"
          fill={m.surplus > 0 ? '#efbb7e' : '#bdc9d1'}
          fontSize="14"
        >
          {setup.brightness === 0
            ? 'Fuente apagada · reparto potencial por fotón'
            : m.surplus > 0
              ? `Sobra energía: Kmáx = ${n(m.kineticMax)} eV`
              : `No alcanza: faltan ${n(Math.max(0, -m.surplus))} eV para superar el umbral`}
        </text>
        <text x="32" y="230" fill="#a5becb" fontSize="13">
          ENERGÍA MÁXIMA vs. FRECUENCIA · EJES FIJOS
        </text>
        {[0, 2, 4].map((k) => (
          <g key={k}>
            <path d={`M60 ${y(k)}H540`} stroke="#456174" strokeOpacity=".45" />
            <text x="32" y={y(k) + 4} fill="#a5becb" fontSize="12">
              {k}
            </text>
          </g>
        ))}
        <path d="M60 240V410H550" fill="none" stroke="#7c99a9" />
        {Object.entries(MATERIALS).map(([key, material]) => {
          const f0 = material.work / H_EV / 1e12,
            max = H_EV * 1600e12 - material.work
          return (
            <path
              key={key}
              d={`M${x(f0)} 410 ${x(1600)} ${y(max)}`}
              fill="none"
              stroke={key === setup.material ? '#efbb7e' : material.color}
              strokeWidth={key === setup.material ? 3 : 1}
              opacity={key === setup.material ? 1 : 0.2}
            />
          )
        })}
        <path
          d={`M${x(m.threshold)} 252V410`}
          stroke="#a8cad2"
          strokeDasharray="4 6"
        />
        <text
          x={x(m.threshold)}
          y="252"
          fill="#a8cad2"
          textAnchor="middle"
          fontSize="12"
        >
          f₀
        </text>
        <path
          d={`M${x(setup.frequency)} 267V410`}
          stroke={light.color}
          strokeOpacity=".6"
          strokeDasharray="2 5"
        />
        <circle
          cx={x(setup.frequency)}
          cy={y(Math.max(0, m.surplus))}
          r="6"
          fill={m.emitting ? '#fff0d8' : '#183446'}
          stroke={light.color}
          strokeWidth="2"
        />
        {[350, 800, 1200, 1600].map((f) => (
          <text
            key={f}
            x={x(f)}
            y="432"
            fill="#a5becb"
            textAnchor="middle"
            fontSize="12"
          >
            {f}
          </text>
        ))}
        <text x="32" y="461" fill="#b8cfd7" fontSize="12">
          Vertical: eV · Horizontal: THz · debajo de f₀ no hay fotoemisión
        </text>
      </svg>
    )
  }
  const photons = stream(m.photonRate / 1.5e10, 0.18, time),
    electrons = m.emitting
      ? stream(m.emissionRate / 1.5e10, 500000 / m.speed, time)
      : []
  const wave = Array.from({ length: 100 }, (_, i) => {
    const u = i / 99,
      offset = Math.sin((u * setup.frequency) / 65 + time * 6) * 3
    return `${i ? 'L' : 'M'}${470 - 239 * u + offset},${83 + 162 * u + offset}`
  }).join(' ')
  return (
    <svg
      viewBox="0 0 600 470"
      role="img"
      aria-label={`Celda fotoeléctrica con ${m.material.name}, luz de ${n(setup.frequency, 0)} THz y brillo ${n(setup.brightness, 0)}%. ${m.emitting ? `Emite electrones: corriente ideal ${n(m.current * 1e9)} nanoamperes.` : 'No emite electrones.'}`}
    >
      <defs>
        <linearGradient id={`${id}-metal`}>
          <stop stopColor="#344d60" />
          <stop offset=".65" stopColor={m.material.color} />
          <stop offset="1" stopColor="#59788b" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x2="0" y2="1">
          <stop stopColor="#447087" stopOpacity=".12" />
          <stop offset="1" stopColor="#112c3d" stopOpacity=".6" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop stopColor={light.color} stopOpacity=".7" />
          <stop offset="1" stopColor={light.color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <text x="32" y="35" fill="#9bb9ca" fontSize="13" letterSpacing="1">
        LUZ QUE LLEGA / ELECTRONES QUE SALEN
      </text>
      <rect
        x="137"
        y="164"
        width="420"
        height="196"
        rx="42"
        fill={`url(#${id}-glass)`}
        stroke="#678b9f"
        strokeWidth="1.5"
      />
      <path
        d="M159 185Q155 177 185 177H470"
        fill="none"
        stroke="#a2c4d3"
        strokeOpacity=".2"
        strokeWidth="2"
      />
      <text x="350" y="185" fill="#7d9eaf" fontSize="11">
        VACÍO · COLECCIÓN IDEAL
      </text>
      <rect
        x="212"
        y="209"
        width="22"
        height="124"
        rx="4"
        fill={`url(#${id}-metal)`}
      />
      <path d="M235 215V325" stroke={m.material.color} strokeWidth="3" />
      <text
        x="182"
        y="250"
        textAnchor="end"
        fill={m.material.color}
        fontSize="21"
      >
        {m.material.symbol}
      </text>
      <text x="182" y="270" textAnchor="end" fill="#a6bfcc" fontSize="12">
        METAL
      </text>
      <rect
        x="513"
        y="209"
        width="15"
        height="124"
        rx="4"
        fill="#4e7686"
        stroke="#8db6c0"
      />
      {setup.brightness > 0 && (
        <>
          <path
            d="M460 73 479 92 235 267 231 231Z"
            fill={light.color}
            opacity={0.04 + (0.13 * setup.brightness) / 100}
          />
          <path
            d={wave}
            fill="none"
            stroke={light.color}
            opacity={0.2 + (0.6 * setup.brightness) / 100}
            strokeWidth="1.4"
          />
          <circle
            cx="235"
            cy="251"
            r="30"
            fill={`url(#${id}-glow)`}
            opacity={setup.brightness / 100}
          />
        </>
      )}
      {photons.map((p, i) => (
        <circle
          key={i}
          cx={470 - 237 * p.x}
          cy={83 + 162 * p.x + (p.y - 0.5) * 13}
          r="2.7"
          fill={light.color}
        />
      ))}
      {electrons.map((p, i) => (
        <g key={i}>
          <path
            d={`M${240 + 273 * p.x - Math.min(23, m.speed / 45000)} ${239 + p.y * 48}h${Math.min(23, m.speed / 45000)}`}
            stroke="#7ae6dc"
            strokeWidth="1.4"
            opacity=".35"
          />
          <circle
            cx={240 + 273 * p.x}
            cy={239 + p.y * 48}
            r="3"
            fill="#a5fff0"
          />
        </g>
      ))}
      <g transform="translate(470 83) rotate(-35)">
        <path d="M-14-22H14L21 16H-21Z" fill="#375366" stroke="#89abba" />
        <path
          d="M-23 17H23"
          stroke={setup.brightness > 0 ? light.color : '#607f8d'}
          strokeWidth="5"
        />
      </g>
      <text x="350" y="65" fill={light.color} fontSize="13">
        {n(setup.frequency, 0)} THz
      </text>
      <text x="350" y="110" fill="#a6bfcc" fontSize="12">
        {n(m.wavelength, 0)} nm
      </text>
      <path
        d="M223 334V397H315M528 334V397H391"
        fill="none"
        stroke="#668e9f"
        strokeWidth="2"
      />
      <circle cx="353" cy="397" r="37" fill="#142f40" stroke="#6c9bad" />
      <path d="M328 389Q353 362 378 389" fill="none" stroke="#567c8e" />
      <path
        d={`M353 400 ${353 + 25 * Math.sin(-1.05 + Math.min(1, m.current / 45e-9) * 2.1)} ${400 - 25 * Math.cos(-1.05 + Math.min(1, m.current / 45e-9) * 2.1)}`}
        stroke="#efbb7e"
        strokeWidth="2"
      />
      <text x="353" y="419" textAnchor="middle" fill="#c7dbe1" fontSize="12">
        nA
      </text>
      <text x="410" y="405" fill="#efbb7e" fontSize="17">
        {n(m.current * 1e9)} nA
      </text>
      <text x="32" y="461" fill="#b5cbd6" fontSize="13">
        {setup.brightness === 0
          ? 'FUENTE APAGADA'
          : m.canEmit
            ? 'EMISIÓN ACTIVA · ELECTRONES EN TURQUESA'
            : 'SIN EMISIÓN · CADA FOTÓN ESTÁ DEBAJO DEL UMBRAL'}
      </text>
    </svg>
  )
}
