import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import EntropyApp from './App'
import './entropia.css'

import '../series/world.css'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EntropyApp />
  </StrictMode>,
)
