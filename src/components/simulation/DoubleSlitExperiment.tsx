import { useRef } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/store';
import { ParticleEmitter } from './ParticleEmitter';
import { SlitBarrier } from './SlitBarrier';
import { DetectionScreen } from './DetectionScreen';
import { Particles } from './Particles';
import { WaveFunction } from './WaveFunction';

interface DoubleSlitExperimentProps {
  isObserved: boolean;
}

/**
 * Componente que representa el experimento completo de la doble rendija
 * Organiza los elementos principales: emisor, barrera con rendijas y pantalla de detección
 * 
 * Características principales:
 * - Coordina los componentes del experimento
 * - Implementa física cuántica con patrones de interferencia o difracción
 * - Con una sola rendija, no aplica observación (no tiene sentido físico)
 * - Visualiza la dualidad onda-partícula según el estado de observación
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
  
  // Desactivar observador en configuración de 1 rendija
  const effectiveObservation = slitCount === 1 ? false : isObserved;

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
        isObserved={effectiveObservation}
      />
      
      {/* Pantalla de detección */}
      <DetectionScreen 
        position={[2, 0, 0]}
        isObserved={effectiveObservation}
      />
      
      {/* Sistema de partículas */}
      <Particles />
      
      {/* Visualización de la función de onda */}
      <WaveFunction 
        slitWidth={slitWidth}
        slitSeparation={slitSeparation}
        slitCount={slitCount}
        isObserved={effectiveObservation}
        particleType={particleType}
      />
      
      {/* Plano de referencia (suelo) */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial 
          color="#1A1A2E" 
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
} 