import { create } from 'zustand'
import {
  buildDistribution,
  DEFAULT_CONFIG,
  normalizeConfig,
  sampleImpact,
} from '../physics/interference.ts'
import type { Config, Distribution } from '../physics/interference.ts'

export const HISTOGRAM_BINS = 256
export const MAX_RECENT_HITS = 2000

export interface DetectionHit {
  id: number
  z: number
  /** Cosmetic height on the detector; the physical transverse coordinate is z. */
  y: number
}

export interface Comparison {
  config: Config
  histogram: number[]
  detected: number
}

export interface LabState {
  config: Config
  runId: number
  isPaused: boolean
  isAutoMode: boolean
  emissionRate: number
  burstSize: number
  showWaves: boolean
  showTheory: boolean
  view: 'perspective' | 'top'
  cameraResetKey: number
  detected: number
  histogram: number[]
  recentHits: DetectionHit[]
  comparison: Comparison | null
  distribution: Distribution
  setConfig: (patch: Partial<Config>) => void
  togglePause: () => void
  toggleAuto: () => void
  setEmissionRate: (value: number) => void
  setBurstSize: (value: number) => void
  setShowWaves: (value: boolean) => void
  setShowTheory: (value: boolean) => void
  setView: (value: 'perspective' | 'top') => void
  resetCamera: () => void
  emit: (count?: number) => void
  clearRun: () => void
  resetAll: () => void
  saveComparison: () => void
  clearComparison: () => void
}

function integerControl(value: number, fallback: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.round(Math.min(max, Math.max(min, value))) : fallback
}

function emptyRun(runId: number) {
  return {
    runId,
    detected: 0,
    histogram: new Array<number>(HISTOGRAM_BINS).fill(0),
    recentHits: [],
  }
}

export const useLabStore = create<LabState>((set) => ({
  config: { ...DEFAULT_CONFIG },
  ...emptyRun(0),
  isPaused: false,
  isAutoMode: false,
  emissionRate: 12,
  burstSize: 1,
  showWaves: true,
  showTheory: true,
  view: 'perspective',
  cameraResetKey: 0,
  comparison: null,
  distribution: buildDistribution(DEFAULT_CONFIG),

  setConfig: (patch) =>
    set((state) => {
      const config = normalizeConfig(patch, state.config)
      const changed = (Object.keys(config) as (keyof Config)[]).some(
        (key) => config[key] !== state.config[key],
      )
      if (!changed) return state
      // A run always belongs to one physical setup. A saved comparison remains
      // labelled with its own setup and never receives new detections.
      return {
        config,
        distribution: buildDistribution(config),
        ...emptyRun(state.runId + 1),
      }
    }),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  toggleAuto: () => set((state) => ({ isAutoMode: !state.isAutoMode })),
  setEmissionRate: (value) =>
    set((state) => ({ emissionRate: integerControl(value, state.emissionRate, 1, 120) })),
  setBurstSize: (value) =>
    set((state) => ({ burstSize: integerControl(value, state.burstSize, 1, 10) })),
  setShowWaves: (value) =>
    set((state) => (typeof value === 'boolean' ? { showWaves: value } : state)),
  setShowTheory: (value) =>
    set((state) => (typeof value === 'boolean' ? { showTheory: value } : state)),
  setView: (value) =>
    set((state) => (value === 'perspective' || value === 'top' ? { view: value } : state)),
  resetCamera: () => set((state) => ({ cameraResetKey: state.cameraResetKey + 1 })),

  emit: (count = 1) =>
    set((state) => {
      if (state.isPaused || !Number.isFinite(count) || count < 1) return state
      // Bound a single external call as well as the retained visual history.
      const amount = Math.min(10000, Math.floor(count))
      const histogram = [...state.histogram]
      const histogramBinWidth = (2 * state.distribution.halfWidth) / HISTOGRAM_BINS
      const newHits: DetectionHit[] = []
      for (let index = 0; index < amount; index++) {
        const z = sampleImpact(state.distribution)
        const bin = Math.min(
          HISTOGRAM_BINS - 1,
          Math.max(0, Math.floor((z + state.distribution.halfWidth) / histogramBinWidth)),
        )
        histogram[bin]++
        // Every impact contributes to statistics, even when its decorative dot
        // has left the finite GPU/DOM history. No efficiency is inferred here:
        // these are ideal detections conditional on transmission to the screen.
        const y = 0.4 + Math.random() * 0.8
        if (index >= amount - MAX_RECENT_HITS) {
          newHits.push({ id: state.detected + index + 1, z, y })
        }
      }
      const keepPrevious = Math.max(0, MAX_RECENT_HITS - newHits.length)
      return {
        detected: state.detected + amount,
        histogram,
        recentHits: [...(keepPrevious ? state.recentHits.slice(-keepPrevious) : []), ...newHits],
      }
    }),

  clearRun: () => set((state) => emptyRun(state.runId + 1)),
  resetAll: () =>
    set((state) => ({
      config: { ...DEFAULT_CONFIG },
      ...emptyRun(state.runId + 1),
      isPaused: false,
      isAutoMode: false,
      emissionRate: 12,
      burstSize: 1,
      showWaves: true,
      showTheory: true,
      view: 'perspective',
      cameraResetKey: state.cameraResetKey + 1,
      comparison: null,
      distribution: buildDistribution(DEFAULT_CONFIG),
    })),
  saveComparison: () =>
    set((state) => ({
      comparison: {
        config: { ...state.config },
        histogram: [...state.histogram],
        detected: state.detected,
      },
    })),
  clearComparison: () => set({ comparison: null }),
}))
