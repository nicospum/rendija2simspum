import { useState } from 'react'
import { factor, impact } from './impact'
import type { Setup } from './learning'

const SYMBOLS = [
  {
    symbol: 'A',
    name: 'Área del horizonte',
    detail:
      'La magnitud que cambia al mover la masa. A = 4πrₛ². Si el radio se duplica, el área y la entropía se cuadruplican.',
  },
  {
    symbol: 'kB',
    name: 'Constante de Boltzmann',
    detail:
      'Conecta entropía y termodinámica. Da a S sus unidades de joules por kelvin. S/kB es una cantidad sin unidades.',
  },
  {
    symbol: 'c',
    name: 'Velocidad de la luz',
    detail:
      'Conecta espacio, tiempo y energía en relatividad. En esta fórmula aparece elevada al cubo.',
  },
  {
    symbol: 'G',
    name: 'Constante gravitatoria',
    detail:
      'Fija la intensidad de la gravedad. Junto con ℏ y c define el área de Planck: ℓP² = ℏG/c³.',
  },
  {
    symbol: 'ℏ',
    name: 'Constante reducida de Planck',
    detail:
      'Introduce la escala cuántica. También aparece en ΔxΔp ≥ ℏ/2, la incertidumbre de Heisenberg. La relación área–entropía se llama Bekenstein–Hawking.',
  },
  {
    symbol: '¼',
    name: 'El factor que fijó Hawking',
    detail:
      'Bekenstein propuso relacionar entropía y área. La temperatura calculada por Hawking permitió fijar el coeficiente exacto 1/4 en relatividad general.',
  },
] as const

export default function EntropyExplorer({
  setup,
  baseline,
  onDouble,
  onRestore,
}: {
  setup: Setup
  baseline: Setup
  onDouble: () => void
  onRestore: () => void
}) {
  const [selected, setSelected] = useState(0)
  const result = impact(setup, baseline)
  const side = Math.min(2.2, Math.max(0.22, result.areaSideRatio))
  const limited = side !== result.areaSideRatio
  return (
    <section className="hk-entropy-explorer" aria-labelledby="hk-entropy-title">
      <div className="hk-panel-heading">
        <div>
          <p className="hk-eyebrow">UNA PISTA SOBRE LA GRAVEDAD CUÁNTICA</p>
          <h2 id="hk-entropy-title">La entropía cuenta área.</h2>
        </div>
        <span className="hk-model-tag">BEKENSTEIN–HAWKING</span>
      </div>
      <p>
        La entropía se relaciona con cuántas configuraciones microscópicas pueden corresponder a una
        misma descripción macroscópica. En un agujero negro, su valor semiclásico es proporcional al
        área del horizonte.
      </p>
      <div className="hk-entropy-layout">
        <div>
          <div
            className="hk-entropy-equation"
            role="math"
            aria-label="S igual a k de Boltzmann por c al cubo por área, dividido por cuatro G h barra; igual a k de Boltzmann por área dividido por cuatro longitudes de Planck al cuadrado"
          >
            S ={' '}
            <span>
              <b>
                k<sub>B</sub> c³ A
              </b>
              <b>4 G ℏ</b>
            </span>{' '}
            ={' '}
            <span>
              <b>
                k<sub>B</sub> A
              </b>
              <b>
                4 ℓ<sub>P</sub>²
              </b>
            </span>
          </div>
          <div className="hk-constant-buttons" aria-label="Explorar símbolos de la fórmula">
            {SYMBOLS.map((item, i) => (
              <button
                key={item.symbol}
                aria-pressed={selected === i}
                onClick={() => setSelected(i)}
              >
                {item.symbol}
              </button>
            ))}
          </div>
          <div className="hk-constant-explanation" aria-live="polite">
            <strong>{SYMBOLS[selected].name}</strong>
            <p>{SYMBOLS[selected].detail}</p>
          </div>
          <p className="hk-footnote">
            kB, c, G y ℏ son constantes de la naturaleza. El control de masa cambia el área A. La
            fórmula une gravedad, física cuántica y termodinámica.
          </p>
        </div>
        <div>
          <svg
            viewBox="0 0 440 240"
            role="img"
            aria-label={`Comparación de áreas: masa ${factor(result.mass)}, área y entropía ${factor(result.entropy)}`}
          >
            <defs>
              <pattern id="hk-area-grid" width="9" height="9" patternUnits="userSpaceOnUse">
                <rect x="1" y="1" width="7" height="7" rx="1" fill="#dfb573" fillOpacity=".65" />
              </pattern>
            </defs>
            <rect x="54" y="76" width="72" height="72" fill="url(#hk-area-grid)" stroke="#83aeb6" />
            <rect
              x={300 - 36 * side}
              y={112 - 36 * side}
              width={72 * side}
              height={72 * side}
              fill="url(#hk-area-grid)"
              stroke="#e4be81"
            />
            <text x="90" y="24" textAnchor="middle">
              REFERENCIA
            </text>
            <text x="300" y="24" textAnchor="middle">
              AHORA
            </text>
            <text x="90" y="222" textAnchor="middle">
              Área ×1
            </text>
            <text x="300" y="222" textAnchor="middle">
              Área {factor(result.entropy)}
            </text>
          </svg>
          <p className="hk-footnote">
            Horizontes desplegados como cuadrados para comparar áreas.{' '}
            {limited
              ? 'Dibujo comprimido fuera del intervalo de tamaños; los factores conservan el valor real. '
              : ''}
            La cuadrícula representa áreas relativas; no muestra átomos ni celdas de Planck
            observadas.
          </p>
          <div className="hk-entropy-actions">
            <button className="hk-button hk-primary" onClick={onDouble}>
              Abrir reto: masa ×2 → área ×4
            </button>
            <button className="hk-reset" onClick={onRestore}>
              Restaurar
            </button>
          </div>
          <p className="hk-footnote">
            El reto prepara 10¹² kg en vacío y compara con el doble de esa masa.
          </p>
        </div>
      </div>
      <p className="hk-entropy-law">
        Al evaporarse, disminuye la entropía del agujero negro. La segunda ley generalizada incluye
        también la entropía exterior. Esta comparación muestra S del agujero negro; no calcula la
        entropía total de la radiación ni resuelve la paradoja de la información.
      </p>
      <a href="https://doi.org/10.12942/lrr-2001-6" target="_blank" rel="noreferrer">
        Wald: termodinámica de agujeros negros ↗
      </a>
    </section>
  )
}
