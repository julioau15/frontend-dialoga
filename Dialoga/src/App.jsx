import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TemaProvider } from './contexts/TemaContext'
import BotaoTemaFlutuante from './components/BotaoTema/BotaoTemaFlutuante'
import AppRoutes from './routes'

export default function App() {
  return (
    <TemaProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          {/* botão de tema nas telas sem menu lateral (login, cadastro...) */}
          <BotaoTemaFlutuante />
        </AuthProvider>
      </BrowserRouter>
    </TemaProvider>
  )
}