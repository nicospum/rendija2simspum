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
  
  // Altura de las rendijas (más altas que anchas)
  const slitHeight = 0.7;

  // Calcular posiciones de las rendijas
  const calculateSlitPositions = () => {
    const positions = [];
    
    for (let i = 0; i < slitCount; i++) {
      let slitX = 0;
      if (slitCount % 2 === 0) {
        // Para número par de rendijas
        slitX = (i - slitCount / 2 + 0.5) * slitSeparation;
      } else {
        // Para número impar de rendijas
        slitX = (i - Math.floor(slitCount / 2)) * slitSeparation;
      }
      positions.push(slitX);
    }
    
    return positions;
  };

  const slitPositions = calculateSlitPositions();

  // Ya no necesitamos pre-calcular la geometría, ahora la creamos para cada rendija
  
  return (
    <group ref={groupRef} position={position} rotation={[0, Math.PI/2, 0]}>
      {/* Barrera completa (con segmentos que cubren todo excepto las rendijas) */}
      
      {/* Parte superior e inferior de la barrera */}
      <mesh castShadow receiveShadow position={[0, (barrierHeight - slitHeight) / 4 + slitHeight / 2, 0]}>
        <boxGeometry args={[barrierWidth, (barrierHeight - slitHeight) / 2, barrierDepth]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      <mesh castShadow receiveShadow position={[0, -(barrierHeight - slitHeight) / 4 - slitHeight / 2, 0]}>
        <boxGeometry args={[barrierWidth, (barrierHeight - slitHeight) / 2, barrierDepth]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Segmentos laterales entre rendijas */}
      {slitPositions.map((slitX, index) => {
        // Segmentos a la izquierda de la primera rendija y entre rendijas
        const leftSegments = [];
        if (index === 0) {
          // Desde el borde izquierdo hasta la primera rendija
          const leftWidth = slitX - slitWidth/2 + barrierWidth/2;
          if (leftWidth > 0) {
            leftSegments.push(
              <mesh 
                key={`left-segment-${index}`} 
                position={[-barrierWidth/2 + leftWidth/2, 0, 0]} 
                castShadow 
                receiveShadow
              >
                <boxGeometry args={[leftWidth, slitHeight, barrierDepth]} />
                <meshStandardMaterial color="#333333" />
              </mesh>
            );
          }
        } else {
          // Entre rendijas
          const prevSlitX = slitPositions[index - 1];
          const midWidth = slitX - prevSlitX - slitWidth;
          if (midWidth > 0) {
            leftSegments.push(
              <mesh 
                key={`mid-segment-${index}`} 
                position={[prevSlitX + midWidth/2 + slitWidth/2, 0, 0]} 
                castShadow 
                receiveShadow
              >
                <boxGeometry args={[midWidth, slitHeight, barrierDepth]} />
                <meshStandardMaterial color="#333333" />
              </mesh>
            );
          }
        }
        
        // Segmento a la derecha de la última rendija
        const rightSegments = [];
        if (index === slitPositions.length - 1) {
          const rightWidth = barrierWidth/2 - (slitX + slitWidth/2);
          if (rightWidth > 0) {
            rightSegments.push(
              <mesh 
                key={`right-segment-${index}`} 
                position={[slitX + slitWidth/2 + rightWidth/2, 0, 0]} 
                castShadow 
                receiveShadow
              >
                <boxGeometry args={[rightWidth, slitHeight, barrierDepth]} />
                <meshStandardMaterial color="#333333" />
              </mesh>
            );
          }
        }
        
        return [...leftSegments, ...rightSegments];
      }).flat()}

      {/* Rendijas (solo se muestra el borde y el detector si está observado) */}
      {slitPositions.map((slitX, index) => (
        <group key={`slit-group-${index}`} position={[slitX, 0, 0]}>
          {/* Borde brillante alrededor de la rendija */}
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(slitWidth + 0.01, slitHeight + 0.01, barrierDepth + 0.02)]} />
            <lineBasicMaterial color="#00B8D4" linewidth={1} />
          </lineSegments>
          
          {/* Detector (solo visible cuando se observa) */}
          {isObserved && (
            <pointLight
              color="#FF5252"
              intensity={0.5}
              distance={0.5}
              position={[0, 0, 0.1]}
            />
          )}
        </group>
      ))}
    </group>
  );
} 