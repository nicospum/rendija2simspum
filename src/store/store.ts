import { create } from 'zustand';
import * as THREE from 'three';

/**
 * Tipos de partículas disponibles para el experimento
 * 
 * - electron: Partícula con masa, colapsa ante observación
 * - photon: Partícula sin masa, colapsa ante observación
 * - neutrino: Partícula casi sin interacción, apenas afectada por la observación
 */
export type ParticleType = 'electron' | 'photon' | 'neutrino';

/**
 * Propiedades físicas de cada tipo de partícula
 */
export interface ParticleProperties {
  // Masa efectiva de la partícula para cálculos cuánticos (unidades arbitrarias)
  mass: number;
  // Factor que determina cuánto colapsa la función de onda al ser observada (0-1)
  observationCollapseFactor: number;
  // Color visual de la partícula en la simulación
  color: string;
  // Color de emisión para efectos luminosos
  emissiveColor: string;
  // Longitud de onda característica (en unidades arbitrarias)
  defaultWavelength: number;
}

/**
 * Catálogo de propiedades físicas para cada tipo de partícula
 */
export const PARTICLE_PROPERTIES: Record<ParticleType, ParticleProperties> = {
  electron: {
    mass: 1.0,
    observationCollapseFactor: 1.0, // Colapso total
    color: '#64B5F6', // Azul
    emissiveColor: '#64B5F6',
    defaultWavelength: 0.05
  },
  photon: {
    mass: 0.0001, // Casi cero pero no exactamente para evitar divisiones por cero
    observationCollapseFactor: 1.0, // Colapso total
    color: '#FFEE58', // Amarillo
    emissiveColor: '#FFEE58',
    defaultWavelength: 0.07
  },
  neutrino: {
    mass: 0.00001,
    observationCollapseFactor: 0.05, // Apenas afectado por observación (5%)
    color: '#A5D6A7', // Verde claro
    emissiveColor: '#A5D6A7',
    defaultWavelength: 0.03
  }
};

/**
 * Interfaz que define una partícula individual en el experimento
 */
export interface Particle {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  type: ParticleType;
  isActive: boolean;
  // Rendija por la que pasó la partícula (si fue observada)
  slitIndex?: number;
}

/**
 * Interfaz para las estadísticas del experimento
 */
