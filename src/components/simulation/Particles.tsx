import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { 
  useStore, 
  Particle, 
  PARTICLE_PROPERTIES,
  calculateSingleSlitPattern,
  calculateMultiSlitPattern
} from '../../store/store';

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
  const registerSlitPass = useStore(state => state.registerSlitPass);
  const slitWidth = useStore(state => state.slitWidth);
  const slitSeparation = useStore(state => state.slitSeparation);
  const slitCount = useStore(state => state.slitCount);
  const isObserved = useStore(state => state.isObserved);
  const wavelength = useStore(state => state.wavelength);
  
  // Variables para cálculos físicos
  const screenDistanceRef = useRef(4.0); // Distancia total de emisor a pantalla
  
  // Contador para registrar estadísticas
  const statsRef = useRef({
    totalParticles: 0,
    collisionsBarrier: 0,
    passedSlits: 0,
    reachedScreen: 0
  });
  
  // Geometría y material compartidos para las partículas
  const geometryRef = useRef<THREE.SphereGeometry>(null);
  const materialRefs = useRef<Record<string, THREE.MeshStandardMaterial | null>>({
    electron: null,
    photon: null,
    neutrino: null
  });
  
  // Crear geometría y materiales compartidos (memoizado para rendimiento)
  useMemo(() => {
    geometryRef.current = new THREE.SphereGeometry(0.02, 8, 8);
    
    // Crear materiales para cada tipo de partícula
    Object.entries(PARTICLE_PROPERTIES).forEach(([type, props]) => {
      materialRefs.current[type] = new THREE.MeshStandardMaterial({
        color: props.color,
        emissive: props.emissiveColor,
        emissiveIntensity: 0.5
      });
    });
  }, []);
  
  /**
   * Verifica si una partícula pasa por alguna rendija y devuelve el índice de la rendija
   * 
   * @param position - Posición de la partícula
   * @returns Objeto con información de paso y rendija correspondiente
   */
  const checkSlitPassage = (position: THREE.Vector3): { passes: boolean, slitIndex: number } => {
    // Posición de las rendijas
    const slitStart = -slitSeparation * 0.5 * (slitCount - 1);
    
    // Verificar cada rendija
    for (let i = 0; i < slitCount; i++) {
      const slitY = slitStart + i * slitSeparation;
      const slitTop = slitY + slitWidth * 0.5;
      const slitBottom = slitY - slitWidth * 0.5;
      
      // Si la partícula está dentro de la rendija en Y, pasa
      if (position.y >= slitBottom && position.y <= slitTop) {
        return { passes: true, slitIndex: i };
      }
    }
    
    // No pasó por ninguna rendija
    return { passes: false, slitIndex: -1 };
  };
  
  /**
   * Aplica comportamiento cuántico a la partícula
   * 
   * Implementa los efectos de interferencia/difracción:
   * - Para 1 rendija: Patrón de difracción
   * - Para 2+ rendijas: Patrón de interferencia
   * 
   * Además, modifica el comportamiento según:
   * - Tipo de partícula (electron/photon/neutrino)
   * - Presencia de observador (excepto en neutrinos, poco afectados)
   * 
   * @param particle - Partícula a procesar
   * @returns Vector de velocidad modificado
   */
  const applyQuantumBehavior = (particle: Particle): THREE.Vector3 => {
    const velocity = particle.velocity.clone();
    const properties = PARTICLE_PROPERTIES[particle.type];
    
    // Posición vertical normalizada (-1 a 1) para cálculos de patrones
    const normalizedY = particle.position.y;
    
    // Distancia efectiva a la pantalla para cálculos
    const effectiveDistance = screenDistanceRef.current;
    
    let quantumEffect = 0;
    
    // Comportamiento específico según número de rendijas
    if (slitCount === 1) {
      // Para una sola rendija: patrón de difracción
      const pattern = calculateSingleSlitPattern(
        normalizedY, 
        effectiveDistance, 
        slitWidth, 
        wavelength
      );
      
      // Convertir el patrón en un efecto cuántico de desviación
      quantumEffect = (pattern - 0.5) * 0.05;
    } else {
      // Para múltiples rendijas: patrón de interferencia/trayectoria definida
      
      // Si hay observación y NO es neutrino (o es neutrino pero falla la probabilidad de no colapsar)
      const noCollapse = particle.type === 'neutrino' && 
                         Math.random() > properties.observationCollapseFactor;
      
      if (!isObserved || noCollapse) {
        // Sin observación: patrón de interferencia
        const pattern = calculateMultiSlitPattern(
          normalizedY,
          effectiveDistance,
          slitSeparation,
          slitCount,
          wavelength
        );
        
        // Efecto más pronunciado para interferencia
        quantumEffect = (pattern - 0.5) * 0.1;
      } else {
        // Con observación y colapso: trayectoria más definida
        // La partícula mantiene más su dirección original
        // (representando el colapso a una trayectoria definida)
        
        // Si tenemos información por cuál rendija pasó, usarla para el efecto
        if (particle.slitIndex !== undefined) {
          // Calcular posición central de la rendija
          const slitStart = -slitSeparation * 0.5 * (slitCount - 1);
          const slitCenterY = slitStart + particle.slitIndex * slitSeparation;
          
          // Efecto direccional hacia el centro de la rendija por la que pasó
          // (muy suave para simular un leve esparcimiento)
          quantumEffect = (slitCenterY - normalizedY) * 0.01;
        }
      }
    }
    
    // Aplicar el efecto calculado a la velocidad
    velocity.y += quantumEffect;
    
    // Normalizar para mantener velocidad constante
    return velocity.normalize().multiplyScalar(particle.velocity.length());
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
        const slitCheck = checkSlitPassage(newPosition);
        
        if (slitCheck.passes) {
          // Log para depuración - pasa por rendija
          console.log(`Partícula ${particle.id} pasó por la rendija ${slitCheck.slitIndex + 1}`);
          statsRef.current.passedSlits++;
          
          // Emitir evento de paso por rendija para el panel de información
          window.dispatchEvent(new CustomEvent('slitPass', {
            detail: { slitIndex: slitCheck.slitIndex }
          }));
          
          // Registrar por cuál rendija pasó
          registerSlitPass(particle.id, slitCheck.slitIndex);
          
          // Aplicar comportamiento cuántico si pasa por la rendija
          const quantumVelocity = applyQuantumBehavior(particle);
          
          // Actualizar posición y velocidad con efectos cuánticos
          updateParticlePosition(particle.id, newPosition);
          
          // Asignar la nueva velocidad modificada por efectos cuánticos
          particle.velocity.copy(quantumVelocity);
        } else {
          // Log para depuración - colisión con barrera
          console.log(`Partícula ${particle.id} colisionó con la barrera`);
          statsRef.current.collisionsBarrier++;
          
          // Emitir evento de colisión con barrera para el panel de información
          window.dispatchEvent(new CustomEvent('barrierCollision'));
          
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
            material={materialRefs.current[particle.type] || undefined}
          />
        )
      )}
    </>
  );
} 