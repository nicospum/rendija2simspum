import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import Series from './Series'
import { mountLabHelp } from '../education/mountLabHelp'
import './maldacena.css'
const Entanglement = lazy(() => import('./quantum/EntanglementLab'))
const Holography = lazy(() => import('./HolographyLab'))
const Page = lazy(() => import('./page/PageLab'))
const path = location.pathname.replace(/\/$/, '')
const App =
  path === '/entrelazados'
    ? Entanglement
    : [
          '/holografia',
          '/espacio-con-frontera',
          '/dos-lenguajes',
          '/frontera-caliente',
        ].includes(path)
      ? Holography
      : path === '/curva-de-page'
        ? Page
        : Series
mountLabHelp()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<p role="status">Preparando el laboratorio de Maldacena…</p>}>
      <App />
    </Suspense>
  </StrictMode>,
)
