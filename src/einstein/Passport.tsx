import { einsteinLabs } from './catalog'
import { completedCount } from './progress'
import type { ChapterId } from './progress'
import { usePassport } from './usePassport'
export default function Passport() {
  const passport = usePassport(),
    total = completedCount(passport)
  return (
    <section
      className="en-passport"
      aria-label="Tu pasaporte del especial Einstein"
    >
      <div>
        <p className="en-kicker">TU PASAPORTE DE IDEAS</p>
        <h2>
          {total === 28
            ? '¡Un recorrido completo!'
            : 'Cada pregunta deja una marca.'}
        </h2>
        <p>
          {total} de 28 retos completados · todos los capítulos están
          abiertos.
        </p>
      </div>
      <div className="en-stamps">
        {einsteinLabs.map((lab, i) => {
          const count = passport[lab.id as ChapterId].length
          return (
            <a
              key={lab.id}
              href={lab.href}
              data-complete={count === 4}
              aria-label={`${lab.title}: ${count} de 4 retos completados`}
            >
              <span>0{i + 1}</span>
              <strong>{lab.title}</strong>
              <small>
                {count === 4 ? '✓ Completado' : `${count}/4 retos`}
              </small>
            </a>
          )
        })}
      </div>
      <p className="en-storage-note">
        Las marcas se guardan solo en este navegador, si permite
        almacenamiento local. No necesitás una cuenta. Reiniciar un reto
        conserva tus descubrimientos.
      </p>
    </section>
  )
}
