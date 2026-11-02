import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import Series from './Series'
import './maldacena.css'
const Entanglement = lazy(() => import('./quantum/EntanglementLab'))
const Geometry = lazy(() => import('./geometry/GeometryLab'))
const Duality = lazy(() => import('./geometry/DualityLab'))
const Thermal = lazy(() => import('./thermal/ThermalLab'))
const path = location.pathname.replace(/\/$/, '')
const App =
  path === '/entrelazados'
    ? Entanglement
    : path === '/espacio-con-frontera'
      ? Geometry
      : path === '/dos-lenguajes'
        ? Duality
        : path === '/frontera-caliente'
          ? Thermal
          : Series
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<p role="status">Preparando el laboratorio de Maldacena…</p>}>
      <App />
    </Suspense>
  </StrictMode>,
)
