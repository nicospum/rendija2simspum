import type { CSSProperties } from 'react'
import { usePassportStore } from '../shared/usePassportStore'
import { chapters, laboratories, passport } from './catalog'
import { experiments } from '../portal/catalog'
import { JourneyNavigation } from './LabFrame'
export default function MaldacenaSeries() {
  const progress = usePassportStore(passport)
  return (
    <div className="md-shell">
      <header className="md-header">
        <a href="/">∿ SPUM</a>
        <a href="/agujeros-negros/">DESDE EL ATLAS DE LO INVISIBLE ↗</a>
      </header>
      <main>
        <section className="md-intro">
          <p className="md-eyebrow">JUAN MALDACENA / EL DICCIONARIO DEL UNIVERSO</p>
          <h1>
            La información
            <br />
            encuentra una geometría.
          </h1>
          <p>
            ¿Pueden dos descripciones con dimensiones diferentes hablar de la misma
            física? Entrá por una pregunta sencilla, jugá con cada modelo y conectá las
            pistas.
          </p>
          <p>
            Empezá distinguiendo el todo de sus partes con dos qubits. Después entrá en
            Holografía: un solo laboratorio con geometría AdS, el diccionario entre
            información y longitudes, y una frontera caliente. La curva de Page tiene su
            propio laboratorio para investigar la paradoja de la información.
          </p>
          <a className="md-primary" href="/entrelazados/">
            Empezar por dos qubits →
          </a>{' '}
          <a href="/entropia/#information-bridge">
            ¿Empezás de cero? Probá contar información primero →
          </a>
          <svg
            className="md-atlas-art"
            viewBox="0 0 900 260"
            role="img"
            aria-label="Un intervalo en la frontera y curvas en el interior: mapa conceptual del recorrido holográfico"
          >
            <defs>
              <linearGradient id="md-atlas-gradient" x2="0" y2="1">
                <stop stopColor="#c3afff" stopOpacity=".4" />
                <stop offset="1" stopColor="#a0edcf" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M100 35H800" stroke="#bba5ff" strokeWidth="2" />
            <path d="M260 35H640" stroke="#a0edcf" strokeWidth="7" />
            {[80, 120, 160, 190].map((r, i) => (
              <path
                key={r}
                d={`M${450 - r} 35a${r} ${r} 0 0 0 ${r * 2} 0`}
                stroke={i === 3 ? '#a0edcf' : '#81749d'}
                strokeWidth={i === 3 ? 4 : 1}
                fill={i === 3 ? 'url(#md-atlas-gradient)' : 'none'}
              />
            ))}
            <circle cx="260" cy="35" r="10" fill="#a0edcf" />
            <circle cx="640" cy="35" r="10" fill="#a0edcf" />
            <text x="450" y="20" fill="#e6dfff" textAnchor="middle" fontSize="15">
              UNA REGIÓN EN LA FRONTERA
            </text>
            <text x="450" y="250" fill="#ffd58c" textAnchor="middle" fontSize="18">
              OTRA FORMA DE HACER LA CUENTA
            </text>
            <text x="140" y="150" fill="#bba5ff" fontSize="35">
              Sₐ
            </text>
            <text x="690" y="150" fill="#a0edcf" fontSize="28">
              ℒ / 4G₃
            </text>
          </svg>
          <p className="md-progress">
            {passport.completedCount(progress)} / {chapters.length * 4} descubrimientos
            guardados en este navegador
          </p>
        </section>
        <section className="md-first-steps" aria-labelledby="md-first-title">
          <h2 id="md-first-title">Una pregunta, una prueba, una explicación.</h2>
          <ol>
            <li>
              <strong>Elegí una idea.</strong> La predicción es un punto de partida; podés
              revisarla después.
            </li>
            <li>
              <strong>Tocá la escena o sus controles.</strong> Mirá el cambio y, cuando el
              reto lo pida, registrá la comparación.
            </li>
            <li>
              <strong>Conectá las pistas.</strong> Cada capítulo prepara una pregunta que
              el siguiente ayuda a responder.
            </li>
          </ol>
          <p>
            En estos modelos, «frontera» e «interior» son dos descripciones vinculadas de
            ciertos sistemas. No representan una pared material de nuestro universo.
          </p>
          <p>
            Una parada opcional después de Entrelazados:{' '}
            <a href="/bell/">Bell: ¿las partículas traen respuestas escritas? ↗</a>.
            Girá los analizadores y compará correlaciones con un modelo local explícito,
            en cuatro retos propios. Después retomá Holografía para explorar el vínculo
            entre información y geometría.
          </p>
        </section>
        <div className="md-map-grid">
          {laboratories.map((c, i) => (
            <a
              className="md-chapter"
              href={c.href}
              key={c.id}
              style={{ '--chapter-color': c.color } as CSSProperties}
            >
              <span className="md-symbol" aria-hidden="true">
                {c.symbol}
              </span>
              <p className="md-eyebrow">
                LABORATORIO {i + 1} / {laboratories.length}
              </p>
              <h2>{c.title}</h2>
              <p>
                <strong>{c.question}</strong>
              </p>
              <p>{c.detail}</p>
              <small>
                {c.chapterIds.reduce((sum, id) => sum + progress[id].length, 0)} /{' '}
                {c.chapterIds.length * 4} retos · Entrar y jugar →
              </small>
            </a>
          ))}
        </div>
        <section className="md-notebook">
          <p className="md-eyebrow">LA PREGUNTA DE 1997 / EL PUENTE DE 2006</p>
          <h2>¿Por qué importa esta idea?</h2>
          <div className="md-note-grid">
            <article>
              <h3>Una propuesta de Maldacena</h3>
              <p>
                En 1997, Juan Maldacena propuso una dualidad entre ciertas teorías
                cuánticas y teorías de cuerdas con gravedad en espacios anti-de Sitter.
                Dos lenguajes para una misma física, con un diccionario entre observables.
              </p>
              <a href="https://arxiv.org/abs/hep-th/9711200">El trabajo original ↗</a>
            </article>
            <article>
              <h3>Información que se puede dibujar</h3>
              <p>
                Ryu y Takayanagi relacionaron la entropía de una región con una superficie
                mínima. Aquí exploramos un intervalo de una CFT₂ y una geodésica en AdS₃,
                en un régimen semiclásico.
              </p>
              <a href="https://arxiv.org/abs/hep-th/0603001">Ryu–Takayanagi ↗</a>
            </article>
            <article>
              <h3>Lo que todavía está abierto</h3>
              <p>
                El recorrido no reproduce toda la teoría de cuerdas ni demuestra que
                nuestro universo sea un holograma. El capítulo de Page distingue la
                entropía fina de la radiación de la cuenta térmica: una descripción puede
                ignorar correlaciones que la otra conserva.
              </p>
              <a href="https://www.ias.edu/ideas/ias-shaping-field-epr-adscft-and-beyond">
                Contexto en IAS ↗
              </a>
            </article>
          </div>
        </section>
        <JourneyNavigation />
      </main>
      <footer className="md-footer">
        <a href="/entropia/#information-bridge">Contar lo que no vemos ↗</a>
        <a href="/agujeros-negros/">Especial agujeros negros ↗</a>
        <a href="/einstein/">Especial Einstein ↗</a>
        <a href="/">Los {experiments.length} laboratorios ↗</a>
      </footer>
    </div>
  )
}
