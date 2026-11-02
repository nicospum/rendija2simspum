import { useCallback, useEffect, useRef, useState } from 'react'
import { resolveHelp } from './helpContent'
import type { HelpEntry } from './helpContent'
import { helpPosition, sceneHelpPosition } from './helpPolicy'
import { availableSceneHelp, sceneHelpAt, SCENE_HELP_CHANGED } from './sceneHelp'
import type { SceneHelpHit } from './sceneHelp'
import './helpMode.css'

const STORAGE_KEY = 'spum.help.enabled.v1'
const TARGETS =
  '[data-help-body],button,a,input,select,textarea,summary,[role="slider"],[role="button"],svg text,svg circle,svg path,svg rect,svg line,svg polyline,svg polygon,canvas,label,output,dt,dd,strong,code,p,h1,h2,h3,table,figcaption'

function protectedSceneRect(scene: Element) {
  const workspace = scene.closest('[data-scene-workspace]')
  const visualRects = [
    ...(workspace?.querySelectorAll('.spum-live-stage canvas,.spum-live-stage svg') ??
      []),
  ]
    .map((element) => element.getBoundingClientRect())
    .filter(
      (r) =>
        r.width >= 100 &&
        r.height >= 70 &&
        r.bottom > 0 &&
        r.top < innerHeight &&
        r.right > 0 &&
        r.left < innerWidth,
    )
  if (!visualRects.length) return scene.getBoundingClientRect()
  return {
    left: Math.min(...visualRects.map((r) => r.left)),
    right: Math.max(...visualRects.map((r) => r.right)),
    top: Math.min(...visualRects.map((r) => r.top)),
    bottom: Math.max(...visualRects.map((r) => r.bottom)),
  }
}

