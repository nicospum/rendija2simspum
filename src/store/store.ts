import { create } from 'zustand';
import * as THREE from 'three';

/**
 * Tipos de partículas disponibles para el experimento
 */
export type ParticleType = 'electron' | 'photon';

/**
 * Interfaz que define una partícula individual en el experimento
 */
export interface Particle {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: ParticleType;
  isActive: boolean;
}

/**
 * Genera un número aleatorio con distribución gaussiana.
 * Utiliza el algoritmo de Box-Muller para transformar números aleatorios uniformes.
 * @param mean Media de la distribución (valor central)
 * @param sigma Desviación estándar (dispersión)
 * @returns Número aleatorio con distribución gaussiana
 */
export const gaussianRandom = (mean = 0, sigma = 1): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  
  // Transformación Box-Muller
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  
  // Aplicar media y desviación estándar
  return z0 * sigma + mean;
};

/**
 * Aplica una dispersión angular a un vector de dirección.
 * La dispersión sigue una distribución gaussiana.
 * @param direction Vector de dirección base
 * @param dispersionFactor Factor de dispersión (sigma)
 * @returns Vector con dispersión aplicada
 */
export const applyAngularDispersion = (direction: THREE.Vector3, dispersionFactor: number): THREE.Vector3 => {
  // Crear una copia del vector dirección
  const newDirection = direction.clone();
  
  // Para mantener la dirección principalmente hacia adelante,
  // limitamos la dispersión a pequeños ángulos en componentes Y y Z
  // El factor 0.1 reduce el efecto para mantener dirección general hacia la barrera
  const thetaDeviation = gaussianRandom(0, dispersionFactor) * 0.1;
  const phiDeviation = gaussianRandom(0, dispersionFactor) * 0.1;
  
  // Vectores perpendiculares para aplicar la rotación
  // Esto mantiene la dirección principal hacia X positivo
  const yAxis = new THREE.Vector3(0, 1, 0);
  const zAxis = new THREE.Vector3(0, 0, 1);
  
  // Aplicar pequeñas rotaciones
  newDirection.applyAxisAngle(yAxis, thetaDeviation);
  newDirection.applyAxisAngle(zAxis, phiDeviation);
  
  // Normalizar para mantener magnitud unitaria
  return newDirection.normalize();
};

/**
 * Interfaz que define el estado de la aplicación
 */
interface ExperimentState {
  // Parámetros del experimento
  slitWidth: number;
  slitSeparation: number;
  slitCount: number;
  particleType: ParticleType;
  particleSpeed: number;
  wavelength: number;
  isObserved: boolean;
  
  // Parámetros de emisión
  dispersionFactor: number;
  baseDirection: THREE.Vector3;
  
  // Control de partículas
  particles: Particle[];
  nextParticleId: number;
  
  // Controles de simulación
  isPaused: boolean;
  isAutoMode: boolean;
  particlesPerEmission: number;
  emissionSpeed: number;
  updateFrequency: number;
  
  // Acciones para actualizar el estado
  setSlitWidth: (width: number) => void;
  setSlitSeparation: (separation: number) => void;
  setSlitCount: (count: number) => void;
  setParticleType: (type: ParticleType) => void;
  setParticleSpeed: (speed: number) => void;
  setWavelength: (wavelength: number) => void;
  setObserved: (observed: boolean) => void;
  setIsPaused: (paused: boolean) => void;
  setIsAutoMode: (auto: boolean) => void;
  setParticlesPerEmission: (count: number) => void;
  setEmissionSpeed: (speed: number) => void;
  setUpdateFrequency: (frequency: number) => void;
  setDispersionFactor: (factor: number) => void;
  togglePause: () => void;
  toggleAutoMode: () => void;
  resetExperiment: () => void;
  
  // Acciones para partículas
  fireParticles: (count: number, direction?: THREE.Vector3) => void;
  updateParticlePosition: (id: number, position: THREE.Vector3) => void;
  deactivateParticle: (id: number) => void;
  registerParticleImpact: (id: number, position: THREE.Vector3) => void;
}

/**
 * Store global para el estado del experimento de doble rendija
 * Usa Zustand como gestor de estado
 */
