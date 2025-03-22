import { useRef } from 'react';
import * as THREE from 'three';

interface SlitBarrierProps {
  position: [number, number, number];
  slitWidth: number;
  slitSeparation: number;
  slitCount: number;
  isObserved: boolean;
}

/**
 * Componente que representa la barrera con rendijas en el experimento
 */
export function SlitBarrier({
  position,
  slitWidth,
  slitSeparation,
  slitCount,
  isObserved
}: SlitBarrierProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Dimensiones de la barrera
  const barrierWidth = 2;
  const barrierHeight = 1;
  const barrierDepth = 0.05;

  // Calcular posiciones de las rendijas
  const calculateSlitPositions = () => {
    const positions = [];
    
    for (let i = 0; i < slitCount; i++) {
      let slitY = 0;
      if (slitCount % 2 === 0) {
        // Para número par de rendijas
        slitY = (i - slitCount / 2 + 0.5) * slitSeparation;
      } else {
        // Para número impar de rendijas
        slitY = (i - Math.floor(slitCount / 2)) * slitSeparation;
      }
      positions.push(slitY);
    }
    
    return positions;
  };

  const slitPositions = calculateSlitPositions();

  return (
    <group ref={groupRef} position={position}>
      {/* Barrera principal (plano sólido) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[barrierWidth, barrierHeight, barrierDepth]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Rendijas (como huecos en la barrera) */}
      {slitPositions.map((slitY, index) => (
        <mesh 
          key={`slit-${index}`} 
          position={[0, slitY, 0]}
        >
          <boxGeometry args={[slitWidth, slitWidth, barrierDepth + 0.01]} />
          <meshStandardMaterial 
            color="#000020" 
            transparent={true}
            opacity={0.1}
            depthWrite={false}
          />
          
          {/* Detector (solo visible cuando se observa) */}
          {isObserved && (
            <pointLight
              color="#FF5252"
              intensity={0.5}
              distance={0.5}
              position={[0, 0, 0.1]}
            />
          )}
        </mesh>
      ))}
    </group>
  );
} 