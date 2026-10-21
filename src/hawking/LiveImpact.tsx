import { factor, impact } from './impact'
import type { Setup } from './learning'
import { scientific } from './physics'

export default function LiveImpact({
  setup,
  baseline,
  running,
}: {
  setup: Setup
  baseline: Setup
  running: boolean
}) {
  const result = impact(setup, baseline)
  const maxPower = Math.max(result.current.powerW, result.current.absorbedW)
  return (
    <section className="hk-live-impact" aria-labelledby="hk-impact-title">
      <p className="hk-eyebrow">LO QUE TU CAMBIO PROVOCA</p>
      <div aria-live={running ? 'off' : 'polite'} aria-atomic="true">
        <h2 id="hk-impact-title">{result.title}</h2>
        <p className="hk-impact-explanation">{result.explanation}</p>
      </div>
      <div className="hk-impact-metrics">
        {result.metrics.map(({ name, ratio }) => (
          <div key={name}>
            <span>{name}</span>
            <strong>{factor(ratio)}</strong>
            <div
              className="hk-comparison-bars"
              aria-label={`${name}: referencia uno, actual ${factor(ratio)}`}
            >
              <i style={{ width: `${100 / Math.max(1, ratio)}%` }} />
              <i style={{ width: `${(100 * ratio) / Math.max(1, ratio)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="hk-comparison-key">
        <i /> Referencia del reto <i /> Ahora · barras con una escala común por magnitud
      </p>
      <div className="hk-energy-balance">
        <div>
          <span>Sale · emisión ideal</span>
          <strong>{scientific(result.current.powerW, 'W')}</strong>
          <div>
            <i style={{ width: `${(100 * result.current.powerW) / maxPower}%` }} />
          </div>
        </div>
        <div>
          <span>Entra · absorción ideal</span>
          <strong>{scientific(result.current.absorbedW, 'W')}</strong>
          <div>
            <i style={{ width: `${(100 * result.current.absorbedW) / maxPower}%` }} />
          </div>
        </div>
        <p>
          {result.current.netW < 0
            ? 'Balance: entra más energía de la que sale. Ganaría masa.'
            : 'Balance: sale más energía de la que entra. Perdería masa.'}{' '}
          Las dos barras usan la misma escala de potencia. Con fondo cósmico se muestra el balance
          instantáneo.
        </p>
      </div>
    </section>
  )
}
