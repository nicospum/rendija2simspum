import type { PointerEvent } from 'react'
import type { Point2 } from './sceneInteraction'
import { usePointerDrag } from './usePointerDrag'

/** Capture only the object's hit area; the rest of the scene keeps normal page scrolling. */
export function useSvgScrub(
  onPoint: (point: Point2) => void,
  lifecycle: { onStart?: () => void; onFinish?: () => void } = {},
) {
  const update = (event: PointerEvent<SVGElement>) => {
    const matrix = event.currentTarget.ownerSVGElement?.getScreenCTM()
    if (!matrix) return
    const point = new DOMPoint(
      event.clientX,
      event.clientY,
    ).matrixTransform(matrix.inverse())
    onPoint({ x: point.x, y: point.y })
  }
  return usePointerDrag({
    onStart(event) {
      lifecycle.onStart?.()
      update(event)
    },
    onMove: update,
    onEnd(event) {
      update(event)
      lifecycle.onFinish?.()
    },
    onCancel: lifecycle.onFinish,
  })
}
