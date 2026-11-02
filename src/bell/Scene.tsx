import { useSvgScrub } from '../shared/useSvgScrub'
import { scrubKey } from '../shared/sceneInteraction'
import { PAIRS, PAIR_LABELS, card, quantum, interval } from './physics'
import type { Angles, Pair, Sweep } from './physics'
import { n, signed } from './format'

function Dial({
  side,
  setting,
  angle,
  onAngle,
}: {
  side: 'A' | 'B'
  setting: number
  angle: number
  onAngle: (value: number) => void
}) {
  const cx = side === 'A' ? 150 : 450,
    cy = 140,
    r = 60,
    a = (angle * Math.PI) / 180
  const drag = useSvgScrub((p) =>
    onAngle(
      Math.round(
        Math.max(-90, Math.min(90, (Math.atan2(cy - p.y, p.x - cx) * 180) / Math.PI)) * 2,
      ) / 2,
    ),
  )
  const ink = side === 'A' ? '#89e8ed' : '#ffbd9b'
  return (
    <g>
      <circle cx={cx} cy={cy} r="66" fill="#1b2440" stroke={ink} strokeOpacity=".4" />
      {[0, 45, 90, -45, -90].map((v) => {
        const k = (v * Math.PI) / 180
        return (
          <path
            key={v}
            d={`M${cx + 52 * Math.cos(k)} ${cy - 52 * Math.sin(k)}L${cx + 61 * Math.cos(k)} ${cy - 61 * Math.sin(k)}`}
            stroke={ink}
            strokeOpacity=".45"
          />
        )
      })}
      <path
        d={`M${cx - 42 * Math.cos(a)} ${cy + 42 * Math.sin(a)}L${cx + 42 * Math.cos(a)} ${cy - 42 * Math.sin(a)}`}
        stroke={ink}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="6" fill={ink} />
      <circle cx={cx + r * Math.cos(a)} cy={cy - r * Math.sin(a)} r="8" fill={ink} />
      <circle
        {...drag}
        className="spum-object-handle"
        cx={cx + r * Math.cos(a)}
        cy={cy - r * Math.sin(a)}
        r="46"
        fill="transparent"
        tabIndex={0}
        role="slider"
        aria-label={`Girar analizador ${side}${setting}`}
        aria-valuemin={-90}
        aria-valuemax={90}
        aria-valuenow={angle}
        aria-valuetext={`${n(angle, 1)} grados`}
        data-help-title={`Orientación ${side}${setting}`}
        data-help-body="Arrastrá el punto del borde o usá las flechas. Cambia la base de medida de este analizador. Cada lado tiene dos orientaciones guardadas; los botones A₀B₀… eligen cuál se usa. Cambiar un ángulo borra los datos activos para no mezclar montajes distintos."
        onKeyDown={(e) => {
          const value = scrubKey(e.key, angle, -90, 90, 0.5)
          if (value !== undefined) {
            e.preventDefault()
            onAngle(value)
          }
        }}
      />
      <text x={cx} y="38" textAnchor="middle" fill={ink} fontSize="17" fontWeight="600">
        {side}
        {setting === 0 ? '₀' : '₁'} · {n(angle, 1)}°
      </text>
      <text x={cx} y="237" textAnchor="middle" fill={ink} fontSize="13">
        GIRÁ EL PUNTO
      </text>
    </g>
  )
}
export default function Apparatus({
  angles,
  pair,
  last,
  event,
  onAngle,
  onEmit,
}: {
  angles: Angles
  pair: Pair
  last: number | null
  event: number
  onAngle: (index: number, value: number) => void
  onEmit: () => void
}) {
  const [a, b] = PAIRS[pair],
    aResult = last === null ? null : last < 2 ? '+' : '−',
    bResult = last === null ? null : last % 2 === 0 ? '+' : '−'
  return (
    <svg
      viewBox="0 0 600 270"
      role="group"
      aria-label="Fuente de pares de fotones y dos analizadores giratorios con dos salidas cada uno"
    >
      <defs>
        <radialGradient id="bl-source">
          <stop stopColor="#eee1ff" />
          <stop offset=".5" stopColor="#c39bff" />
          <stop offset="1" stopColor="#7d60b5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M275 140H216M325 140H384"
        stroke="#b69aea"
        strokeWidth="3"
        strokeDasharray="7 8"
        opacity=".65"
      />
      <path
        d="M84 125L48 83M84 155L48 197M516 125L552 83M516 155L552 197"
        fill="none"
        stroke="#717a9c"
        strokeWidth="1.5"
      />
      <Dial side="A" setting={a} angle={angles[a]} onAngle={(v) => onAngle(a, v)} />
      <Dial side="B" setting={b - 2} angle={angles[b]} onAngle={(v) => onAngle(b, v)} />
      <circle cx="300" cy="140" r="40" fill="url(#bl-source)" />
      <circle cx="300" cy="140" r="25" fill="#614584" stroke="#ddcaff" />
      <text
        x="300"
        y="146"
        fill="#fff2ff"
        fontSize="20"
        textAnchor="middle"
        pointerEvents="none"
      >
        Φ⁺
      </text>
      <circle
        cx="300"
        cy="140"
        r="46"
        fill="transparent"
        tabIndex={0}
        role="button"
        aria-label="Emitir un par desde la fuente"
        data-help-title="Preparar y medir una pareja nueva"
        data-help-body="Cada pulsación prepara un nuevo par en el estado de Bell Φ+. Se registra una salida + o − por lado. No se dibuja una polarización individual ya decidida antes de medir. El cálculo conjunto de probabilidades no representa una señal física entre los detectores."
        onClick={onEmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onEmit()
          }
        }}
      />
      <text x="300" y="205" fill="#c6b7df" fontSize="12" textAnchor="middle">
        TOCÁ LA FUENTE
      </text>
      {(['A', 'B'] as const).map((side) => {
        const x = side === 'A' ? 42 : 558,
          result = side === 'A' ? aResult : bResult
        return (
          <g
            key={side}
            data-help-title={`Salidas del detector ${side}`}
            data-help-body="+ y − son las dos salidas posibles del analizador, no cargas eléctricas. Todos los pares del modelo se detectan, sin descartar resultados. El destello marca la última detección real del lote; no indica una comunicación con el otro detector."
          >
            {['+', '−'].map((sign, i) => (
              <g key={`${event}-${sign}`}>
                <circle
                  className={result === sign ? 'bl-flash' : ''}
                  cx={x}
                  cy={i === 0 ? 72 : 208}
                  r="19"
                  fill={
                    result === sign ? (side === 'A' ? '#89e8ed' : '#ffbd9b') : '#202842'
                  }
                  stroke={side === 'A' ? '#89e8ed' : '#ffbd9b'}
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={(i === 0 ? 72 : 208) + 6}
                  fill={result === sign ? '#142135' : '#eee7ff'}
                  textAnchor="middle"
                  fontSize="23"
                >
                  {sign}
                </text>
              </g>
            ))}
          </g>
        )
      })}
    </svg>
  )
}

