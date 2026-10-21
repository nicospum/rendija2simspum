import { useState } from 'react'
import './field-equation.css'
const pieces = [
  {
    title: 'La parte geométrica',
    text: 'Rμν y R describen aspectos de la curvatura. La métrica gμν permite medir distancias e intervalos. Juntos forman el lado geométrico de la ecuación: el espacio-tiempo participa en la física.',
    question:
      'Los relojes, las órbitas y los caminos de la luz permiten estudiar esa geometría.',
  },
  {
    title: 'El puente entre ambos lados',
    text: 'G es la constante gravitatoria y c es la velocidad de la luz en el vacío. El factor 8πG/c⁴ fija cómo se relacionan las unidades y la intensidad del acoplamiento entre geometría y energía.',
    question:
      'El c⁴ de esta fórmula y el c² de E₀ = mc² cumplen papeles distintos.',
  },
  {
    title: 'Lo que cuenta como fuente',
    text: 'Tμν es el tensor de energía y momento. Incluye densidad de energía, flujos y presiones. También la luz transporta energía: la gravitación no responde solamente a objetos con masa en reposo.',
    question:
      'E₀ = mc² identifica la energía en reposo asociada a una masa; Tμν reúne más información sobre el sistema.',
  },
] as const
export default function FieldEquationNotebook() {
  const [piece, setPiece] = useState(0)
  const [answer, setAnswer] = useState<number | null>(null)
  return (
    <section
      className="en-field"
      id="en-field"
      aria-labelledby="en-field-title"
    >
      <p className="en-kicker">LA FÓRMULA DE LA LOCOMOTORA / 1915</p>
      <h2 id="en-field-title">
        Una ecuación para cambiar
        <br />
        <em>la idea de gravedad.</em>
      </h2>
      <p>
        Tocá las tres partes. De un lado, geometría; del otro, energía y
        momento. La ecuación de campo las relaciona.
      </p>
      <div
        className="en-field-formula"
        role="group"
        aria-label="Explorar las partes de la ecuación de campo de Einstein"
      >
        <button
          aria-pressed={piece === 0}
          aria-controls="en-field-explanation"
          onClick={() => setPiece(0)}
        >
          <span>
            R<sub>μν</sub> − ½ Rg<sub>μν</sub>
          </span>
          <small>01 · GEOMETRÍA</small>
        </button>
        <span aria-hidden="true">=</span>
        <button
          aria-pressed={piece === 1}
          aria-controls="en-field-explanation"
          onClick={() => setPiece(1)}
        >
          <span className="en-field-fraction">
            <span>8πG</span>
            <span>
              c<sup>4</sup>
            </span>
          </span>
          <small>02 · EL PUENTE</small>
        </button>
        <span aria-hidden="true">·</span>
        <button
          aria-pressed={piece === 2}
          aria-controls="en-field-explanation"
          onClick={() => setPiece(2)}
        >
          <span>
            T<sub>μν</sub>
          </span>
          <small>03 · ENERGÍA Y MOMENTO</small>
        </button>
      </div>
      <div
        className="en-field-explanation"
        id="en-field-explanation"
        aria-live="polite"
      >
        <h3>{pieces[piece].title}</h3>
        <p>{pieces[piece].text}</p>
        <p>{pieces[piece].question}</p>
      </div>
      <div className="en-field-bridge">
        <strong>Dos fórmulas famosas, dos preguntas.</strong>
        <p>
          E₀ = mc²: ¿qué energía en reposo corresponde a una masa? La
          ecuación de campo: ¿cómo se relacionan geometría y
          energía-momento? Los agujeros negros conectan ambas ideas.
        </p>
      </div>
      <fieldset className="en-field-question">
        <legend>
          Una sorpresa: ¿puede haber gravedad donde no hay materia local?
        </legend>
        <div>
          {[
            'Sí: por ejemplo, fuera de una estrella',
            'El vacío siempre es espacio-tiempo plano',
          ].map((choice, i) => (
            <button
              key={choice}
              aria-pressed={answer === i}
              onClick={() => setAnswer(i)}
            >
              {choice}
            </button>
          ))}
        </div>
        {answer !== null && (
          <p role="status">
            {answer === 0
              ? '¡Exacto! '
              : 'Mirá el exterior de una estrella. '}
            Un lugar con Tμν = 0 puede seguir teniendo curvatura. La
            solución también depende de las condiciones del problema. Vacío
            local no implica espacio-tiempo plano.
          </p>
        )}
      </fieldset>
      <details>
        <summary>¿Y la constante cosmológica?</summary>
        <p>
          Esta es la forma sin constante cosmológica, como la de la foto. La
          ecuación general puede incluir +Λgμν en el lado geométrico. Los
          modelos locales de estos laboratorios toman Λ = 0.
        </p>
      </details>
      <div className="en-field-links">
        <a href="/ascensor-de-einstein/">
          Entrar a la relatividad general →
        </a>
        <a href="/tren-de-einstein/">Explorar las señales del tren →</a>
      </div>
      <p className="en-field-source">
        El tren de las señales es otro experimento mental: estudia
        simultaneidad en relatividad especial. La pintada de la foto expresa
        relatividad general.
      </p>
      <div className="en-field-sources">
        <a
          href="https://www.einstein.caltech.edu/news/one-hundred-years-of-einsteins-field-equations-and-of-the-explanation-of-mercurys-perihelion"
          target="_blank"
          rel="noreferrer"
        >
          La historia en Einstein Papers Project ↗
        </a>
        <a
          href="https://ocw.mit.edu/courses/8-033-relativity-fall-2006/02415213222b845bbec6e734c64d1718_fieldeqs.pdf"
          target="_blank"
          rel="noreferrer"
        >
          Las ecuaciones explicadas por MIT ↗
        </a>
        <a
          href="https://www.einstein-online.info/en/spotlight/From-force-to-field/"
          target="_blank"
          rel="noreferrer"
        >
          De la fuerza al campo · Einstein Online ↗
        </a>
      </div>
    </section>
  )
}
