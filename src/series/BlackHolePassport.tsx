import { blackHoleLabs } from './catalog'
import { completedCount } from './progress'
import type { ChapterId } from './progress'
import { useBlackHolePassport } from './usePassport'
export default function BlackHolePassport() {
  const passport = useBlackHolePassport(),
    total = completedCount(passport)
  return (
    <section
      className="bh-passport"
      aria-label="Tu bitácora del especial agujeros negros"
    >
      <div className="bh-passport-heading">
        <div>
          <p className="bh-kicker">TU BITÁCORA DE EXPLORACIÓN</p>
          <h2>
            {total === 20
              ? '¡Veinte pistas conectadas!'
              : 'Cada misterio deja una huella.'}
          </h2>
        </div>
        <strong>
          {total}
          <small>/20</small>
        </strong>
      </div>
      <div className="bh-stamps">
        {blackHoleLabs.map((lab, i) => {
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
                {count === 4 ? '✓ Pista descifrada' : `${count}/4 retos`}
              </small>
            </a>
          )
        })}
      </div>
      <p>
        Explorá en cualquier orden. Los logros se guardan solo en este
        navegador, si permite almacenamiento local. Reiniciar un reto
        conserva tus descubrimientos.
      </p>
    </section>
  )
}
