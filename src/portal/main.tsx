import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Portal from './App'
import './portal.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Portal />
  </StrictMode>,
)
