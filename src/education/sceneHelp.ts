import type { HelpEntry } from './helpContent'

export interface SceneHelpHit {
  id: string
  entry: HelpEntry
  /** Actual selected point in client coordinates, never an invented hotspot. */
  anchor?: { x: number; y: number }
}
export interface SceneHelpProvider {
  pick: (point: { x: number; y: number; pointerType: string }) => SceneHelpHit | null
  items?: () => readonly SceneHelpHit[]
}
const providers = new Map<Element, SceneHelpProvider>()
export const SCENE_HELP_CHANGED = 'spum-scene-help-changed'
const changed = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(SCENE_HELP_CHANGED))
}

export function registerSceneHelp(element: Element, provider: SceneHelpProvider) {
  providers.set(element, provider)
  changed()
  return () => {
    if (providers.get(element) === provider) {
      providers.delete(element)
      changed()
    }
  }
}
export function sceneHelpAt(target: Element) {
  for (let element: Element | null = target; element; element = element.parentElement) {
    const provider = providers.get(element)
    if (provider) return { element, provider }
  }
  // Camera scroll shields are siblings of a canvas, never physics objects.
  const viewport = target.closest('.quantum-viewport,.scene-viewport')
  const canvas = viewport?.querySelector('canvas')
  const provider = canvas ? providers.get(canvas) : null
  return canvas && provider ? { element: canvas, provider } : null
}
export function availableSceneHelp() {
  return [...providers.entries()]
    .filter(
      ([element]) => element.isConnected && element.getBoundingClientRect().width > 0,
    )
    .sort(([a], [b]) => {
      const visibleArea = (element: Element) => {
        const r = element.getBoundingClientRect()
        return (
          Math.max(0, Math.min(innerHeight, r.bottom) - Math.max(0, r.top)) *
          Math.max(0, Math.min(innerWidth, r.right) - Math.max(0, r.left))
        )
      }
      return visibleArea(b) - visibleArea(a)
    })
    .map(([element, provider]) => ({ element, provider }))
}
