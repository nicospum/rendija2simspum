import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './acrecion.css'
import '../series/world.css'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
