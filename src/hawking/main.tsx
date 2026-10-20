import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import HawkingApp from './App'
import './hawking.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HawkingApp />
  </StrictMode>,
)
