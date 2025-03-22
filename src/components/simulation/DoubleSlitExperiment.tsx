import { useRef } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/store';
import { ParticleEmitter } from './ParticleEmitter';
import { SlitBarrier } from './SlitBarrier';
import { DetectionScreen } from './DetectionScreen';
// import { WaveFunction } from './WaveFunction';

interface DoubleSlitExperimentProps {
  isObserved: boolean;
}

/**
 * Componente que representa el experimento completo de la doble rendija
 * Organiza los elementos principales: emisor, barrera con rendijas y pantalla de detección
 */
export function DoubleSlitExperiment({ isObserved }: DoubleSlitExperimentProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Obtenemos parámetros del almacén de estado utilizando selectores individuales
  // para evitar el problema de recreación de objetos que causa bucles infinitos
  const slitWidth = useStore(state => state.slitWidth);
  const slitSeparation = useStore(state => state.slitSeparation);
  const slitCount = useStore(state => state.slitCount);
  const particleType = useStore(state => state.particleType);
  const particleSpeed = useStore(state => state.particleSpeed);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Etiquetas para los componentes */}
      <Text 
        position={[-2, 1.2, 0]} 
        color="#00B8D4" 
        fontSize={0.15}
        anchorX="center"
      >
        Emisor
      </Text>
      
      <Text 
        position={[0, 1.2, 0]} 
        color="#00B8D4" 
        fontSize={0.15}
        anchorX="center"
      >
        Barrera
      </Text>
      
      <Text 
        position={[2, 1.2, 0]} 
        color="#00B8D4" 
        fontSize={0.15}
        anchorX="center"
      >
        Pantalla
      </Text>

      {/* Emisor de partículas */}
      <ParticleEmitter 
        position={[-2, 0, 0]}
        particleType={particleType}
        speed={particleSpeed}
      />
      
      {/* Barrera con rendijas */}
      <SlitBarrier 
        position={[0, 0, 0]}
        slitWidth={slitWidth}
        slitSeparation={slitSeparation}
        slitCount={slitCount}
        isObserved={isObserved}
      />
      
      {/* Pantalla de detección */}
      <DetectionScreen 
        position={[2, 0, 0]}
        isObserved={isObserved}
      />
      
      {/* Plano de referencia (suelo) */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]} 
        receiveShadow
      >
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color="#1A1A2E" />
      </mesh>
    </group>
  );
} 