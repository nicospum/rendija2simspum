import { useRef } from 'react'
import type { PointerEvent } from 'react'
import type { Point2 } from './sceneInteraction'

/** Capture only the object's hit area; the rest of the scene keeps normal page scrolling. */
export function useSvgScrub(onPoint: (point: Point2) => void) {
  const pointer = useRef<number | null>(null)
  const update = (event: PointerEvent<SVGElement>) => {
    const matrix = event.currentTarget.ownerSVGElement?.getScreenCTM()
    if (!matrix) return
    const point = new DOMPoint(
      event.clientX,
      event.clientY,
    ).matrixTransform(matrix.inverse())
    onPoint({ x: point.x, y: point.y })
  }
  return {
    onPointerDown(event: PointerEvent<SVGElement>) {
      if (!event.isPrimary || event.button !== 0) return
      event.preventDefault()
      pointer.current = event.pointerId
      event.currentTarget.setPointerCapture(event.pointerId)
      update(event)
    },
    onPointerMove(event: PointerEvent<SVGElement>) {
      if (pointer.current === event.pointerId) update(event)
    },
    onPointerUp(event: PointerEvent<SVGElement>) {
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
