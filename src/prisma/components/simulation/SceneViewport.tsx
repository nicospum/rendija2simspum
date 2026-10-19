import { useEffect, useMemo, useRef, type ComponentRef, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei/core/OrbitControls'
import { PerspectiveCamera, Vector3 } from 'three'
import type { ExperimentConfig, ExperimentResult } from '../../physics/optics'
import ExperimentScene from './ExperimentScene'
import { CAMERA_FOV, experimentFramingPoints, fitExperimentCamera, settleOrbitControls } from './cameraFraming'

interface SceneViewportProps {
  experiment: ExperimentResult
  config: ExperimentConfig
  intensity: number
  lightEnabled: boolean
  view: 'perspective' | 'top'
  showNormals: boolean
  showLabels: boolean
  cameraResetKey: number
  onHover: (target: 'lamp' | 'prism' | 'screen' | 'beam' | null) => void
}

interface Layout {
  minimumZ: number
  maximumZ: number
}

const LABELS = [
  { target: 'lamp', index: '01', title: 'Luz blanca', detail: 'Fuente colimada' },
  { target: 'prism', index: '02', title: 'Prisma', detail: 'Refracción · dispersión' },
  { target: 'screen', index: '03', title: 'Espectro', detail: 'Pantalla de observación' },
] as const

// DOM labels stay in the existing React root. Drei Html creates separate
// roots whose synchronous cleanup conflicts with React 19 StrictMode.
function ProjectionLabels({ references, positions, view }: {
  references: RefObject<HTMLButtonElement | null>[]
  positions: [number, number, number][]
  view: SceneViewportProps['view']
}) {
  const point = useMemo(() => new Vector3(), [])
  useFrame(({ camera, size }) => {
    // Read all dimensions before writing positions to avoid repeated layout
    // work while the user orbits the camera.
    const dimensions = references.map((reference) => ({
      width: reference.current?.offsetWidth ?? 0,
      height: reference.current?.offsetHeight ?? 0,
    }))
    positions.forEach((position, index) => {
      const label = references[index].current
      if (!label) return
      point.set(...position).project(camera)
      const visible = point.z >= -1 && point.z <= 1 && Math.abs(point.x) <= 1.05 && Math.abs(point.y) <= 1.05
      label.style.visibility = visible ? 'visible' : 'hidden'
      if (!visible) return
      const marginX = dimensions[index].width / 2 + 6
      const projectedX = (point.x * 0.5 + 0.5) * size.width
      const projectedY = (-point.y * 0.5 + 0.5) * size.height - (view === 'top' ? 28 : 10)
      const minimumY = dimensions[index].height + 6
      const maximumY = size.height - 6
      label.style.left = `${Math.max(marginX, Math.min(size.width - marginX, projectedX))}px`
      label.style.top = `${Math.max(minimumY, Math.min(maximumY, projectedY))}px`
      label.style.transform = 'translate(-50%, -100%)'
    })
  })
  return null
}

function CameraRig({ view, cameraResetKey, points }: { view: SceneViewportProps['view']; cameraResetKey: number; points: Vector3[] }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const { camera, invalidate, size } = useThree()
  const lastFrame = useRef<{ view: SceneViewportProps['view']; key: number; width: number; height: number } | null>(null)

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera) || size.width <= 0 || size.height <= 0) return
    if (controls.current) settleOrbitControls(controls.current)
    const previous = lastFrame.current
    const preserveOrbit = previous?.view === view && previous.key === cameraResetKey
      && previous.width === size.width && previous.height === size.height && controls.current
    const direction = preserveOrbit ? camera.position.clone().sub(controls.current!.target) : undefined
    const frame = fitExperimentCamera(points, size.width, size.height, view, direction)
    camera.up.copy(frame.up)
    camera.position.copy(frame.position)
    camera.fov = CAMERA_FOV
    camera.far = frame.far
    camera.updateProjectionMatrix()
    camera.lookAt(frame.target)
    controls.current?.target.copy(frame.target)
    controls.current?.update()
    lastFrame.current = { view, key: cameraResetKey, width: size.width, height: size.height }
    invalidate()
  }, [camera, view, cameraResetKey, points, invalidate, size.width, size.height])

  return (
    <OrbitControls
      ref={controls} makeDefault enableDamping dampingFactor={0.12}
      enableRotate={view !== 'top'} enablePan enableZoom
      minDistance={4} maxDistance={100}
      minPolarAngle={view === 'top' ? 0 : 0.08} maxPolarAngle={view === 'top' ? Math.PI : Math.PI / 2 - 0.06}
      zoomSpeed={0.75} rotateSpeed={0.6} panSpeed={0.65}
    />
  )
}

