import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import LensApp from './App'
import './lente.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LensApp />
  </StrictMode>,
)
