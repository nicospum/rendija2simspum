import { useEffect, useMemo } from 'react'
import { Edges } from '@react-three/drei/core/Edges'
import { BufferGeometry, Float32BufferAttribute, DoubleSide } from 'three'
import type { ExperimentResult } from '../../physics/optics'

interface PrismProps {
  experiment: ExperimentResult
  onEnter: () => void
  onLeave: () => void
}

// Extrusion of the exact optical polygon: no separate visual rotation or shape.
export default function Prism({ experiment, onEnter, onLeave }: PrismProps) {
  const geometry = useMemo(() => {
    const positions: number[] = []
    for (const height of [0.34, 1.33]) {
      for (const vertex of experiment.vertices) positions.push(vertex.x, height, vertex.z)
    }
    const indices = [0, 1, 2, 3, 5, 4]
    for (let edge = 0; edge < 3; edge++) {
      const next = (edge + 1) % 3
      indices.push(edge, next + 3, next, edge, edge + 3, next + 3)
    }
    const result = new BufferGeometry()
    result.setAttribute('position', new Float32BufferAttribute(positions, 3))
    result.setIndex(indices)
    const flatFaces = result.toNonIndexed()
    result.dispose()
    flatFaces.computeVertexNormals()
    return flatFaces
  }, [experiment.vertices])
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <group>
      <mesh position={[0, 0.085, 0]}>
        <cylinderGeometry args={[0.82, 0.86, 0.14, 64]} />
        <meshStandardMaterial color="#263a40" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.171, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.76, 0.008, 8, 80]} />
        <meshBasicMaterial color="#8aa8a8" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[0.57, 0.61, 0.1, 3]} />
        <meshStandardMaterial color="#516369" metalness={0.75} roughness={0.32} />
      </mesh>
      <mesh
        geometry={geometry}
        onPointerOver={(event) => { event.stopPropagation(); onEnter() }}
        onPointerOut={onLeave}
        onClick={(event) => { event.stopPropagation(); onEnter() }}
        renderOrder={4}
      >
        <meshPhysicalMaterial
          color="#b9dedc" metalness={0} roughness={0.11}
          transmission={0.62} thickness={0.35}
          ior={experiment.rays.find((ray) => ray.wavelength === 550)?.refractiveIndex ?? 1.52}
          transparent opacity={0.44} depthWrite={false} side={DoubleSide}
          clearcoat={1} clearcoatRoughness={0.08} specularIntensity={1}
        />
        <Edges color="#a4e8df" threshold={18} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}
