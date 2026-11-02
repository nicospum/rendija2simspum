import { useSvgScrub } from '../shared/useSvgScrub'
import { scrubKey } from '../shared/sceneInteraction'
import { degrees, radians, snapshot } from './physics'
import type { Setup } from './physics'
import { n } from './format'
const color = { A: '#7ce1cd', B: '#ffc47d' }
const clamp = (v: number, low: number, high: number) => Math.max(low, Math.min(high, v))

function Shadow({
  setup,
  city,
  onHeight,
}: {
  setup: Setup
  city: 'A' | 'B'
  onHeight: (height: number) => void
}) {
  const m = snapshot(setup),
    angle = city === 'A' ? m.signedA : m.signedB,
    length = city === 'A' ? m.shadowA : m.shadowB,
    scale = Math.min(
      42,
      110 / Math.max(setup.height, Math.abs(m.shadowA), Math.abs(m.shadowB)),
    ),
    top = 145 - setup.height * scale,
    end = 165 + length * scale
  const drag = useSvgScrub((p) =>
    onHeight(Math.round(clamp((145 - p.y) / scale, 0.5, 3) * 20) / 20),
  )
  return (
    <svg
      viewBox="0 0 340 198"
      role="group"
      aria-label={`Sombra en sitio ${city}. Altura ${n(setup.height, 2)} m, sombra ${n(Math.abs(length), 3)} m, ángulo firmado ${n(angle, 2)} grados.`}
    >
      <defs>
        <pattern
          id={`er-ground-${city}`}
          width="16"
          height="10"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 10L10 0" stroke="#6c806c" opacity=".3" />
        </pattern>
      </defs>
      <text x="16" y="23" fill={color[city]} fontSize="16" fontWeight="700">
        SITIO {city}
      </text>
      <text x="324" y="23" textAnchor="end" fill="#d9e6de" fontSize="14">
        {n(Math.abs(angle), 2)}° ·{' '}
        {Math.abs(angle) < 1e-9
          ? 'sin sombra'
          : angle > 0
            ? 'sombra al N'
            : 'sombra al S'}
      </text>
      <rect x="10" y="145" width="320" height="24" fill="#b7b995" />
      <rect x="10" y="145" width="320" height="24" fill={`url(#er-ground-${city})`} />
      <path d="M10 145H330" stroke="#8aa69b" />
      <path
        d={`M165 145H${end}`}
        stroke="#071820"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {Math.abs(length) > 1e-9 && (
        <circle
          cx={end}
          cy="145"
          r="3"
          fill="#ffe0a2"
          data-help-title="Extremo de la sombra"
          data-help-body="El punto claro es una marca de medición en el extremo de la sombra negra. No es un fotón ni un objeto adicional. Su posición cambia con el ángulo del Sol y la altura del palo."
        />
      )}
      <path
        d={`M${165 - Math.tan(radians(angle)) * 90} ${top - 90}L${end} 145`}
        stroke="#ffe49a"
        strokeWidth="2.5"
        opacity=".85"
      />
      <path d="M165 30V145" stroke="#91aaab" strokeDasharray="3 5" />
      <path
        d={`M165 145V${top}`}
        stroke={color[city]}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <text x="20" y="188" fill="#a5bdb5" fontSize="12">
        SUR ←
      </text>
      <text x="320" y="188" textAnchor="end" fill="#a5bdb5" fontSize="12">
        → NORTE
      </text>
      <text x="170" y="186" textAnchor="middle" fill="#fff1ce" fontSize="14">
        Sombra: {n(Math.abs(length), 3)} m
      </text>
      <circle cx="165" cy={top} r="20" fill={color[city]} fillOpacity=".12" />
      <circle
        {...drag}
        className="spum-object-handle"
        cx="165"
        cy={top}
        r="24"
        fill="transparent"
        stroke={color[city]}
        strokeDasharray="3 4"
        strokeOpacity=".55"
        tabIndex={0}
        role="slider"
        aria-label={`Estirar el palo ${city}`}
        aria-valuemin={0.5}
        aria-valuemax={3}
        aria-valuenow={setup.height}
        aria-valuetext={`${n(setup.height, 2)} metros`}
        data-help-title="La punta del palo se puede arrastrar"
        data-help-body="Estirá o acortá el palo vertical. Ambos sitios usan la misma altura para aislar ese cambio. La sombra cambia de longitud, pero el cociente sombra/altura conserva el ángulo. Las dos lupas comparten escala, ajustada para que las sombras entren."
        onKeyDown={(e) => {
          const v = scrubKey(e.key, setup.height, 0.5, 3, 0.05)
          if (v !== undefined) {
            e.preventDefault()
            onHeight(Math.round(v * 20) / 20)
          }
        }}
      />
      <circle cx="165" cy={top} r="5" fill={color[city]} pointerEvents="none" />
    </svg>
  )
}

