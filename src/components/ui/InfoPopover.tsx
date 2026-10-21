import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties, ReactNode } from 'react'
import './InfoPopover.css'

/** One accessible explanation, anchored on desktop and contained in the phone viewport. */
export default function InfoPopover({ name, children }: { name: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<CSSProperties>({ left: 16, bottom: 16 })
  const button = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const delay = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const id = useId()
  const cancelClose = () => {
    clearTimeout(delay.current)
  }
  const show = () => {
    cancelClose()
    setOpen(true)
  }
  const leave = () => {
    cancelClose()
    delay.current = setTimeout(() => setOpen(false), 180)
  }
  const close = () => {
    cancelClose()
    setOpen(false)
  }
  useEffect(() => () => clearTimeout(delay.current), [])
  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      if (window.innerWidth <= 850) {
        setPosition({ left: 16, right: 16, bottom: 16 })
        return
      }
      const anchor = button.current?.getBoundingClientRect(),
        popup = panel.current?.getBoundingClientRect()
      if (!anchor || !popup) return
      const left = Math.max(
        16,
        Math.min(anchor.right - popup.width, window.innerWidth - popup.width - 16),
      )
      const below = anchor.bottom + 8
      const top = Math.max(
        16,
        Math.min(
          below + popup.height <= window.innerHeight - 16 ? below : anchor.top - popup.height - 8,
          window.innerHeight - popup.height - 16,
        ),
      )
      setPosition({ left, top })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, children])
  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !button.current?.contains(event.target) &&
        !panel.current?.contains(event.target)
      )
        setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open])
  return (
    <span className="spum-info">
      <button
        ref={button}
        type="button"
        aria-label={`Información: ${name}`}
        aria-expanded={open}
        aria-controls={id}
        aria-describedby={open ? id : undefined}
        onClick={show}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') show()
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse') leave()
        }}
        onBlur={(event) => {
          if (!panel.current?.contains(event.relatedTarget)) close()
        }}
      >
        ?
      </button>
      {open &&
        createPortal(
          <div
            ref={panel}
            id={id}
            role="note"
            className="spum-info-panel"
            style={position}
            onPointerEnter={cancelClose}
            onPointerLeave={(event) => {
              if (event.pointerType === 'mouse') leave()
            }}
          >
            <strong>{name}</strong>
            <div>{children}</div>
            <button
              type="button"
              onClick={() => {
                close()
                button.current?.focus()
              }}
              aria-label={`Cerrar información: ${name}`}
            >
              Cerrar ×
            </button>
          </div>,
          document.body,
        )}
    </span>
  )
}
