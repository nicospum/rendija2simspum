import { useState } from 'react'
import ExperimentIllustration from '../portal/ExperimentIllustration'
import { einsteinLabs } from './catalog'
import { CHAPTER_NOTES } from './chapterNotes'
import { usePassport } from './usePassport'
import type { ChapterId } from './progress'
import Passport from './Passport'
import EnergyNotebook from './EnergyNotebook'
import Artifact from './Artifact'
import './special.css'
const families = [
  ['todo', 'Todo el viaje'],
  ['RELATIVIDAD ESPECIAL', 'Movimiento y tiempo'],
  ['RELATIVIDAD GENERAL', 'Gravedad'],
  ['FÍSICA CUÁNTICA', 'Luz y cuantos'],
] as const
export default function EinsteinSeries() {
  const [family, setFamily] = useState<string>('todo'),
    passport = usePassport()
  const shown = einsteinLabs.filter(
    (lab) => family === 'todo' || lab.field === family,
  )
  return (
    <div className="es-shell en-special">
      <header className="rl-header">
        <a href="/" className="rl-brand">
          ∿ SPUM <small>ESPECIALES</small>
        </a>
        <a href="/">Todos los laboratorios ↗</a>
      </header>
      <main>
        <section className="en-hero">
          <div>
            <p className="en-kicker">
              UN CIENTÍFICO CURIOSO / SIETE MANERAS DE SORPRENDERTE
            </p>
            <h1>
              Einstein.
              <br />
              <em>
                La aventura
                <br />
                de imaginar.
              </em>
            </h1>
            <p>
              Subí al tren, llevá un reloj a otra altura y perseguí un rayo
              de luz. Cambiá una condición. Mirá qué sucede. Hay un universo
              de ideas esperando que lo pongas a prueba.
            </p>
            <div className="en-hero-actions">
              <a className="en-primary" href="/reloj-de-luz/">
                Abrir el primer laboratorio →
              </a>
              <a href="#en-route">Elegir mi pregunta ↓</a>
            </div>
            <div className="en-hero-tags">
              <span>7 laboratorios</span>
              <span>28 retos</span>
              <span>A tu ritmo</span>
            </div>
          </div>
          <figure className="en-portrait">
            <span className="en-portrait-orbit" aria-hidden="true" />
            <span className="en-formula-sticker">E = mc²</span>
            <img
              src="/einstein/einstein-cuaderno-v1.webp"
              width="1254"
              height="1254"
              alt="Einstein ilustrado, sonriente y pensativo, con un lápiz y un cuaderno abierto"
              fetchPriority="high"
              decoding="async"
            />
            <figcaption>
              Una pregunta puede cambiar la forma de mirar.
            </figcaption>
          </figure>
        </section>
        <Passport />
        <section className="en-train">
          <figure>
            <img
              src="/einstein/tren-espejo-de-sal-v1.webp"
              width="1774"
              height="887"
              alt="Un tren de colores cálidos y su reflejo sobre un espejo de sal, con Einstein asomado a una ventana"
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              Un viaje imaginario inspirado en el Salar de Uyuni.
              Ilustración, no un viaje histórico de Einstein.
            </figcaption>
          </figure>
          <div>
            <p className="en-kicker">
              PRÓXIMA ESTACIÓN: UN «AHORA» DIFERENTE
            </p>
            <h2>
              Un tren.
              <br />
              Dos miradas.
              <br />
              <em>¿El mismo presente?</em>
            </h2>
            <p>
              Dos destellos ocurren a la vez para alguien en el andén.
              ¿También para quien viaja? Subite a uno de los experimentos
              mentales más famosos del recorrido.
            </p>
            <a className="en-primary" href="/tren-de-einstein/">
              Subir al tren de Einstein →
            </a>
          </div>
        </section>
        <section
          id="en-route"
          className="en-route"
          aria-labelledby="en-route-title"
        >
          <p className="en-kicker">ELEGÍ POR DÓNDE EMPEZAR</p>
          <h2 id="en-route-title">¿Qué te da más curiosidad?</h2>
          <p>
            Podés seguir el orden del cuaderno o entrar por cualquier
            pregunta. Los retos completados te acompañan al cambiar de
            capítulo.
          </p>
          <div
            className="en-family-buttons"
            role="group"
            aria-label="Elegir tema del recorrido"
          >
            {families.map(([value, label]) => (
              <button
                key={value}
                aria-pressed={family === value}
                onClick={() => setFamily(value)}
              >
                {label}
                <span>
                  {value === 'todo'
                    ? 7
                    : einsteinLabs.filter((lab) => lab.field === value)
                        .length}
                </span>
              </button>
            ))}
          </div>
          <p className="en-filter-count" role="status">
            {shown.length}{' '}
            {shown.length === 1
              ? 'laboratorio para explorar'
              : 'laboratorios para explorar'}
          </p>
          <div className="en-chapter-grid">
            {shown.map((lab) => {
              const id = lab.id as ChapterId,
                index = einsteinLabs.indexOf(lab),
                notes = CHAPTER_NOTES[id],
                completed = passport[id].length
              return (
                <article
                  key={id}
                  className="en-chapter"
                  data-family={lab.field}
                >
                  <a
                    className="en-chapter-art"
                    href={lab.href}
                    aria-label={`Entrar a ${lab.title}`}
                  >
                    <span>0{index + 1}</span>
                    <ExperimentIllustration kind={id} />
                  </a>
                  <div className="en-chapter-copy">
                    <p className="en-kicker">
                      {lab.field} · {completed}/4 RETOS
                    </p>
                    <h3>{lab.title}</h3>
                    <p className="en-chapter-question">{lab.question}</p>
                    <p>{lab.discovery}</p>
                    <div className="en-object-tags">
                      {notes.objects.map((object) => (
                        <span key={object.name}>{object.name}</span>
                      ))}
                    </div>
                    <a className="en-chapter-link" href={lab.href}>
                      Entrar y descubrir →
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
        <EnergyNotebook />
        <section className="en-nobel">
          <Artifact kind="metal" />
          <div>
            <p className="en-kicker">EL EINSTEIN DEL NOBEL</p>
            <h2>
              La luz también
              <br />
              llegó con una sorpresa.
            </h2>
            <p>
              El Nobel de Física de 1921 destacó especialmente la ley del
              efecto fotoeléctrico. Cambiá el brillo, el color y el metal
              para descubrir qué hace falta para arrancar un electrón.
            </p>
            <a href="/efecto-fotoelectrico/">
              Entrar al laboratorio del Nobel →
            </a>
            <a
              href="https://www.nobelprize.org/prizes/physics/1921/summary/"
              target="_blank"
              rel="noreferrer"
            >
              Leer el motivo oficial del premio ↗
            </a>
          </div>
        </section>
        <section className="en-bridge">
          <div>
            <p className="en-kicker">EL VIAJE SIGUE / OTRO ESPECIAL</p>
            <h2>
              Cuando la gravedad
              <br />
              lleva todo al extremo.
            </h2>
            <p>
              La luz se curva, las órbitas revelan masas invisibles y los
              relojes cuentan historias diferentes. El especial de agujeros
              negros conecta esas pistas con cinco laboratorios.
            </p>
            <a href="/agujeros-negros/">
              Abrir el atlas de agujeros negros →
            </a>
          </div>
          <div className="en-bridge-art">
            <Artifact kind="disk" />
          </div>
        </section>
      </main>
      <footer className="rl-footer">
        <a href="/">Volver a SPUM ↗</a>
        <span>La curiosidad también es una forma de viajar.</span>
      </footer>
    </div>
  )
}
