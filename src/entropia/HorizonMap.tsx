import type { ReactNode } from 'react'
import { useSvgScrub } from '../shared/useSvgScrub'
import { scrubKey } from '../shared/sceneInteraction'
import { massAtEdge, emittedAtCorner, exampleAreaAtX } from './interaction'
import { useEffect, useId, useState } from 'react'
import './viewport.css'
import { entropyModel } from './physics'

function graticule(radius: number, yaw: number) {
  const paths: string[] = []
  const pitch = Math.PI / 9
  const project = (lat: number, lon: number) => {
    const x = Math.cos(lat) * Math.cos(lon + yaw)
    const z = Math.cos(lat) * Math.sin(lon + yaw)
    const y = Math.sin(lat)
    return [
      245 + radius * x,
      214 - radius * (y * Math.cos(pitch) - z * Math.sin(pitch)),
      y * Math.sin(pitch) + z * Math.cos(pitch),
    ]
  }
  const line = (points: number[][]) => {
    let visible = false,
      path = ''
    for (const [x, y, z] of points) {
      if (z >= 0) {
        path += `${visible ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`
        visible = true
      } else visible = false
    }
    paths.push(path)
  }
  for (let lat = -60; lat <= 60; lat += 20)
    line(
      Array.from({ length: 181 }, (_, j) =>
        project((lat * Math.PI) / 180, (j * Math.PI) / 90),
      ),
    )
  for (let lon = 0; lon < 360; lon += 20)
    line(
      Array.from({ length: 91 }, (_, j) =>
        project(((j - 45) * Math.PI) / 90, (lon * Math.PI) / 180),
      ),
    )
  return paths
}

