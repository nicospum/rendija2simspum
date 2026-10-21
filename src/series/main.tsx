import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import BlackHoleSeries from './BlackHoleSeries'
import '../acrecion/acrecion.css'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BlackHoleSeries />
  </StrictMode>,
)
