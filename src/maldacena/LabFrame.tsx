import { useEffect } from 'react'
import type { ReactNode } from 'react'
import SceneConsole from '../components/ui/SceneConsole'
import { LabMission } from '../components/ui/LabJourney'
import { chapters, passport } from './catalog'
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
  const index = chapters.findIndex((c) => c.id === id)
  return (
    <nav className="md-journey" aria-label="Recorrido Maldacena">
      <a href="/maldacena/">↟ Mapa del especial</a>
      <details>
        <summary>
          Los {chapters.length} capítulos{' '}
          {index >= 0 && `· ${index + 1}/${chapters.length}`}
        </summary>
        <ol>
          {chapters.map((c) => (
            <li key={c.id}>
              <a href={`/${c.id}/`} aria-current={id === c.id ? 'page' : undefined}>
                {c.title}
              </a>
            </li>
          ))}
        </ol>
      </details>
      {index >= 0 && (
        <a
          href={
            index < chapters.length - 1 ? `/${chapters[index + 1].id}/` : '/maldacena/'
          }
        >
          {index < chapters.length - 1 ? 'Siguiente capítulo →' : 'Volver al recorrido →'}
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
  const current = lessons[lesson]
  const observed = steps.length > 0 && steps.every((s) => s.done)
  const verified = observed && prediction === current.answer
  const focusScene = () =>
    document.getElementById('md-map')?.focus({ preventScroll: true })
  useEffect(() => {
    if (verified && chapters.some((c) => c.id === id))
      passport.saveCompleted(id as ChapterId, [lesson])
  }, [verified, id, lesson])
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
          <h1>{title}</h1>
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
