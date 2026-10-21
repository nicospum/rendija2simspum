import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import Horizon from './Horizon'
import { boundedView, mapTarget, OVERVIEW, visualRadius, worldPoint } from './exploration'
import type { MapTarget, View } from './exploration'
import { CMB, scientific, SOLAR_MASS } from './physics'
import type { blackHole } from './physics'
import { factor } from './impact'

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
}: {
  current: Reading
  reference: Reading
  emission: number
  absorption: number
  moving: boolean
  motion: boolean
  reduced: boolean
  onToggle: () => void
}) {
  const [view, setView] = useState<View>({ ...OVERVIEW })
  const [hovered, setHovered] = useState<MapTarget | null>(null)
  const [pinned, setPinned] = useState<MapTarget | null>(null)
  const clock = useRef(0)
  const scene = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; view: View; moved: boolean } | null>(null)
  const ratio = current.massKg / reference.massKg
  const radius = visualRadius(ratio)
  const selected =
    (pinned === 'absorption' && current.bathK === 0 ? null : pinned) ??
    (hovered === 'absorption' && current.bathK === 0 ? null : hovered)
  function reveal() {
    scene.current?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'center' })
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
  const content: Record<MapTarget, { title: string; text: string; question: string }> = {
    horizon: {
      title: 'Horizonte de sucesos',
      text: `Es la frontera a partir de la cual ninguna señal luminosa futura puede llegar al exterior. No es una pared. Su radio actual es ${scientific(current.radiusM, 'm')}: radio ${factor(ratio)} respecto de la referencia. El borde luminoso solo lo señala en este esquema.`,
      question: 'Probá duplicar la masa: ¿por qué crece el radio pero baja la temperatura?',
    },
    interior: {
      title: 'La región interior',
      text: 'El disco oscuro representa el interior del horizonte en un corte esquemático. La radiación de Hawking no es luz clásica que sale de ese interior: se calcula con campos cuánticos en un espacio-tiempo con horizonte.',
      question: 'Que emita energía hacia afuera no significa que algo pueda escapar desde adentro.',
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
      question: '¿El horizonte actual es mayor o menor? Compará sus radios usando la misma escala.',
    },
  }
  const labels: { id: MapTarget; label: string }[] = [
    { id: 'horizon', label: 'Horizonte' },
    { id: 'interior', label: 'Interior' },
    { id: 'emission', label: 'Dorado · sale' },
    ...(current.bathK > 0 ? [{ id: 'absorption' as const, label: 'Azul · entra' }] : []),
    { id: 'reference', label: 'Referencia' },
    { id: 'background', label: 'Fondo' },
  ]
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
    } else if (event.pointerType !== 'touch') setHovered(targetAt(event))
  }
  return (
    <>
      <div
        className="hk-scene hk-explorer"
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
          className="hk-map-hitarea"
          role="group"
          tabIndex={0}
          aria-label="Mapa explorable: flechas para desplazar; señalá o tocá para obtener información"
          onPointerMove={move}
          onPointerDown={(event) => {
            if (event.button !== 0) return
            drag.current = { x: event.clientX, y: event.clientY, view, moved: false }
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerUp={(event) => {
            if (drag.current && !drag.current.moved) {
              setPinned(targetAt(event))
              setHovered(null)
            }
            drag.current = null
            if (event.currentTarget.hasPointerCapture(event.pointerId))
              event.currentTarget.releasePointerCapture(event.pointerId)
          }}
          onPointerCancel={() => {
            drag.current = null
          }}
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
          Acercamiento ×{view.zoom.toFixed(1).replace('.', ',')} · señalá o tocá para aprender
        </p>
      </div>
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
          Arrastrá suavemente para explorar. En celular, arrastrá de lado; deslizá hacia arriba para
          seguir leyendo. Acercar la vista no cambia la física ni simula una caída.
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
          Señalá un elemento o usá estos botones. Tocá para fijar la explicación; cerrala con × o
          Escape dentro del visor.
        </span>
      </div>
    </>
  )
}
