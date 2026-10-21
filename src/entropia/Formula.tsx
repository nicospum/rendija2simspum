import { useState } from 'react'
import { K, C, G, HBAR, PLANCK_AREA, patchEntropy, entropyModel } from './physics'
import { scientific } from '../hawking/physics'

const terms = [
  {
    id: 'A',
    name: 'A · área del horizonte',
    text: 'Es lo que modificás con la masa y la evaporación. Para Schwarzschild: rₛ = 2GM/c² y A = 4πrₛ². Al duplicar M, A crece por cuatro.',
    value: (m: ReturnType<typeof entropyModel>) => scientific(m.current.areaM2, 'm²'),
  },
  {
    id: 'kB',
    name: 'kB · Boltzmann',
    text: 'Conecta la entropía con la descripción estadística. Da las unidades J/K. S/kB es adimensional; no equivale a un número de bits sin dividir por ln 2.',
    value: () => scientific(K, 'J/K'),
  },
  {
    id: 'c',
    name: 'c · velocidad de la luz',
    text: 'La constante relativista une espacio, tiempo y energía. En la fórmula aparece elevada al cubo. Su valor no se modifica con estos controles.',
    value: () => scientific(C, 'm/s'),
  },
  {
    id: 'G',
    name: 'G · gravitación',
    text: 'Fija la escala de la interacción gravitatoria. Junto con ℏ y c define el área de Planck: ℓP² = ℏG/c³.',
    value: () => scientific(G, 'm³/(kg·s²)'),
  },
  {
    id: 'hbar',
    name: 'ℏ · Planck reducida',
    text: 'Introduce la escala cuántica; ℏ = h/(2π). También aparece en la incertidumbre de Heisenberg, que es otra relación física.',
    value: () => scientific(HBAR, 'J·s'),
  },
  {
    id: 'quarter',
    name: '¼ · el factor de Hawking',
    text: 'Bekenstein propuso la relación entre entropía y área. La temperatura de Hawking fijó el coeficiente ¼ en relatividad general. La lupa de abajo permite hacer esa división.',
    value: () => '1 / 4',
  },
] as const

export default function Formula({
  model,
  patch,
  onPatch,
}: {
  model: ReturnType<typeof entropyModel>
  patch: number
  onPatch: (value: number) => void
}) {
  const [selected, setSelected] = useState<(typeof terms)[number]['id']>('A')
  const term = terms.find((t) => t.id === selected)!
  return (
    <section id="en-formula" className="en-panel en-formula">
      <div className="en-section-top">
        <div>
          <p className="en-eyebrow">02 / UNA ECUACIÓN, TRES FÍSICAS</p>
          <h2>Leé la fórmula, pieza por pieza.</h2>
        </div>
        <span className="en-stamp">TOCÁ UN SÍMBOLO</span>
      </div>
      <div
        className="en-equation"
        aria-label="S igual a k Boltzmann por c al cubo por A dividido por cuatro G h barra"
      >
        <span>
          S<sub>BH</sub> ={' '}
        </span>
        <span className="en-fraction">
          <span>
            <button onClick={() => setSelected('kB')}>
              k<sub>B</sub>
            </button>
            <button onClick={() => setSelected('c')}>c³</button>
            <button onClick={() => setSelected('A')}>A</button>
          </span>
          <span>
            <button onClick={() => setSelected('quarter')}>4</button>
            <button onClick={() => setSelected('G')}>G</button>
            <button onClick={() => setSelected('hbar')}>ℏ</button>
          </span>
        </span>
        <span className="en-equivalent">
          = k<sub>B</sub> A / (4ℓ<sub>P</sub>²)
        </span>
      </div>
      <div className="en-term-buttons" aria-label="Partes de la fórmula">
        {terms.map((t) => (
          <button key={t.id} aria-pressed={selected === t.id} onClick={() => setSelected(t.id)}>
            {t.name}
          </button>
        ))}
      </div>
      <div className="en-term-detail" aria-live="polite">
        <div>
          <h3>{term.name}</h3>
          <strong>{term.value(model)}</strong>
        </div>
        <p>{term.text}</p>
      </div>
      <div className="en-formula-bottom">
        <div>
          <p className="en-eyebrow">LUPA ALGEBRAICA / EJEMPLO APARTE</p>
          <h3>¿Qué hace ese cuatro?</h3>
          <p>
            Tomá un área de ejemplo y dividila por 4. Los colores agrupan la cuenta; no son una
            imagen del tejido del espacio.
          </p>
          <label htmlFor="en-patch">
            Área de ejemplo{' '}
            <output>
              {patch} ℓ<sub>P</sub>²
            </output>
          </label>
          <input
            id="en-patch"
            type="range"
            min="4"
            max="64"
            step="4"
            value={patch}
            onChange={(e) => onPatch(Number(e.target.value))}
          />
          <p className="en-small">
            No cambia la masa del laboratorio. ℓP² = {scientific(PLANCK_AREA, 'm²')}.
          </p>
        </div>
        <div className="en-patch-result">
          <div className="en-patch-grid" aria-label={`${patch} cuadrados agrupados de a cuatro`}>
            {Array.from({ length: patchEntropy(patch) }, (_, i) => (
              <span className="en-patch-group" key={i}>
                {[0, 1, 2, 3].map((j) => (
                  <i key={j} />
                ))}
              </span>
            ))}
          </div>
          <p>
            <b>
              {patch} ÷ 4 = {patchEntropy(patch)}
            </b>
            <span>unidades de S/kB</span>
          </p>
          <small>
            En bits: {scientific(patchEntropy(patch) / Math.LN2)}. Un grupo no es un bit.
          </small>
        </div>
      </div>
    </section>
  )
}
