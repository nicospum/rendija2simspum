import { useMemo, useState } from 'react'
import LabFrame from '../LabFrame'
import PageScene from './PageScene'
import { curveFor, sumSingles, densityPurity } from './physics'
import { LESSONS, initialTrial, observe, prepare, setEmitted, steps } from './learning'
import type { Trial } from './learning'
const n = (v: number, d = 2) => v.toLocaleString('es-AR', { maximumFractionDigits: d })
export default function PageLab() {
  const [trial, setTrial] = useState(() => initialTrial()),
    [view, setView] = useState<'partition' | 'curve'>('partition')
  const calculation = useMemo(() => curveFor(trial.n, trial.seed), [trial.n, trial.seed])
  const point = calculation.points[trial.emitted]
  const singles = useMemo(
    () => sumSingles(calculation.state, trial.emitted),
    [calculation.state, trial.emitted],
  )
  const purity = useMemo(
    () => densityPurity(calculation.state, trial.emitted),
    [calculation.state, trial.emitted],
  )
  const update = (patch: Partial<Pick<Trial, 'thermal' | 'average' | 'inspection'>>) =>
    setTrial((t) => observe({ ...t, ...patch }))
  const emit = (k: number) => setTrial((t) => setEmitted(t, k))
  const restore = () =>
    setTrial((t) => ({ ...initialTrial(t.lesson, t.seed), prediction: t.prediction }))
  const changeLesson = (i: number) => {
    setTrial(initialTrial(i, trial.seed))
    setView(i === 1 || i === 2 ? 'curve' : 'partition')
  }
  return (
    <LabFrame
      id="curva-de-page"
      title="¿Se pierde la información?"
      intro="Dejá salir qubits, reuní la radiación y descubrí por qué una curva que primero sube y después baja cambió la discusión sobre los agujeros negros."
      lessons={LESSONS}
      lesson={trial.lesson}
      onLesson={changeLesson}
      prediction={trial.prediction}
      onPredict={(value) => setTrial((t) => ({ ...t, prediction: value }))}
      steps={steps(trial)}
      onRestore={restore}
      readout={
        <>
          <strong>
            R: {trial.emitted} de {trial.n} qubits · S(R)={n(point.entropy)} bits
          </strong>
          <p>
            {trial.lesson === 3
              ? `Por separado: ΣS(Rᵢ)=${n(singles)} bits · conjunto: ${n(point.entropy)} bits.`
              : trial.lesson === 2
                ? trial.thermal
                  ? `Referencia independiente: ${point.thermal} bits · estado calculado: ${n(point.entropy)} bits.`
                  : 'Referencia independiente apagada · el estado calculado no cambia.'
                : trial.lesson === 1 && trial.average
                  ? `Media de Page: ${n(point.average)} bits · cota por dimensiones: ${point.bound} bits.`
                  : `Conjunto BR: puro, S(BR)=0 · S(B)=S(R)=${n(point.entropy)} bits.`}
          </p>
        </>
      }
      controls={
        <>
          <label htmlFor="page-emitted">
            Qubits que pasaron a la radiación R{' '}
            <output>
              {trial.emitted} / {trial.n}
            </output>
          </label>
          <input
            id="page-emitted"
            type="range"
            min="0"
            max={trial.n}
            step="1"
            value={trial.emitted}
            onChange={(e) => emit(+e.target.value)}
          />
          <div className="spum-console-buttons">
            <button
              disabled={trial.emitted === trial.n}
              onClick={() => emit(trial.emitted + 1)}
              data-help-title="Incluir un qubit más en la radiación R"
              data-help-body="Pasa el próximo qubit de B, lo que queda, a la colección R, lo que reunís. Mirá cómo cambia S(R): la entropía de esa colección al ignorar B. El estado puro del conjunto se conserva; cambia qué parte estudiás. Es un reparto abstracto, no una emisión física de Hawking calculada en el tiempo."
            >
              Emitir un qubit →
            </button>
            <button
              disabled={trial.emitted === 0}
              onClick={() => emit(trial.emitted - 1)}
              data-help-title="Revisar el reparto anterior"
              data-help-body="Devuelve un qubit de R a B para comparar de nuevo la entropía S(R) con una colección menor, conservando la misma preparación. Rebobina el reparto abstracto del modelo: no absorbe físicamente una partícula ni borra una medición."
            >
              ← Volver un paso
            </button>
          </div>
          <div className="spum-console-buttons">
            <button onClick={() => emit(0)}>Inicio: 0</button>
            <button onClick={() => emit(1)}>Primer qubit: 1</button>
            <button onClick={() => emit(Math.floor(trial.n / 2))}>
              Mitad: {Math.floor(trial.n / 2)}
            </button>
            <button onClick={() => emit(trial.n)}>Todo en R: {trial.n}</button>
          </div>
          <p className="spum-console-impact">
            B: lo que queda; R: lo que reunís. S(R) describe la incertidumbre cuántica de
            R al ignorar B. Un conjunto puro puede tener partes mixtas. Abrí «Qué
            representan B, R y la entropía» para conocer los qubits del modelo.
          </p>
          <p className="spum-console-impact">
            Mover el reparto no es medir ni destruir qubits. Volver un paso rebobina el
            modelo; no es una operación física sobre radiación real. Mirar las partes por
            separado cambia la descripción, no el estado.
          </p>
          <div className="spum-console-buttons">
            <button
              aria-pressed={trial.average}
              onClick={() => {
                update({ average: !trial.average })
                setView('curve')
              }}
            >
              Promedio de Page
            </button>
            <button
              aria-pressed={trial.thermal}
              onClick={() => {
                update({ thermal: !trial.thermal })
                setView('curve')
              }}
            >
              Emisión independiente
            </button>
          </div>
          <div className="spum-console-buttons">
            <button
              aria-pressed={trial.inspection === 'whole'}
              onClick={() => {
                update({ inspection: 'whole' })
                setView('partition')
              }}
            >
              R como conjunto
            </button>
            <button
              aria-pressed={trial.inspection === 'separate'}
              onClick={() => {
                update({ inspection: 'separate' })
                setView('partition')
              }}
            >
              Qubits por separado
            </button>
          </div>
          <details>
            <summary>Qué representan B, R y la entropía</summary>
            <p>
              B son los qubits que quedan en el reservorio que representa al agujero
              negro; R, los que ya incluís en la radiación. Un qubit es un sistema
              cuántico de dos niveles. Los puntos son una representación abstracta: no
              fotografías de partículas de Hawking.
            </p>
            <p>
              La entropía S(R) describe el estado de toda la radiación al ignorar B. Puede
              crecer aunque el conjunto BR sea puro. Cada punto de la curva se calcula a
              partir de un estado cuántico, no se carga una animación grabada.
            </p>
            <p>
              La línea coral k corresponde a radiación independiente y máximamente
              mezclada; la dorada es la media de Page entre muchos estados puros
              aleatorios. No son la misma cantidad que la entropía térmica del exterior
              calculada en el laboratorio de Hawking.
            </p>
          </details>
          <details>
            <summary>Explorar otras preparaciones</summary>
            <label htmlFor="page-size">Tamaño del sistema: {trial.n} qubits</label>
            <input
              id="page-size"
              type="range"
              min="4"
              max="8"
              step="1"
              value={trial.n}
              onChange={(e) => setTrial((t) => prepare(t, +e.target.value, t.seed))}
            />
            <button onClick={() => setTrial((t) => prepare(t, t.n, t.seed + 1))}>
              Otra preparación pura
            </button>
            <p>
              Preparación {trial.seed}. Cambiar tamaño o preparación inicia una
              comparación nueva y borra sus observaciones, conservando tu predicción. Los
              cuatro retos usan 6 qubits; podés volver con el botón de abajo.
            </p>
            <button onClick={restore}>Usar condiciones del reto</button>
          </details>
          <details>
            <summary>Los números del estado actual</summary>
            <p>
              Pureza de R: Tr(ρR²)={n(purity, 4)}. Vale 1 para un estado puro y menos de 1
              para uno mixto.
            </p>
            <p>
              Correlación total en R: ΣS(Rᵢ)−S(R)=
              {n(Math.max(0, singles - point.entropy), 4)} bits. Incluye correlaciones
              clásicas y cuánticas; no es por sí sola una medida de entrelazamiento.
            </p>
            <p>
              Capacidades por dimensiones: R hasta {trial.emitted} bits, B hasta{' '}
              {point.remaining} bits. Al ser BR puro, S(R)=S(B)≤min(k,N−k). Estas
              capacidades no son masas, áreas ni una medición de S_BH.
            </p>
          </details>
        </>
      }
      explanation={
        <>
          <h3>La paradoja: tres ideas que no encajan fácilmente</h3>
          <p>
            Partimos de un estado puro. Una evolución cuántica cerrada y unitaria conserva
            esa pureza. El cálculo semiclásico de Hawking describe radiación con carácter
            térmico. Si el agujero negro desapareciera y toda la radiación final quedara
            en un estado mixto, ¿cómo sería compatible con esa evolución unitaria? La
            pregunta trata sobre el estado cuántico y sus correlaciones; no sobre que una
            persona conozca una contraseña.
          </p>
          <h3>Una curva calculada, no una promesa de recuperar un mensaje</h3>
          <p>
            Preparamos un vector complejo puro de {trial.n} qubits, elegido con la
            distribución uniforme de Haar. Conservamos ese mismo estado y cambiamos la
            partición: los primeros k qubits forman R y los demás B. Esto explora la
            estructura de información que motiva una curva de Page; no resuelve la
            dinámica gravitatoria, la emisión de energía o el tiempo de evaporación.
          </p>
          <p>
            Calculamos <code>ρR=TrB |ψ⟩⟨ψ|</code> y <code>S(R)=−Tr ρR log₂ρR</code>. La
            traza parcial ignora una parte para describir la otra; no modifica el estado
            total. Cuando R queda vacío o contiene todo, su entropía es cero. En el medio
            depende de las correlaciones de la preparación.
          </p>
          <h3>¿Qué aporta Page?</h3>
          <p>
            Para un estado puro aleatorio complejo repartido en dimensiones m≤d, la media
            es <code>⟨S⟩=[H(md)−H(d)−(m−1)/(2d)]/ln 2</code>, con H(q)=Σ₁ᵠ1/j. Aquí
            m=min(2ᵏ,2ᴺ⁻ᵏ) y d=max(2ᵏ,2ᴺ⁻ᵏ). La fórmula está expresada en bits; el
            artículo usa logaritmos naturales. Page propuso esta expresión en 1993;
            trabajos posteriores, como el de Sen, demostraron la fórmula.
          </p>
          <p>
            La media alcanza su máximo cerca de la mitad del reparto. Con N impar tiene
            dos valores centrales iguales; una preparación concreta puede fluctuar. La
            línea gris min(k,N−k) es una cota, no la fórmula exacta de Page. El eje
            horizontal cuenta qubits, no años ni una fracción física de masa. No obtenemos
            de este juguete un tiempo de Page de un agujero negro astrofísico.
          </p>
          <h3>Del área a las islas</h3>
          <p>
            Los capítulos anteriores relacionaron entropía y geometría mediante
            Ryu–Takayanagi. En modelos gravitatorios específicos, las superficies
            cuánticas extremales y las llamadas islas permiten obtener curvas compatibles
            con la evolución unitaria, incorporando nuevas contribuciones a la cuenta de
            entropía. Este laboratorio no calcula esas superficies ni demuestra una
            solución universal de la paradoja. La curva de Page no ha sido medida en la
            radiación de un agujero negro astrofísico.
          </p>
          <p>
            La suma térmica de fotones del laboratorio Hawking y la entropía fina de la
            radiación son cuentas distintas. Una entropía térmica que crece puede
            coexistir con información en correlaciones que esa descripción no registra.
            Reunir qubits aquí muestra esa distinción; no implementa un método para leer
            información real de un agujero negro.
          </p>
        </>
      }
      sources={[
        {
          label: 'Hawking · Breakdown of Predictability (1976)',
          url: 'https://doi.org/10.1103/PhysRevD.14.2460',
        },
        {
          label: 'Page · Average Entropy of a Subsystem (1993)',
          url: 'https://arxiv.org/abs/gr-qc/9305007',
        },
        {
          label: 'Sen · demostración de la entropía media (1996)',
          url: 'https://arxiv.org/abs/hep-th/9601132',
        },
        {
          label: 'Page · Information in Black Hole Radiation (1993)',
          url: 'https://arxiv.org/abs/hep-th/9306083',
        },
        {
          label: 'Penington · reconstrucción y paradoja (2019)',
          url: 'https://arxiv.org/abs/1905.08255',
        },
        {
          label: 'Almheiri, Engelhardt, Marolf y Maxfield · evaporación (2019)',
          url: 'https://arxiv.org/abs/1905.08762',
        },
      ]}
    >
      <PageScene
        n={trial.n}
        emitted={trial.emitted}
        points={calculation.points}
        sumLocal={singles}
        onEmitted={emit}
        view={view}
        onView={setView}
        showThermal={trial.thermal}
        showAverage={trial.average}
        revealedUntil={trial.revealedUntil}
        inspection={trial.inspection}
      />
    </LabFrame>
  )
}
