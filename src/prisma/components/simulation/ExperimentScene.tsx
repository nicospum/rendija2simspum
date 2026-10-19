import { useEffect, useMemo } from 'react'
import { Line } from '@react-three/drei/core/Line'
import { AdditiveBlending, BufferGeometry, Color, DoubleSide, Float32BufferAttribute } from 'three'
import type { ExperimentConfig, ExperimentResult } from '../../physics/optics'
import { clipRayToViewBounds } from './cameraFraming'
import LightEmitter from './LightEmitter'
import Prism from './Prism'
import SpectrumScreen from './SpectrumScreen'
import OpticalBench from './OpticalBench'

type HoverTarget = 'lamp' | 'prism' | 'screen' | 'beam' | null

interface ExperimentSceneProps {
  experiment: ExperimentResult
  config: ExperimentConfig
  intensity: number
  lightEnabled: boolean
  showNormals: boolean
  minimumZ: number
  maximumZ: number
  onHover: (target: HoverTarget) => void
}

function LightPaths({ experiment, intensity, onHover }: { experiment: ExperimentResult; intensity: number; onHover: (target: HoverTarget) => void }) {
  const geometries = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    const glowPositions: number[] = []
    const glowColors: number[] = []
    const incidentPaths = new Set<string>()
    for (const ray of experiment.rays) {
      ray.segments.forEach((original, index) => {
        const segment = clipRayToViewBounds(original, experiment.screenX)
        if (!segment) return
        const incident = index === 0 && original.medium === 'air'
        if (incident) {
          const key = `${segment.from.x.toFixed(6)},${segment.from.z.toFixed(6)},${segment.to.x.toFixed(6)},${segment.to.z.toFixed(6)}`
          if (incidentPaths.has(key)) return
          incidentPaths.add(key)
        }
        const color = new Color(incident ? '#fff6dd' : ray.color).multiplyScalar(incident ? 1 : ray.transmission)
        const { from, to } = segment
        const representative = ray.offset === 0 && [380, 440, 490, 550, 580, 620, 700].includes(ray.wavelength)
        if (incident || representative) {
          positions.push(from.x, 0.84, from.z, to.x, 0.84, to.z)
          colors.push(color.r, color.g, color.b, color.r, color.g, color.b)
        }
        const length = Math.hypot(to.x - from.x, to.z - from.z)
        if (length < 1e-7) return
        const normalX = -(to.z - from.z) / length * 0.003
        const normalZ = (to.x - from.x) / length * 0.003
        const a = [from.x + normalX, 0.84, from.z + normalZ]
        const b = [from.x - normalX, 0.84, from.z - normalZ]
        const c = [to.x + normalX, 0.84, to.z + normalZ]
        const d = [to.x - normalX, 0.84, to.z - normalZ]
        glowPositions.push(...a, ...b, ...c, ...b, ...d, ...c)
        // The incoming white paths are deduplicated; spectral paths divide
        // their display power over the 33 wavelength samples.
        const power = incident ? 1 : 1 / 33
        for (let vertex = 0; vertex < 6; vertex++) glowColors.push(color.r * power, color.g * power, color.b * power)
      })
    }
    const core = new BufferGeometry()
    core.setAttribute('position', new Float32BufferAttribute(positions, 3))
    core.setAttribute('color', new Float32BufferAttribute(colors, 3))
    const glow = new BufferGeometry()
    glow.setAttribute('position', new Float32BufferAttribute(glowPositions, 3))
    glow.setAttribute('color', new Float32BufferAttribute(glowColors, 3))
    return { core, glow }
  }, [experiment])
  useEffect(() => () => { geometries.core.dispose(); geometries.glow.dispose() }, [geometries])

  return (
    <group>
      <mesh geometry={geometries.glow} renderOrder={8}
        onPointerOver={(event) => { event.stopPropagation(); onHover('beam') }}
        onPointerOut={() => onHover(null)}
        onClick={(event) => { event.stopPropagation(); onHover('beam') }}
      >
        <meshBasicMaterial vertexColors transparent opacity={intensity * 0.12} side={DoubleSide} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <lineSegments geometry={geometries.core} renderOrder={9} raycast={() => undefined}>
        <lineBasicMaterial vertexColors transparent opacity={intensity * 0.38} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </lineSegments>
    </group>
  )
}

export default function ExperimentScene({ experiment, config, intensity, lightEnabled, showNormals, minimumZ, maximumZ, onHover }: ExperimentSceneProps) {
  const central = experiment.rays.find((ray) => ray.wavelength === 550 && Math.abs(ray.offset) < 1e-6)
  return (
    <>
      <ambientLight intensity={0.7} />
      <hemisphereLight color="#dbf3e9" groundColor="#132128" intensity={1.8} />
      <directionalLight position={[-4, 7, 4]} intensity={2.4} color="#d2e9eb" />
      <directionalLight position={[4, 3, -3]} intensity={1.1} color="#88b6b9" />
      <OpticalBench screenX={experiment.screenX} minimumZ={minimumZ} maximumZ={maximumZ} />
      <LightEmitter experiment={experiment} config={config} intensity={intensity} lightEnabled={lightEnabled} onEnter={() => onHover('lamp')} onLeave={() => onHover(null)} />
      <Prism experiment={experiment} onEnter={() => onHover('prism')} onLeave={() => onHover(null)} />
      <SpectrumScreen experiment={experiment} minimumZ={minimumZ} maximumZ={maximumZ} intensity={intensity} lightEnabled={lightEnabled} onEnter={() => onHover('screen')} onLeave={() => onHover(null)} />
      {lightEnabled && <LightPaths experiment={experiment} intensity={intensity} onHover={onHover} />}
      {showNormals && central?.interactions.map((interaction, index) => (
        <Line key={index}
          points={[
            [interaction.point.x - interaction.normal.x * 0.36, 0.846, interaction.point.z - interaction.normal.z * 0.36],
            [interaction.point.x + interaction.normal.x * 0.56, 0.846, interaction.point.z + interaction.normal.z * 0.56],
          ]}
          color={interaction.type === 'internal-reflection' ? '#ffbf70' : '#8bbdc4'}
          lineWidth={1} dashed dashSize={0.055} gapSize={0.035} transparent opacity={0.9}
        />
      ))}
    </>
  )
}
