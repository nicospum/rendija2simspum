import { useContext, useEffect } from 'react'
import type { ReactNode } from 'react'
import SceneConsole from '../components/ui/SceneConsole'
import { LabMission } from '../components/ui/LabJourney'
import { chapters, laboratories, chapterHref, passport } from './catalog'
import { HolographyContext } from './HolographyContext'
import HolographyNavigation from './HolographyNavigation'
import type { ChapterId } from './catalog'
import './maldacena.css'

export interface Lesson {
  title: string
  question: string
  choices: readonly string[]
  answer: number
  hint: string
  meaning: string
}
export function JourneyNavigation({ id }: { id?: string }) {
  const index = laboratories.findIndex((c) =>
    c.chapterIds.some((chapterId) => chapterId === id),
  )
  const unitIndex = chapters.findIndex((c) => c.id === id)
  return (
    <nav className="md-journey" aria-label="Recorrido Maldacena">
      <a href="/maldacena/">↟ Mapa del especial</a>
      <details>
        <summary>
          Los {laboratories.length} laboratorios{' '}
          {index >= 0 && `· ${index + 1}/${laboratories.length}`}
        </summary>
        <ol>
          {laboratories.map((c) => (
            <li key={c.id}>
              <a
                href={c.href}
                aria-current={
                  c.chapterIds.some((chapterId) => chapterId === id) ? 'page' : undefined
                }
              >
                {c.title}
              </a>
            </li>
          ))}
        </ol>
      </details>
      {index >= 0 && (
        <a
          href={
            unitIndex < chapters.length - 1
              ? chapterHref(chapters[unitIndex + 1].id)
              : '/maldacena/'
          }
        >
          {unitIndex < chapters.length - 1
            ? index === 1 && unitIndex < 3
              ? 'Siguiente sección →'
              : 'Siguiente laboratorio →'
            : 'Volver al recorrido →'}
        </a>
      )}
    </nav>
  )
}
export default function LabFrame({
  id,
  title,
  intro,
  lessons,
  lesson,
  onLesson,
  prediction,
  onPredict,
  steps,
  onRestore,
  children,
  controls,
  readout,
  explanation,
  sources,
}: {
  id: string
  title: string
  intro: string
  lessons: readonly Lesson[]
  lesson: number
  onLesson: (index: number) => void
  prediction: number | null
  onPredict: (index: number) => void
  steps: readonly { label: string; done: boolean }[]
  onRestore: () => void
  children: ReactNode
  controls: ReactNode
  readout: ReactNode
  explanation: ReactNode
  sources: readonly { label: string; url: string }[]
}) {
  const holography = useContext(HolographyContext)
  const current = lessons[lesson]
  const observed = steps.length > 0 && steps.every((s) => s.done)
  const verified = observed && prediction === current.answer
  const focusScene = () =>
    document.getElementById('md-map')?.focus({ preventScroll: true })
  useEffect(() => {
    if (verified && chapters.some((c) => c.id === id))
      passport.saveCompleted(id as ChapterId, [lesson])
  }, [verified, id, lesson])
  useEffect(() => {
    if (holography?.focusScene)
      document.getElementById('md-map')?.scrollIntoView({ block: 'start' })
  }, [holography?.section, holography?.focusScene])
  return (
    <div className="md-shell">
      <a className="md-skip" href="#md-map">
        Ir a la escena
      </a>
      <header className="md-header">
        <a href="/">∿ SPUM</a>
        <a href="/maldacena/">EL DICCIONARIO DEL UNIVERSO</a>
      </header>
      <main>
        <JourneyNavigation id={id} />
        <section className="md-intro">
          <p className="md-eyebrow">ESPECIAL MALDACENA / JUGAR · MEDIR · CONECTAR</p>
          <h1>{holography ? 'Holografía: geometría y frontera' : title}</h1>
          {holography && (
            <>
              <p className="md-holography-context">
                Primero explorá la geometría de anti-de Sitter (AdS); después conectá una
                longitud con información y calentá la frontera. La primera sección prepara
                el lenguaje geométrico: por sí sola no demuestra holografía. AdS y de
                Sitter (dS) son espacios distintos.
              </p>
              <HolographyNavigation />
              <h2 className="md-holography-heading">{title}</h2>
            </>
          )}
          <p>{intro}</p>
          <a className="md-primary" data-scene-play href="#md-map">
            Entrar y probar ↓
          </a>
          <p className="md-small">
            No necesitás empezar por las fórmulas: elegí una idea, cambiá una cosa y
            compará. Cada reto te indica qué observar en el modelo.
          </p>
        </section>
        <LabMission
          title={current.question}
          instruction={current.hint}
          index={lesson}
          href="#md-challenges"
        />
        <section
          id="md-map"
          className="md-workspace"
          data-scene-workspace
          tabIndex={-1}
          aria-label={`Laboratorio ${title}`}
          data-help-scope={id}
        >
          <div className="spum-live-stage md-stage">
            <div className="md-drawing">{children}</div>
            <div className="md-readout" role="status">
              {readout}
            </div>
          </div>
          <SceneConsole
            viewHref="#md-map"
            challengeHref="#md-challenges"
            hint={current.hint}
            challenge={{
              index: lesson,
              lessons,
              question: current.question,
              choices: current.choices,
              prediction,
              steps,
              verified,
              feedback:
                observed && prediction !== null
                  ? `${prediction === current.answer ? 'Tu idea coincide con el modelo.' : 'Revisá tu idea mirando la comparación.'} ${current.meaning}`
                  : '',
              meaning: current.meaning,
              onPredict,
              onLesson,
              onRestore,
            }}
          >
            {holography && <HolographyNavigation compact />}
            {controls}
          </SceneConsole>
        </section>
        <section className="md-notebook" id="md-understand">
          <a
            className="md-return-to-scene"
            data-scene-play
            href="#md-map"
            onClick={focusScene}
          >
            Volver a mi escena y mi reto ↑
          </a>
          <p className="md-eyebrow">LO QUE DESCUBRISTE / Y HASTA DÓNDE LLEGA</p>
          <h2>Del gesto a la idea.</h2>
          {explanation}
          <details>
            <summary>Fórmulas, fuentes y límites</summary>
            <p>
              Los dibujos usan coordenadas y colores didácticos. Las lecturas corresponden
              al modelo indicado en este capítulo.
            </p>
            <ul>
              {sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </details>
          <a
            className="md-return-to-scene"
            data-scene-play
            href="#md-map"
            onClick={focusScene}
          >
            Seguir probando con mi montaje ↑
          </a>
        </section>
        <JourneyNavigation id={id} />
      </main>
      <footer className="md-footer">
        <a href="/entropia/#information-bridge">
          Antes de empezar: contar información ↗
        </a>
        <a href="/agujeros-negros/">Atlas de agujeros negros ↗</a>
        <a href="/">Todos los laboratorios ↗</a>
      </footer>
    </div>
  )
}
