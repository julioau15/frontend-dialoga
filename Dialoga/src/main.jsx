import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './utils/tema' // aplica o tema salvo (claro/escuro) antes de desenhar a tela
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
