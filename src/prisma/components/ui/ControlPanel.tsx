import type { CSSProperties } from 'react'
import { useStore, MATERIAL_LABELS } from '../../store/store'
import type { Material } from '../../physics/optics'
import Icon from './Icon'

interface SliderProps {
  id: string; label: string; value: number; min: number; max: number; step?: number
  display: string; onChange: (value: number) => void; hint: string; ends?: [string, string]
}
function Slider({ id, label, value, min, max, step = 1, display, onChange, hint, ends }: SliderProps) {
  return <div className="slider-control">
    <div className="control-label"><label htmlFor={id}>{label}</label><output htmlFor={id}>{display}</output></div>
    <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-describedby={`${id}-hint`} style={{ '--range-fill': `${(value - min) / (max - min) * 100}%` } as CSSProperties} />
    {ends && <div className="range-ends"><span>{ends[0]}</span><span>{ends[1]}</span></div>}
    <span className="sr-only" id={`${id}-hint`}>{hint}</span>
  </div>
}
export default function ControlPanel() {
  const state = useStore()
  const { config, setParameter } = state
  return <aside className="control-panel" aria-label="Controles del experimento">
    <div className="panel-heading"><div><span className="eyebrow">TU EXPERIMENTO</span><h2>Explorá la luz</h2></div><button className="icon-button" onClick={state.reset} title="Restablecer todos los valores" aria-label="Restablecer experimento"><Icon name="reset" /></button></div>
    <section className="control-section">
      <div className="section-heading"><span className="section-number">01</span><h3>Fuente de luz</h3><button className={`switch ${state.lightEnabled ? 'on' : ''}`} role="switch" aria-checked={state.lightEnabled} aria-label="Encender fuente de luz" onClick={state.toggleLight}><span /></button></div>
      <div className="source-type"><span className="white-light-dot" /><span>Luz blanca</span><span className="mono">380–700 nm</span></div>
      <Slider id="light-angle" label="Dirección" value={config.lightAngle} min={-16} max={16} display={`${config.lightAngle}°`} ends={['−16°', '+16°']} onChange={(v) => setParameter('lightAngle', v)} hint="Gira la lámpara en el plano del experimento; el haz puede dejar de alcanzar el prisma." />
      <Slider id="light-offset" label="Posición lateral" value={config.lightOffset} min={-0.7} max={0.7} step={0.01} display={`${config.lightOffset.toFixed(2)} u`} onChange={(v) => setParameter('lightOffset', v)} hint="Desplaza la fuente en la dirección lateral del banco." />
      <Slider id="intensity" label="Intensidad" value={state.lightIntensity} min={0} max={1} step={0.01} display={`${Math.round(state.lightIntensity * 100)} %`} onChange={state.setIntensity} hint="Cambia el brillo del haz, sin cambiar los ángulos de refracción." />
      <details className="advanced-controls"><summary>Ajustar ancho del haz</summary><Slider id="light-width" label="Ancho" value={config.lightWidth} min={0.005} max={0.08} step={0.005} display={`${config.lightWidth.toFixed(3)} u`} onChange={(v) => setParameter('lightWidth', v)} hint="Haz más ancho: las franjas se superponen y el espectro pierde definición." /></details>
    </section>
    <section className="control-section">
      <div className="section-heading"><span className="section-number">02</span><h3>Prisma</h3><Icon name="prism" size={17} /></div>
      <label className="field-label" htmlFor="prism-material">Material</label>
      <select id="prism-material" value={config.material} onChange={(e) => state.setMaterial(e.target.value as Material)}>{Object.entries(MATERIAL_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      <Slider id="prism-angle" label="Rotación" value={config.prismAngle} min={-180} max={180} display={`${config.prismAngle}°`} ends={['−180°', '+180°']} onChange={(v) => setParameter('prismAngle', v)} hint="Rota el prisma en una vuelta completa y recalcula las intersecciones y la refracción en cada cara." />
      <Slider id="apex-angle" label="Ángulo del vértice" value={config.apexAngle} min={30} max={80} display={`${config.apexAngle}°`} onChange={(v) => setParameter('apexAngle', v)} hint="Modifica la forma triangular real del prisma y la desviación de la luz." />
    </section>
    <section className="control-section screen-controls">
      <div className="section-heading"><span className="section-number">03</span><h3>Pantalla</h3></div>
      <Slider id="screen-distance" label="Distancia al prisma" value={config.screenDistance} min={1.6} max={4.2} step={0.1} display={`${config.screenDistance.toFixed(1)} u`} onChange={(v) => setParameter('screenDistance', v)} hint="Al alejar la pantalla, aumenta la separación de las longitudes de onda que llegan a ella." />
    </section>
    <div className="panel-footer"><Icon name="check" size={14} /><span>Los rayos se calculan con la ley de Snell</span></div>
  </aside>
}
