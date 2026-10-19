import { useEffect, useMemo } from 'react'
import { BufferGeometry, Float32BufferAttribute } from 'three'

interface OpticalBenchProps {
  screenX: number
  minimumZ: number
  maximumZ: number
}

export default function OpticalBench({ screenX, minimumZ, maximumZ }: OpticalBenchProps) {
  const left = -4.65
  const right = screenX + 0.65
  const back = Math.min(-1.6, minimumZ - 0.55)
  const front = Math.max(1.6, maximumZ + 0.55)
  const centerX = (left + right) / 2
  const centerZ = (back + front) / 2
  const markings = useMemo(() => {
    const positions: number[] = []
    for (let x = Math.ceil(left * 5) / 5; x < right; x += 0.2) {
      const major = Math.abs(x - Math.round(x)) < 0.001
      positions.push(x, 0.013, -1.33, x, 0.013, -1.33 + (major ? 0.22 : 0.09))
    }
    positions.push(left + 0.3, 0.013, -1.33, right - 0.3, 0.013, -1.33)
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
    return geometry
  }, [left, right])
  useEffect(() => () => markings.dispose(), [markings])

  return (
    <group>
      <mesh position={[centerX, -0.12, centerZ]}>
        <boxGeometry args={[right - left, 0.24, front - back]} />
        <meshStandardMaterial color="#1b3036" roughness={0.72} metalness={0.3} />
      </mesh>
      <mesh position={[centerX, -0.265, centerZ]}>
        <boxGeometry args={[right - left - 0.12, 0.05, front - back - 0.12]} />
        <meshStandardMaterial color="#071316" roughness={0.58} metalness={0.6} />
      </mesh>
      {[left + 0.18, right - 0.18].flatMap((x) => [back + 0.18, front - 0.18].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, 0.01, z]}>
          <cylinderGeometry args={[0.04, 0.04, 0.018, 6]} />
          <meshStandardMaterial color="#718286" roughness={0.4} metalness={0.8} />
        </mesh>
      )))}
      <mesh position={[centerX, 0.005, -0.96]}>
        <boxGeometry args={[right - left - 0.55, 0.014, 0.045]} />
        <meshStandardMaterial color="#52686d" metalness={0.8} roughness={0.35} />
      </mesh>
      <lineSegments geometry={markings}>
        <lineBasicMaterial color="#668388" transparent opacity={0.72} />
      </lineSegments>
    </group>
  )
}
