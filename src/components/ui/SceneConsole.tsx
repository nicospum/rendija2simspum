import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ObservationStep } from './trialSteps'
import './SceneConsole.css'
import './SceneChallenge.css'

function revealControls(controls: HTMLDivElement | null) {
  if (!controls) return
  controls.scrollIntoView({ block: 'start' })
  const workspace = controls.closest('[data-scene-workspace]')
  const left = controls.getBoundingClientRect().left
  // A tall scene beside the controls reaches the end of its grid row sooner.
  // Keep the whole drawing visible instead of aligning the controls too high.
  const stage = [
    ...(workspace?.querySelectorAll<HTMLElement>('.spum-live-stage') ?? []),
  ].find((element) => {
    const box = element.getBoundingClientRect()
    return box.width > 0 && box.right <= left + 2
  })
  if (!stage) return
  const box = stage.getBoundingClientRect()
  const inset = Number.parseFloat(getComputedStyle(stage).top)
  if (
    Number.isFinite(inset) &&
    box.top < inset &&
    box.height <= innerHeight - inset
  )
    window.scrollBy({ top: box.top - inset, behavior: 'instant' })
}

export interface SceneChallenge {
  index: number
  lessons: readonly { title: string }[]
  question: string
  choices: readonly string[]
  prediction: number | null
  steps: readonly ObservationStep[]
  verified: boolean
  feedback: string
  meaning: string
  onPredict: (choice: number) => void
  onLesson: (index: number) => void
  onCheck?: () => void
  onTry?: () => void
  tryLabel?: string
  onRestore: () => void
}