export interface ExperimentStats {
  particlesFired: number;      // Total de partículas disparadas
  particlesDetected: number;   // Partículas que llegaron a la pantalla
  barrierCollisions: number;   // Partículas que chocaron con la barrera
  slitPassCount: number[];     // Conteo por rendija (solo con observación)
  startTime: number;           // Tiempo de inicio del experimento (timestamp)
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
 * Calcula el patrón de intensidad para difracción de una sola rendija
 * Basado en la función sinc² para una rendija rectangular
 * 
 * I(θ) = I₀·sinc²(πa·sin(θ)/λ)
 * donde:
 * - a: ancho de la rendija
 * - λ: longitud de onda
 * - θ: ángulo de difracción
 * 
 * @param y - Posición vertical en la pantalla
 * @param screenDistance - Distancia a la pantalla
 * @param slitWidth - Ancho de la rendija
 * @param wavelength - Longitud de onda de la partícula
 * @returns Intensidad relativa en el punto y (0-1)
 */
export function calculateSingleSlitPattern(
  y: number,
  screenDistance: number,
  slitWidth: number,
  wavelength: number
): number {
  // Simplificación del ángulo para ángulos pequeños: sin(θ) ≈ y/L
  const angle = y / screenDistance;
  
  // Argumento para la función sinc
  const arg = Math.PI * slitWidth * angle / wavelength;
  
  // Para evitar división por cero en sinc(0)
  if (Math.abs(arg) < 0.0001) return 1.0;
  
  // Función sinc²(x) = (sin(x)/x)²
  const sinc = Math.sin(arg) / arg;
  return sinc * sinc;
}

/**
 * Calcula el patrón de intensidad para interferencia de múltiples rendijas
 * Basado en la fórmula: I(y) = I₀·cos²(πd·y/λL)
 * 
 * @param y - Posición vertical en la pantalla
 * @param screenDistance - Distancia a la pantalla
 * @param slitSeparation - Separación entre rendijas
 * @param slitCount - Número de rendijas
 * @param wavelength - Longitud de onda de la partícula
 * @returns Intensidad relativa en el punto y (0-1)
 */
export function calculateMultiSlitPattern(
  y: number,
  screenDistance: number,
  slitSeparation: number,
  slitCount: number,
  wavelength: number
): number {
  // Para ángulos pequeños
  const angle = y / screenDistance;
  
  // Desfase entre rendijas
  const phase = 2 * Math.PI * slitSeparation * angle / wavelength;
  
  // Patrón básico para 2 rendijas: cos²(phase/2)
  const basicPattern = Math.pow(Math.cos(phase / 2), 2);
  
  // Modificación para múltiples rendijas (simplificación)
  // Aumenta la nitidez de los máximos con más rendijas
  const sharpnessFactor = 1 + 0.5 * (slitCount - 2);
  
  // Intensidad normalizada (0-1)
  const intensity = Math.pow(basicPattern, sharpnessFactor);
  
  // Aplicar modulación de la envolvente de difracción de una rendija
  const diffractionEnvelope = calculateSingleSlitPattern(y, screenDistance, slitSeparation / 5, wavelength);
  
  return intensity * diffractionEnvelope;
}

/**
 * Aplica el factor de colapso a una partícula observada, según su tipo
 * 
 * @param particleType - Tipo de partícula
 * @param pattern - Patrón de intensidad sin observación
 * @returns Patrón de intensidad alterado por la observación
 */
export function applyObservationEffect(
  particleType: ParticleType, 
  pattern: number
): number {
  const collapseFactor = PARTICLE_PROPERTIES[particleType].observationCollapseFactor;
  
  // Si es neutrino, casi no afecta la observación
  if (particleType === 'neutrino') {
    // Reducción muy pequeña del patrón
    return pattern * (1 - collapseFactor * 0.2);
  }
  
  // Para otras partículas, colapso significativo
  // Reduce dramáticamente la interferencia
  return pattern * (1 - collapseFactor);
}

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
  
  // Estadísticas del experimento
  stats: ExperimentStats;
  
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
  
  // Estadísticas 
  incrementParticlesFired: (count: number) => void;
  incrementParticlesDetected: (count: number) => void;
  incrementBarrierCollisions: (count: number) => void;
  incrementSlitPassCount: (slitIndex: number) => void;
  resetStats: () => void;
  
  // Acciones para partículas
  fireParticles: (count: number, direction?: THREE.Vector3) => void;
  updateParticlePosition: (id: number, position: THREE.Vector3) => void;
  deactivateParticle: (id: number) => void;
  registerParticleImpact: (id: number, position: THREE.Vector3) => void;
  registerSlitPass: (id: number, slitIndex: number) => void;
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
  
  // Estadísticas iniciales
  stats: {
    particlesFired: 0,
    particlesDetected: 0,
    barrierCollisions: 0,
    slitPassCount: [0, 0, 0, 0, 0], // Para hasta 5 rendijas
    startTime: Date.now(),
  },
  
