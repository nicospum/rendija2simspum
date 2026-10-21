import { useState } from 'react'
import {
  LIGHT_SPEED,
  massFromPosition,
  positionFromMass,
  restEnergy,
} from './energy'
const n = (value: number, d = 2) =>
  value.toLocaleString('es-AR', { maximumFractionDigits: d })
export default function EnergyNotebook() {
  const [mass, setMass] = useState(1),
    energy = restEnergy(mass)
  return (
    <section className="en-energy" aria-labelledby="en-energy-title">
      <div>
        <p className="en-kicker">EN EL MARGEN DEL CUADERNO</p>
        <h2 id="en-energy-title">
          La fórmula que conocés.
          <br />
          Una idea para explorar.
        </h2>
        <div className="en-famous-formula">
          E<sub>0</sub> = mc<sup>2</sup>
        </div>
        <p>
          La masa de un sistema en reposo corresponde a una energía. Mové la
          masa y mirá cómo cambia su equivalente.
        </p>
        <p>
          El subíndice 0 aclara que hablamos de{' '}
          <strong>energía en reposo</strong>. Esta cuenta no indica que
          podamos convertir toda esa energía en energía aprovechable.
        </p>
        <a
          href="https://cds.cern.ch/record/2905272/files/4_Passport_E-mc2.pdf"
          target="_blank"
          rel="noreferrer"
        >
          La explicación del CERN ↗
        </a>
      </div>
      <div className="en-energy-card">
        <label htmlFor="en-mass">
          Masa del sistema{' '}
          <output>{mass >= 1000 ? '1 g' : `${n(mass)} mg`}</output>
        </label>
        <input
          id="en-mass"
          type="range"
          min="0"
          max="100"
          step="any"
          value={positionFromMass(mass)}
          aria-valuetext={`${n(mass)} miligramos`}
          onChange={(e) => setMass(massFromPosition(+e.target.value))}
        />
        <div className="en-energy-presets">
          <button onClick={() => setMass(1)}>1 miligramo</button>
          <button onClick={() => setMass(1000)}>1 gramo</button>
        </div>
        <span>Energía en reposo equivalente</span>
        <strong>
          {n(energy.joules / 1e9)} <small>gigajoules</small>
        </strong>
        <p>{n(energy.kwh, 0)} kWh de energía equivalente.</p>
        <div className="en-energy-meter" aria-hidden="true">
          <span
            style={{ width: `${8 + (92 * positionFromMass(mass)) / 100}%` }}
          />
        </div>
        <p className="en-energy-note">
          Otro ángulo: almacenar 1 kWh en un sistema en reposo aumenta su
          masa en unos {n((3.6e6 / LIGHT_SPEED ** 2) * 1e12)} nanogramos.
        </p>
        <p className="en-energy-note">
          La barra usa escala logarítmica para explorar desde 0,1 mg hasta 1
          g.
        </p>
      </div>
    </section>
  )
}