export function LocalCards({
  index,
  onCard,
}: {
  index: number
  onCard: (index: number) => void
}) {
  const c = card(index)
  return (
    <div
      className="bl-local-game"
      aria-label="Construir una tarjeta de respuestas locales"
    >
      <p className="bl-kicker">INTENTÁ SUPERAR |S| = 2</p>
      <div className="bl-card-bits">
        {['A₀', 'A₁', 'B₀', 'B₁'].map((label, i) => (
          <button
            key={label}
            className={c.answers[i] === 1 ? 'bl-plus' : 'bl-minus'}
            aria-label={`Respuesta ${label}: ${c.answers[i] === 1 ? 'más uno' : 'menos uno'}. Cambiar signo`}
            onClick={() => onCard(index ^ (1 << i))}
            data-help-title={`Respuesta preparada para ${label}`}
            data-help-body="Esta casilla es una instrucción local para una pregunta etiquetada. Se fija antes de elegir qué combinación se consulta. Es un modelo de respuestas preparadas, no la ley de un polarizador clásico. Tocarla invierte su signo; el resultado remoto no decide esta respuesta."
          >
            <span>{label}</span>
            <strong>{c.answers[i] === 1 ? '+' : '−'}</strong>
          </button>
        ))}
      </div>
      <div className="bl-products">
        {c.correlations.map((v, i) => (
          <div key={i}>
            <span>{['A₀B₀', 'A₀B₁', 'A₁B₀', '−A₁B₁'][i]}</span>
            <strong>{signed(i === 3 ? -v : v, 0)}</strong>
          </div>
        ))}
      </div>
      <p className="bl-cancel">
        S = A₀ ×{' '}
        <b className={c.brackets[0] === 0 ? 'bl-zero' : ''}>
          ({signed(c.brackets[0], 0)})
        </b>{' '}
        + A₁ ×{' '}
        <b className={c.brackets[1] === 0 ? 'bl-zero' : ''}>
          ({signed(c.brackets[1], 0)})
        </b>{' '}
        = <strong>{signed(c.S, 0)}</strong>
      </p>
      <p className="bl-local-caption">
        Paréntesis: (B₀+B₁) y (B₀−B₁). Uno siempre es cero.
      </p>
    </div>
  )
}

