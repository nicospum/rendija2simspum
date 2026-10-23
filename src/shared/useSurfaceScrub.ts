import type { PointerEvent, RefObject } from 'react'
import type { Point2 } from './sceneInteraction'
import { usePointerDrag } from './usePointerDrag'
/** Capture a small handle; coordinates belong to its entire image, not to the moving handle. */
export function useSurfaceScrub(
  area: RefObject<HTMLElement | null>,
  onPoint: (p: Point2) => void,
) {
  const update = (event: PointerEvent<HTMLElement>) => {
    const b = area.current?.getBoundingClientRect()
    if (!b || !b.width || !b.height) return
    onPoint({
      x: Math.max(0, Math.min(1, (event.clientX - b.left) / b.width)),
      y: Math.max(0, Math.min(1, (event.clientY - b.top) / b.height)),
    })
  }
  return usePointerDrag({ onStart: update, onMove: update, onEnd: update })
}
