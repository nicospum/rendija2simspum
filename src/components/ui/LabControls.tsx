import { useLabStore } from '../../store/store'
import { CONFIG_LIMITS, type ParticleType } from '../../physics/interference'

function Range({
  id,
  title,
  value,
  min,
  max,
  step,
  suffix = '',
  description,
  onChange,
}: {
  id: string
  title: string
  value: number
  min: number
  max: number
  step: number
  suffix?: string
  description: string
  onChange: (value: number) => void
}) {
  const decimals = step < 0.01 ? 3 : step < 1 ? 2 : 0
  return (
    <div className="q-range">
      <label htmlFor={id}>
        {title}
        <output htmlFor={id}>
          {value.toFixed(decimals)}
          {suffix}
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-describedby={`${id}-help`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <p id={`${id}-help`}>{description}</p>
    </div>
  )
}

export default function LabControls() {
  const config = useLabStore((s) => s.config)
  const rate = useLabStore((s) => s.emissionRate)
  const burstSize = useLabStore((s) => s.burstSize)
  const setConfig = useLabStore((s) => s.setConfig)
  return (
    <aside className="q-controls" aria-labelledby="controls-title">
      <div className="q-controls-heading">
        <div>
          <span className="q-eyebrow">TU EXPERIMENTO</span>
          <h2 id="controls-title">Cambiá una cosa.</h2>
        </div>
        <button
          className="q-icon-button"
          aria-label="Restablecer experimento"
          title="Restablecer todos los valores"
          onClick={() => useLabStore.getState().resetAll()}
        >
          ↺
        </button>
      </div>
      <section className="q-control-section">
        <h3>
          <span>01</span> La fuente
        </h3>
        <label className="q-select-label" htmlFor="particle-type">
          Partícula
        </label>
        <select
          id="particle-type"
          value={config.particleType}
          onChange={(e) => setConfig({ particleType: e.target.value as ParticleType })}
        >
          <option value="electron">Electrón</option>
          <option value="photon">Fotón</option>
          <option value="neutron">Neutrón</option>
        </select>
        <p className="q-control-hint">A igual longitud de onda, el mismo patrón ideal.</p>
        <Range
          id="wavelength"
          title="Longitud de onda λ"
          min={CONFIG_LIMITS.wavelength.min}
          max={CONFIG_LIMITS.wavelength.max}
          step={CONFIG_LIMITS.wavelength.step}
          value={config.wavelength}
          suffix=" u"
          description="Una λ mayor separa más las franjas de interferencia."
          onChange={(wavelength) => setConfig({ wavelength })}
        />
        <Range
          id="emission-rate"
          title="Detecciones por segundo"
          min={1}
          max={120}
          step={1}
          value={rate}
          description="Controla la rapidez de la emisión continua, sin cambiar la distribución."
          onChange={(value) => useLabStore.getState().setEmissionRate(value)}
        />
        <Range
          id="burst-size"
          title="Partículas por pulsación"
          min={1}
          max={10}
          step={1}
          value={burstSize}
          description="Usá una para ver cada evento; aumentá para acumular más rápido."
          onChange={(value) => useLabStore.getState().setBurstSize(value)}
        />
      </section>
      <section className="q-control-section">
        <h3>
          <span>02</span> Las aberturas
        </h3>
        <Range
          id="slit-count"
          title="Número de rendijas"
          min={CONFIG_LIMITS.slitCount.min}
          max={CONFIG_LIMITS.slitCount.max}
          step={CONFIG_LIMITS.slitCount.step}
          value={config.slitCount}
          description="Una abertura difracta. Varias también pueden interferir."
          onChange={(slitCount) => setConfig({ slitCount })}
        />
        <Range
          id="slit-width"
          title="Ancho a"
          min={CONFIG_LIMITS.slitWidth.min}
          max={Math.min(CONFIG_LIMITS.slitWidth.max, config.slitSeparation - 0.02)}
          step={CONFIG_LIMITS.slitWidth.step}
          value={config.slitWidth}
          suffix=" u"
          description="Una abertura más estrecha ensancha la envolvente de difracción."
          onChange={(slitWidth) => setConfig({ slitWidth })}
        />
        <Range
          id="slit-separation"
          title="Separación entre centros d"
          min={CONFIG_LIMITS.slitSeparation.min}
          max={CONFIG_LIMITS.slitSeparation.max}
          step={CONFIG_LIMITS.slitSeparation.step}
          value={config.slitSeparation}
          suffix=" u"
          description="Mayor separación entre rendijas produce franjas más juntas."
          onChange={(slitSeparation) => setConfig({ slitSeparation })}
        />
      </section>
      <section className="q-control-section">
        <h3>
          <span>03</span> La información
        </h3>
        <div className="q-detector-presets">
          <button
            aria-pressed={config.detectorStrength === 0}
            onClick={() => setConfig({ detectorStrength: 0 })}
          >
            Sin registro
          </button>
          <button
            aria-pressed={config.detectorStrength === 1}
            onClick={() => setConfig({ detectorStrength: 1 })}
          >
            Camino registrado
          </button>
        </div>
        <Range
          id="detector-strength"
          title="Fracción con camino marcado"
          min={0}
          max={100}
          step={10}
          value={Math.round(config.detectorStrength * 100)}
          suffix=" %"
          description="Un dispositivo conserva información de por cuál abertura pasó. Mirar la pantalla no activa ese dispositivo."
          onChange={(value) => setConfig({ detectorStrength: value / 100 })}
        />
        <Range
          id="screen-distance"
          title="Distancia a la pantalla L"
          min={CONFIG_LIMITS.screenDistance.min}
          max={CONFIG_LIMITS.screenDistance.max}
          step={CONFIG_LIMITS.screenDistance.step}
          value={config.screenDistance}
          suffix=" u"
          description="Al alejar la pantalla, se expande el patrón calculado."
          onChange={(screenDistance) => setConfig({ screenDistance })}
        />
      </section>
      <div className="q-controls-foot">
        Cambiar la configuración inicia una corrida nueva para no mezclar resultados de condiciones
        distintas.
        <button onClick={() => useLabStore.getState().clearRun()}>Limpiar detecciones ↺</button>
      </div>
    </aside>
  )
}
