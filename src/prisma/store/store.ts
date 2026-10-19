import { create } from 'zustand'
import type { ExperimentConfig, Material } from '../physics/optics'
import { DEFAULT_CONFIG } from '../physics/optics.ts'
export { DEFAULT_CONFIG } from '../physics/optics.ts'
export const MATERIAL_LABELS: Record<Material, string> = { glass: 'Vidrio', quartz: 'Cuarzo', acrylic: 'Acrílico' }
const LIMITS = {
  prismAngle: [-180, 180], apexAngle: [30, 80], lightAngle: [-16, 16],
  lightOffset: [-0.7, 0.7], lightWidth: [0.005, 0.08], screenDistance: [1.6, 4.2],
} as const
type NumericParameter = keyof typeof LIMITS
interface AppState {
  config: ExperimentConfig
  // Keep a physical snapshot while preparing the next configuration.
  pausedConfig: ExperimentConfig | null
  lightIntensity: number
  lightEnabled: boolean
  view: 'perspective' | 'top'
  showNormals: boolean
  showLabels: boolean
  cameraResetKey: number
  setParameter: (key: NumericParameter, value: number) => void
  setMaterial: (material: Material) => void
  setIntensity: (value: number) => void
  toggleLight: () => void
  togglePause: () => void
  setView: (view: 'perspective' | 'top') => void
  toggleNormals: () => void
  toggleLabels: () => void
  resetCamera: () => void
  reset: () => void
}
export const useStore = create<AppState>((set) => ({
  config: { ...DEFAULT_CONFIG }, pausedConfig: null,
  lightIntensity: 0.8, lightEnabled: true, view: 'perspective',
  showNormals: false, showLabels: true, cameraResetKey: 0,
  setParameter: (key, value) => {
    if (!Number.isFinite(value)) return
    const [min, max] = LIMITS[key]
    set((state) => ({ config: { ...state.config, [key]: Math.max(min, Math.min(max, value)) } }))
  },
  setMaterial: (material) => {
    if (Object.prototype.hasOwnProperty.call(MATERIAL_LABELS, material)) set((state) => ({ config: { ...state.config, material } }))
  },
  setIntensity: (value) => {
    if (Number.isFinite(value)) set({ lightIntensity: Math.max(0, Math.min(1, value)) })
  },
  toggleLight: () => set((state) => ({ lightEnabled: !state.lightEnabled })),
  togglePause: () => set((state) => ({ pausedConfig: state.pausedConfig ? null : { ...state.config } })),
  setView: (view) => set({ view }),
  toggleNormals: () => set((state) => ({ showNormals: !state.showNormals })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  resetCamera: () => set((state) => ({ cameraResetKey: state.cameraResetKey + 1 })),
  reset: () => set((state) => ({
    config: { ...DEFAULT_CONFIG }, pausedConfig: null,
    lightIntensity: 0.8, lightEnabled: true, view: 'perspective',
    showNormals: false, showLabels: true, cameraResetKey: state.cameraResetKey + 1,
  })),
}))
