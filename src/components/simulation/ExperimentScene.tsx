import { useEffect, useMemo } from 'react'
import { Line } from '@react-three/drei/core/Line'
import { AdditiveBlending, DataTexture, LinearFilter, RGBAFormat } from 'three'
import { slitCenters } from '../../physics/interference'
import { useLabStore } from '../../store/store'

const METAL = '#526877'
const DARK = '#182b39'
const MINT = '#6ef5cb'

function Box({
  position,
  size,
  color = METAL,
  roughness = 0.38,
  metalness = 0.65,
}: {
  position: [number, number, number]
  size: [number, number, number]
  color?: string
  roughness?: number
  metalness?: number
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  )
}

function Bench({ distance }: { distance: number }) {
  const length = distance + 4.9,
    center = (distance - 3.65) / 2
  const grid = useMemo(() => {
    const vertices: number[] = []
    for (let z = -3.5; z <= 3.5; z += 0.5)
      vertices.push(center - length / 2, 0.006, z, center + length / 2, 0.006, z)
    for (let x = Math.ceil(center - length / 2); x < center + length / 2; x += 0.5)
      vertices.push(x, 0.006, -3.5, x, 0.006, 3.5)
    return new Float32Array(vertices)
  }, [center, length])
  return (
    <group>
      <Box
        position={[center, -0.13, 0]}
        size={[length, 0.25, 7.05]}
        color="#142631"
        roughness={0.72}
      />
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[grid, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#40616c" transparent opacity={0.22} />
      </lineSegments>
      <Box position={[center, -0.045, 3.53]} size={[length, 0.032, 0.022]} color="#578a95" />
      <Box position={[center, -0.045, -3.53]} size={[length, 0.032, 0.022]} color="#578a95" />
      <Box position={[center, 0.055, 0]} size={[length - 0.35, 0.09, 0.18]} color="#344d5c" />
      {[-2.8, -0.65, distance - 0.35].map((x, i) => (
        <mesh key={i} position={[x, 0.109, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.035, 12]} />
          <meshBasicMaterial color="#8aa6ad" />
        </mesh>
      ))}
    </group>
  )
}

function Emitter() {
  const particleType = useLabStore((state) => state.config.particleType)
  const isPaused = useLabStore((state) => state.isPaused)
  const color =
    particleType === 'photon' ? '#ffe2a5' : particleType === 'neutron' ? '#bdabff' : MINT
  return (
    <group position={[-3.2, 0, 0]}>
      <Box position={[-0.18, 0.17, 0]} size={[1.05, 0.2, 0.8]} color="#2d4553" />
      <Box position={[-0.18, 0.58, 0]} size={[0.21, 0.7, 0.2]} />
      <group position={[-0.2, 1.13, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.83, 40]} />
          <meshStandardMaterial color="#4d6472" metalness={0.82} roughness={0.28} />
        </mesh>
        {[-0.3, -0.14, 0.14].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.328, 0.025, 8, 40]} />
            <meshStandardMaterial color="#9fb6c0" metalness={0.85} roughness={0.24} />
          </mesh>
        ))}
        <mesh position={[0, 0.43, 0]}>
          <cylinderGeometry args={[0.26, 0.29, 0.12, 40]} />
          <meshStandardMaterial color="#0c1921" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.495, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.19, 40]} />
          <meshBasicMaterial color={color} transparent opacity={isPaused ? 0.4 : 0.9} />
        </mesh>
      </group>
      <mesh position={[-0.4, 0.3, 0.34]}>
        <sphereGeometry args={[0.035, 12, 8]} />
        <meshBasicMaterial color={isPaused ? '#77959d' : color} />
      </mesh>
    </group>
  )
}