export default function HorizonMap({
  model,
  mass,
  emitted,
  onMass,
  onEmitted,
  controls,
  exampleArea,
  onExampleArea,
}: {
  model: ReturnType<typeof entropyModel>
  mass: number
  emitted: number
  onMass: (v: number) => void
  onEmitted: (v: number) => void
  controls: ReactNode
  exampleArea?: number
  onExampleArea?: (value: number) => void
}) {
  const [focused, setFocused] = useState(false)
  const [view, setView] = useState<'horizon' | 'area'>('horizon')
  useEffect(() => {
    const media = window.matchMedia(
      '(max-width: 850px), (max-height: 550px)',
    )
    const update = () => setFocused(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])
  const resize = useSvgScrub((p) => {
    const v = massAtEdge(p.x, emitted)
    if (v !== null) onMass(v)
  })
  const emit = useSvgScrub((p) => {
    const v = emittedAtCorner(p.x, mass)
    if (v !== null) onEmitted(v)
  })
  const example = useSvgScrub((p) => {
    const value = exampleAreaAtX(focused ? (p.x * 700) / 360 : p.x)
    if (value !== null) onExampleArea?.(value)
  })
  const [yaw, setYaw] = useState(0)
  const [inspect, setInspect] = useState<'horizon' | 'grid' | 'reference'>(
    'horizon',
  )
  const id = useId().replace(/:/g, '')
  const radius = 70 * model.radiusRatio
  const areaSide = 100 * model.radiusRatio
  const descriptions = {
    horizon:
      'El horizonte es una frontera causal, no una corteza sólida. Su radio areal rₛ define A = 4πrₛ². El mapa representa esa geometría; no muestra cómo lo vería una cámara astronómica.',
    grid: 'La trama ayuda a ver una superficie curva. No son bits, átomos ni celdas de Planck observadas. El cuadrado lateral tiene el mismo cociente de áreas que el horizonte y mantiene una escala fija.',
    reference:
      'La línea punteada conserva siempre la referencia de 10 masas solares. Ni el encuadre ni la escala se ajustan al mover la masa: duplicar el radio ocupa cuatro veces más área.',
  }
  return (
    <div data-scene-workspace className="en-map">
      <div
        className="spum-live-stage en-visual-stage"
        data-focused={focused}
        data-example={exampleArea !== undefined}
      >
        {focused && exampleArea === undefined && (
          <div
            className="en-view-choices"
            role="group"
            aria-label="Elegir vista de entropía"
          >
            <button
              aria-pressed={view === 'horizon'}
              onClick={() => setView('horizon')}
            >
              Horizonte
            </button>
            <button
              aria-pressed={view === 'area'}
              onClick={() => setView('area')}
            >
              Área y entropía
            </button>
          </div>
        )}
        <svg
          className="en-map-drawing"
          viewBox={
            exampleArea !== undefined
              ? focused
                ? '0 0 360 380'
                : '0 0 700 320'
              : focused
                ? view === 'horizon'
                  ? '65 55 360 365'
                  : '425 55 250 350'
                : '0 0 700 425'
          }
          role="group"
          aria-label={
            exampleArea === undefined
              ? `Mapa geométrico del horizonte. Radio ${model.radiusRatio.toFixed(2)} veces y área ${model.areaRatio.toFixed(2)} veces la referencia fija.`
              : `Lupa algebraica aparte: ${exampleArea} áreas de Planck divididas por cuatro. El agujero negro del laboratorio no cambia.`
          }
        >
          {exampleArea !== undefined ? (
            <g>
              <rect width="700" height="320" fill="#091b27" />
              <text
                x={focused ? 180 : 350}
                y="34"
                textAnchor="middle"
                fill="#e8d29a"
                fontSize={focused ? 19 : 24}
              >
                {focused
                  ? 'ÁREA ÷ 4 · EJEMPLO APARTE'
                  : 'LUPA ALGEBRAICA · EJEMPLO APARTE'}
              </text>
              <text
                x={focused ? 180 : 350}
                y="59"
                textAnchor="middle"
                fill="#b5ced0"
                fontSize="17"
              >
                {focused
                  ? 'Cada grupo: cuatro áreas de Planck'
                  : 'Cada grupo tiene cuatro áreas de Planck'}
              </text>
              {Array.from({ length: exampleArea / 4 }, (_, group) => (
                <g
                  key={group}
                  transform={`translate(${(focused ? 35 : 64) + (group % (focused ? 4 : 8)) * 72} ${80 + Math.floor(group / (focused ? 4 : 8)) * (focused ? 64 : 72)})`}
                >
                  <rect
                    x="-5"
                    y="-5"
                    width="59"
                    height="59"
                    rx="5"
                    fill="none"
                    stroke="#527b81"
                  />
                  {Array.from({ length: 4 }, (_, cell) => (
                    <rect
                      key={cell}
                      x={(cell % 2) * 26}
                      y={Math.floor(cell / 2) * 26}
                      width="22"
                      height="22"
                      fill={group % 2 ? '#a5e4db' : '#efd29a'}
                    />
                  ))}
                </g>
              ))}
              <text
                x={focused ? 180 : 350}
                y="243"
                display={focused ? 'none' : undefined}
                textAnchor="middle"
                fill="#a5e4db"
                fontSize="20"
              >
                ← Arrastrá para cambiar el área de ejemplo →
              </text>
              <text
                x={focused ? 180 : 350}
                y={focused ? 365 : 279}
                textAnchor="middle"
                fill="#efd29a"
                fontSize={focused ? 22 : 30}
              >
                {exampleArea} ÷ 4 = {exampleArea / 4} unidades de S/kB
              </text>
              <text
                x={focused ? 180 : 350}
                y="307"
                display={focused ? 'none' : undefined}
                textAnchor="middle"
                fill="#b5ced0"
                fontSize="17"
              >
                No son bits ni celdas observadas · la masa del laboratorio
                no cambia
              </text>
              <rect
                {...example}
                x={focused ? 20 : 44}
                y="70"
                width={focused ? 320 : 612}
                height={focused ? 270 : 150}
                fill="transparent"
                className="spum-object-handle"
                role="slider"
                tabIndex={0}
                aria-label="Cambiar área de ejemplo en la escena"
                data-help-title="Manija de un ejemplo algebraico"
                data-help-body="Arrastrar aquí cambia el área de un ejemplo pequeño para visualizar la división por cuatro. No modifica la masa del agujero negro del montaje. Las casillas son una ayuda de conteo, no celdas de Planck observadas ni bits individuales."
                aria-valuemin={4}
                aria-valuemax={64}
                aria-valuenow={exampleArea}
                onKeyDown={(event) => {
                  const value = scrubKey(event.key, exampleArea, 4, 64, 4)
                  if (value !== undefined) {
                    event.preventDefault()
                    onExampleArea?.(value)
                  }
                }}
              />
            </g>
          ) : (
            <>
              <defs>
                <radialGradient id={`${id}-space`}>
                  <stop stopColor="#16303a" />
                  <stop offset="1" stopColor="#09141d" />
                </radialGradient>
                <radialGradient id={`${id}-body`} cx="32%" cy="22%">
                  <stop stopColor="#405047" />
                  <stop offset=".45" stopColor="#182924" />
                  <stop offset="1" stopColor="#040b10" />
                </radialGradient>
                <radialGradient id={`${id}-glow`}>
                  <stop offset=".7" stopColor="#e7c17f" stopOpacity="0" />
                  <stop
                    offset=".86"
                    stopColor="#e7c17f"
                    stopOpacity=".13"
                  />
                  <stop offset="1" stopColor="#e7c17f" stopOpacity="0" />
                </radialGradient>
                <pattern
                  id={`${id}-tiles`}
                  width="15"
                  height="15"
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    width="15"
                    height="15"
                    fill="#dabb7920"
                    stroke="#e3c58b"
                    strokeOpacity=".45"
                    strokeWidth=".8"
                  />
                </pattern>
              </defs>
              <rect width="700" height="425" fill={`url(#${id}-space)`} />
              {Array.from({ length: 65 }, (_, i) => (
                <circle
                  key={i}
                  cx={20 + ((i * 83) % 660)}
                  cy={32 + ((i * 53) % 355)}
                  r={i % 4 === 0 ? 1 : 0.6}
                  fill="#c2d7dd"
                  opacity=".25"
                />
              ))}
              <g
                className="en-svg-mono"
                fill="#a6bdc2"
                display={focused ? 'none' : undefined}
              >
                <text x="26" y="32">
                  GEOMETRÍA DEL HORIZONTE
                </text>
                <text x="488" y="65">
                  ÁREAS RELATIVAS
                </text>
              </g>
              <path
                d="M440 60V365"
                stroke="#b1cccf"
                strokeOpacity=".12"
                display={focused ? 'none' : undefined}
              />
              <g display={focused && view === 'area' ? 'none' : undefined}>
                <circle
                  cx="245"
                  cy="214"
                  r={radius * 1.28}
                  fill={`url(#${id}-glow)`}
                />
                <circle
                  cx="245"
                  cy="214"
                  r={radius}
                  fill={`url(#${id}-body)`}
                  stroke="#efd29a"
                  strokeWidth="1.5"
                />
                <g
                  fill="none"
                  stroke="#d9bc7f"
                  strokeWidth=".75"
                  opacity=".7"
                >
                  {graticule(radius, yaw).map((d, i) => (
                    <path key={i} d={d} />
                  ))}
                </g>
                <circle
                  cx="245"
                  cy="214"
                  r="70"
                  fill="none"
                  stroke="#8caab8"
                  strokeWidth="1"
                  strokeDasharray="4 5"
                />
                <path
                  d={`M245 ${214 + radius + 18}h${radius}m-${radius} -4v8m${radius} -8v8`}
                  fill="none"
                  stroke="#efd29a"
                />
                <text
                  x={245 + radius / 2}
                  y={214 + radius + 42}
                  textAnchor="middle"
                  fill="#efd29a"
                  fontSize={focused ? 18 : 13}
                >
                  rₛ ={' '}
                  {(model.current.radiusM / 1000).toLocaleString('es-AR', {
                    maximumFractionDigits: 1,
                  })}{' '}
                  km
                </text>

                <circle
                  {...resize}
                  cx={245 + radius}
                  cy="214"
                  r="8"
                  fill="#efd29a"
                  stroke="transparent"
                  strokeWidth="44"
                  vectorEffect="non-scaling-stroke"
                  className="spum-object-handle"
                  role="slider"
                  tabIndex={0}
                  aria-label="Cambiar masa inicial desde el horizonte"
                  data-help-title="Cambiar la masa desde el borde"
                  data-help-body="Este punto es un asa de control, no una partícula sobre el horizonte. Arrastrarlo en modo juego cambia la masa inicial: el radio crece proporcionalmente a M, el área y la entropía como M². La escala de referencia permanece fija para que se note el efecto."
                  aria-valuemin={5}
                  aria-valuemax={20}
                  aria-valuenow={mass}
                  aria-valuetext={`${mass} masas solares iniciales`}
                  onKeyDown={(e) => {
                    const v = scrubKey(e.key, mass, 5, 20, 0.1)
                    if (v !== undefined) {
                      e.preventDefault()
                      onMass(v)
                    }
                  }}
                />
              </g>
              <g
                display={focused && view === 'horizon' ? 'none' : undefined}
              >
                <rect
                  x="500"
                  y="134"
                  width="100"
                  height="100"
                  fill="none"
                  stroke="#8caab8"
                  strokeDasharray="4 4"
                />
                <rect
                  x={550 - areaSide / 2}
                  y={184 - areaSide / 2}
                  width={areaSide}
                  height={areaSide}
                  fill={`url(#${id}-tiles)`}
                  stroke="#efd29a"
                />
                <text
                  x="550"
                  y="324"
                  textAnchor="middle"
                  fill="#efd29a"
                  fontSize="30"
                  fontFamily="Georgia,serif"
                >
                  {model.areaRatio.toLocaleString('es-AR', {
                    maximumFractionDigits: 2,
                  })}{' '}
                  ×
                </text>
                <text
                  x="550"
                  y="347"
                  textAnchor="middle"
                  fill="#a6bdc2"
                  fontSize={focused ? 17 : 12}
                >
                  el área de referencia
                </text>

                <circle
                  {...emit}
                  cx={550 + areaSide / 2}
                  cy={184 + areaSide / 2}
                  r="7"
                  fill="#9ce3db"
                  stroke="transparent"
                  strokeWidth="44"
                  vectorEffect="non-scaling-stroke"
                  className="spum-object-handle"
                  role="slider"
                  tabIndex={0}
                  aria-label="Emitir masa desde el cuadro de área"
                  data-help-title="Elegir cuánta masa se emitió"
                  data-help-body="El punto en la esquina del cuadrado es una manija para avanzar o retroceder la fracción emitida del modelo. El cuadrado representa el cociente de áreas del horizonte: al reducirse la masa disminuyen área y entropía del agujero negro. No es una partícula ni la superficie física del horizonte."
                  aria-valuemin={0}
                  aria-valuemax={0.5}
                  aria-valuenow={emitted}
                  aria-valuetext={`${emitted * 100} por ciento de la masa inicial emitida`}
                  onKeyDown={(e) => {
                    const v = scrubKey(e.key, emitted, 0, 0.5, 0.025)
                    if (v !== undefined) {
                      e.preventDefault()
                      onEmitted(v)
                    }
                  }}
                />
              </g>
              <g display={focused ? 'none' : undefined}>
                <path d="M44 380h100m-100 -4v8m100 -8v8" stroke="#8caab8" />
                <text x="44" y="403" fill="#a6bdc2" fontSize="11">
                  {(
                    ((model.reference.radiusM / 1000) * 100) /
                    70
                  ).toLocaleString('es-AR', {
                    maximumFractionDigits: 1,
                  })}{' '}
                  km · escala fija del mapa
                </text>
                <text x="473" y="380" fill="#a6bdc2" fontSize="11">
                  Punteado: referencia de 10 M☉
                </text>
              </g>
            </>
          )}
        </svg>
        <div className="en-map-readout" role="status">
          {exampleArea !== undefined ? (
            <>
              <strong>
                {exampleArea} ÷ 4 = {exampleArea / 4} unidades de S/kB
              </strong>
              <span>
                Arrastrá los grupos. Ejemplo algebraico: no son bits ni
                celdas observadas.
              </span>
            </>
          ) : (
            <>
              <strong>
                Radio ×
                {model.radiusRatio.toLocaleString('es-AR', {
                  maximumFractionDigits: 2,
                })}{' '}
                · Área y entropía ×
                {model.areaRatio.toLocaleString('es-AR', {
                  maximumFractionDigits: 2,
                })}
              </strong>
              <span>
                {focused && view === 'horizon'
                  ? 'Arrastrá el borde dorado para cambiar la masa.'
                  : focused
                    ? 'Arrastrá la esquina verde para emitir masa.'
                    : 'Borde dorado: masa · Esquina verde: emisión.'}{' '}
                Punteado: referencia fija de 10 M☉.
              </span>
            </>
          )}
        </div>
      </div>
      {controls}
      <details className="bh-scene-details">
        <summary>Explorar la geometría y sus límites</summary>
        <div className="en-map-legend">
          <span>● Horizonte geométrico</span>
          <span>▦ Área relativa · otra escala</span>
          <span>⋯ Referencia: 10 M☉</span>
        </div>
        <div className="en-map-tools">
          <div className="en-buttons" aria-label="Explorar el mapa">
            {(
              [
                ['horizon', 'Horizonte'],
                ['grid', 'Trama'],
                ['reference', 'Referencia'],
              ] as const
            ).map(([key, title]) => (
              <button
                key={key}
                aria-pressed={inspect === key}
                onClick={() => setInspect(key)}
              >
                {title}
              </button>
            ))}
          </div>
          <label className="en-rotation">
            Girar el mapa{' '}
            <input
              aria-label="Girar el mapa"
              type="range"
              min="-45"
              max="45"
              value={(yaw * 180) / Math.PI}
              onChange={(e) =>
                setYaw((Number(e.target.value) * Math.PI) / 180)
              }
            />
          </label>
        </div>
        <p className="en-map-explainer" aria-live="polite">
          {descriptions[inspect]}
        </p>
      </details>
    </div>
  )
}
