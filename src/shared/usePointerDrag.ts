import { useRef } from 'react'
import type { PointerEvent } from 'react'

/** One captured pointer owns a gesture until release, cancellation or lost capture. */
export function usePointerDrag<T extends Element>({
  onStart,
  onMove,
  onEnd,
  onCancel,
  onHover,
  preventDefault = true,
}: {
  onStart: (event: PointerEvent<T>) => void
  onMove: (event: PointerEvent<T>) => void
  onEnd: (event: PointerEvent<T>) => void
  onCancel?: () => void
  onHover?: (event: PointerEvent<T>) => void
  preventDefault?: boolean
}) {
  const pointer = useRef<number | null>(null)
  const cancel = (event: PointerEvent<T>) => {
    if (pointer.current !== event.pointerId) return
    pointer.current = null
    onCancel?.()
  }
  return {
    onPointerDown(event: PointerEvent<T>) {
      if (
        pointer.current !== null ||
        !event.isPrimary ||
        event.button !== 0
      )
        return
      if (preventDefault) event.preventDefault()
      // Do not retain ownership if capture fails because the pointer already ended.
      event.currentTarget.setPointerCapture(event.pointerId)
      pointer.current = event.pointerId
      onStart(event)
    },
    onPointerMove(event: PointerEvent<T>) {
      if (pointer.current === event.pointerId) onMove(event)
      else if (pointer.current === null) onHover?.(event)
    },
    onPointerUp(event: PointerEvent<T>) {
      if (pointer.current !== event.pointerId) return
      pointer.current = null
      onEnd(event)
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId)
    },
    onPointerCancel: cancel,
    onLostPointerCapture: cancel,
  }
}