function Barrier() {
  const config = useLabStore((state) => state.config)
  const centers = useMemo(() => slitCenters(config), [config])
  const edges = [
    -1.45,
    ...centers.flatMap((z) => [z - config.slitWidth / 2, z + config.slitWidth / 2]),
    1.45,
  ]
  const detection = config.detectorStrength > 0 && config.slitCount > 1
  return (
    <group>
      <Box position={[0, 0.13, 0]} size={[0.75, 0.2, 3.18]} color="#2e4554" />
      <Box position={[0, 0.37, 0]} size={[0.17, 0.3, 2.9]} color={DARK} />
      <Box position={[0, 1.92, 0]} size={[0.17, 0.35, 2.9]} color={DARK} />
      {edges
        .slice(0, -1)
        .map(
          (start, index) =>
            index % 2 === 0 && (
              <Box
                key={`${index}-${start}`}
                position={[0, 1.13, (start + edges[index + 1]) / 2]}
                size={[0.17, 1.22, edges[index + 1] - start]}
                color="#283e4b"
              />
            ),
        )}
      {centers.map((z) => (
        <group key={z}>
          {[-1, 1].map((side) => (
            <Box
              key={side}
              position={[-0.095, 1.13, z + side * (config.slitWidth / 2 + 0.008)]}
              size={[0.014, 1.22, 0.015]}
              color="#b3cbd2"
              metalness={0.82}
            />
          ))}
          <mesh position={[-0.11, 1.76, z]}>
            <sphereGeometry args={[0.035, 12, 8]} />
            <meshBasicMaterial color={detection ? '#ffbf85' : '#75939c'} />
          </mesh>
          {detection && (
            <mesh position={[-0.135, 1.13, z]}>
              <boxGeometry args={[0.015, 1.1, config.slitWidth * 0.7]} />
              <meshBasicMaterial
                color="#ffbd80"
                transparent
                opacity={0.08 + config.detectorStrength * 0.16}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>
      ))}
      {[-1.5, 1.5].map((z) => (
        <Box key={z} position={[0, 1.14, z]} size={[0.22, 1.96, 0.09]} />
      ))}
    </group>
  )
}

function TheoryBands() {
  const distribution = useLabStore((state) => state.distribution)
  const distance = useLabStore((state) => state.config.screenDistance)
  const texture = useMemo(() => {
    const values = distribution.probabilities
    const max = Math.max(...values, 1e-10)
    const data = new Uint8Array(values.length * 4)
    for (let index = 0; index < values.length; index++) {
      const brightness = Math.pow(values[index] / max, 0.65)
      data[index * 4] = 59
      data[index * 4 + 1] = 166
      data[index * 4 + 2] = 187
      data[index * 4 + 3] = Math.round(brightness * 93)
    }
    const result = new DataTexture(data, values.length, 1, RGBAFormat)
    result.magFilter = LinearFilter
    result.minFilter = LinearFilter
    result.needsUpdate = true
    return result
  }, [distribution])
  useEffect(() => () => texture.dispose(), [texture])
  const curve = useMemo(() => {
    const maximum = Math.max(...distribution.probabilities, 1e-10)
    return distribution.positions.map((z, i): [number, number, number] => [
      distance - 0.145,
      0.33 + (distribution.probabilities[i] / maximum) * 0.42,
      z,
    ])
  }, [distribution, distance])
  return (
    <group>
      <mesh position={[distance - 0.111, 1.17, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[6, 1.7]} />
        <meshBasicMaterial map={texture} transparent depthWrite={false} />
      </mesh>
      <Line points={curve} color="#80bdce" lineWidth={1.3} transparent opacity={0.8} />
    </group>
  )
}

function DetectionScreen() {
  const distance = useLabStore((state) => state.config.screenDistance)
  const recentHits = useLabStore((state) => state.recentHits)
  const showTheory = useLabStore((state) => state.showTheory)
  const dotTexture = useMemo(() => {
    const size = 32,
      data = new Uint8Array(size * size * 4)
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const radius = Math.hypot(((x + 0.5) / size) * 2 - 1, ((y + 0.5) / size) * 2 - 1)
        const offset = (y * size + x) * 4
        data[offset] = data[offset + 1] = data[offset + 2] = 255
        data[offset + 3] = Math.round(Math.max(0, Math.min(1, (1 - radius) * 3)) * 255)
      }
    const texture = new DataTexture(data, size, size, RGBAFormat)
    texture.magFilter = LinearFilter
    texture.minFilter = LinearFilter
    texture.needsUpdate = true
    return texture
  }, [])
  useEffect(() => () => dotTexture.dispose(), [dotTexture])
  const points = useMemo(() => {
    const positions = new Float32Array(recentHits.length * 3)
    for (let index = 0; index < recentHits.length; index++) {
      const hit = recentHits[index]
      // Vertical placement is decorative; the model predicts the horizontal z distribution.
      positions[index * 3] = distance - 0.16
      positions[index * 3 + 1] = 0.45 + (hit.y - 0.4) * 1.85
      positions[index * 3 + 2] = hit.z
    }
    return positions
  }, [recentHits, distance])
  return (
    <group>
      <Box
        position={[distance, 1.17, 0]}
        size={[0.2, 1.94, 6.08]}
        color="#0a1a25"
        roughness={0.9}
        metalness={0.12}
      />
      <Box position={[distance - 0.012, 2.19, 0]} size={[0.25, 0.12, 6.3]} color="#577482" />
      <Box position={[distance - 0.012, 0.15, 0]} size={[0.25, 0.13, 6.3]} color="#577482" />
      {[-3.1, 3.1].map((z) => (
        <group key={z}>
          <Box position={[distance, 1.17, z]} size={[0.25, 2.16, 0.1]} color="#577482" />
          <Box position={[distance + 0.05, 0.06, z]} size={[0.65, 0.1, 0.23]} color="#2e4554" />
        </group>
      ))}
      {showTheory && <TheoryBands />}
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[points, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#c9ffed"
          map={dotTexture}
          size={0.055}
          sizeAttenuation
          transparent
          opacity={0.95}
          alphaTest={0.03}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  )
}

/** Static wavefront guide, deliberately separate from measured particle impacts. */
function WaveGuide() {
  const config = useLabStore((state) => state.config)
  const centers = useMemo(() => slitCenters(config), [config])
  const waves = useMemo(() => {
    const result: number[] = []
    // Wavelength is exaggerated eightfold so the guide remains legible. It is
    // not the field used to sample detections, nor a particle flight animation.
    const spacing = config.wavelength * 8
    for (const center of centers)
      for (let radius = spacing; radius < config.screenDistance; radius += spacing) {
        for (let step = -36; step < 36; step++) {
          const a = (step * Math.PI) / 112,
            b = ((step + 1) * Math.PI) / 112
          const ax = Math.cos(a) * radius,
            az = center + Math.sin(a) * radius
          const bx = Math.cos(b) * radius,
            bz = center + Math.sin(b) * radius
          if (
            Math.abs(az) <= 3 &&
            Math.abs(bz) <= 3 &&
            ax < config.screenDistance - 0.2 &&
            bx < config.screenDistance - 0.2
          ) {
            result.push(ax, 1.12, az, bx, 1.12, bz)
          }
        }
      }
    for (let x = -2.6; x < -0.2; x += spacing) result.push(x, 1.12, -0.72, x, 1.12, 0.72)
    return new Float32Array(result)
  }, [config, centers])
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[waves, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        color="#8ba7ff"
        transparent
        opacity={0.25 / Math.sqrt(centers.length)}
        depthWrite={false}
      />
    </lineSegments>
  )
}

export default function ExperimentScene() {
  const distance = useLabStore((state) => state.config.screenDistance)
  const showWaves = useLabStore((state) => state.showWaves)
  return (
    <>
      <ambientLight intensity={0.85} />
      <hemisphereLight args={['#adcfeb', '#14232d', 1.6]} />
      <directionalLight
        position={[-3, 8, 5]}
        intensity={2.5}
        color="#e2f2ff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-normalBias={0.04}
      />
      <directionalLight position={[5, 4, -5]} intensity={2} color="#729dff" />
      <Bench distance={distance} />
      <Emitter />
      <Barrier />
      <DetectionScreen />
      {showWaves && <WaveGuide />}
    </>
  )
}
