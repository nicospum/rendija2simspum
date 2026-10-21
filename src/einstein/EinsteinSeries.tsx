import ExperimentIllustration from '../portal/ExperimentIllustration'
import { einsteinLabs } from './catalog'
export default function EinsteinSeries() {
  return (
    <div className="es-shell">
      <header className="rl-header">
        <a href="/" className="rl-brand">
          ∿ SPUM <small>EXPERIMENTOS</small>
        </a>
        <a href="/">Todos los laboratorios ↗</a>
      </header>
      <main>
        <section className="es-hero">
          <div>
            <p className="rl-eyebrow">UN ESPECIAL / UNA NUEVA FORMA DE MIRAR</p>
            <h1>
              Einstein.
              <br />
              <em>
                Espacio, tiempo
                <br />y cuantos de luz.
              </em>
            </h1>
            <p>
              La luz conecta espacio y tiempo. La gravedad cambia la geometría.
              La energía de la luz se intercambia en cuantos. Explorá sus ideas
              con preguntas, comparaciones y experimentos mentales.
            </p>
            <a className="rl-primary" href="/reloj-de-luz/">
              Empezar con el reloj de luz →
            </a>
          </div>
          <svg
            viewBox="0 0 300 320"
            role="img"
            aria-label="Ilustración de Einstein, con su pelo blanco y bigote, rodeado de caminos de luz"
          >
            <circle
              cx="150"
              cy="148"
              r="125"
              fill="#102d3b"
              stroke="#5b8995"
              strokeDasharray="3 9"
            />
            <path
              d="M45 111 23 87l36 4-19-34 43 12 6-36 29 27 30-37 12 35 43-26-4 37 43-7-15 32 39 15-33 16 20 27-40-4-9 37H73l-13-31-31 6Z"
              fill="#dfebe4"
            />
            <path
              d="M86 94q67-42 127 0l-5 79q-4 66-58 67-53-4-60-67Z"
              fill="#c8b8a1"
            />
            <path
              d="M92 121q23-14 43 0m28 0q23-15 42 0"
              stroke="#e8efdf"
              strokeWidth="8"
              fill="none"
            />
            <path
              d="M104 135h16m56 0h16M150 130l-10 41 18 3"
              stroke="#344d50"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M111 191q19-26 39-8 20-18 43 8l-27 8-16-7-17 7Z"
              fill="#eef1e4"
            />
            <path
              d="M135 211q15 7 30 0M83 235l-30 62h194l-33-63-60 27Z"
              stroke="#698593"
              fill="#213c4e"
            />
            <path
              d="M36 270 75 212 101 270M219 52v64l43 56"
              stroke="#8be7dd"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="75" cy="212" r="5" fill="#fff0ca" />
            <circle cx="219" cy="116" r="5" fill="#fff0ca" />
          </svg>
        </section>
        <p className="rl-eyebrow">
          {einsteinLabs.length} LABORATORIOS DISPONIBLES / RELATIVIDAD Y FÍSICA
          CUÁNTICA
        </p>
        {einsteinLabs.map((lab, i) => (
          <section
            key={lab.id}
            className="es-current"
            aria-labelledby={`es-${lab.id}`}
          >
            <div className="es-art">
              <ExperimentIllustration kind={lab.id} />
            </div>
            <div>
              <p className="rl-eyebrow">
                0{i + 1} / DISPONIBLE · {lab.field}
              </p>
              <h2 id={`es-${lab.id}`}>{lab.title}</h2>
              <p>{lab.discovery}</p>
              <p>
                Dos vistas conectadas · cuatro retos · controles en tiempo real.
              </p>
              <a className="rl-primary" href={lab.href}>
                Explorar {lab.title.toLowerCase()} →
              </a>
            </div>
          </section>
        ))}
        <section className="es-roadmap">
          <p className="rl-eyebrow">YA DISPONIBLE / EL EFECTO FOTOELÉCTRICO</p>
          <h2>El Einstein del Nobel: la luz y los electrones.</h2>
          <p>
            El Nobel de Física de 1921 destacó especialmente su ley del efecto
            fotoeléctrico. Mercurio puso a prueba la relatividad general; el
            Nobel nos abre otra puerta, la física cuántica.
          </p>
          <p>
            ¿Más brillo o más frecuencia: qué consigue arrancar electrones? El
            laboratorio del Nobel ya permite comparar materiales, guardar
            mediciones y completar cuatro retos.
          </p>
          <a href="/efecto-fotoelectrico/">Entrar al laboratorio del Nobel →</a>
          <br />
          <a
            href="https://www.nobelprize.org/prizes/physics/1921/summary/"
            target="_blank"
            rel="noreferrer"
          >
            Por qué le dieron el Nobel: fuente oficial ↗
          </a>
        </section>
        <section className="es-bridge">
          <p className="rl-eyebrow">YA PODÉS EXPLORAR / RELATIVIDAD GENERAL</p>
          <h2>Cuando la gravedad entra en escena.</h2>
          <p>
            El especial de agujeros negros ya permite seguir luz curvada y
            comparar relojes cerca de un horizonte. Son continuaciones del
            recorrido: podés visitarlas ahora y volver al reloj de luz.
          </p>
          <div>
            <a href="/lente-gravitacional/">Lente gravitacional ↗</a>
            <a href="/horizonte/">Al borde del horizonte ↗</a>
            <a href="/agujeros-negros/">Los cinco capítulos del especial ↗</a>
          </div>
        </section>
      </main>
      <footer className="rl-footer">
        <a href="/">Volver a SPUM ↗</a>
        <span>La curiosidad cambia tu punto de vista.</span>
      </footer>
    </div>
  )
}
