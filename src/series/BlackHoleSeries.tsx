import type { ReactNode } from 'react'
import { blackHoleLabs } from './catalog'
import { useBlackHolePassport } from './usePassport'
import type { ChapterId } from './progress'
import BlackHolePassport from './BlackHolePassport'
import ScaleExplorer from './ScaleExplorer'
import ExperimentIllustration from '../portal/ExperimentIllustration'
import { TIMELINE } from './journey'
import './expedition.css'
export { BlackHoleNavigation } from './BlackHoleNavigation'
export default function BlackHoleSeries({
  children,
}: {
  children?: ReactNode
}) {
  const passport = useBlackHolePassport()
  return (
    <div className="bh-series-shell bh-expedition">
      <header>
        <a href="/">
          ∿ SPUM <small>ESPECIALES</small>
        </a>
        <a href="/">Todos los laboratorios ↗</a>
      </header>
      <main>
        <section className="bh-exp-hero">
          <div>
            <p className="bh-kicker">
              UNA EXPEDICIÓN / CINCO MISTERIOS CONECTADOS
            </p>
            <h1>
              Agujeros negros.
              <br />
              <em>
                Lo invisible
                <br />
                deja huellas.
              </em>
            </h1>
            <p>
              Seguí una luz que se curva. Descubrí qué brilla, qué mensajes
              escapan y por qué un horizonte tiene temperatura y entropía.
              Cada laboratorio revela otra pista.
            </p>
            <div className="bh-exp-actions">
              <a className="bh-primary" href="/lente-gravitacional/">
                Empezar la expedición →
              </a>
              <a href="#bh-route">Elegir un misterio ↓</a>
            </div>
            <div className="bh-exp-tags">
              <span>5 laboratorios</span>
              <span>20 retos</span>
              <span>Tu propia bitácora</span>
            </div>
          </div>
          <figure>
            <span className="bh-exp-emblem" aria-hidden="true">
              ATLAS
              <br />
              DE LO
              <br />
              INVISIBLE
            </span>
            <img
              src="/agujeros-negros/atlas-portada-v1.webp"
              srcSet="/agujeros-negros/atlas-portada-movil-v1.webp 640w, /agujeros-negros/atlas-portada-v1.webp 1536w"
              sizes="(max-width: 850px) calc(100vw - 40px), 48vw"
              width="1536"
              height="1024"
              alt="Ilustración de un agujero negro con un disco de gas luminoso y un arco de luz sobre su región oscura"
              fetchPriority="high"
              decoding="async"
            />
            <figcaption>
              Ilustración artística del entorno. Los laboratorios calculan y
              explican sus propias representaciones físicas.
            </figcaption>
          </figure>
        </section>
        <BlackHolePassport />
        <section
          className="bh-route"
          id="bh-route"
          aria-labelledby="bh-route-title"
        >
          <p className="bh-kicker">EL MAPA DE LA EXPEDICIÓN</p>
          <h2 id="bh-route-title">
            Cinco puertas.
            <br />
            Una historia que se conecta.
          </h2>
          <p>
            Podés seguir las pistas en orden o empezar por la pregunta que
            más te intrigue. Cada puerta tiene cuatro retos y una bitácora
            de descubrimientos.
          </p>
          <div className="bh-route-grid">
            {blackHoleLabs.map((lab, i) => (
              <article className="bh-route-card" key={lab.id}>
                <a
                  className="bh-route-art"
                  href={lab.href}
                  aria-label={`Entrar a ${lab.title}`}
                >
                  <span>0{i + 1}</span>
                  <b>{passport[lab.id as ChapterId].length}/4 RETOS</b>
                  <ExperimentIllustration kind={lab.id} />
                </a>
                <div className="bh-route-copy">
                  <p className="bh-kicker">
                    PISTA 0{i + 1} /{' '}
                    {
                      [
                        'LUZ',
                        'MATERIA',
                        'MENSAJES',
                        'TEMPERATURA',
                        'INFORMACIÓN',
                      ][i]
                    }
                  </p>
                  <h3>{lab.title}</h3>
                  <p className="bh-route-question">{lab.question}</p>
                  <p>{lab.discovery}</p>
                  <a href={lab.href}>Entrar y descubrir →</a>
                </div>
              </article>
            ))}
          </div>
        </section>
        <ScaleExplorer />
        {children}
        <section
          className="bh-timeline"
          aria-labelledby="bh-timeline-title"
        >
          <p className="bh-kicker">DE LAS IDEAS A LAS OBSERVACIONES</p>
          <h2 id="bh-timeline-title">
            ¿Quién encontró
            <br />
            cada pista?
          </h2>
          <p>
            Una predicción, un cálculo y una observación aportan evidencias
            distintas. Estas son algunas estaciones de la historia.
          </p>
          <div className="bh-timeline-grid">
            {TIMELINE.map((item) => (
              <article
                key={item.year}
                data-observed={item.type === 'OBSERVACIÓN'}
              >
                <strong>{item.year}</strong>
                <span>{item.type}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <a href={item.source} target="_blank" rel="noreferrer">
                  Leer la fuente ↗
                </a>
              </article>
            ))}
          </div>
        </section>
        <section className="bh-exp-bridge">
          <img
            src="/einstein/einstein-avatar-v1.webp"
            width="160"
            height="160"
            loading="lazy"
            decoding="async"
            alt="Einstein ilustrado, pensando"
          />
          <div>
            <p className="bh-kicker">LA OTRA MITAD DEL VIAJE</p>
            <h2>
              Antes del horizonte,
              <br />
              una idea de Einstein.
            </h2>
            <p>
              La ecuación de la locomotora, el ascensor y los relojes te
              llevan a la relatividad. Volvé a sus preguntas con una mirada
              nueva.
            </p>
            <a href="/einstein/#en-field">
              Explorar la ecuación de campo →
            </a>
          </div>
        </section>
      </main>
      <footer>
        <a href="/">Seguir explorando SPUM ↗</a>
        <span>Observar. Comparar. Preguntarse otra vez.</span>
      </footer>
    </div>
  )
}
