import { useRef } from 'react'
import type { PointerEvent, RefObject } from 'react'
import type { Point2 } from './sceneInteraction'
/** Capture a small handle; coordinates belong to its entire image, not to the moving handle. */
export function useSurfaceScrub(
  area: RefObject<HTMLElement | null>,
  onPoint: (p: Point2) => void,
) {
  const pointer = useRef<number | null>(null)
  const update = (event: PointerEvent<HTMLElement>) => {
    const b = area.current?.getBoundingClientRect()
    if (!b || !b.width || !b.height) return
    onPoint({
      x: Math.max(0, Math.min(1, (event.clientX - b.left) / b.width)),
      y: Math.max(0, Math.min(1, (event.clientY - b.top) / b.height)),
    })
  }
  return {
    onPointerDown(event: PointerEvent<HTMLElement>) {
      if (!event.isPrimary || event.button !== 0) return
      event.preventDefault()
      pointer.current = event.pointerId
      event.currentTarget.setPointerCapture(event.pointerId)
      update(event)
    },
    onPointerMove(event: PointerEvent<HTMLElement>) {
      if (pointer.current === event.pointerId) update(event)
    },
    onPointerUp(event: PointerEvent<HTMLElement>) {
      if (pointer.current !== event.pointerId) return
      update(event)
      pointer.current = null
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId)
    },
    onPointerCancel() {
      pointer.current = null
    },
    onLostPointerCapture() {
      pointer.current = null
    },
  }
}
