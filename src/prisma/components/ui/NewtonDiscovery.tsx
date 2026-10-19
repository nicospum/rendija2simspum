const NEWTON_LETTER = 'https://newtonproject.ox.ac.uk/view/texts/normalized/NATP00006'
const DISPERSION = 'https://openstax.org/books/university-physics-volume-3/pages/1-5-dispersion'

export default function NewtonDiscovery() {
  return (
    <section className="prism-history" aria-labelledby="prism-history-title">
      <div className="prism-history-heading">
        <span className="eyebrow">QUÉ CAMBIÓ CON NEWTON</span>
        <h2 id="prism-history-title">¿El prisma fabrica los colores?</h2>
        <p>Ver una banda de colores fue el comienzo. La pregunta importante era de dónde venían.</p>
      </div>
      <div className="prism-history-grid">
        <article className="prism-history-card">
          <span className="prism-history-number mono">01 / EL DESCUBRIMIENTO</span>
          <h3>El color ya estaba en la luz.</h3>
          <p>
            Newton mostró que la luz blanca es una mezcla: el prisma separa sus componentes porque
            los desvía de forma distinta. El vidrio no fabrica esos colores.
          </p>
          <a className="prism-history-source" href={NEWTON_LETTER} target="_blank" rel="noreferrer">
            Leer su explicación de 1672 ↗
          </a>
        </article>
        <article className="prism-history-card">
          <span className="prism-history-number mono">02 / POR QUÉ IMPORTÓ</span>
          <h3>Entender la luz, mejorar los instrumentos.</h3>
          <p>
            Esa diferencia de desviación explica por qué una lente puede enfocar cada color en un
            lugar distinto y formar bordes coloreados: la aberración cromática. Fue una razón para
            que Newton explorara telescopios con espejos.
          </p>
          <a
            className="prism-history-source"
            href={`${NEWTON_LETTER}#:~:text=When%20I%20understood%20this`}
            target="_blank"
            rel="noreferrer"
          >
            Newton sobre lentes y telescopios ↗
          </a>
        </article>
      </div>
      <details className="prism-history-evidence">
        <summary>¿Bastaba con observar un espectro?</summary>
        <p>
          Newton seleccionó pequeñas porciones del espectro y las refractó con otro prisma: un
          componente bien aislado conservaba su color. También reunió los colores con una lente y
          recuperó luz blanca.{' '}
          <a href={NEWTON_LETTER} target="_blank" rel="noreferrer">
            Estos ensayos están descritos en su carta de 1672.
          </a>
        </p>
        <p>
          <strong>Esas pruebas adicionales no están incluidas en este banco.</strong> Aquí explorás
          la dispersión en un prisma y las consecuencias de un modelo que ya representa la luz
          mediante distintas longitudes de onda.
        </p>
      </details>
      <p className="prism-history-note">
        En el lenguaje actual, la dispersión ocurre porque el índice de refracción depende de la
        longitud de onda.{' '}
        <a href={DISPERSION} target="_blank" rel="noreferrer">
          Ver el fundamento en OpenStax ↗
        </a>
      </p>
    </section>
  )
}
