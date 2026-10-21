import { useState } from 'react'
import ExperimentIllustration from '../portal/ExperimentIllustration'
import { blackHoleLabs } from './catalog'
import './atlas.css'
const ATLAS = [
  {
    id: 'lente-gravitacional',
    label: 'La luz',
    title: 'Una sombra dibujada por la luz',
    type: 'GEOMETRÍA Y OBSERVACIÓN',
    text: 'La luz que pasa cerca se desvía; parte queda capturada. La sombra aparente no es una superficie sólida ni una fotografía directa del horizonte.',
    history:
      '2019 · La colaboración EHT publica la imagen de M87* y su sombra. Nuestro laboratorio explora las trayectorias en un modelo ideal.',
    source: 'https://www.eso.org/public/images/eso1907a/',
  },
  {
    id: 'acrecion',
    label: 'El gas',
    title: 'Lo brillante está afuera',
    type: 'UNA PISTA OBSERVABLE',
    text: 'El gas del disco se calienta y emite. La gravedad curva su luz y el movimiento modifica lo que recibimos. Ese resplandor no es radiación de Hawking.',
    history:
      'Las imágenes y espectros del entorno revelan gas; las órbitas estelares también permiten inferir una masa invisible. Genzel y Ghez recibieron parte del Nobel de 2020 por el objeto compacto del centro galáctico.',
    source: 'https://www.nobelprize.org/prizes/physics/2020/summary/',
  },
  {
    id: 'horizonte',
    label: 'La frontera',
    title: 'El límite de los mensajes',
    type: 'PREDICCIÓN DE RELATIVIDAD GENERAL',
    text: 'El horizonte es una frontera causal. Desde su interior, una señal de luz no puede llegar al exterior lejano. No es una pared donde una sonda tenga que chocar.',
    history:
      'La simulación compara caída y señales. Las observaciones del entorno apoyan la descripción de agujeros negros; no nos dan mensajes enviados desde su interior.',
    source: 'https://science.nasa.gov/universe/black-holes/anatomy/',
  },
  {
    id: 'hawking',
    label: 'La temperatura',
    title: 'Una temperatura sin un disco de gas',
    type: 'PREDICCIÓN SEMICLÁSICA',
    text: 'La radiación de Hawking conecta campos cuánticos y horizontes. Su temperatura aumenta al disminuir la masa. Es un fenómeno diferente de la emisión del disco.',
    history:
      '1974–1975 · Stephen Hawking desarrolla la predicción. No hay una detección astrofísica confirmada de esa radiación; los sistemas análogos no son agujeros negros gravitatorios.',
    source: 'https://doi.org/10.1007/BF02345020',
  },
  {
    id: 'entropia',
    label: 'El área',
    title: 'La superficie entra en la cuenta',
    type: 'TERMODINÁMICA DE AGUJEROS NEGROS',
    text: 'La entropía de Bekenstein–Hawking es proporcional al área del horizonte. La fórmula une G, c, ℏ y kB: gravedad, relatividad, cuántica y termodinámica.',
    history:
      '1973 · Jacob Bekenstein propone entropía de área. El cálculo de temperatura de Hawking fija la normalización. El mapa del laboratorio no es un conteo observado de celdas microscópicas.',
    source: 'https://doi.org/10.1103/PhysRevD.7.2333',
  },
] as const
export default function BlackHoleAtlas() {
  const [index, setIndex] = useState(0),
    item = ATLAS[index],
    lab = blackHoleLabs.find((l) => l.id === item.id)!
  return (
    <section className="bh-atlas" aria-labelledby="bh-atlas-title">
      <p className="bh-atlas-kicker">
        CINCO PIEZAS / UN ATLAS DE LO INVISIBLE
      </p>
      <h2 id="bh-atlas-title">Aprendé a distinguir las pistas.</h2>
      <p>
        Elegí una pieza: qué representa, cómo se estudia y qué parte de la
        historia estás explorando.
      </p>
      <div
        className="bh-atlas-tabs"
        role="group"
        aria-label="Elegir pieza del atlas"
      >
        {ATLAS.map((entry, i) => (
          <button
            key={entry.id}
            aria-pressed={index === i}
            aria-controls="bh-atlas-panel"
            onClick={() => setIndex(i)}
          >
            0{i + 1} · {entry.label}
          </button>
        ))}
      </div>
      <div className="bh-atlas-panel" id="bh-atlas-panel">
        <div className="bh-atlas-art">
          <ExperimentIllustration kind={item.id} />
        </div>
        <div>
          <span>{item.type}</span>
          <h3 aria-live="polite">{item.title}</h3>
          <p>{item.text}</p>
          <p className="bh-atlas-history">{item.history}</p>
          <a href={lab.href}>Explorar: {lab.title} →</a>
          <a href={item.source} target="_blank" rel="noreferrer">
            Leer la fuente ↗
          </a>
        </div>
      </div>
    </section>
  )
}
