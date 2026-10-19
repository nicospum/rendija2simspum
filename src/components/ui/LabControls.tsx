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
  active = false,
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
  active?: boolean
  onChange: (value: number) => void
}) {
  const decimals = step < 0.01 ? 3 : step < 1 ? 2 : 0
  return (
    <div className={`q-range${active ? ' q-control-active' : ''}`}>
      {active && <span className="q-control-focus-label">CONTROL DE ESTE RETO</span>}
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
        aria-label={title}
        aria-describedby={`${id}-help`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <p id={`${id}-help`}>{description}</p>
      {active && (
        <a className="q-control-link" href="#slit-evidence-title">
          Ver la comparación ↑
        </a>
      )}
    </div>
  )
}

export default function LabControls({
  activeControl,
  onReset,
}: {
  activeControl?: string
  onReset?: () => void
}) {
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
          onClick={onReset ?? (() => useLabStore.getState().resetAll())}
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
        <p className="q-control-hint">
          A igual longitud de onda y geometría, estas partículas tienen el mismo patrón ideal.
          Cambiar de partícula no fija su energía real en este modelo.
        </p>
        <Range
          id="wavelength"
          active={activeControl === 'wavelength'}
          title="Longitud de onda λ"
          min={CONFIG_LIMITS.wavelength.min}
          max={CONFIG_LIMITS.wavelength.max}
          step={CONFIG_LIMITS.wavelength.step}
          value={config.wavelength}
          suffix=" u"
          description="Una λ mayor separa las franjas y ensancha la envolvente de difracción: el patrón completo se abre."
          onChange={(wavelength) => setConfig({ wavelength })}
        />
        <Range
          id="emission-rate"
          active={activeControl === 'emission-rate'}
          title="Detecciones por segundo"
          min={1}
          max={120}
          step={1}
          value={rate}
          description="Acumula detecciones más rápido en emisión continua; no cambia dónde son más probables."
          onChange={(value) => useLabStore.getState().setEmissionRate(value)}
        />
        <Range
          id="burst-size"
          active={activeControl === 'burst-size'}
          title="Partículas por pulsación"
          min={1}
          max={10}
          step={1}
          value={burstSize}
          description="Con una, cada pulsación deja un punto. Muchos puntos revelan la distribución; más partículas no cambian esa distribución."
          onChange={(value) => useLabStore.getState().setBurstSize(value)}
        />
      </section>
      <section className="q-control-section">
        <h3>
          <span>02</span> Las aberturas
        </h3>
        <Range
          id="slit-count"
          active={activeControl === 'slit-count'}
          title="Número de rendijas"
          min={CONFIG_LIMITS.slitCount.min}
          max={CONFIG_LIMITS.slitCount.max}
          step={CONFIG_LIMITS.slitCount.step}
          value={config.slitCount}
          description="Una rendija produce difracción. Con varias y sin información de camino, se suma la interferencia entre las aberturas."
          onChange={(slitCount) => setConfig({ slitCount })}
        />
        <Range
          id="slit-width"
          active={activeControl === 'slit-width'}
          title="Ancho a"
          min={CONFIG_LIMITS.slitWidth.min}
          max={Math.min(CONFIG_LIMITS.slitWidth.max, config.slitSeparation - 0.02)}
          step={CONFIG_LIMITS.slitWidth.step}
          value={config.slitWidth}
          suffix=" u"
          description="Una rendija más estrecha ensancha la envolvente de difracción. Con dos rendijas, d controla además las franjas internas."
          onChange={(slitWidth) => setConfig({ slitWidth })}
        />
        <Range
          id="slit-separation"
          active={activeControl === 'slit-separation'}
          title="Separación entre centros d"
          min={CONFIG_LIMITS.slitSeparation.min}
          max={CONFIG_LIMITS.slitSeparation.max}
          step={CONFIG_LIMITS.slitSeparation.step}
          value={config.slitSeparation}
          suffix=" u"
          description="Al aumentar d, las franjas se juntan. Si mantenés a, la envolvente de difracción conserva su ancho."
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
          active={activeControl === 'detector-strength'}
          title="Fracción con camino marcado"
          min={0}
          max={100}
          step={10}
          value={Math.round(config.detectorStrength * 100)}
          suffix=" %"
          description="Mezcla ideal de eventos con y sin información de camino. Al 100 %, desaparecen las franjas de interferencia y queda la difracción. Mirar la pantalla no activa el dispositivo."
          onChange={(value) => setConfig({ detectorStrength: value / 100 })}
        />
        <Range
          id="screen-distance"
          active={activeControl === 'screen-distance'}
          title="Distancia a la pantalla L"
          min={CONFIG_LIMITS.screenDistance.min}
          max={CONFIG_LIMITS.screenDistance.max}
          step={CONFIG_LIMITS.screenDistance.step}
          value={config.screenDistance}
          suffix=" u"
          description="Alejar la pantalla expande las distancias entre franjas y la envolvente sobre ella; no cambia sus ángulos."
          onChange={(screenDistance) => setConfig({ screenDistance })}
        />
      </section>
      <div className="q-controls-foot">
        Cambiar la configuración inicia una corrida nueva para no mezclar resultados de condiciones
        distintas. La cámara y el campo de ondas son ayudas visuales: no cambian las probabilidades
        de detección.
        <button onClick={() => useLabStore.getState().clearRun()}>Limpiar detecciones ↺</button>
      </div>
    </aside>
  )
}
