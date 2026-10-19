import { useEffect, useMemo } from 'react'
import { BufferGeometry, Color, DoubleSide, Float32BufferAttribute } from 'three'
import type { ExperimentResult } from '../../physics/optics'

interface SpectrumScreenProps {
  experiment: ExperimentResult
  minimumZ: number
  maximumZ: number
  intensity: number
  lightEnabled: boolean
  onEnter: () => void
  onLeave: () => void
}

export default function SpectrumScreen({ experiment, minimumZ, maximumZ, intensity, lightEnabled, onEnter, onLeave }: SpectrumScreenProps) {
  const centerZ = (minimumZ + maximumZ) / 2
  const width = maximumZ - minimumZ
  const spectrum = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    const bands: { low: number; high: number; color: Color; power: number }[] = []
    // Source offsets bound each calculated wavelength footprint. Power is
    // combined before rendering, so overlapping wavelengths mix additively
    // rather than one painted stripe hiding another.
    for (const wavelength of new Set(experiment.rays.map((ray) => ray.wavelength))) {
      const rays = experiment.rays.filter((ray) => ray.wavelength === wavelength && ray.status === 'screen' && ray.screenHit && Math.abs(ray.screenHit.z) <= 12)
      if (!rays.length) continue
      const hits = rays.map((ray) => ray.screenHit!.z)
      bands.push({
        low: Math.max(-12, Math.min(...hits) - 0.004),
        high: Math.min(12, Math.max(...hits) + 0.004),
        color: new Color(rays[0].color),
        power: rays.reduce((sum, ray) => sum + ray.transmission, 0) / rays.length,
      })
    }
    const unrefractedHits = experiment.rays.flatMap((ray) => ray.status === 'missed' && ray.screenHit && Math.abs(ray.screenHit.z) <= 12 ? [ray.screenHit.z] : [])
    if (unrefractedHits.length) bands.push({
      low: Math.max(-12, Math.min(...unrefractedHits) - 0.004),
      high: Math.min(12, Math.max(...unrefractedHits) + 0.004),
      color: new Color('#fff7df'),
      power: unrefractedHits.length / new Set(experiment.rays.map((ray) => ray.offset)).size,
    })
    if (bands.length) {
      const low = Math.min(...bands.map((band) => band.low))
      const high = Math.max(...bands.map((band) => band.high))
      const step = (high - low) / 192
      const cells = Array.from({ length: 192 }, (_, index) => {
        const z = low + step * (index + 0.5)
        const color = new Color(0, 0, 0)
        let power = 0
        for (const band of bands) {
          if (z < band.low || z > band.high) continue
          color.r += band.color.r * band.power
          color.g += band.color.g * band.power
          color.b += band.color.b * band.power
          power += band.power
        }
        return { color, power }
      })
      const peak = Math.max(...cells.map((cell) => cell.power))
      const x = experiment.screenX - 0.018
      cells.forEach(({ color, power }, index) => {
        if (power === 0) return
        color.multiplyScalar(1 / Math.max(color.r, color.g, color.b, 1e-8))
        const bottom = low + index * step
        const top = bottom + step
        positions.push(x, 0.52, bottom, x, 1.16, bottom, x, 1.16, top, x, 0.52, bottom, x, 1.16, top, x, 0.52, top)
        for (let vertex = 0; vertex < 6; vertex++) colors.push(color.r, color.g, color.b, Math.sqrt(power / peak))
      })
    }
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 4))
    return geometry
  }, [experiment])
  useEffect(() => () => spectrum.dispose(), [spectrum])

  return (
    <group>
      <group
        position={[experiment.screenX + 0.035, 0.97, centerZ]}
        onPointerOver={(event) => { event.stopPropagation(); onEnter() }}
        onPointerOut={onLeave}
        onClick={(event) => { event.stopPropagation(); onEnter() }}
      >
        <mesh>
          <boxGeometry args={[0.075, 1.52, width + 0.13]} />
          <meshStandardMaterial color="#6d8284" metalness={0.65} roughness={0.3} />
        </mesh>
        <mesh position={[-0.04, 0, 0]}>
          <boxGeometry args={[0.012, 1.38, width]} />
          <meshStandardMaterial color="#dce5dc" roughness={0.94} metalness={0} />
        </mesh>
      </group>
      {[minimumZ + 0.13, maximumZ - 0.13].map((z) => (
        <group key={z} position={[experiment.screenX + 0.065, 0, z]}>
          <mesh position={[0, 0.055, 0]}>
            <boxGeometry args={[0.5, 0.11, 0.23]} />
            <meshStandardMaterial color="#283b41" metalness={0.75} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.21, 0]}>
            <cylinderGeometry args={[0.037, 0.037, 0.32, 12]} />
            <meshStandardMaterial color="#829693" metalness={0.9} roughness={0.25} />
          </mesh>
        </group>
      ))}
      {lightEnabled && (
        <mesh geometry={spectrum} renderOrder={12}>
          <meshBasicMaterial vertexColors transparent opacity={0.94 * intensity} side={DoubleSide} depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}
