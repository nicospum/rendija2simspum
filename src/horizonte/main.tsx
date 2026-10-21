import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '../acrecion/acrecion.css'
import './horizonte.css'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