export default function Scene({
  setup,
  view,
  activeCity,
  onCity,
  onHeight,
  onSelectCity,
}: {
  setup: Setup
  view: 'planet' | 'shadows'
  activeCity: 'A' | 'B'
  onCity: (latitude: number) => void
  onHeight: (height: number) => void
  onSelectCity: (city: 'A' | 'B') => void
}) {
  const m = snapshot(setup),
    latitude = activeCity === 'A' ? setup.latitudeA : setup.latitudeB
  const drag = useSvgScrub((p) =>
    onCity(
      Math.round(clamp(degrees(Math.atan2(210 - p.y, p.x - 245)), -35, 55) * 10) / 10,
    ),
  )
  if (view === 'shadows')
    return (
      <>
        <div className="er-loupe-tabs" role="group" aria-label="Elegir lupa">
          <button aria-pressed={activeCity === 'A'} onClick={() => onSelectCity('A')}>
            Lupa A
          </button>
          <button aria-pressed={activeCity === 'B'} onClick={() => onSelectCity('B')}>
            Lupa B
          </button>
        </div>
        <div className="er-shadow-pair">
          {(['A', 'B'] as const).map((city) => (
            <div className="er-shadow-city" key={city} data-active={activeCity === city}>
              <Shadow setup={setup} city={city} onHeight={onHeight} />
            </div>
          ))}
        </div>
        <p className="er-shadow-readout">
          Sitio {activeCity}: sombra{' '}
          {n(Math.abs(activeCity === 'A' ? m.shadowA : m.shadowB), 3)} m · ángulo{' '}
          {n(Math.abs(activeCity === 'A' ? m.signedA : m.signedB), 2)}°
        </p>
      </>
    )
  const at = (angle: number, radius = 145) => ({
    x: 245 + radius * Math.cos(radians(angle)),
    y: 210 - radius * Math.sin(radians(angle)),
  })
  const pointA = at(setup.latitudeA),
    pointB = at(setup.latitudeB),
    mid = at((setup.latitudeA + setup.latitudeB) / 2, 188),
    sun = {
      x: Math.cos(radians(setup.declination)),
      y: -Math.sin(radians(setup.declination)),
    },
    arc: string[] = Array.from({ length: 50 }, (_, i) => {
      const p = at(setup.latitudeA + ((setup.latitudeB - setup.latitudeA) * i) / 49, 155)
      return `${i ? 'L' : 'M'}${p.x} ${p.y}`
    })
  return (
    <svg
      className="er-planet"
      viewBox="0 0 600 390"
      role="group"
      aria-label={`Corte meridiano de la Tierra. Sitios separados ${n(m.distance)} kilómetros y ${n(m.separation, 2)} grados. Arrastrá el sitio ${activeCity}.`}
    >
      <defs>
        <radialGradient
          id="er-ocean"
          cx={`${50 + 40 * sun.x}%`}
          cy={`${50 + 40 * sun.y}%`}
        >
          <stop stopColor="#276875" />
          <stop offset=".7" stopColor="#153d51" />
          <stop offset="1" stopColor="#0b2136" />
        </radialGradient>
        <radialGradient id="er-halo">
          <stop offset=".75" stopColor="#65dfd6" stopOpacity="0" />
          <stop offset=".89" stopColor="#65dfd6" stopOpacity=".18" />
          <stop offset="1" stopColor="#65dfd6" stopOpacity="0" />
        </radialGradient>
        <clipPath id="er-earth-clip">
          <circle cx="245" cy="210" r="145" />
        </clipPath>
      </defs>
      <g stroke="#f6ce74" strokeWidth="1.5" opacity=".5">
        {[40, 90, 140, 190, 240, 290].map((y) => (
          <path
            key={y}
            d={`M595 ${y}l-165 ${165 * Math.tan(radians(setup.declination))}`}
          />
        ))}
      </g>
      <circle cx="245" cy="210" r="166" fill="url(#er-halo)" />
      <circle
        cx="245"
        cy="210"
        r="145"
        fill="url(#er-ocean)"
        stroke="#68b8b5"
        strokeWidth="1.5"
      />
      <g clipPath="url(#er-earth-clip)" stroke="#79c4ba" fill="none" opacity=".2">
        {[40, 85, 125].map((r) => (
          <ellipse key={r} cx="245" cy="210" rx={r} ry="145" />
        ))}
        {[110, 160, 210, 260, 310].map((y) => (
          <path key={y} d={`M100 ${y}Q245 ${y + 25} 390 ${y}`} />
        ))}
      </g>
      <path
        d="M245 64V355M101 210H390"
        stroke="#68b8b5"
        strokeDasharray="3 6"
        opacity=".3"
      />
      <text x="244" y="47" textAnchor="middle" fill="#8ec7bc" fontSize="12">
        NORTE
      </text>
      <path
        d={arc.join(' ')}
        stroke="#fff0bb"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${pointA.x} ${pointA.y}L245 210L${pointB.x} ${pointB.y}`}
        fill="none"
        stroke="#eff5d3"
        strokeDasharray="4 4"
        opacity=".7"
      />
      <circle cx="245" cy="210" r="4" fill="#bfd3c6" />
      {(['A', 'B'] as const).map((city) => {
        const phi = city === 'A' ? setup.latitudeA : setup.latitudeB,
          p = at(phi),
          top = at(phi, 169 + setup.height * 4)
        return (
          <g key={city}>
            <path
              d={`M${p.x + 180 * sun.x} ${p.y + 180 * sun.y}L${p.x} ${p.y}`}
              stroke="#ffdf8c"
              strokeWidth="2"
              opacity=".8"
            />
            <path
              d={`M${p.x} ${p.y}L${top.x} ${top.y}`}
              stroke={color[city]}
              strokeWidth="4"
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={city === activeCity ? 8 : 5}
              fill={color[city]}
            />
            <text
              x={top.x + 9}
              y={top.y + (city === 'A' ? 18 : -5)}
              fill={color[city]}
              fontSize="16"
              fontWeight="700"
            >
              {city}
            </text>
          </g>
        )
      })}
      <text x={mid.x + 15} y={mid.y} fill="#fff0bb" fontSize="14">
        {n(m.distance, 0)} km
      </text>
      <text x="245" y="245" textAnchor="middle" fill="#f7e3a2" fontSize="20">
        Δθ = {n(m.separation, 2)}°
      </text>
      <circle
        cx={at(latitude).x}
        cy={at(latitude).y}
        r="22"
        fill="none"
        stroke={color[activeCity]}
        strokeDasharray="4 5"
        pointerEvents="none"
      />
      <circle
        {...drag}
        className="spum-object-handle"
        cx={at(latitude).x}
        cy={at(latitude).y}
        r="50"
        fill="transparent"
        tabIndex={0}
        role="slider"
        aria-label={`Mover sitio ${activeCity} sobre el meridiano`}
        aria-valuemin={-35}
        aria-valuemax={55}
        aria-valuenow={latitude}
        aria-valuetext={`Latitud ${n(latitude, 2)} grados`}
        data-help-title={`Sitio ${activeCity}: una vertical local`}
        data-help-body="Arrastrá este aro por el borde del planeta. Se mueve el lugar de medición, no el Sol. La varilla apunta radialmente hacia arriba y la cinta mide un arco del mismo meridiano. El dibujo aumenta los palos para que se vean; sus sombras se calculan a partir del ángulo real."
        onKeyDown={(e) => {
          const v = scrubKey(e.key, latitude, -35, 55, 0.1)
          if (v !== undefined) {
            e.preventDefault()
            onCity(v)
          }
        }}
      />
      <g
        transform={`translate(${245 + 330 * sun.x} ${210 + 330 * sun.y})`}
        stroke="#f9d280"
        data-help-title="Dirección del Sol"
        data-help-body="Este símbolo indica la dirección del Sol en el corte. Su distancia está muy comprimida: el modelo usa rayos paralelos de un Sol lejano. Cambiar su declinación mueve esta dirección y las dos sombras, no el tamaño del planeta."
      >
        <circle r="14" fill="#f9d280" />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} transform={`rotate(${i * 45})`} d="M0 -21V-28" strokeWidth="2" />
        ))}
      </g>
      <text x="415" y="362" fill="#f2d595" fontSize="12">
        RAYOS PARALELOS
      </text>
      <text x="24" y="365" fill="#9bbab6" fontSize="12">
        Corte de un meridiano · palos aumentados
      </text>
    </svg>
  )
}
