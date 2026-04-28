import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import RecipientApp from './RecipientApp.jsx'
import './src/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RecipientApp />
  </StrictMode>,
)
