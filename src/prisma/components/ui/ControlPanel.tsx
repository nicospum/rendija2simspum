import type { CSSProperties } from 'react'
import { useStore, MATERIAL_LABELS } from '../../store/store'
import type { Material } from '../../physics/optics'
import Icon from './Icon'

interface SliderProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  step?: number
  display: string
  onChange: (value: number) => void
  hint: string
  ends?: [string, string]
  active?: boolean
}
function Slider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  display,
  onChange,
  hint,
  ends,
  active,
}: SliderProps) {
  return (
    <div className={`slider-control${active ? ' learning-control-active' : ''}`}>
      {active && <span className="learning-control-tag">CONTROL DE ESTE RETO</span>}
      <div className="control-label">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{display}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-describedby={`${id}-hint`}
        style={{ '--range-fill': `${((value - min) / (max - min)) * 100}%` } as CSSProperties}
      />
      {ends && (
        <div className="range-ends">
          <span>{ends[0]}</span>
          <span>{ends[1]}</span>
        </div>
      )}
      <p className="control-hint" id={`${id}-hint`}>
        {hint}
      </p>
      {active && (
        <a className="learning-jump" href="#prism-evidence-title">
          Ver la comparación ↑
        </a>
      )}
    </div>
  )
}
export default function ControlPanel({
  activeControl,
  onReset,
}: {
  activeControl?: string
  onReset?: () => void
}) {
  const state = useStore()
  const { config, setParameter } = state
  return (
    <aside className="control-panel" id="prism-controls" aria-label="Controles del experimento">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">TU EXPERIMENTO</span>
          <h2>Explorá la luz</h2>
        </div>
        <button
          className="icon-button"
          onClick={onReset ?? state.reset}
          title="Restablecer todos los valores"
          aria-label="Restablecer experimento"
        >
          <Icon name="reset" />
        </button>
      </div>
      <section className="control-section">
        <div className="section-heading">
          <span className="section-number">01</span>
          <h3>Fuente de luz</h3>
          <button
            className={`switch ${state.lightEnabled ? 'on' : ''}`}
            role="switch"
            aria-checked={state.lightEnabled}
            aria-label="Fuente de luz"
            title={state.lightEnabled ? 'Apagar fuente de luz' : 'Encender fuente de luz'}
            onClick={state.toggleLight}
          >
            <span />
          </button>
        </div>
        <div className="source-type">
          <span className="white-light-dot" />
          <span>Luz blanca</span>
          <span className="mono">380–700 nm</span>
        </div>
        <Slider
          active={activeControl === 'light-angle'}
          id="light-angle"
          label="Dirección"
          value={config.lightAngle}
          min={-16}
          max={16}
          display={`${config.lightAngle}°`}
          ends={['−16°', '+16°']}
          onChange={(v) => setParameter('lightAngle', v)}
          hint="Cambia por dónde llega el haz. Si evita el prisma, la pantalla recibe luz blanca sin separar."
        />
        <Slider
          id="light-offset"
          label="Posición lateral"
          value={config.lightOffset}
          min={-0.7}
          max={0.7}
          step={0.01}
          display={`${config.lightOffset.toFixed(2)} u`}
          onChange={(v) => setParameter('lightOffset', v)}
          hint="Mueve la fuente de lado. Parte del haz puede evitar el prisma y mezclarse con la luz que sí se separó."
        />
        <Slider
          active={activeControl === 'intensity'}
          id="intensity"
          label="Intensidad"
          value={state.lightIntensity}
          min={0}
          max={1}
          step={0.01}
          display={`${Math.round(state.lightIntensity * 100)} %`}
          onChange={state.setIntensity}
          hint="Más brillo no cambia el recorrido ni la separación. Al llegar a cero, ya no se observa luz."
        />
        <details className="advanced-controls">
          <summary>Ajustar ancho del haz</summary>
          <Slider
            id="light-width"
            label="Ancho"
            value={config.lightWidth}
            min={0.005}
            max={0.08}
            step={0.005}
            display={`${config.lightWidth.toFixed(3)} u`}
            onChange={(v) => setParameter('lightWidth', v)}
            hint="Un haz más ancho superpone posiciones y dificulta distinguir colores cercanos; no agrega componentes nuevos."
          />
        </details>
      </section>
      <section className="control-section">
        <div className="section-heading">
          <span className="section-number">02</span>
          <h3>Prisma</h3>
          <Icon name="prism" size={17} />
        </div>
        <div
          className={`material-learning-control${activeControl === 'prism-material' ? ' learning-control-active' : ''}`}
        >
          {activeControl === 'prism-material' && (
            <span className="learning-control-tag">CONTROL DE ESTE RETO</span>
          )}
          <label className="field-label" htmlFor="prism-material">
            Material
          </label>
          <select
            id="prism-material"
            value={config.material}
            aria-describedby="prism-material-hint"
            onChange={(e) => state.setMaterial(e.target.value as Material)}
          >
            {Object.entries(MATERIAL_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <p className="control-hint" id="prism-material-hint">
            Cada material cambia n con el color de forma distinta. Compará la desviación y Δz
            manteniendo la geometría.
          </p>
          {activeControl === 'prism-material' && (
            <a className="learning-jump" href="#prism-evidence-title">
              Ver la comparación ↑
            </a>
          )}
        </div>
        <Slider
          id="prism-angle"
          label="Rotación"
          value={config.prismAngle}
          min={-180}
          max={180}
          display={`${config.prismAngle}°`}
          ends={['−180°', '+180°']}
          onChange={(v) => setParameter('prismAngle', v)}
          hint="Cambia el ángulo de entrada respecto de la normal. Puede desviar el haz fuera de la pantalla o producir reflexión interna."
        />
        <Slider
          id="apex-angle"
          label="Ángulo del vértice"
          value={config.apexAngle}
          min={30}
          max={80}
          display={`${config.apexAngle}°`}
          onChange={(v) => setParameter('apexAngle', v)}
          hint="Cambia la forma del prisma y la orientación entre sus caras. Observá cómo varían la salida y la desviación."
        />
      </section>
      <section className="control-section screen-controls">
        <div className="section-heading">
          <span className="section-number">03</span>
          <h3>Pantalla</h3>
        </div>
        <Slider
          active={activeControl === 'screen-distance'}
          id="screen-distance"
          label="Distancia al prisma"
          value={config.screenDistance}
          min={1.6}
          max={4.2}
          step={0.1}
          display={`${config.screenDistance.toFixed(1)} u`}
          onChange={(v) => setParameter('screenDistance', v)}
          hint="Alejarla amplía la separación de los rayos que llegan: cambia Δz, no sus ángulos ni los colores presentes."
        />
      </section>
      <div className="panel-footer">
        <Icon name="check" size={14} />
        <span>
          Órbita y vista cambian la cámara. Normales muestra desde dónde se miden los ángulos; no
          cambia la física.
        </span>
      </div>
    </aside>
  )
}
