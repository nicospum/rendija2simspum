import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore, Particle } from '../../store/store';

/**
 * Componente que gestiona y renderiza las partículas del experimento
 * Maneja la física y colisiones de las partículas
 */
export function Particles() {
  // Referencias a posiciones de los elementos clave
  const barrierPosition = new THREE.Vector3(0, 0, 0);
  const screenPosition = new THREE.Vector3(2, 0, 0);
  
  // Obtener el estado del store
  const particles = useStore(state => state.particles);
  const updateParticlePosition = useStore(state => state.updateParticlePosition);
  const deactivateParticle = useStore(state => state.deactivateParticle);
  const registerParticleImpact = useStore(state => state.registerParticleImpact);
  const slitWidth = useStore(state => state.slitWidth);
  const slitSeparation = useStore(state => state.slitSeparation);
  const slitCount = useStore(state => state.slitCount);
  const isObserved = useStore(state => state.isObserved);
  
  // Contador para registrar estadísticas
  const statsRef = useRef({
    totalParticles: 0,
    collisionsBarrier: 0,
    passedSlits: 0,
    reachedScreen: 0
  });
  
  // Geometría y material compartidos para las partículas
  const geometryRef = useRef<THREE.SphereGeometry>(null);
  const materialElectronRef = useRef<THREE.MeshStandardMaterial>(null);
  const materialPhotonRef = useRef<THREE.MeshStandardMaterial>(null);
  
  // Crear geometría y materiales compartidos (memoizado para rendimiento)
  useMemo(() => {
    geometryRef.current = new THREE.SphereGeometry(0.02, 8, 8);
    materialElectronRef.current = new THREE.MeshStandardMaterial({
      color: '#64B5F6',
      emissive: '#64B5F6',
      emissiveIntensity: 0.5
    });
    materialPhotonRef.current = new THREE.MeshStandardMaterial({
      color: '#FFEE58',
      emissive: '#FFEE58',
      emissiveIntensity: 0.5
    });
  }, []);
  
  // Función para verificar si una partícula pasa por alguna rendija
  const passesSlits = (position: THREE.Vector3): boolean => {
    // Posición de las rendijas
    const slitStart = -slitSeparation * 0.5 * (slitCount - 1);
    
    // Verificar cada rendija
    for (let i = 0; i < slitCount; i++) {
      const slitY = slitStart + i * slitSeparation;
      const slitTop = slitY + slitWidth * 0.5;
      const slitBottom = slitY - slitWidth * 0.5;
      
      // Si la partícula está dentro de la rendija en Y, pasa
      if (position.y >= slitBottom && position.y <= slitTop) {
        return true;
      }
    }
    
    // No pasó por ninguna rendija
    return false;
  };
  
  // Función para calcular la trayectoria cuántica de una partícula
  const applyQuantumBehavior = (particle: Particle): THREE.Vector3 => {
    const velocity = particle.velocity.clone();
    
    // Si no hay observación, aplicar interferencia cuántica
    if (!isObserved) {
      // Introducir un pequeño cambio en la dirección basado en principios cuánticos
      // Esto es una simplificación para visualizar el fenómeno de interferencia
      const waveIntensity = 0.02;
      const phase = particle.position.y * 20; // Factor para crear el patrón de interferencia
      const interference = Math.cos(phase) * waveIntensity;
      
      velocity.y += interference;
    }
    
    return velocity;
  };
  
  // Lógica de movimiento y colisiones de partículas
  useFrame((_, delta) => {
    const activeParticles = particles.filter(p => p.isActive);
    
    // Log para depuración - partículas activas
    if (activeParticles.length > 0 && activeParticles.length !== statsRef.current.totalParticles) {
      console.log(`Partículas activas: ${activeParticles.length}`);
      statsRef.current.totalParticles = activeParticles.length;
    }
    
    activeParticles.forEach(particle => {
      // Calcular nueva posición
      const newPosition = particle.position.clone().add(
        particle.velocity.clone().multiplyScalar(delta * 2) // Multiplicamos por un factor para mayor velocidad
      );
      
      // Verificar colisión con la barrera
      if (newPosition.x >= barrierPosition.x - 0.05 && 
          particle.position.x < barrierPosition.x - 0.05) {
        
        // Comprobar si pasa por alguna rendija
        if (passesSlits(newPosition)) {
          // Log para depuración - pasa por rendija
          console.log(`Partícula ${particle.id} pasó por una rendija`);
          statsRef.current.passedSlits++;
          
          // Aplicar comportamiento cuántico si pasa por la rendija
          const quantumVelocity = applyQuantumBehavior(particle);
          updateParticlePosition(particle.id, newPosition);
          
          // Actualizar velocidad con efectos cuánticos
          const updatedParticle = {
            ...particle,
            position: newPosition,
            velocity: quantumVelocity
          };
          
          updateParticlePosition(updatedParticle.id, updatedParticle.position);
        } else {
          // Log para depuración - colisión con barrera
          console.log(`Partícula ${particle.id} colisionó con la barrera`);
          statsRef.current.collisionsBarrier++;
          
          // Colisión con la barrera, desactivar partícula
          deactivateParticle(particle.id);
        }
      } 
      // Verificar colisión con la pantalla
      else if (newPosition.x >= screenPosition.x - 0.05 && 
               particle.position.x < screenPosition.x - 0.05) {
        // Log para depuración - impacto en pantalla
        console.log(`Partícula ${particle.id} impactó en la pantalla en posición y=${newPosition.y.toFixed(2)}, z=${newPosition.z.toFixed(2)}`);
        statsRef.current.reachedScreen++;
        
        // Registrar impacto en la pantalla
        registerParticleImpact(particle.id, newPosition);
      }
      // Sin colisiones, actualizar posición
      else {
        updateParticlePosition(particle.id, newPosition);
      }
    });
  });
  
  // Renderizar cada partícula activa
  return (
    <>
      {particles.map(particle => 
        particle.isActive && (
          <mesh 
            key={particle.id}
            position={[particle.position.x, particle.position.y, particle.position.z]}
            geometry={geometryRef.current || undefined}
            material={
              particle.type === 'electron' 
                ? materialElectronRef.current || undefined
                : materialPhotonRef.current || undefined
            }
          />
        )
      )}
    </>
  );
} 