  // Acciones
  setSlitWidth: (width: number) => set({ slitWidth: width }),
  setSlitSeparation: (separation: number) => set({ slitSeparation: separation }),
  setSlitCount: (count: number) => set({ slitCount: count }),
  setParticleType: (type: ParticleType) => set({ 
    particleType: type,
    // Actualizar la longitud de onda al cambiar el tipo de partícula
    wavelength: PARTICLE_PROPERTIES[type].defaultWavelength 
  }),
  setParticleSpeed: (speed: number) => set({ particleSpeed: speed }),
  setWavelength: (wavelength: number) => set({ wavelength: wavelength }),
  setObserved: (observed: boolean) => set(state => {
    // No permitir observación con 1 rendija (no tiene sentido físico)
    if (state.slitCount === 1) {
      return { isObserved: false };
    }
    return { isObserved: observed };
  }),
  setIsPaused: (paused: boolean) => set({ isPaused: paused }),
  setIsAutoMode: (auto: boolean) => set({ isAutoMode: auto }),
  setParticlesPerEmission: (count: number) => set({ particlesPerEmission: count }),
  setEmissionSpeed: (speed: number) => set({ emissionSpeed: speed }),
  setUpdateFrequency: (frequency: number) => set({ updateFrequency: frequency }),
  setDispersionFactor: (factor: number) => set({ dispersionFactor: factor }),
  
  // Estadísticas 
  incrementParticlesFired: (count: number) => set(state => ({
    stats: {
      ...state.stats,
      particlesFired: state.stats.particlesFired + count
    }
  })),
  
  incrementParticlesDetected: (count: number) => set(state => ({
    stats: {
      ...state.stats,
      particlesDetected: state.stats.particlesDetected + count
    }
  })),
  
  incrementBarrierCollisions: (count: number) => set(state => ({
    stats: {
      ...state.stats,
      barrierCollisions: state.stats.barrierCollisions + count
    }
  })),
  
  incrementSlitPassCount: (slitIndex: number) => set(state => {
    const newSlitPassCount = [...state.stats.slitPassCount];
    if (slitIndex >= 0 && slitIndex < newSlitPassCount.length) {
      newSlitPassCount[slitIndex]++;
    }
    return {
      stats: {
        ...state.stats,
        slitPassCount: newSlitPassCount
      }
    };
  }),
  
  resetStats: () => set({
    stats: {
      particlesFired: 0,
      particlesDetected: 0,
      barrierCollisions: 0,
      slitPassCount: [0, 0, 0, 0, 0],
      startTime: Date.now(),
    }
  }),
  
  // Funciones para alternar estados
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  toggleAutoMode: () => set((state) => ({ isAutoMode: !state.isAutoMode })),
  
  // Reiniciar el experimento
  resetExperiment: () => set((state) => {
    console.log('Reiniciando experimento...');
    
    // Disparar evento para limpiar la pantalla de detección
    window.dispatchEvent(new CustomEvent('resetDetectionScreen'));
    
    // Mantener la configuración pero resetear las partículas y estadísticas
    return { 
      particles: [],
      nextParticleId: 1, 
      // Resetear estadísticas
      stats: {
        particlesFired: 0,
        particlesDetected: 0,
        barrierCollisions: 0,
        slitPassCount: [0, 0, 0, 0, 0],
        startTime: Date.now(),
      },
      // Si está en modo auto, mantenerlo, pero asegurar que no está en pausa
      isPaused: state.isAutoMode ? false : state.isPaused
    };
  }),
  
  // Acción para registrar el paso por una rendija específica
  registerSlitPass: (id: number, slitIndex: number) => set(state => ({
    particles: state.particles.map(p => 
      p.id === id ? { ...p, slitIndex } : p
    )
  })),
  
  // Acciones para partículas
  fireParticles: (count: number, direction?: THREE.Vector3) => set((state) => {
    if (state.isPaused) return { particles: state.particles }; // No hacer nada si está en pausa
    
    console.log(`Store: Disparando ${count} partículas`);
    
    // Incrementar contador de partículas disparadas
    state.incrementParticlesFired(count);
    
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
    
    // Incrementar el contador de partículas detectadas
    state.incrementParticlesDetected(1);
    
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
        type: particle.type,
        slitIndex: particle.slitIndex,
        isObserved: state.isObserved && state.slitCount > 1
      } 
    });
    
    // Disparar el evento para que lo capture DetectionScreen
    window.dispatchEvent(impactEvent);
    
    // Desactivar la partícula después de impactar
    return {
      particles: state.particles.map(p => 
        p.id === id ? { ...p, isActive: false } : p
      )
    };
  }),
})); 