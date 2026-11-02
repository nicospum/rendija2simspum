import { createContext } from 'react'
import type { HolographySection } from './catalog'

export const HolographyContext = createContext<{
  section: HolographySection
  focusScene: boolean
  navigate: (section: HolographySection, focusScene: boolean) => void
} | null>(null)