export default function SceneConsole({
  children,
  hint,
  challengeHref,
  viewHref,
  challenge,
}: {
  children: ReactNode
  hint: string
  challengeHref: string
  viewHref: string
  challenge: SceneChallenge
}) {
  const controlsHref = challengeHref.replace(/-challenges$/, '-controls')
  const [mode, setMode] = useState<'wide' | 'play' | 'challenge'>(() =>
    [challengeHref, controlsHref].includes(location.hash)
      ? 'challenge'
      : 'wide',
  )
  const open = mode === 'challenge'
  const active = mode !== 'wide'
  const pendingControls = useRef(location.hash === controlsHref)
  const id = useId()
  const controls = useRef<HTMLDivElement>(null)
  const question = useRef<HTMLDivElement>(null)
  const returnToScene = () => {
    document
      .getElementById(viewHref.slice(1))
      ?.scrollIntoView({ block: 'start' })
  }
  const wasActive = useRef(false)
  useLayoutEffect(() => {
    if (active || wasActive.current)
      document
        .getElementById(viewHref.slice(1))
        ?.scrollIntoView({ block: 'start' })
    wasActive.current = active
  }, [active, open, challenge.index, viewHref])
  // Existing "Retos" links keep their useful fallback URL, but open the same
  // current trial beside the live scene. Modified clicks still open a new tab.
  useEffect(() => {
    const reveal = (variables = false) => {
      const alreadyOpen =
        controls.current?.parentElement?.dataset.challengeOpen === 'true'
      pendingControls.current = variables && !alreadyOpen
      setMode('challenge')
      if (variables && alreadyOpen) revealControls(controls.current)
      else
        document
          .getElementById(viewHref.slice(1))
          ?.scrollIntoView({ block: 'start' })
    }
    const navigate = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      const anchor =
        event.target instanceof Element ? event.target.closest('a') : null
      const href = anchor?.getAttribute('href')
      if (!href?.startsWith('#')) return
      if (
        href !== challengeHref &&
        href !== controlsHref &&
        !anchor?.hasAttribute('data-scene-play')
      )
        return
      event.preventDefault()
      reveal(href === controlsHref)
    }
    const onHash = () => {
      if (location.hash === challengeHref) reveal()
      if (location.hash === controlsHref) reveal(true)
    }
    document.addEventListener('click', navigate)
    window.addEventListener('hashchange', onHash)
    onHash()
    return () => {
      document.removeEventListener('click', navigate)
      window.removeEventListener('hashchange', onHash)
    }
  }, [challengeHref, controlsHref, viewHref])
  useLayoutEffect(() => {
    if (!active) return
    const workspace = controls.current?.closest<HTMLElement>(
      '[data-scene-workspace]',
    )
    if (!workspace) return
    const stages = [...workspace.querySelectorAll('.spum-live-stage')]
    const measure = () => {
      const height = Math.max(
        0,
        ...stages.map((stage) => stage.getBoundingClientRect().height),
      )
      workspace.style.setProperty(
        '--spum-stage-height',
        `${Math.ceil(height)}px`,
      )
    }
    const observer = new ResizeObserver(measure)
    stages.forEach((stage) => observer.observe(stage))
    measure()
    if (pendingControls.current) {
      pendingControls.current = false
      revealControls(controls.current)
    }
    return () => {
      observer.disconnect()
      workspace.style.removeProperty('--spum-stage-height')
    }
  }, [active, open])
  const missing = challenge.steps.find((step) => !step.done)
  const ready = challenge.prediction !== null && !missing
  return (
    <div
      className="spum-scene-console"
      role="group"
      aria-label="Controles junto al experimento"
      data-challenge-open={open}
      data-scene-active={active}
    >
      <div className="spum-console-heading">
        {open ? (
          <select
            aria-label="Elegir reto junto a la escena"
            data-help-title="Elegir una pregunta para explorar"
            data-help-body="Elegís cuál de los cuatro retos querés explorar. Cada uno propone una pregunta, una predicción y observaciones distintas. Este menú cambia el reto, no una magnitud física del experimento."
            value={challenge.index}
            onChange={(event) => {
              challenge.onLesson(+event.target.value)
              returnToScene()
            }}
          >
            {challenge.lessons.map((lesson, i) => (
              <option key={i} value={i}>
                {i + 1}/4 · {lesson.title}
              </option>
            ))}
          </select>
        ) : (
          <strong>Probá acá.</strong>
        )}
        {active && (
          <button
            className="spum-challenge-toggle"
            aria-label="Ampliar visor"
            title="Ampliar el visor sin reiniciar la prueba"
            data-help-title="Dar más lugar al experimento"
            data-help-body="Amplía el espacio disponible para mirar la escena y conserva las condiciones de tu prueba. Cambia la distribución de la página, no la escala física ni los resultados del modelo."
            onClick={() => {
              setMode('wide')
              returnToScene()
            }}
          >
            ⤢<span className="spum-expand-word"> Ampliar</span>
          </button>
        )}
        {open && (
          <button
            className="spum-challenge-toggle"
            data-help-title="Volver a la pregunta y el resultado"
            data-help-body="Desplaza la página hasta la pregunta, tu predicción y la devolución del reto actual. La marca Resultado avisa que completaste la comparación. No reinicia el ensayo ni cambia las variables: podés volver a los controles con Probar en la escena."
            onClick={() =>
              question.current?.scrollIntoView({ block: 'start' })
            }
          >
            {challenge.verified ? '✓ Resultado' : '↑ Pregunta'}
          </button>
        )}
        <button
          className="spum-challenge-toggle"
          aria-label={open ? 'Cerrar reto' : 'Mi reto'}
          aria-expanded={open}
          aria-controls={id}
          data-help-title={
            open
              ? 'Cerrar la pregunta y seguir jugando'
              : 'Abrir el reto junto a la escena'
          }
          data-help-body="Muestra u oculta la pregunta, la predicción y los pasos del reto junto al experimento. Conserva las condiciones del ensayo para que puedas pasar de explorar a comprobar tu idea."
          onClick={() => {
            setMode(open ? 'play' : 'challenge')
            returnToScene()
          }}
        >
          {open ? '×' : 'Mi reto'}
        </button>
      </div>
      <div
        className="spum-scene-challenge"
        id={id}
        ref={question}
        role="group"
        aria-label="Reto junto al experimento"
        hidden={!open}
      >
        {open && (
          <>
            <p className="spum-challenge-question">{challenge.question}</p>
            <label className="spum-challenge-answer">
              <span>Tu predicción</span>
              <select
                aria-label="Tu predicción junto a la escena"
                data-help-title="Elegir una idea antes de probar"
                data-help-body="Elegí lo que esperás que ocurra y contrastalo con el experimento. No se trata de adivinar: podés cambiar tu idea después de observar. El menú registra tu explicación propuesta; no cambia las condiciones físicas."
                value={challenge.prediction ?? ''}
                onChange={(event) => {
                  if (event.target.value !== '')
                    challenge.onPredict(+event.target.value)
                }}
              >
                <option value="" disabled>
                  Elegí una idea para probar…
                </option>
                {challenge.choices.map((choice, i) => (
                  <option key={i} value={i}>
                    {choice}
                  </option>
                ))}
              </select>
            </label>
            {challenge.prediction !== null &&
              challenge.choices[challenge.prediction].length > 48 && (
                <p className="spum-challenge-choice">
                  Tu idea: {challenge.choices[challenge.prediction]}
                </p>
              )}
            <p className="spum-challenge-step" role="status">
              {challenge.verified
                ? '✓ Descubrimiento comprobado.'
                : challenge.prediction === null
                  ? 'Primero elegí una idea; podés cambiarla después.'
                  : missing
                    ? `Probá: ${missing.label}`
                    : 'Comparación lista: revisá tu explicación.'}
            </p>
            <div className="spum-console-buttons spum-challenge-actions">
              {challenge.onCheck && (
                <button
                  disabled={!ready}
                  onClick={challenge.onCheck}
                  data-help-title="Contrastar tu explicación con lo observado"
                  data-help-body="Compara tu predicción con las observaciones que pide el reto. Se habilita cuando elegiste una idea y completaste sus pasos; si falta algo, la línea Probá indica qué observar. No vuelve a medir ni modifica el experimento."
                >
                  Comprobar explicación
                </button>
              )}
              {challenge.verified && (
                <button
                  onClick={() => {
                    challenge.onLesson(
                      (challenge.index + 1) % challenge.lessons.length,
                    )
                    returnToScene()
                  }}
                >
                  {challenge.index === 3
                    ? 'Volver al reto 1'
                    : 'Siguiente reto →'}
                </button>
              )}
              <button
                onClick={() => revealControls(controls.current)}
                data-help-title="Volver a los controles del ensayo"
                data-help-body="Desplaza la página hasta los mandos junto a la escena para realizar la comparación que pide el reto. Conserva la pregunta, la predicción y las condiciones actuales."
              >
                Probar en la escena ↓
              </button>
            </div>
            {(challenge.feedback || challenge.verified) && (
              <p className="spum-challenge-feedback" role="status">
                {challenge.feedback || challenge.meaning}
              </p>
            )}
            <details className="spum-console-help">
              <summary
                data-help-title="Consultar qué falta observar"
                data-help-body="Despliega las observaciones necesarias para este reto y las acciones de comparación. La marca de cada paso indica si ya registraste esa observación; no dice por sí sola si tu explicación es correcta."
              >
                Pasos del reto y referencia
              </summary>
              <ul>
                {challenge.steps.map((step) => (
                  <li key={step.label}>
                    {step.done ? '✓' : '○'} {step.label}
                  </li>
                ))}
              </ul>
              <div className="spum-console-buttons">
                {challenge.onTry && (
                  <button
                    disabled={challenge.prediction === null}
                    onClick={challenge.onTry}
                  >
                    {challenge.tryLabel ?? 'Probar la comparación'}
                  </button>
                )}
                <button
                  onClick={() => {
                    challenge.onRestore()
                    returnToScene()
                  }}
                >
                  Reiniciar este reto
                </button>
              </div>
            </details>
          </>
        )}
      </div>
      <div className="spum-console-variables" ref={controls}>
        {children}
      </div>
      <details className="spum-console-help">
        <summary>Cómo jugar y qué cambia</summary>
        <p className="spum-console-hint">{hint}</p>
        {active && (
          <p className="spum-console-hint">
            Cerrar el reto permite explorar con los mandos a la vista. El
            visor amplio muestra más detalle y conserva tus condiciones.
          </p>
        )}
        {active && (
          <div className="spum-console-buttons">
            <button
              onClick={() => {
                setMode('wide')
                returnToScene()
              }}
            >
              Ver visor amplio
            </button>
          </div>
        )}
      </details>
    </div>
  )
}
