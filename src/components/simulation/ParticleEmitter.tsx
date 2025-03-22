import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleEmitterProps {
  position: [number, number, number];
  particleType: 'electron' | 'photon';
  speed: number;
}

/**
 * Componente que emite partículas (electrones o fotones) hacia la barrera con rendijas
 */
export function ParticleEmitter({ position, particleType, speed }: ParticleEmitterProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  
  // Colores para los diferentes tipos de partículas
  const particleColors = {
    electron: '#64B5F6', // Azul para electrones
    photon: '#FFEE58'    // Amarillo para fotones
  };
  
  // Efecto de hover
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered]);
  
  // Animación simple de rotación
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01 * speed;
    }
  });

  return (
    <mesh 
      ref={meshRef}
      position={position}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      castShadow
    >
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial 
        color={particleColors[particleType]} 
        emissive={particleColors[particleType]}
        emissiveIntensity={hovered ? 2 : 0.5}
      />
      
      {/* Luz que emana del emisor */}
      <pointLight 
        color={particleColors[particleType]} 
        intensity={1} 
        distance={3} 
      />
    </mesh>
  );
} 