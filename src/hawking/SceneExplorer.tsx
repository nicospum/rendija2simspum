import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import Horizon from './Horizon'
import {
  boundedView,
  mapTarget,
  markerPosition,
  OVERVIEW,
  visualRadius,
  worldPoint,
} from './exploration'
import type { MapTarget, View } from './exploration'
import { CMB, scientific, SOLAR_MASS } from './physics'
import type { blackHole } from './physics'
import { factor } from './impact'
import { usePointerDrag } from '../shared/usePointerDrag'
import { registerSceneHelp } from '../education/sceneHelp'
import type { SceneHelpHit } from '../education/sceneHelp'

type Reading = ReturnType<typeof blackHole>
export default function SceneExplorer({
  current,
  reference,
  emission,
  absorption,
  moving,
  motion,
  reduced,
  onToggle,
  controls,
}: {
  current: Reading
  reference: Reading
  emission: number
  absorption: number
  moving: boolean
  motion: boolean
  reduced: boolean
  onToggle: () => void
  controls?: ReactNode
}) {
  const [view, setView] = useState<View>({ ...OVERVIEW })
  const [hovered, setHovered] = useState<MapTarget | null>(null)
  const [pinned, setPinned] = useState<MapTarget | null>(null)
  const clock = useRef(0)
  const scene = useRef<HTMLDivElement>(null)
  const hitarea = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; view: View; moved: boolean } | null>(null)
  const ratio = current.massKg / reference.massKg
  const radius = visualRadius(ratio)
  const selected =
    (pinned === 'absorption' && current.bathK === 0 ? null : pinned) ??
    (hovered === 'absorption' && current.bathK === 0 ? null : hovered)
  function reveal() {
    scene.current?.scrollIntoView({
      behavior: reduced ? 'instant' : 'smooth',
      block: 'center',
    })
  }
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPinned(null)
        setHovered(null)
      }
    }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [])
  const content = useMemo<
    Record<MapTarget, { title: string; text: string; question: string }>
  >(
    () => ({
      horizon: {
        title: 'Horizonte de sucesos',
        text: `Es la frontera a partir de la cual ninguna señal luminosa futura puede llegar al exterior. No es una pared. Su radio actual es ${scientific(current.radiusM, 'm')}: radio ${factor(ratio)} respecto de la referencia. El borde luminoso solo lo señala en este esquema.`,
        question:
          'Probá duplicar la masa: ¿por qué crece el radio pero baja la temperatura?',
      },
      interior: {
        title: 'La región interior',
        text: 'El disco oscuro representa el interior del horizonte en un corte esquemático. La radiación de Hawking no es luz clásica que sale de ese interior: se calcula con campos cuánticos en un espacio-tiempo con horizonte.',
        question:
          'Que emita energía hacia afuera no significa que algo pueda escapar desde adentro.',
      },
      emission: {
        title: 'Dorado: energía emitida',
        text: `Los marcadores dorados simbolizan la emisión de Hawking. Ahora: ${scientific(current.powerW, 'W')} en el modelo ideal, potencia ${factor(current.powerW / reference.powerW)}. El brillo y movimiento están amplificados; no indican un color visible, una velocidad física ni fotones individuales.`,
        question:
          'Al dividir la masa por dos, T se duplica y la potencia ideal se cuadruplica. Mirá cómo responde el flujo.',
      },
      absorption: {
        title: 'Azul: energía que entra',
        text: `Representa la absorción del fondo cósmico a ${CMB.toLocaleString('es-AR', { maximumFractionDigits: 4 })} K: ${scientific(current.absorbedW, 'W')} en esta aproximación. ${current.netW < 0 ? 'Entra más energía de la que sale: ganaría masa.' : 'Todavía sale más energía de la que entra: perdería masa.'} El dorado sigue presente porque la emisión no se apaga.`,
        question:
          'Compará las barras de energía: emitir y evaporarse no son lo mismo. Acá mostramos el balance instantáneo, sin avanzar el reloj.',
      },
      background: {
        title: 'Fondo y trama de orientación',
        text: 'Las estrellas y la trama ayudan a ubicarte en el visor. Son ilustrativas: no calculan lente gravitacional, órbitas ni una deformación medible del espacio. El fondo cósmico del control es un baño térmico a 2,7255 K; no es este dibujo de estrellas.',
        question:
          'Podés acercar y desplazar suavemente la vista sin cambiar masa, temperatura ni tiempo.',
      },
      reference: {
        title: 'Referencia punteada',
        text: `Este círculo conserva el radio de la referencia del reto: ${scientific(reference.radiusM, 'm')}. No es un segundo horizonte ni la esfera de fotones. El acercamiento mueve y amplía tanto la referencia como el horizonte actual.`,
        question:
          '¿El horizonte actual es mayor o menor? Compará sus radios usando la misma escala.',
      },
    }),
    [current, reference, ratio],
  )
  const labels: { id: MapTarget; label: string }[] = [
    { id: 'horizon', label: 'Horizonte' },
    { id: 'interior', label: 'Interior' },
    { id: 'emission', label: 'Dorado · sale' },
    ...(current.bathK > 0 ? [{ id: 'absorption' as const, label: 'Azul · entra' }] : []),
    { id: 'reference', label: 'Referencia' },
    { id: 'background', label: 'Fondo' },
  ]
  useEffect(() => {
    const element = hitarea.current
    if (!element) return
    const pick = (point: {
      x: number
      y: number
      pointerType: string
    }): SceneHelpHit | null => {
      if (!scene.current?.querySelector('canvas')) return null
      const bounds = element.getBoundingClientRect()
      if (
        bounds.width <= 0 ||
        bounds.height <= 0 ||
        point.x < bounds.left ||
        point.x > bounds.right ||
        point.y < bounds.top ||
        point.y > bounds.bottom
      )
        return null
      const world = worldPoint(
        (2 * (point.x - bounds.left)) / bounds.width - 1,
        1 - (2 * (point.y - bounds.top)) / bounds.height,
        bounds.width / bounds.height,
        view,
      )
      const target = mapTarget(
        world,
        radius,
        clock.current,
        emission,
        current.bathK > 0 ? absorption : 0,
        (point.pointerType === 'touch' ? 40 : 20) / (bounds.height * view.zoom),
      )
      const description = content[target]
      return {
        id: `hawking-${target}`,
        entry: {
          title: description.title,
          body: `${target === 'emission' || target === 'absorption' ? 'Marcador identificado en este instante; no seguimos una partícula física. ' : ''}${description.text} ${description.question}`,
        },
        anchor: { x: point.x, y: point.y },
      }
    }
    return registerSceneHelp(element, {
      pick,
      items: () => {
        const bounds = element.getBoundingClientRect()
        const found = new Map<string, SceneHelpHit>()
        const consider = (p: { x: number; y: number }) => {
          const x =
            bounds.left +
            bounds.width / 2 +
            ((p.x - view.x) * view.zoom * bounds.height) / 2
          const y =
            bounds.top +
            bounds.height / 2 -
            ((p.y - view.y) * view.zoom * bounds.height) / 2
          const hit = pick({ x, y, pointerType: 'mouse' })
          if (hit && !found.has(hit.id)) found.set(hit.id, hit)
        }
        consider({ x: 0, y: 0 })
        for (let i = 0; i < 16; i++) {
          const a = (i * Math.PI) / 8
          consider({ x: radius * Math.cos(a), y: radius * Math.sin(a) })
          consider({ x: 0.32 * Math.cos(a), y: 0.32 * Math.sin(a) })
        }
        for (let i = 0; i < 40; i++) {
          for (const incoming of [false, true]) {
            const signal = incoming ? (current.bathK > 0 ? absorption : 0) : emission
            if (signal <= 0) continue
            const point = markerPosition(i, clock.current, radius, signal, incoming)
            if (point.visible) consider(point)
          }
        }
        const background = pick({
          x: bounds.left + 8,
          y: bounds.top + 8,
          pointerType: 'mouse',
        })
        if (background && !found.has(background.id)) found.set(background.id, background)
        return [...found.values()]
      },
    })
    // Descriptions and render geometry update together when the physical setup changes.
  }, [view, radius, current.bathK, content, emission, absorption])
  function targetAt(event: PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const p = worldPoint(
      (2 * (event.clientX - bounds.left)) / bounds.width - 1,
      1 - (2 * (event.clientY - bounds.top)) / bounds.height,
      bounds.width / bounds.height,
      view,
    )
    return mapTarget(
      p,
      radius,
      clock.current,
      emission,
      absorption,
      26 / (bounds.height * view.zoom),
    )
  }
  function move(event: PointerEvent<HTMLDivElement>) {
    if (drag.current) {
      const dx = event.clientX - drag.current.x,
        dy = event.clientY - drag.current.y
      if (Math.hypot(dx, dy) > 6) drag.current.moved = true
      if (drag.current.moved) {
        const height = event.currentTarget.getBoundingClientRect().height
        setView(
          boundedView({
            ...drag.current.view,
            x: drag.current.view.x - (dx * 2) / (height * view.zoom),
            y:
              drag.current.view.y +
              (event.pointerType === 'touch' ? 0 : (dy * 2) / (height * view.zoom)),
          }),
        )
        setHovered(null)
      }
    }
  }
  const gesture = usePointerDrag<HTMLDivElement>({
    // The map deliberately allows native vertical scrolling (touch-action: pan-y).
    preventDefault: false,
    onStart(event) {
      drag.current = { x: event.clientX, y: event.clientY, view, moved: false }
    },
    onMove: move,
    onEnd(event) {
      if (drag.current && !drag.current.moved) {
        setPinned(targetAt(event))
        setHovered(null)
      }
      drag.current = null
    },
    onCancel() {
      drag.current = null
    },
    onHover(event) {
      if (event.pointerType !== 'touch') setHovered(targetAt(event))
    },
  })
  return (
    <>
      <div
        className="hk-scene hk-explorer spum-live-stage"
        ref={scene}
        onPointerLeave={() => setHovered(null)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setPinned(null)
            setHovered(null)
          }
        }}
      >
        <Horizon
          ratio={ratio}
          bath={current.bathK > 0}
          moving={moving}
          emission={emission}
          absorption={absorption}
          view={view}
          clock={clock}
        />
        <div
          ref={hitarea}
          data-scene-help-surface
          className="hk-map-hitarea"
          role="group"
          tabIndex={0}
          aria-label="Mapa explorable: flechas para desplazar; señalá o tocá para obtener información"
          {...gesture}
          onKeyDown={(event) => {
            const direction = {
              ArrowLeft: [-1, 0],
              ArrowRight: [1, 0],
              ArrowUp: [0, 1],
              ArrowDown: [0, -1],
            }[event.key]
            if (direction) {
              event.preventDefault()
              setView(
                boundedView({
                  ...view,
                  x: view.x + (direction[0] * 0.06) / view.zoom,
                  y: view.y + (direction[1] * 0.06) / view.zoom,
                }),
              )
            }
          }}
        />
        <div className="hk-scene-top">
          <span>
            <i /> EXPLORAR EL HORIZONTE
          </span>
          <button onClick={onToggle} aria-pressed={!motion} disabled={reduced}>
            {reduced ? 'Movimiento reducido' : motion ? 'Pausar visual' : 'Animar visual'}
          </button>
        </div>
        <div className="hk-scene-label">
          <span>SCHWARZSCHILD · VISTA ESQUEMÁTICA</span>
          <strong>{scientific(current.massKg, 'kg')}</strong>
          <small>{scientific(current.massKg / SOLAR_MASS)} masas solares nominales</small>
        </div>
        {selected && !(selected === 'absorption' && current.bathK === 0) && (
          <aside
            id="hk-map-information"
            className="hk-map-bubble"
            aria-label="Información del mapa"
          >
            <div>
              <strong>{content[selected].title}</strong>
              <button
                aria-label="Cerrar información del mapa"
                onClick={() => {
                  setPinned(null)
                  setHovered(null)
                }}
              >
                ×
              </button>
            </div>
            <p>{content[selected].text}</p>
            <p>{content[selected].question}</p>
          </aside>
        )}
        <p className="hk-map-scale">
          Acercamiento ×{view.zoom.toFixed(1).replace('.', ',')} · señalá o tocá para
          aprender
        </p>
      </div>
      {controls}
      <details className="hk-map-drawer">
        <summary>Acercar el mapa y descubrir sus elementos</summary>
        <div className="hk-map-tools">
          <div className="hk-map-navigation" aria-label="Navegación del visor">
            <button
              aria-label="Alejar vista"
              disabled={view.zoom <= 1}
              onClick={() => setView(boundedView({ ...view, zoom: view.zoom - 0.2 }))}
            >
              −
            </button>
            <button
              aria-label="Acercar vista"
              disabled={view.zoom >= 2.4}
              onClick={() => setView(boundedView({ ...view, zoom: view.zoom + 0.2 }))}
            >
              +
            </button>
            <button
              onClick={() => {
                setView(boundedView({ zoom: 2.2, x: radius * 0.75, y: 0 }))
                setPinned('horizon')
                reveal()
              }}
            >
              Ir al horizonte
            </button>
            <button
              onClick={() => {
                setView({ ...OVERVIEW })
                setPinned(null)
                setHovered(null)
              }}
            >
              Vista general
            </button>
          </div>
          <p>
            Arrastrá suavemente para explorar. En celular, arrastrá de lado; deslizá hacia
            arriba para seguir leyendo. Acercar la vista no cambia la física ni simula una
            caída.
          </p>
          <div className="hk-map-labels" aria-label="Elementos del mapa">
            {labels.map(({ id, label }) => (
              <button
                key={id}
                aria-pressed={selected === id}
                aria-controls="hk-map-information"
                onMouseEnter={() => setHovered(id)}
                onFocus={() => setHovered(id)}
                onBlur={() => setHovered(null)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => {
                  setPinned(id)
                  reveal()
                }}
              >
                {label} <span aria-hidden="true">?</span>
              </button>
            ))}
          </div>
          <span id="hk-map-help" className="hk-map-hint">
            Señalá un elemento o usá estos botones. Tocá para fijar la explicación;
            cerrala con × o Escape dentro del visor.
          </span>
        </div>
      </details>
    </>
  )
}
