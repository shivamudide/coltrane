import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// One-time migration from the previous app name.
const legacy = localStorage.getItem('waxd-v1')
if (legacy && !localStorage.getItem('coltrane-v1')) {
  localStorage.setItem('coltrane-v1', legacy)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
