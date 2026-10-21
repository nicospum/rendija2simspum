import { blackHoleLabs } from './catalog'
import '../components/ui/LabJourney.css'
import './series.css'

export function BlackHoleNavigation({ current }: { current: string }) {
  const index = blackHoleLabs.findIndex((lab) => lab.id === current)
  if (index < 0) return null
  return (
    <nav
      className="spum-series"
      aria-label="Índice del especial agujeros negros"
    >
      <details>
        <summary>
          <span>ESPECIAL AGUJEROS NEGROS</span>
          <strong>
            {index + 1} / {blackHoleLabs.length} · {blackHoleLabs[index].title}
          </strong>
          <b>Índice +</b>
        </summary>
        <ol>
          {blackHoleLabs.map((lab, i) => (
            <li key={lab.id}>
              <a
                href={lab.href}
                aria-current={lab.id === current ? 'page' : undefined}
              >
                <span>0{i + 1}</span>
                <div>
                  <strong>{lab.title}</strong>
                  <small>{lab.question}</small>
                </div>
              </a>
            </li>
          ))}
        </ol>
        <a className="spum-series-home" href="/agujeros-negros/">
          Ver el especial completo ↗
        </a>
      </details>
      <div className="spum-series-steps">
        {index > 0 ? (
          <a href={blackHoleLabs[index - 1].href}>
            ← Anterior: {blackHoleLabs[index - 1].title}
          </a>
        ) : (
          <a href="/agujeros-negros/">← Inicio del especial</a>
        )}
        {index < blackHoleLabs.length - 1 ? (
          <a href={blackHoleLabs[index + 1].href}>
            Siguiente: {blackHoleLabs[index + 1].title} →
          </a>
        ) : (
          <a href="/agujeros-negros/">Volver al mapa del especial →</a>
        )}
      </div>
    </nav>
  )
}

export default function BlackHoleSeries() {
  return (
    <div className="bh-series-shell">
      <header>
        <a href="/">
          ∿ SPUM <small>EXPERIMENTOS</small>
        </a>
        <a href="/">Todos los laboratorios ↗</a>
      </header>
      <main>
        <section className="bh-series-hero">
          <p>UN ESPECIAL / {blackHoleLabs.length} LABORATORIOS CONECTADOS</p>
          <h1>
            Agujeros negros.
            <br />
            <em>Preguntas que iluminan.</em>
          </h1>
          <div className="bh-series-art" aria-hidden="true">
            <span />
          </div>
          <p>
            ¿Cómo vemos algo oscuro? ¿Qué ocurre al cruzar su horizonte? ¿Por qué tiene temperatura? ¿Qué tiene que
            ver su superficie con la entropía? Seguí el recorrido o entrá por la
            pregunta que más te intrigue.
          </p>
          <a href="/lente-gravitacional/">Empezar por la luz →</a>
        </section>
        <section className="bh-series-labs" aria-label="Recorrido del especial">
          {blackHoleLabs.map((lab, i) => (
            <article key={lab.id}>
              <span>0{i + 1} / EXPLORAR</span>
              <h2>
                <a href={lab.href}>{lab.title}</a>
              </h2>
              <h3>{lab.question}</h3>
              <p>{lab.discovery}</p>
              <a href={lab.href}>Entrar y descubrir →</a>
            </article>
          ))}
        </section>
        <section className="bh-series-note">
          <h2>Una historia, distintas pistas.</h2>
          <p>
            Primero seguís los caminos de la luz. Después descubrís el gas y las
            órbitas que delatan la masa invisible. Una sonda explora el horizonte,
            sus relojes y los mensajes que pueden salir. Hawking conecta temperatura y
            pérdida de masa; Bekenstein–Hawking conecta área y entropía. El
            índice de cada laboratorio te lleva al siguiente.
          </p>
          <p>
            Los modelos explican su alcance en cada experiencia. El disco
            luminoso, la sombra y la radiación de Hawking representan fenómenos
            diferentes.
          </p>
        </section>
      </main>
      <footer>
        <a href="/">Seguir explorando SPUM ↗</a>
      </footer>
    </div>
  )
}