export default function SceneViewport(props: SceneViewportProps) {
  const lampLabel = useRef<HTMLButtonElement>(null)
  const prismLabel = useRef<HTMLButtonElement>(null)
  const screenLabel = useRef<HTMLButtonElement>(null)
  const references = useMemo(() => [lampLabel, prismLabel, screenLabel], [])
  const layout = useMemo<Layout>(() => {
    const hits = props.experiment.rays.flatMap((ray) => ray.screenHit && Math.abs(ray.screenHit.z) <= 12 ? [ray.screenHit.z] : [])
    const low = hits.length ? Math.min(...hits) : 0
    const high = hits.length ? Math.max(...hits) : 0
    const center = (low + high) / 2
    const halfWidth = Math.max(0.68, (high - low) / 2 + 0.22)
    const minimumZ = Math.max(-12, center - halfWidth)
    const maximumZ = Math.min(12, center + halfWidth)
    return { minimumZ, maximumZ }
  }, [props.experiment])
  const framingPoints = useMemo(() => experimentFramingPoints(
    props.experiment, props.config, layout.minimumZ, layout.maximumZ, props.showNormals,
  ), [props.experiment, props.config, layout.minimumZ, layout.maximumZ, props.showNormals])
  const labelPositions = useMemo<[number, number, number][]>(() => [
    [props.experiment.source.x - 0.08, 1.12, props.experiment.source.z],
    [0, 1.33, 0],
    [props.experiment.screenX, 1.73, (layout.minimumZ + layout.maximumZ) / 2],
  ], [props.experiment.source.x, props.experiment.source.z, props.experiment.screenX, layout.minimumZ, layout.maximumZ])
  const outside = props.experiment.rays.filter((ray) => ray.screenHit && Math.abs(ray.screenHit.z) > 12).length

  return (
    <div className="scene-viewport" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        frameloop="demand" dpr={[1, 1.5]}
        camera={{ position: [-5, 6, 9], fov: 43, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        fallback={<div className="scene-fallback">Tu navegador necesita WebGL para mostrar el banco óptico. Podés explorar los controles y los resultados numéricos.</div>}
        onPointerMissed={() => props.onHover(null)}
      >
        <color attach="background" args={['#101c20']} />
        <CameraRig view={props.view} cameraResetKey={props.cameraResetKey} points={framingPoints} />
        <ExperimentScene {...props} minimumZ={layout.minimumZ} maximumZ={layout.maximumZ} />
        <ProjectionLabels references={references} positions={labelPositions} view={props.view} />
      </Canvas>
      {props.showLabels && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {LABELS.map((label, index) => (
            <button
              key={label.target} ref={references[index]} className="scene-label"
              style={{ position: 'absolute', left: 0, top: 0, visibility: 'hidden', pointerEvents: 'auto' }}
              onMouseEnter={() => props.onHover(label.target)} onMouseLeave={() => props.onHover(null)}
              onFocus={() => props.onHover(label.target)} onBlur={() => props.onHover(null)}
              onClick={() => props.onHover(label.target)}
            >
              <span className="scene-label__index">{label.index}</span>
              <span className="scene-label__title">{label.title}</span>
              <span className="scene-label__detail">{label.detail}</span>
            </button>
          ))}
        </div>
      )}
      {outside > 0 && <div className="scene-boundary-note" role="status">{outside} impactos calculados fuera del banco</div>}
    </div>
  )
}
