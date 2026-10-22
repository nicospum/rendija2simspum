import { useSvgScrub } from '../shared/useSvgScrub'
import { scrubKey } from '../shared/sceneInteraction'
import { sourceAtY } from './interaction'
import { radians, SKY_DISTANCE, RS_REFERENCE } from './physics'
import type { Ray } from './physics'
import type { Setup } from './learning'

export default function Diagram({
  setup,
  ray,
  neighbors,
  onSource,
}: {
  setup: Setup
  ray: Ray
  neighbors: Ray[]
  onSource?: (value: number) => void
}) {
  const drag = useSvgScrub((p) => {
    const v = sourceAtY(p.y, setup.yaw, setup.azimuth)
    if (v !== null) onSource?.(v)
  })
  const scale = setup.mass
  const paths = [...neighbors, ray]
  const sourceAngle = radians(setup.source + setup.yaw)
  const sourceX = -90 * Math.cos(sourceAngle)
  const sourceY = 90 * Math.sin(sourceAngle) * Math.cos(setup.azimuth)
  const outsidePlane =
    Math.abs(Math.sin(sourceAngle) * Math.sin(setup.azimuth)) > 1e-6
  const overview = (p: { x: number; y: number }) =>
    `${(320 + p.x * scale * 3.15).toFixed(2)},${(320 - p.y * scale * 3.15).toFixed(2)}`
  const near = (p: { x: number; y: number }) =>
    `${(p.x * scale).toFixed(4)},${(-p.y * scale).toFixed(4)}`
  return (
    <div className="ln-diagram">
      <svg
        className="ln-overview"
        viewBox="0 0 640 640"
        role={onSource ? 'group' : 'img'}
        aria-label={`Trayectorias calculadas. El rayo elegido ${ray.outcome === 'sky' ? 'alcanza la esfera de fondo' : ray.outcome === 'captured' ? 'alcanza el horizonte' : 'no se resuelve dentro del límite numérico'}. Corte por el plano del rayo.`}
      >
        <defs>
          <pattern
            id="ln-coordinate-grid"
            width="63"
            height="63"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M63 0H0V63"
              stroke="#294149"
              strokeWidth="1"
              fill="none"
            />
          </pattern>
        </defs>
        <rect
          x="15"
          y="15"
          width="610"
          height="610"
          fill="url(#ln-coordinate-grid)"
          opacity=".4"
        />
        <circle
          cx="320"
          cy="320"
          r={(3.15 * SKY_DISTANCE) / RS_REFERENCE}
          fill="none"
          stroke="#6d9caa"
          strokeDasharray="4 6"
          opacity=".7"
        />
        <path
          d="M25 320H615M320 25V615"
          stroke="#4d6570"
          strokeWidth="1"
          opacity=".6"
        />
        {paths.map((item, i) => (
          <polyline
            key={i}
            points={item.points.map(overview).join(' ')}
            fill="none"
            stroke={i === paths.length - 1 ? '#f4c789' : '#78b7c5'}
            strokeWidth={i === paths.length - 1 ? 3 : 1.5}
            opacity={i === paths.length - 1 ? 1 : 0.45}
          />
        ))}
        {setup.gravity && (
          <circle
            cx="320"
            cy="320"
            r={3.15 * scale}
            fill="#03090d"
            stroke="#ddae72"
          />
        )}
        <circle cx="395.6" cy="320" r="7" fill="#b8e0e7" />
        <circle
          cx={320 + sourceX * 3.15}
          cy={320 - sourceY * 3.15}
          r="8"
          fill="#f5c681"
          stroke="#fff1d9"
        />
        {onSource && Math.abs(Math.cos(setup.azimuth)) >= 0.25 && (
          <circle
            {...drag}
            cx={320 + sourceX * 3.15}
            cy={320 - sourceY * 3.15}
            r="8"
            fill="transparent"
            stroke="transparent"
            strokeWidth="44"
            vectorEffect="non-scaling-stroke"
            className="spum-object-handle"
            role="slider"
            tabIndex={0}
            aria-label="Mover la fuente dorada en el diagrama"
            aria-valuemin={-18}
            aria-valuemax={18}
            aria-valuenow={setup.source}
            onKeyDown={(e) => {
              const v = scrubKey(e.key, setup.source, -18, 18, 1)
              if (v !== undefined) {
                e.preventDefault()
                onSource(v)
              }
            }}
          />
        )}
        <text
          className="ln-diagram-labels"
          x={336 + sourceX * 3.15}
          y={307 - sourceY * 3.15}
        >
          {outsidePlane ? 'PROYECCIÓN' : 'FUENTE'}
        </text>
        <g className="ln-diagram-labels">
          <text x="410" y="307">
            CÁMARA
          </text>
          <text x="320" y="28" textAnchor="middle">
            ESFERA LUMINOSA DE FONDO
          </text>
          <text x="320" y="627" textAnchor="middle">
            RASTREO INVERSO: CÁMARA → ORIGEN
          </text>
          <text x="323" y="352">
            0
          </text>
        </g>
      </svg>
      <details className="bh-scene-details">
        <summary>Ampliación cercana y cómo leer las coordenadas</summary>
        <div className="ln-near-row">
          <div>
            <span className="ln-eyebrow">CERCA DEL AGUJERO NEGRO</span>
            <svg
              className="ln-closeup"
              viewBox="-12 -12 24 24"
              role="img"
              aria-label="Ampliación de las mismas trayectorias: horizonte y esfera de fotones. Escala física fija."
            >
              <defs>
                <clipPath id="ln-near-clip">
                  <rect x="-12" y="-12" width="24" height="24" rx=".4" />
                </clipPath>
              </defs>
              <g clipPath="url(#ln-near-clip)">
                <rect
                  x="-12"
                  y="-12"
                  width="24"
                  height="24"
                  fill="#080f16"
                />
                <path
                  d="M-12 0H12M0 -12V12"
                  stroke="#243740"
                  strokeWidth=".06"
                />
                {setup.gravity && (
                  <circle
                    r={1.5 * scale}
                    fill="none"
                    stroke="#7eaab5"
                    strokeWidth=".12"
                    strokeDasharray=".18 .18"
                  />
                )}
                {paths.map((item, i) => (
                  <polyline
                    key={i}
                    points={item.points.map(near).join(' ')}
                    fill="none"
                    stroke={i === paths.length - 1 ? '#f4c789' : '#78b7c5'}
                    strokeWidth={i === paths.length - 1 ? '.16' : '.08'}
                    opacity={i === paths.length - 1 ? 1 : 0.45}
                  />
                ))}
                {setup.gravity && (
                  <circle
                    r={scale}
                    fill="#02070a"
                    stroke="#cfa76f"
                    strokeWidth=".12"
                  />
                )}
              </g>
            </svg>
          </div>
          <div className="ln-path-key">
            <span>
              <i /> Rayo elegido
            </span>
            <span>
              <i /> Direcciones vecinas
            </span>
            {setup.gravity && (
              <span>
                <i /> Esfera de fotones: 1,5 rₛ
              </span>
            )}
            <span>
              {setup.gravity
                ? 'Horizonte: rₛ'
                : 'Sin lente: caminos rectos'}
            </span>
            <p>
              La ampliación usa la misma escala física al cambiar la masa.
            </p>
          </div>
        </div>
        <p className="ln-caption">
          Corte en el plano del rayo: (r cos φ, r sin φ), con r de
          Schwarzschild. φ = 0 apunta a la cámara; este corte gira con ella.
          Las curvas son geodésicas; el dibujo no es una distancia espacial
          euclídea medida ni una vista desde afuera del universo.{' '}
          {outsidePlane
            ? 'La fuente está fuera de este corte: su marcador muestra una proyección.'
            : 'La fuente y la cámara están en este corte.'}
        </p>
        <p className="ln-caption">
          Rastreamos hacia el origen para saber qué ve cada píxel. La luz
          recibida viaja en sentido contrario. Alcanzar el horizonte en este
          rastreo no significa recibir luz desde su interior.
        </p>
      </details>
    </div>
  )
}
