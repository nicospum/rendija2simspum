import { useEffect, useMemo, useRef, useState, type ComponentRef, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei/core/OrbitControls'
import { PerspectiveCamera, Vector3 } from 'three'
import { useLabStore } from '../../store/store'
import ExperimentScene from './ExperimentScene'
import { CanvasErrorBoundary } from './CanvasErrorBoundary'
import { apparatusBounds, CAMERA_FOV, fitCamera, type CameraView } from './cameraFraming'
import './SceneViewport.css'

const LABELS = [
  {
    name: 'Emisor',
    index: '01',
    explanation:
      'Cada partícula detectada deja un único impacto localizado. Las franjas aparecen al reunir muchos eventos, incluso si las partículas se emiten de a una.',
  },
  {
    name: 'Rendijas',
    index: '02',
    explanation:
      'Sin información del camino, las amplitudes de las rendijas interfieren. Un detector que distingue por dónde pasó la partícula reduce la coherencia, no el tamaño de cada impacto.',
  },
  {
    name: 'Pantalla',
    index: '03',
    explanation:
      'Los puntos claros son detecciones muestreadas. El fondo azul y la curva, si están activos, son la probabilidad teórica; no son datos medidos.',
  },
] as const

function CameraRig() {
  const view = useLabStore((state) => state.view)
  const resetKey = useLabStore((state) => state.cameraResetKey)
  const distance = useLabStore((state) => state.config.screenDistance)
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const { camera, size, invalidate } = useThree()
  const previous = useRef<{
    view: CameraView
    resetKey: number
    width: number
    height: number
  } | null>(null)
  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera) || size.width <= 0 || size.height <= 0) return
    // Flush damping before fitting: pending orbit inertia must not shift the new framing.
    if (controls.current) {
      const damping = controls.current.enableDamping
      controls.current.enableDamping = false
      controls.current.update()
      controls.current.enableDamping = damping
    }
    const old = previous.current
    const preserveOrbit =
      old?.view === view &&
      old.resetKey === resetKey &&
      old.width === size.width &&
      old.height === size.height
    const direction =
      preserveOrbit && controls.current
        ? camera.position.clone().sub(controls.current.target)
        : undefined
    const frame = fitCamera(apparatusBounds(distance), size.width, size.height, view, direction)
    camera.up.copy(frame.up)
    camera.position.copy(frame.position)
    camera.fov = CAMERA_FOV
    camera.far = Math.max(100, frame.distance + 30)
    camera.updateProjectionMatrix()
    camera.lookAt(frame.target)
    controls.current?.target.copy(frame.target)
    controls.current?.update()
    previous.current = { view, resetKey, width: size.width, height: size.height }
    invalidate()
  }, [camera, size.width, size.height, view, resetKey, distance, invalidate])
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.12}
      enableRotate={view !== 'top'}
      enablePan
      enableZoom
      minDistance={4}
      maxDistance={80}
      minPolarAngle={view === 'top' ? 0 : 0.12}
      maxPolarAngle={view === 'top' ? Math.PI : Math.PI / 2 - 0.045}
      rotateSpeed={0.6}
      panSpeed={0.6}
      zoomSpeed={0.7}
    />
  )
}

function ProjectedLabels({ references }: { references: RefObject<HTMLDivElement | null>[] }) {
  const distance = useLabStore((state) => state.config.screenDistance)
  const view = useLabStore((state) => state.view)
  const positions = useMemo<[number, number, number][]>(
    () => [
      [-3.3, 1.58, 0],
      [0, 2.12, 0],
      [distance, 2.28, 0],
    ],
    [distance],
  )
  const point = useMemo(() => new Vector3(), [])
  useFrame(({ camera, size }) => {
    const widths = references.map((reference) => reference.current?.offsetWidth ?? 0)
    positions.forEach((position, index) => {
      const element = references[index].current
      if (!element) return
      point.set(...position).project(camera)
      const visible =
        point.z >= -1 && point.z <= 1 && Math.abs(point.x) < 1.05 && Math.abs(point.y) < 1.05
      element.style.visibility = visible ? 'visible' : 'hidden'
      if (!visible) return
      const padding = widths[index] / 2 + 7
      const x = Math.max(
        padding,
        Math.min(size.width - padding, (point.x * 0.5 + 0.5) * size.width),
      )
      const y = Math.max(
        49,
        Math.min(
          size.height - 42,
          (-point.y * 0.5 + 0.5) * size.height - (view === 'top' ? 28 : 12),
        ),
      )
      element.style.left = `${x}px`
      element.style.top = `${y}px`
      element.dataset.placement = y > size.height * 0.55 ? 'above' : 'below'
    })
  })
  return null
}

