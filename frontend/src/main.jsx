import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const container = document.getElementById('root')
if (container && !window.__AXOM_AI_MOUNTED__) {
  window.__AXOM_AI_MOUNTED__ = true
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
