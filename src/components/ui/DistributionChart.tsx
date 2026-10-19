import { useLabStore, type Comparison } from '../../store/store'

function line(values: number[], scale: number) {
  return values
    .map(
      (value, i) =>
        `${i === 0 ? 'M' : 'L'}${(12 + ((i + 0.5) * 576) / values.length).toFixed(2)},${(118 - (value / scale) * 102).toFixed(2)}`,
    )
    .join(' ')
}

export default function DistributionChart({
  comparisonOverride,
  guided = false,
}: {
  comparisonOverride?: Comparison | null
  guided?: boolean
}) {
  const histogram = useLabStore((s) => s.histogram)
  const detected = useLabStore((s) => s.detected)
  const distribution = useLabStore((s) => s.distribution)
  const savedComparison = useLabStore((s) => s.comparison)
  const comparison = comparisonOverride === undefined ? savedComparison : comparisonOverride
  const showTheory = useLabStore((s) => s.showTheory)
  // Integrate the fine sampling distribution over the same bins as the data.
  const theory = new Array<number>(histogram.length).fill(0)
  distribution.probabilities.forEach((probability, index) => {
    theory[
      Math.min(
        theory.length - 1,
        Math.floor((index * theory.length) / distribution.probabilities.length),
      )
    ] += probability
  })
  const observed = histogram.map((value) => (detected ? value / detected : 0))
  const reference =
    comparison?.histogram.map((value) => (comparison.detected ? value / comparison.detected : 0)) ??
    []
  const scale = Math.max(0.01, ...observed, ...reference, ...(showTheory ? theory : [])) * 1.07
  return (
    <section className="q-chart" aria-labelledby="chart-title">
      <div className="q-chart-header">
        <div>
          <span className="q-eyebrow">DE LOS PUNTOS A LA EVIDENCIA</span>
          <h2 id="chart-title">Lo que se acumula en la pantalla</h2>
        </div>
        <button
          aria-pressed={showTheory}
          onClick={() => useLabStore.getState().setShowTheory(!showTheory)}
        >
          Curva teórica
        </button>
      </div>
      <div className="q-chart-legend">
        <span>
          <i className="q-key-dots" />
          Frecuencia de impactos
        </span>
        {showTheory && (
          <span>
            <i className="q-key-theory" />
            Probabilidad calculada
          </span>
        )}
        {comparison && (
          <span>
            <i className="q-key-reference" />
            {guided ? 'Referencia del reto' : 'Corrida guardada'}
          </span>
        )}
      </div>
      <svg
        className="q-distribution-svg"
        viewBox="0 0 600 126"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Distribución de ${detected} detecciones en la pantalla, de menos tres a más tres unidades. ${showTheory ? 'Incluye la probabilidad teórica.' : ''} ${comparison ? 'Incluye una corrida anterior normalizada para comparar.' : ''}`}
      >
        <line x1="12" y1="118" x2="588" y2="118" stroke="#d8dcd2" />
        <line x1="300" y1="10" x2="300" y2="118" stroke="#e7e9e2" strokeDasharray="3 4" />
        {observed.map((value, i) => (
          <rect
            key={i}
            x={12 + (i * 576) / observed.length}
            y={118 - (value / scale) * 102}
            width={Math.max(1, 576 / observed.length - 0.4)}
            height={(value / scale) * 102}
            fill="#777eb9"
            opacity=".7"
          />
        ))}
        {comparison && (
          <path
            d={line(reference, scale)}
            fill="none"
            stroke="#b88c55"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        )}
        {showTheory && (
          <path d={line(theory, scale)} fill="none" stroke="#3b5148" strokeWidth="2" />
        )}
      </svg>
      <div className="q-chart-axis" aria-hidden="true">
        <span>−3 u</span>
        <span>Posición transversal z</span>
        <span>+3 u</span>
      </div>
      {!guided && (
        <div className="q-comparison-actions">
          <button disabled={detected === 0} onClick={() => useLabStore.getState().saveComparison()}>
            Guardar esta corrida para comparar
          </button>
          {comparison && (
            <button onClick={() => useLabStore.getState().clearComparison()}>
              Quitar comparación ×
            </button>
          )}
        </div>
      )}
      {comparison && (
        <p className="q-comparison-note">
          {guided ? 'Referencia' : 'Guardada'}: {comparison.detected.toLocaleString('es-AR')}{' '}
          impactos · {comparison.config.slitCount}{' '}
          {comparison.config.slitCount === 1 ? 'rendija' : 'rendijas'} · detector{' '}
          {Math.round(comparison.config.detectorStrength * 100)} % · λ{' '}
          {comparison.config.wavelength.toFixed(3)} u · a {comparison.config.slitWidth.toFixed(3)} u
          · d {comparison.config.slitSeparation.toFixed(2)} u · L{' '}
          {comparison.config.screenDistance.toFixed(1)} u. Ambas corridas se comparan por frecuencia
          relativa.
        </p>
      )}
      <p className="q-chart-note">
        {showTheory
          ? 'La línea verde indica la probabilidad calculada. '
          : 'La curva calculada está oculta. '}
        Las barras cuentan detecciones muestreadas en esta simulación; al principio fluctúan mucho.
        Las corridas usan el mismo eje de posición y la misma escala de frecuencias relativas.
      </p>
    </section>
  )
}
