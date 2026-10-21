import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '../einstein/base.css'
import '../reloj/reloj.css'
import './fotoelectrico.css'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
