import { useEffect, useRef, useState } from 'react'
import { resolveHelp } from './helpContent'
import type { HelpEntry } from './helpContent'
import { helpPosition } from './helpPolicy'
import './helpMode.css'

const STORAGE_KEY = 'spum.help.enabled.v1'
const TARGETS =
  '[data-help-body],button,a,input,select,textarea,summary,[role="slider"],[role="button"],svg text,svg circle,svg path,svg rect,svg line,svg polyline,svg polygon,canvas,label,output,dt,dd,strong,code,p,h1,h2,h3,table,figcaption'

export default function HelpMode() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [tip, setTip] = useState<{ entry: HelpEntry; target: Element } | null>(null)
  const [position, setPosition] = useState({ left: 12, top: 12, width: 340 })
  const host = useRef<HTMLDivElement>(null)
  const toggle = () => {
    setEnabled((value) => !value)
    setTip(null)
  }

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(enabled))
    } catch {
      /* Optional preference. */
    }
    if (!enabled) return
    document.documentElement.dataset.labHelp = 'true'
    const show = (event: Event) => {
      if (!(event.target instanceof Element) || host.current?.contains(event.target))
        return
      const target = event.target.closest(TARGETS)
      if (!target) {
        setTip(null)
        return
      }
      const entry = resolveHelp(location.pathname, target)
      if (entry) setTip((old) => (old?.target === target ? old : { entry, target }))
      else setTip(null)
    }
    const consult = (event: Event) => {
      if (!(event.target instanceof Element) || host.current?.contains(event.target))
        return
      show(event)
      event.preventDefault()
      event.stopImmediatePropagation()
    }
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setTip(null)
        setEnabled(false)
        return
      }
      if (event.key === 'Tab' || event.ctrlKey || event.metaKey || event.altKey) return
      const editable =
        event.target instanceof Element &&
        event.target.matches('input,select,textarea,[contenteditable="true"]')
      const control =
        event.target instanceof Element &&
        event.target.closest(
          'button,a,input,select,textarea,summary,[role="slider"],[role="button"],[role="switch"]',
        )
      if (
        editable ||
        ['Enter', ' '].includes(event.key) ||
        (control &&
          [
            'ArrowLeft',
            'ArrowRight',
            'ArrowUp',
            'ArrowDown',
            'Home',
            'End',
            'PageUp',
            'PageDown',
          ].includes(event.key))
      )
        consult(event)
    }
    const wheel = (event: WheelEvent) => {
      if (event.target instanceof Element && event.target.closest('canvas'))
        consult(event)
    }
    document.addEventListener('pointerover', show, true)
    document.addEventListener('focusin', show, true)
    document.addEventListener('pointerdown', consult, true)
    document.addEventListener('click', consult, true)
    document.addEventListener('dblclick', consult, true)
    document.addEventListener('keydown', key, true)
    document.addEventListener('wheel', wheel, { capture: true, passive: false })
    return () => {
      delete document.documentElement.dataset.labHelp
      document.removeEventListener('pointerover', show, true)
      document.removeEventListener('focusin', show, true)
      document.removeEventListener('pointerdown', consult, true)
      document.removeEventListener('click', consult, true)
      document.removeEventListener('dblclick', consult, true)
      document.removeEventListener('keydown', key, true)
      document.removeEventListener('wheel', wheel, true)
    }
  }, [enabled])

  useEffect(() => {
    if (!tip || !enabled) return
    const target = tip.target
    const oldDescription = target.getAttribute('aria-describedby')
    target.setAttribute('data-help-selected', 'true')
    target.setAttribute(
      'aria-describedby',
      `${oldDescription ? oldDescription + ' ' : ''}spum-help-card`,
    )
    const place = () => {
      if (!target.isConnected) {
        setTip(null)
        return
      }
      setPosition(
        helpPosition(target.getBoundingClientRect(), {
          width: innerWidth,
          height: innerHeight,
        }),
      )
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      target.removeAttribute('data-help-selected')
      if (oldDescription === null) target.removeAttribute('aria-describedby')
      else target.setAttribute('aria-describedby', oldDescription)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [tip, enabled])

  return (
    <div className="lab-help" ref={host}>
      {enabled && tip && (
        <section
          id="spum-help-card"
          className="lab-help-card"
          style={position}
          aria-label="Explicación del elemento"
          role="region"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="lab-help-card-heading">
            <strong>{tip.entry.title}</strong>
            <button
              type="button"
              aria-label="Cerrar explicación"
              onClick={() => setTip(null)}
            >
              ×
            </button>
          </div>
          <p>{tip.entry.body}</p>
        </section>
      )}
      <div className="lab-help-dock">
        {enabled && (
          <span role="status">Señalá o tocá para consultar · Salí para jugar</span>
        )}
        <button
          type="button"
          className="lab-help-toggle"
          aria-pressed={enabled}
          onClick={toggle}
        >
          {enabled ? '✓ Modo ayuda · salir' : '? Modo ayuda'}
        </button>
      </div>
    </div>
  )
}