export default function SceneViewport({ touchCamera = false }: { touchCamera?: boolean }) {
  const first = useRef<HTMLDivElement>(null),
    second = useRef<HTMLDivElement>(null),
    third = useRef<HTMLDivElement>(null)
  const references = useMemo(() => [first, second, third], [])
  const [activeLabel, setActiveLabel] = useState<number | null>(null)
  const showWaves = useLabStore((state) => state.showWaves)
  const showTheory = useLabStore((state) => state.showTheory)
  const detectorStrength = useLabStore((state) => state.config.detectorStrength)
  const slitCount = useLabStore((state) => state.config.slitCount)
  const slitExplanation =
    slitCount === 1
      ? 'Una sola abertura también produce difracción: su ancho determina la envolvente del patrón. No hay dos caminos que distinguir.'
      : detectorStrength > 0
        ? `Este modelo mezcla un ${Math.round(detectorStrength * 100)} % de eventos con información del camino y el resto coherente. Por eso se reduce el contraste de las franjas; cada detección sigue siendo un punto.`
        : `Las amplitudes de ${slitCount} rendijas se suman antes de calcular la probabilidad. Sus fases producen máximos y mínimos de interferencia, aunque se emita una partícula a la vez.`
  return (
    <div className="quantum-viewport" aria-label="Banco experimental 3D de rendijas">
      <CanvasErrorBoundary>
        <Canvas
          shadows
          frameloop="demand"
          dpr={[1, 1.5]}
          camera={{ position: [-6, 6, 9], fov: CAMERA_FOV, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          fallback={
            <div className="quantum-fallback">
              La vista 3D necesita WebGL. Podés seguir explorando el experimento con los controles,
              el gráfico y las explicaciones.
            </div>
          }
          onPointerMissed={() => setActiveLabel(null)}
        >
          <color attach="background" args={['#0c1924']} />
          <fog attach="fog" args={['#0c1924', 25, 70]} />
          <CameraRig />
          <ExperimentScene />
          <ProjectedLabels references={references} />
        </Canvas>
      </CanvasErrorBoundary>
      <div
        className="spum-camera-scroll"
        data-camera-enabled={touchCamera}
        aria-hidden="true"
        onPointerDown={() => setActiveLabel(null)}
      />
      <div className="quantum-scene-badges" aria-live="polite">
        <span>
          <i />
          Banco virtual
        </span>
        <span className={detectorStrength > 0 && slitCount > 1 ? 'is-which-path' : ''}>
          {detectorStrength > 0 && slitCount > 1 ? 'Información del camino' : 'Sin medir el camino'}
        </span>
      </div>
      <div className="quantum-scene-labels">
        {LABELS.map((label, index) => (
          <div
            key={label.name}
            ref={references[index]}
            className={`quantum-scene-label${activeLabel === index ? ' is-open' : ''}`}
            onMouseEnter={() => setActiveLabel(index)}
            onMouseLeave={(event) => {
              if (!event.currentTarget.contains(document.activeElement)) setActiveLabel(null)
            }}
          >
            <button
              type="button"
              aria-expanded={activeLabel === index}
              aria-describedby={`apparatus-help-${index}`}
              onClick={() => setActiveLabel(index)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setActiveLabel(null)
              }}
              onFocus={() => setActiveLabel(index)}
              onBlur={() => setActiveLabel(null)}
            >
              <small>{label.index}</small>
              {label.name}
              <span aria-hidden="true">↗</span>
            </button>
            <div role="tooltip" id={`apparatus-help-${index}`} className="quantum-scene-tooltip">
              {index === 1 ? slitExplanation : label.explanation}
            </div>
          </div>
        ))}
      </div>
      <div className="quantum-scene-caption">
        <span>
          {showWaves
            ? 'Frentes de onda: guía cualitativa'
            : 'Arrastrá para girar · pellizcá para acercar'}
        </span>
        <span>
          {showTheory ? 'Azul: teoría · puntos: detecciones' : 'Puntos: detecciones localizadas'}
        </span>
      </div>
    </div>
  )
}
