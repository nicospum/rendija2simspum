import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import EinsteinSeries from './EinsteinSeries'
import './base.css'
import './einstein.css'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EinsteinSeries />
  </StrictMode>,
)
