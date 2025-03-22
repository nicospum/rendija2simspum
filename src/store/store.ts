import { create } from 'zustand';

/**
 * Tipos de partículas disponibles para el experimento
 */
export type ParticleType = 'electron' | 'photon';

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
  
  // Controles de simulación
  isPaused: boolean;
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
  setUpdateFrequency: (frequency: number) => void;
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
  
  // Estados de control de simulación
  isPaused: false,
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
  setUpdateFrequency: (frequency: number) => set({ updateFrequency: frequency }),
})); 