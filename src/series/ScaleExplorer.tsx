import { useState } from 'react'
import { expeditionScales } from './scales'
import { scientific } from '../hawking/physics'
const n = (value: number, digits = 2) =>
  value.toLocaleString('es-AR', { maximumFractionDigits: digits })
export default function ScaleExplorer() {
  const [mass, setMass] = useState(10),
    s = expeditionScales(mass)
  return (
    <section className="bh-scale" aria-labelledby="bh-scale-title">
      <div>
        <p className="bh-kicker">UNA MASA / TRES PISTAS</p>
        <h2 id="bh-scale-title">
          Más grande.
          <br />
          <em>¿Más caliente?</em>
        </h2>
        <p>
          Mové la masa. El horizonte, la temperatura y la entropía responden
          juntos. ¿Qué crece y qué disminuye?
        </p>
        <label htmlFor="bh-scale-mass">
          Masa del agujero negro <output>{n(mass)} M☉</output>
        </label>
        <input
          id="bh-scale-mass"
          type="range"
          min="5"
          max="20"
          step=".5"
          value={mass}
          aria-valuetext={`${n(mass)} masas solares`}
          onChange={(e) => setMass(+e.target.value)}
        />
        <div className="bh-scale-presets">
          {[5, 10, 20].map((value) => (
            <button key={value} onClick={() => setMass(value)}>
              {value} M☉
            </button>
          ))}
        </div>
        <p className="bh-scale-note">
          Schwarzschild, sin rotación ni carga. La temperatura es la de
          Hawking para un observador lejano, diferente de la del gas de un
          disco.
        </p>
      </div>
      <div className="bh-scale-instrument">
        <svg
          viewBox="0 0 360 320"
          role="img"
          aria-label={`Sección del horizonte a escala fija: su radio es ${n(s.radiusRatio)} veces el de referencia de diez masas solares`}
        >
          <defs>
            <radialGradient id="bh-scale-glow">
              <stop offset="0" stopColor="#203f59" />
              <stop offset="1" stopColor="#0d142b" />
            </radialGradient>
          </defs>
          <rect
            x="0"
            y="0"
            width="360"
            height="320"
            rx="18"
            fill="url(#bh-scale-glow)"
          />
          <path d="M20 160H340M180 20V300" stroke="#556889" opacity=".25" />
          <circle
            cx="180"
            cy="160"
            r={s.drawingRadius}
            fill="#020615"
            stroke="#ebbe7a"
            strokeWidth="2"
          />
          <circle
            cx="180"
            cy="160"
            r="60"
            fill="none"
            stroke="#82c5d0"
            strokeDasharray="5 5"
            opacity=".8"
          />
          <path
            d={`M180 160H${180 + s.drawingRadius}`}
            stroke="#ebbe7a"
            strokeWidth="2"
          />
          <circle cx="180" cy="160" r="3" fill="#ebbe7a" />
          <text
            x="18"
            y="26"
            fill="#8cbcc9"
            fontSize="10"
            fontFamily="monospace"
          >
            HORIZONTE / ESCALA FIJA
          </text>
          <text
            x="18"
            y="299"
            fill="#82c5d0"
            fontSize="10"
            fontFamily="monospace"
          >
            - - Referencia: 10 M☉
          </text>
        </svg>
        <p className="bh-scale-caption">
          Sección del horizonte: el círculo no es una superficie que emita
          luz. La marca dorada indica el radio.
        </p>
        <div className="bh-scale-readings">
          <div>
            <span>Radio del horizonte</span>
            <strong>
              {n(s.radiusKm)} <small>km</small>
            </strong>
            <a href="/lente-gravitacional/">Seguí la luz →</a>
          </div>
          <div>
            <span>Temperatura de Hawking</span>
            <strong>
              {n(s.temperatureNK)} <small>nK</small>
            </strong>
            <a href="/hawking/">Entendé la temperatura →</a>
          </div>
          <div>
            <span>Entropía frente a 10 M☉</span>
            <strong>×{n(s.entropyRatio)}</strong>
            <a href="/entropia/">Descifrá el área →</a>
          </div>
        </div>
        <p className="bh-scale-summary" role="status">
          Con {n(mass)} M☉: radio ×{n(s.radiusRatio)}, temperatura ×
          {n(10 / mass)} y entropía ×{n(s.entropyRatio)} respecto de 10 M☉.
          S/kB = {scientific(s.entropyOverK)}.
        </p>
      </div>
    </section>
  )
}