export function QuantumSum({
  angles,
  trial,
  onInspect,
}: {
  angles: Angles
  trial: Sweep | null
  onInspect: (pair: Pair) => void
}) {
  const q = quantum(angles),
    ci = trial ? interval(trial.rows) : null
  return (
    <div className="bl-sum-stage">
      <p className="bl-kicker">CUATRO CORRELACIONES · EL ÚLTIMO TÉRMINO SE RESTA</p>
      <div className="bl-terms">
        {q.correlations.map((e, i) => (
          <button
            key={i}
            onClick={() => onInspect(i as Pair)}
            aria-label={`Examinar combinación ${PAIR_LABELS[i]}`}
            data-help-title={`Contribución ${i === 3 ? '−' : '+'}E de ${PAIR_LABELS[i]}`}
            data-help-body={`E vale ${signed(e, 3)}. ${i === 3 ? 'Esta correlación se resta: si es negativa, su contribución es positiva.' : 'Esta correlación entra con signo positivo.'} Tocá para ver y girar los analizadores de esa combinación.`}
          >
            <span>
              {i === 3 ? '−' : '+'}E{['₀₀', '₀₁', '₁₀', '₁₁'][i]}
            </span>
            <strong>{signed(i === 3 ? -e : e, 3)}</strong>
            <small>E={signed(e, 3)}</small>
          </button>
        ))}
      </div>
      <ScoreBar exact={q.S} observed={ci?.estimate} lower={ci?.lower} upper={ci?.upper} />
      <p className="bl-sum-caption">
        {trial
          ? `${trial.n} pares por combinación · cota 95 % [${signed(ci!.lower, 2)}; ${signed(ci!.upper, 2)}]. Blanco: lote y cota; verde: modelo.`
          : 'Sin ensayo todavía: la marca de color es la predicción, no datos.'}{' '}
        Tocá un término para explorar sus ajustes.
      </p>
    </div>
  )
}

export function ScoreBar({
  exact,
  observed,
  lower,
  upper,
  local = false,
}: {
  exact: number
  observed?: number
  lower?: number
  upper?: number
  local?: boolean
}) {
  const position = (x: number) => `${(x + 4) * 12.5}%`
  return (
    <div
      className="bl-score"
      role="group"
      aria-label={`S con signo. ${local ? 'Tarjeta local' : 'Predicción cuántica'} ${n(exact, 3)}${observed === undefined ? '' : `, estimación ${n(observed, 3)}`}`}
      data-help-title="La suma CHSH y su límite local"
      data-help-body="S suma E₀₀+E₀₁+E₁₀−E₁₁. El eje conserva el signo, de −4 a 4. La banda central corresponde a los modelos locales con independencia de ajustes: −2≤S≤2. La marca de color es la predicción o la tarjeta exacta; la blanca y su intervalo corresponden sólo al ensayo de cuatro lotes nuevos."
    >
      <div className="bl-score-track">
        <span className="bl-local-band" />
        {lower !== undefined && upper !== undefined && (
          <span
            className="bl-error-line"
            style={{ left: position(lower), width: `${(upper - lower) * 12.5}%` }}
          />
        )}
        <i className="bl-exact-mark" style={{ left: position(exact) }} />
        {observed !== undefined && (
          <i className="bl-observed-mark" style={{ left: position(observed) }} />
        )}
      </div>
      <div className="bl-score-ticks">
        <span>−4</span>
        <span>−2</span>
        <span>0</span>
        <span>+2</span>
        <span>+4</span>
      </div>
      <p>
        {local ? 'Tarjeta' : 'Predicción'} S = <b>{signed(exact, 3)}</b>
        {observed === undefined ? '' : ` · Lote: ${signed(observed, 3)}`}
      </p>
    </div>
  )
}
