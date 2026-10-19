import { useEffect, useRef } from 'react'
import Icon from './Icon'

export default function HelpDialog({
  mode,
  onClose,
}: {
  mode: 'guide' | 'theory' | null
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (mode && !ref.current?.open) ref.current?.showModal()
    if (!mode && ref.current?.open) ref.current?.close()
  }, [mode])
  return (
    <dialog ref={ref} className="help-dialog" onClose={onClose} aria-labelledby="help-title">
      <div className="dialog-top">
        <span className="eyebrow">CUADERNO DE LABORATORIO</span>
        <button className="icon-button" onClick={onClose} aria-label="Cerrar ayuda">
          <Icon name="close" />
        </button>
      </div>
      <h2 id="help-title">
        {mode === 'guide' ? 'Predecí, cambiá, compará.' : 'Lo que Newton puso a prueba.'}
      </h2>
      {mode === 'guide' ? (
        <>
          <p>
            Antes de mover un control, anticipá qué va a cambiar. Modificá una sola variable y
            contrastá tu idea con las trayectorias y las mediciones.
          </p>
          <ol>
            <li>
              <strong>Hacé pasar la luz por el prisma.</strong> Compará el haz que lo evita con el
              que lo atraviesa. ¿Cuándo aparecen posiciones diferentes para cada componente?
            </li>
            <li>
              <strong>Separá brillo y recorrido.</strong> Variá la intensidad sin apagar la fuente.
              ¿Cambian los ángulos y la separación, o solo el brillo?
            </li>
            <li>
              <strong>Alejá la pantalla.</strong> Compará la separación de los extremos, Δz, con la
              desviación angular. El gráfico inferior ajusta su escala: usá también los números.
            </li>
            <li>
              <strong>Compará materiales.</strong> Mantené la geometría y cambiá el material.
              Observá cuánto varía el índice entre el violeta y el rojo; un único valor de n no
              describe toda la dispersión.
            </li>
          </ol>
          <p>
            Al elegir un reto se prepara un punto de partida y{' '}
            <strong>se guarda una referencia automáticamente</strong>. Anticipá el resultado y usá{' '}
            <strong>Probar este cambio</strong> para modificar una sola variable. Compará la
            referencia con la lectura actual; son resultados del modelo simulado.
          </p>
          <p>
            <strong>Reiniciar este reto</strong> recupera su punto de partida.{' '}
            <strong>Explorar libremente</strong> permite seguir con los controles sin el recorrido
            guiado.
          </p>
          <p>
            Arrastrá la escena para girar la cámara; usá la rueda o un gesto de pinza para
            acercarte. La vista superior permite comparar las trayectorias.
          </p>
          <p>
            Pasá el cursor sobre la lámpara, el prisma o la pantalla para leer qué ocurre. En
            pantallas táctiles, tocá sus etiquetas.
          </p>
          <p>
            <strong>Congelar lectura</strong> mantiene la geometría y las mediciones actuales
            mientras preparás otros parámetros. Usá <strong>Aplicar y reanudar</strong> para ver los
            cambios ópticos; la intensidad y el encendido siguen disponibles. Congelar no reemplaza
            la referencia del reto.
          </p>
        </>
      ) : (
        <>
          <p>
            Newton explicó la luz blanca como una mezcla de componentes. Para contrastarlo,
            seleccionó luz del espectro, la pasó por otro prisma y también volvió a reunir colores
            para obtener blanco.{' '}
            <a
              href="https://newtonproject.ox.ac.uk/view/texts/normalized/NATP00006"
              target="_blank"
              rel="noreferrer"
            >
              Leer la fuente original de 1672.
            </a>
          </p>
          <p>
            <strong>Este banco incluye un solo prisma.</strong> No reproduce la selección de un
            componente, el segundo prisma ni la recomposición. Permite explorar qué predice el
            modelo, sin sustituir aquellas pruebas históricas.
          </p>
          <p>
            El prisma desvía cada longitud de onda una cantidad distinta. En estos materiales, el
            violeta se refracta más que el rojo: esa diferencia hace visible el espectro.{' '}
            <a
              href="https://openstax.org/books/university-physics-volume-3/pages/1-5-dispersion"
              target="_blank"
              rel="noreferrer"
            >
              Fundamento de la dispersión en OpenStax.
            </a>
          </p>
          <div className="formula">
            n₁ sin θ₁ = n₂ sin θ₂ <span>LEY DE SNELL</span>
          </div>
          <p>
            El índice de refracción se calcula con el modelo de Cauchy:{' '}
            <strong>n(λ) = A + B/λ² + C/λ⁴</strong>. Los ángulos se miden respecto de la normal a
            cada cara. Si el ángulo dentro del prisma supera el crítico, se produce reflexión
            interna total.
          </p>
          <p>
            Se calculan 33 muestras entre 380 y 700 nm para representar un espectro continuo, con
            tres rayos por muestra para aproximar el ancho del haz. No son 33 colores separados de
            la naturaleza. La pantalla recibe únicamente los rayos que la alcanzan.
          </p>
          <p className="model-note">
            Modelo de óptica geométrica en aire. Los coeficientes de los materiales son
            aproximaciones educativas heredadas del proyecto; el cuarzo se modela como un medio
            isotrópico. No se simulan difracción, polarización, absorción ni velocidad de
            propagación. Las distancias usan unidades de escena (u), sin una escala experimental
            calibrada.
          </p>
          <a
            href="https://openstax.org/books/university-physics-volume-3/pages/1-4-total-internal-reflection"
            target="_blank"
            rel="noreferrer"
          >
            Consultar el fundamento físico en OpenStax <Icon name="arrow" size={14} />
          </a>
        </>
      )}
      <button className="button primary" onClick={onClose}>
        Volver al experimento <Icon name="arrow" />
      </button>
    </dialog>
  )
}
