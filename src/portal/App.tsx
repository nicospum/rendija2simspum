import { experiments } from './catalog'
import ExperimentIllustration from './ExperimentIllustration'

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h15m-6-6 6 6-6 6'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Portal() {
  return (
    <div className="portal-shell">
      <a className="skip-link" href="#experimentos">
        Ir a los experimentos
      </a>
      <header className="portal-header">
        <a href="/" className="portal-brand" aria-label="SPUM experimentos, inicio">
          <span className="portal-brand-mark" aria-hidden="true">
            <svg width="27" height="23" viewBox="0 0 36 28" fill="none">
              <path
                d="M2 14c5-19 11 19 16 0s11 19 16 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>
            SPUM<span className="portal-brand-sub">EXPERIMENTOS</span>
          </span>
        </a>
        <nav aria-label="Navegación principal">
          <a href="#experimentos">
            Los laboratorios <span aria-hidden="true">↗</span>
          </a>
          <a href="#aprender">Aprender haciendo</a>
          <a href="/agujeros-negros/">Especial agujeros negros</a>
          <a href="/einstein/">Especial Einstein</a>
        </nav>
        <span className="portal-header-note">Ciencia. A un clic de distancia.</span>
      </header>

      <main>
        <section className="portal-hero" aria-labelledby="portal-title">
          <div className="portal-hero-copy">
            <p className="portal-eyebrow">
              <span /> UN LABORATORIO ABIERTO A LA CURIOSIDAD
            </p>
            <h1 id="portal-title">
              La ciencia se entiende
              <br />
              <em>probando.</em>
            </h1>
            <p className="portal-lead">
              Hay preguntas que se responden mejor con un experimento.
              <br className="desktop-break" /> Cambiá una variable. Mirá qué pasa. Descubrí por qué.
            </p>
            <a className="portal-primary" href="#experimentos">
              Elegí por dónde empezar <Arrow />
            </a>
          </div>
          <div className="portal-hero-note">
            <span className="portal-note-number">?</span>
            <p>
              Las grandes ideas
              <br />
              empiezan con una
              <br />
              <em>buena pregunta.</em>
            </p>
            <span className="portal-note-rule" />
            <span className="portal-mono">OBSERVAR · PROBAR · ENTENDER</span>
          </div>
        </section>

        <section id="experimentos" className="portal-labs" aria-labelledby="labs-title">
          <div className="portal-section-heading">
            <div>
              <span className="portal-eyebrow">ELEGÍ TU EXPERIMENTO</span>
              <h2 id="labs-title">Siempre hay algo más por descubrir.</h2>
            </div>
            <span className="portal-count">
              {String(experiments.length).padStart(2, '0')} LABORATORIOS PARA EXPLORAR
            </span>
          </div>
          <div className="portal-experiment-grid">
            <a className="portal-special-link portal-einstein-link" href="/einstein/">
              <span>ESPECIAL EINSTEIN</span>
              Espacio, tiempo y gravedad. Empezá con el reloj de luz. <Arrow />
            </a>
            <a className="portal-special-link" href="/agujeros-negros/">
              <span>ESPECIAL AGUJEROS NEGROS</span>
              Luz, horizontes, relojes y entropía. Un recorrido para ver lo invisible. <Arrow />
            </a>
            {experiments.map((experiment) => (
              <article className={`portal-experiment-card ${experiment.id}`} key={experiment.id}>
                <a
                  href={experiment.href}
                  className="portal-art-link"
                  aria-label={`Explorar ${experiment.title.toLowerCase()}`}
                >
                  <div className="portal-art-meta">
                    <span>
                      {experiment.number} <span className="portal-meta-line" /> {experiment.field}
                    </span>
                    <span className="portal-art-arrow">
                      <Arrow diagonal />
                    </span>
                  </div>
                  <ExperimentIllustration kind={experiment.id} />
                  <div className="portal-art-caption">
                    <span>{experiment.subtitle}</span>
                    <span>
                      INTERACTIVO <span aria-hidden="true">↗</span>
                    </span>
                  </div>
                </a>
                <div className="portal-card-copy">
                  <div className="portal-card-title">
                    <h3>
                      <a href={experiment.href}>{experiment.title}</a>
                    </h3>
                    <span className="portal-card-number">{experiment.number}</span>
                  </div>
                  <p className="portal-question">{experiment.question}</p>
                  <p className="portal-discovery">{experiment.discovery}</p>
                  <div className="portal-card-bottom">
                    <ul aria-label="Temas">
                      {experiment.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                    <a className="portal-explore-link" href={experiment.href}>
                      Entrar al laboratorio <Arrow />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="portal-diagram-note">
            Los diagramas de esta página son ilustrativos. Dentro de cada laboratorio, los
            resultados se calculan al cambiar los controles.
          </p>
        </section>

        <section id="aprender" className="portal-learning" aria-labelledby="learning-title">
          <div className="portal-learning-intro">
            <span className="portal-eyebrow">MUCHO MÁS QUE MIRAR</span>
            <h2 id="learning-title">
              No hace falta saber.
              <br />
              <em>Hace falta preguntar.</em>
            </h2>
            <p>
              Un laboratorio para equivocarte, comparar y volver a intentar. Las explicaciones
              acompañan lo que ves, para que cada cambio tenga sentido.
            </p>
          </div>
          <ol>
            <li>
              <span>01</span>
              <div>
                <h3>Hacé una predicción</h3>
                <p>
                  Antes de mover un control, imaginá qué va a cambiar. ¿Más franjas? ¿Más separación
                  entre colores?
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Cambiá una sola cosa</h3>
                <p>
                  Compará el resultado con tu idea. Las diferencias son el mejor punto de partida
                  para aprender.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Buscá la explicación</h3>
                <p>
                  Conectá lo que aparece en pantalla con la física del experimento y los límites de
                  cada modelo.
                </p>
              </div>
            </li>
          </ol>
        </section>
      </main>

      <footer className="portal-footer">
        <div>
          <strong>
            SPUM <span>/</span> EXPERIMENTOS
          </strong>
          <p>Un espacio para aprender ciencia, haciendo ciencia.</p>
        </div>
        <span>
          La colección sigue creciendo.
          <br />
          La curiosidad no tiene última página.
        </span>
        <a href="https://github.com/nicospum/rendija2simspum" target="_blank" rel="noreferrer">
          Ver el código <Arrow diagonal />
        </a>
      </footer>
    </div>
  )
}
