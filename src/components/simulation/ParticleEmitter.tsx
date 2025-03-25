import { useRef, useState, useEffect } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore, ParticleType, PARTICLE_PROPERTIES } from '../../store/store';

interface ParticleEmitterProps {
  position: [number, number, number];
  particleType: ParticleType;
  speed: number;
}

/**
 * Componente que emite partículas (electrones, fotones o neutrinos) hacia la barrera con rendijas
 */
export function ParticleEmitter({ position, particleType, speed }: ParticleEmitterProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Referencia al intervalo de emisión automática
  const autoEmitIntervalRef = useRef<number | null>(null);
  
  // Obtener estados y acciones desde el store
  const fireParticles = useStore(state => state.fireParticles);
  const isPaused = useStore(state => state.isPaused);
  const isAutoMode = useStore(state => state.isAutoMode);
  const particlesPerEmission = useStore(state => state.particlesPerEmission);
  const emissionSpeed = useStore(state => state.emissionSpeed);
  
  // Crear un vector para la posición 3D del emisor
  const emitterPosition = new THREE.Vector3(...position);
  
  // Obtener los colores y propiedades de la partícula seleccionada
  const particleColor = PARTICLE_PROPERTIES[particleType].color;
  const particleEmissive = PARTICLE_PROPERTIES[particleType].emissiveColor;
  
  // Efecto de hover
  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => { document.body.style.cursor = 'auto'; };
  }, [hovered]);
  
  // Función para calcular la dirección basada en el punto de clic
  const calculateDirection = (event: ThreeEvent<MouseEvent>) => {
    if (!meshRef.current) return new THREE.Vector3(1, 0, 0);
    
    // Punto donde se hizo clic (en el espacio mundial)
    const clickPoint = event.point.clone();
    
    // Calcular vector desde el centro de la esfera hasta el punto de clic
    const rawDirection = new THREE.Vector3().subVectors(clickPoint, emitterPosition).normalize();
    
    // Crear dirección restringida: principalmente en X, con mínima influencia de Y y Z
    // Tomamos solo un 1% de las componentes Y y Z para una desviación extremadamente sutil
    const restrictedDirection = new THREE.Vector3(
      1.0,                      // Fuerza componente X a 1 (dirección principal hacia la barrera)
      rawDirection.y * 0.01,    // Solo 1% de la componente Y original
      rawDirection.z * 0.01     // Solo 1% de la componente Z original
    );
    
    // Asegurar que la dirección esté normalizada
    return restrictedDirection.normalize();
  };
  
  // Manejador de clic
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (isPaused) return; // No hacer nada si está en pausa
    
    // Calcular dirección basada en el punto de clic
    const direction = calculateDirection(event);
    
    // Disparar partículas según el número configurado
    fireParticles(particlesPerEmission, direction);
    
    // Actualizar estado
    setClicked(true);
    
    // Evitar propagación si es necesario
    event.stopPropagation();
  };
  
  // Función para emitir partículas en modo automático
  const emitParticlesAuto = () => {
    if (isPaused || !isAutoMode) return;
    
    // Dirección por defecto (hacia adelante)
    const defaultDirection = new THREE.Vector3(1, 0, 0);
    
    // Disparar partículas 
    fireParticles(particlesPerEmission, defaultDirection);
    
    // Efecto visual de pulso
    setClicked(true);
    setTimeout(() => setClicked(false), 100);
  };
  
  // Gestionar el modo automático de emisión
  useEffect(() => {
    // Limpiar cualquier intervalo existente
    if (autoEmitIntervalRef.current) {
      clearInterval(autoEmitIntervalRef.current);
      autoEmitIntervalRef.current = null;
    }
    
    // Si el modo automático está activado y no está en pausa, iniciar emisión
    if (isAutoMode && !isPaused) {
      // Calcular el intervalo basado en la velocidad de emisión (más velocidad = menor intervalo)
      // Rango: 2000ms (velocidad 1) a 100ms (velocidad 10)
      const interval = Math.max(100, 2100 - emissionSpeed * 200);
      
      console.log(`Iniciando emisión automática con intervalo: ${interval}ms`);
      
      // Crear un nuevo intervalo
      autoEmitIntervalRef.current = setInterval(emitParticlesAuto, interval);
    }
    
    // Limpieza al desmontar o cambiar dependencias
    return () => {
      if (autoEmitIntervalRef.current) {
        clearInterval(autoEmitIntervalRef.current);
        autoEmitIntervalRef.current = null;
      }
    };
  }, [isAutoMode, isPaused, emissionSpeed, particlesPerEmission, fireParticles]);
  
  // Efecto para reiniciar el estado después de hacer clic
  useEffect(() => {
    if (clicked) {
      const timeout = setTimeout(() => setClicked(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [clicked]);
  
  // Animación simple de rotación y pulso cuando se hace clic
  useFrame((_, delta) => {
    if (meshRef.current) {
      // Rotación básica
      meshRef.current.rotation.y += 0.01 * speed;
      
      // Efecto de pulso al disparar
      if (clicked && meshRef.current.scale.x < 1.2) {
        meshRef.current.scale.set(
          meshRef.current.scale.x + delta * 2,
          meshRef.current.scale.y + delta * 2,
          meshRef.current.scale.z + delta * 2
        );
      } else if (!clicked && meshRef.current.scale.x > 1.0) {
        meshRef.current.scale.set(
          Math.max(1.0, meshRef.current.scale.x - delta * 4),
          Math.max(1.0, meshRef.current.scale.y - delta * 4),
          Math.max(1.0, meshRef.current.scale.z - delta * 4)
        );
      }
    }
  });

  return (
    <mesh 
      ref={meshRef}
      position={position}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
      onClick={handleClick}
      castShadow
    >
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial 
        color={particleColor} 
        emissive={particleEmissive}
        emissiveIntensity={hovered || clicked || isAutoMode ? 2 : 0.5}
      />
      
      {/* Luz que emana del emisor */}
      <pointLight 
        color={particleColor} 
        intensity={clicked || isAutoMode ? 2 : 1} 
        distance={3} 
      />
    </mesh>
  );
} 