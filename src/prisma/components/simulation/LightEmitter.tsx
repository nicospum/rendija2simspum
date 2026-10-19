import type { ExperimentConfig, ExperimentResult } from '../../physics/optics'

interface LightEmitterProps {
  experiment: ExperimentResult
  config: ExperimentConfig
  intensity: number
  lightEnabled: boolean
  onEnter: () => void
  onLeave: () => void
}

export default function LightEmitter({ experiment, config, intensity, lightEnabled, onEnter, onLeave }: LightEmitterProps) {
  return (
    <group position={[experiment.source.x, 0, experiment.source.z]}>
      <mesh position={[-0.24, 0.065, 0]}>
        <boxGeometry args={[0.76, 0.13, 0.64]} />
        <meshStandardMaterial color="#1c2b30" metalness={0.65} roughness={0.4} />
      </mesh>
      <mesh position={[-0.24, 0.36, 0]}>
        <cylinderGeometry args={[0.055, 0.06, 0.55, 16]} />
        <meshStandardMaterial color="#8c9999" metalness={0.9} roughness={0.25} />
      </mesh>
      <group
        position={[0, 0.84, 0]}
        rotation={[0, -config.lightAngle * Math.PI / 180, 0]}
        onPointerOver={(event) => { event.stopPropagation(); onEnter() }}
        onPointerOut={onLeave}
        onClick={(event) => { event.stopPropagation(); onEnter() }}
      >
        <mesh position={[-0.34, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.215, 0.215, 0.64, 32]} />
          <meshStandardMaterial color="#314348" metalness={0.75} roughness={0.28} />
        </mesh>
        {[-0.6, -0.51, -0.42, -0.33].map((position) => (
          <mesh key={position} position={[position, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.216, 0.014, 8, 32]} />
            <meshStandardMaterial color="#17272c" metalness={0.85} roughness={0.32} />
          </mesh>
        ))}
        <mesh position={[-0.027, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.18, 0.21, 0.09, 32]} />
          <meshStandardMaterial color="#92a9a7" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.021, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.165, 32]} />
          <meshStandardMaterial color="#17242b" roughness={0.2} />
        </mesh>
        <mesh position={[0.024, 0, 0]}>
          <boxGeometry args={[0.004, 0.23, Math.max(0.012, config.lightWidth)]} />
          <meshBasicMaterial color={lightEnabled && intensity > 0 ? '#fff7dc' : '#46565c'} toneMapped={false} />
        </mesh>
        <mesh position={[-0.3, 0.26, 0]}>
          <boxGeometry args={[0.26, 0.04, 0.08]} />
          <meshStandardMaterial color="#768d8c" metalness={0.9} roughness={0.35} />
        </mesh>
      </group>
      {lightEnabled && <pointLight position={[0.1, 0.85, 0]} intensity={intensity * 1.5} distance={1.35} color="#fff2d1" decay={2} />}
    </group>
  )
}
