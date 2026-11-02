import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { mountLabHelp } from '../education/mountLabHelp'
import App from './App'
import '../maldacena/maldacena.css'
import './bell.css'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
mountLabHelp()