export default function HelpMode() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [tip, setTip] = useState<{
    entry: HelpEntry
    target: Element
    hit?: SceneHelpHit
    scene?: Element
    rect?: DOMRect
  } | null>(null)
  const [objects, setObjects] = useState<readonly SceneHelpHit[]>([])
  const [hasScene, setHasScene] = useState(false)
  const pinnedRef = useRef(false)
  const [pinned, setPinned] = useState(false)
  const pin = useCallback((value: boolean) => {
    pinnedRef.current = value
    setPinned(value)
  }, [])
  const [position, setPosition] = useState<{
    left: number
    top: number
    width: number
    maxHeight?: number
  }>({ left: 12, top: 12, width: 340 })
  const [marker, setMarker] = useState<{ x: number; y: number } | null>(null)
  const host = useRef<HTMLDivElement>(null)
  const toggle = () => {
    setEnabled((value) => !value)
    setTip(null)
    setObjects([])
    pin(false)
  }
  const inspectObjects = () => {
    const source = availableSceneHelp()[0]
    if (!source) return
    pin(true)
    const scene = source.element.matches('canvas')
      ? source.element
      : (source.element.querySelector('canvas') ??
        source.element.parentElement?.querySelector('canvas') ??
        source.element)
    const bounds = scene.getBoundingClientRect()
    if (
      bounds.height <= innerHeight - 60 &&
      (bounds.top < 8 || bounds.bottom > innerHeight - 94)
    )
      scene.scrollIntoView({ block: 'start', behavior: 'instant' })
    const items = source.provider.items?.() ?? []
    setObjects(items)
    setTip({
      target: source.element,
      scene,
      rect: scene.getBoundingClientRect(),
      entry: {
        title: 'Objetos de esta escena',
        body: items.length
          ? 'Elegí un elemento para conocer su significado. También podés señalarlo o tocarlo directamente en el visor.'
          : 'Señalá o tocá un elemento visible del visor. Si no hay WebGL, podés consultar los controles y sus explicaciones.',
      },
    })
  }

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, String(enabled))
    } catch {
      /* Optional preference. */
    }
    if (!enabled) return
    document.documentElement.dataset.labHelp = 'true'
    const refreshScenes = () => setHasScene(availableSceneHelp().length > 0)
    refreshScenes()
    window.addEventListener(SCENE_HELP_CHANGED, refreshScenes)
    let moveFrame = 0
    let pendingMove: PointerEvent | null = null
    const show = (event: Event) => {
      if (
        pinnedRef.current &&
        ['pointerover', 'pointermove', 'focusin'].includes(event.type)
      )
        return
      if (!(event.target instanceof Element) || host.current?.contains(event.target))
        return
      const domControl = event.target.closest(
        'button,input,select,summary,a,label,[role="slider"],[role="switch"]',
      )
      const source =
        !domControl || domControl.hasAttribute('data-scene-help-surface')
          ? sceneHelpAt(event.target)
          : null
      if (source && !(event instanceof MouseEvent)) {
        const scene = source.element.matches('canvas')
          ? source.element
          : (source.element.querySelector('canvas') ??
            source.element.parentElement?.querySelector('canvas') ??
            source.element)
        const entry = resolveHelp(location.pathname, scene) ?? {
          title: 'Explorar la escena',
          body: 'Usá «Objetos de la escena» para consultar los elementos con teclado, o señalá un objeto en el visor.',
        }
        setTip({
          target: source.element,
          scene,
          rect: scene.getBoundingClientRect(),
          entry,
        })
        return
      }
      if (source && event instanceof MouseEvent) {
        const hit = source.provider.pick({
          x: event.clientX,
          y: event.clientY,
          pointerType: event instanceof PointerEvent ? event.pointerType : 'mouse',
        })
        if (hit) {
          const scene = source.element.matches('canvas')
            ? source.element
            : (source.element.querySelector('canvas') ??
              source.element.parentElement?.querySelector('canvas') ??
              source.element)
          setTip((old) =>
            old?.target === source.element &&
            old.hit?.id === hit.id &&
            old.entry.body === hit.entry.body &&
            old.hit.anchor?.x === hit.anchor?.x &&
            old.hit.anchor?.y === hit.anchor?.y
              ? old
              : {
                  entry: hit.entry,
                  target: source.element,
                  hit,
                  scene,
                  rect: scene.getBoundingClientRect(),
                },
          )
          return
        }
      }
      const target = event.target.closest(TARGETS)
      if (!target) {
        setTip(null)
        return
      }
      const entry = resolveHelp(location.pathname, target)
      if (entry) setTip((old) => (old?.target === target ? old : { entry, target }))
      else setTip(null)
    }
    const move = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        !host.current?.contains(event.target) &&
        sceneHelpAt(event.target)
      )
        event.stopImmediatePropagation()
      if (event.pointerType === 'touch') return
      pendingMove = event
      if (!moveFrame)
        moveFrame = requestAnimationFrame(() => {
          moveFrame = 0
          if (pendingMove) show(pendingMove)
        })
    }
    const consult = (event: Event) => {
      if (!(event.target instanceof Element) || host.current?.contains(event.target))
        return
      pin(false)
      show(event)
      event.preventDefault()
      event.stopImmediatePropagation()
    }
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setTip(null)
        setEnabled(false)
        setObjects([])
        pin(false)
        return
      }
      if (event.key === 'Tab' || event.ctrlKey || event.metaKey || event.altKey) return
      const editable =
        event.target instanceof Element &&
        event.target.matches('input,select,textarea,[contenteditable="true"]')
      const control =
        event.target instanceof Element &&
        event.target.closest(
          'button,a,input,select,textarea,summary,[role="slider"],[role="button"],[role="switch"],[data-scene-help-surface],canvas',
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
    document.addEventListener('pointermove', move, true)
    document.addEventListener('focusin', show, true)
    document.addEventListener('pointerdown', consult, true)
    document.addEventListener('click', consult, true)
    document.addEventListener('dblclick', consult, true)
    document.addEventListener('keydown', key, true)
    document.addEventListener('wheel', wheel, { capture: true, passive: false })
    return () => {
      delete document.documentElement.dataset.labHelp
      window.removeEventListener(SCENE_HELP_CHANGED, refreshScenes)
      cancelAnimationFrame(moveFrame)
      document.removeEventListener('pointerover', show, true)
      document.removeEventListener('pointermove', move, true)
      document.removeEventListener('focusin', show, true)
      document.removeEventListener('pointerdown', consult, true)
      document.removeEventListener('click', consult, true)
      document.removeEventListener('dblclick', consult, true)
      document.removeEventListener('keydown', key, true)
      document.removeEventListener('wheel', wheel, true)
    }
  }, [enabled, pin])

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
      const viewport = {
        width: document.documentElement.clientWidth || innerWidth,
        height: innerHeight,
      }
      if (tip.scene) {
        const rect = tip.scene.getBoundingClientRect()
        const anchor =
          tip.hit?.anchor &&
          tip.rect &&
          rect.width === tip.rect.width &&
          rect.height === tip.rect.height
            ? {
                x: tip.hit.anchor.x + rect.left - tip.rect.left,
                y: tip.hit.anchor.y + rect.top - tip.rect.top,
              }
            : undefined
        setMarker(anchor ?? null)
        setPosition(sceneHelpPosition(protectedSceneRect(tip.scene), viewport, anchor))
      } else {
        setMarker(null)
        setPosition(
          helpPosition(target.getBoundingClientRect(), {
            width: viewport.width,
            height: innerHeight,
          }),
        )
      }
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
      {enabled && marker && tip?.hit && (
        <span
          className="lab-help-point"
          aria-hidden="true"
          style={{ left: marker.x, top: marker.y }}
        />
      )}
      {enabled && tip && (
        <section
          key={tip.hit?.id ?? tip.entry.title}
          id="spum-help-card"
          className={`lab-help-card${tip.scene ? ' lab-help-scene-card' : ''}`}
          data-scene-help-id={tip.hit?.id}
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
              onClick={() => {
                pin(false)
                setTip(null)
              }}
            >
              ×
            </button>
          </div>
          <p>{tip.entry.body}</p>
          {pinned && (
            <p className="lab-help-pinned">
              Consulta fijada · tocá otro elemento o cerrá esta tarjeta para cambiar.
            </p>
          )}
          {tip.scene && (
            <details
              className="lab-help-objects"
              open={objects.length > 0 ? true : undefined}
            >
              <summary
                onClick={(event) => {
                  event.preventDefault()
                  setObjects(
                    objects.length
                      ? []
                      : (sceneHelpAt(tip.target)?.provider.items?.() ?? []),
                  )
                }}
              >
                Explorar objetos de esta escena
              </summary>
              <div>
                {objects.map((hit) => (
                  <button
                    key={hit.id}
                    type="button"
                    onClick={() => {
                      pin(true)
                      const currentItems =
                        sceneHelpAt(tip.target)?.provider.items?.() ?? []
                      const current = currentItems.find((item) => item.id === hit.id)
                      setObjects(currentItems)
                      setTip({
                        ...tip,
                        entry: current?.entry ?? {
                          title: 'El montaje cambió',
                          body: 'Ese elemento ya no está disponible en la vista actual. Elegí otro objeto de la lista o señalá el visor de nuevo.',
                        },
                        hit: current,
                        rect: tip.scene?.getBoundingClientRect(),
                      })
                    }}
                  >
                    {hit.entry.title}
                  </button>
                ))}
              </div>
            </details>
          )}
        </section>
      )}
      <div className={`lab-help-dock${hasScene ? ' has-scene' : ''}`}>
        {enabled && (
          <span role="status">Señalá o tocá para consultar · Salí para jugar</span>
        )}
        {enabled && hasScene && (
          <button
            className="lab-help-object-toggle"
            type="button"
            onClick={inspectObjects}
          >
            Objetos de la escena
          </button>
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