export const useStore = create<ExperimentState>((set) => ({
  // Estado inicial
  slitWidth: 0.1,
  slitSeparation: 0.2,
  slitCount: 2,
  particleType: 'electron',
  particleSpeed: 1.0,
  wavelength: 0.05,
  isObserved: false,
  
  // Parámetros de emisión
  dispersionFactor: 0.5, // Factor de dispersión inicial (sigma)
  baseDirection: new THREE.Vector3(1, 0, 0), // Dirección por defecto (hacia la barrera)
  
  // Estado inicial de partículas
  particles: [],
  nextParticleId: 1,
  
  // Estados de control de simulación
  isPaused: false,
  isAutoMode: false,
  particlesPerEmission: 1, // Por defecto, emitir una partícula a la vez
  emissionSpeed: 5, // Velocidad media por defecto (1-10)
  updateFrequency: 5, // Actualizar cada 5 frames
  
  // Acciones
  setSlitWidth: (width: number) => set({ slitWidth: width }),
  setSlitSeparation: (separation: number) => set({ slitSeparation: separation }),
  setSlitCount: (count: number) => set({ slitCount: count }),
  setParticleType: (type: ParticleType) => set({ particleType: type }),
  setParticleSpeed: (speed: number) => set({ particleSpeed: speed }),
  setWavelength: (wavelength: number) => set({ wavelength: wavelength }),
  setObserved: (observed: boolean) => set({ isObserved: observed }),
  setIsPaused: (paused: boolean) => set({ isPaused: paused }),
  setIsAutoMode: (auto: boolean) => set({ isAutoMode: auto }),
  setParticlesPerEmission: (count: number) => set({ particlesPerEmission: count }),
  setEmissionSpeed: (speed: number) => set({ emissionSpeed: speed }),
  setUpdateFrequency: (frequency: number) => set({ updateFrequency: frequency }),
  setDispersionFactor: (factor: number) => set({ dispersionFactor: factor }),
  
  // Funciones para alternar estados
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  toggleAutoMode: () => set((state) => ({ isAutoMode: !state.isAutoMode })),
  
  // Reiniciar el experimento
  resetExperiment: () => set((state) => {
    console.log('Reiniciando experimento...');
    
    // Disparar evento para limpiar la pantalla de detección
    window.dispatchEvent(new CustomEvent('resetDetectionScreen'));
    
    // Mantener la configuración pero resetear las partículas
    return { 
      particles: [],
      nextParticleId: 1, 
      // Si está en modo auto, mantenerlo, pero asegurar que no está en pausa
      isPaused: state.isAutoMode ? false : state.isPaused
    };
  }),
  
  // Acciones para partículas
  fireParticles: (count: number, direction?: THREE.Vector3) => set((state) => {
    if (state.isPaused) return { particles: state.particles }; // No hacer nada si está en pausa
    
    console.log(`Store: Disparando ${count} partículas`);
    
    const newParticles: Particle[] = [];
    
    // Usar la dirección proporcionada o la dirección base
    const baseDirection = direction || state.baseDirection;
    
    // Crear nuevas partículas
    for (let i = 0; i < count; i++) {
      // Aplicar dispersión gaussiana a la dirección
      const particleDirection = applyAngularDispersion(baseDirection, state.dispersionFactor);
      
      // Crear vector de velocidad escalado por la velocidad de partícula
      const velocity = particleDirection.clone().multiplyScalar(state.particleSpeed);
      
      newParticles.push({
        id: state.nextParticleId + i,
        position: new THREE.Vector3(-2, 0, 0), // Posición inicial del emisor
        velocity: velocity,
        type: state.particleType,
        isActive: true
      });
    }
    
    console.log(`Store: Creadas ${newParticles.length} partículas nuevas, total: ${state.particles.length + newParticles.length}`);
    
    return {
      particles: [...state.particles, ...newParticles],
      nextParticleId: state.nextParticleId + count
    };
  }),
  
  updateParticlePosition: (id: number, position: THREE.Vector3) => set((state) => ({
    particles: state.particles.map(p => 
      p.id === id ? { ...p, position: position } : p
    )
  })),
  
  deactivateParticle: (id: number) => set((state) => {
    console.log(`Store: Desactivando partícula ${id}`);
    return {
      particles: state.particles.map(p => 
        p.id === id ? { ...p, isActive: false } : p
      )
    };
  }),
  
  registerParticleImpact: (id: number, position: THREE.Vector3) => set((state) => {
    console.log(`Store: Registrando impacto de partícula ${id} en posición (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`);
    
    // Encontrar la partícula por ID para obtener su tipo
    const particle = state.particles.find(p => p.id === id);
    if (!particle) {
      console.error(`No se encontró la partícula con ID ${id}`);
      return { particles: state.particles }; // No hacer cambios si no se encuentra la partícula
    }
    
    // Incluir el tipo de partícula en el evento personalizado para que DetectionScreen pueda usarlo
    const impactEvent = new CustomEvent('particleImpact', { 
      detail: { 
        id, 
        position, 
        type: particle.type 
      } 
    });
    window.dispatchEvent(impactEvent);
    
    // Desactivar la partícula
    return {
      particles: state.particles.map(p => 
        p.id === id ? { ...p, isActive: false } : p
      )
    };
  })
})); 