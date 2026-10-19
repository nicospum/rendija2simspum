import { useEffect, useRef } from 'react'
import Icon from './Icon'

export default function HelpDialog({ mode, onClose }: { mode: 'guide' | 'theory' | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (mode && !ref.current?.open) ref.current?.showModal()
    if (!mode && ref.current?.open) ref.current?.close()
  }, [mode])
  return <dialog ref={ref} className="help-dialog" onClose={onClose} aria-labelledby="help-title">
    <div className="dialog-top"><span className="eyebrow">CUADERNO DE LABORATORIO</span><button className="icon-button" onClick={onClose} aria-label="Cerrar ayuda"><Icon name="close" /></button></div>
    <h2 id="help-title">{mode === 'guide' ? 'Un experimento, muchas preguntas.' : 'La luz blanca ya contiene los colores.'}</h2>
    {mode === 'guide' ? <>
      <p>Mové los controles y observá cómo cambia el recorrido de los rayos al instante.</p>
      <ol><li><strong>Dirigí la luz.</strong> Ajustá la dirección y la posición de la lámpara. Si el haz no toca el prisma, no se dispersa.</li><li><strong>Explorá el prisma.</strong> Cambiá el material, la rotación o el ángulo del vértice. La geometría visible es la misma que usa el cálculo.</li><li><strong>Alejá la pantalla.</strong> Compará la separación de las longitudes de onda en la lectura inferior.</li></ol>
      <p>Arrastrá la escena para girar la cámara; usá la rueda o un gesto de pinza para acercarte. La vista superior permite comparar las trayectorias.</p>
      <p>Pasá el cursor sobre la lámpara, el prisma o la pantalla para leer qué ocurre. En pantallas táctiles, tocá sus etiquetas.</p>
      <p><strong>Congelar</strong> mantiene la geometría y las mediciones actuales mientras preparás otros parámetros. Reanudá para aplicarlos. La intensidad y el encendido siguen disponibles.</p>
    </> : <>
      <p>El prisma desvía cada longitud de onda una cantidad distinta. El violeta normalmente se refracta más que el rojo: esa diferencia hace visible el espectro.</p>
      <div className="formula">n₁ sin θ₁ = n₂ sin θ₂ <span>LEY DE SNELL</span></div>
      <p>El índice de refracción se calcula con el modelo de Cauchy: <strong>n(λ) = A + B/λ² + C/λ⁴</strong>. Los ángulos se miden respecto de la normal a cada cara. Si el ángulo dentro del prisma supera el crítico, se produce reflexión interna total.</p>
      <p>Se trazan 33 longitudes de onda entre 380 y 700 nm, con tres rayos por longitud de onda para representar el ancho del haz. La pantalla recibe únicamente los rayos que la alcanzan.</p>
      <p className="model-note">Modelo de óptica geométrica en aire. Los coeficientes de los materiales son aproximaciones educativas heredadas del proyecto; el cuarzo se modela como un medio isotrópico. No se simulan difracción, polarización, absorción ni velocidad de propagación. Las distancias usan unidades de escena (u), sin una escala experimental calibrada.</p>
      <a href="https://openstax.org/books/university-physics-volume-3/pages/1-4-total-internal-reflection" target="_blank" rel="noreferrer">Consultar el fundamento físico en OpenStax <Icon name="arrow" size={14} /></a>
    </>}
    <button className="button primary" onClick={onClose}>Volver al experimento <Icon name="arrow" /></button>
  </dialog>
}
