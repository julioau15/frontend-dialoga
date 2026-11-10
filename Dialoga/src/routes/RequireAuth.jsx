// ============================================================
// routes/RequireAuth.jsx
// Guarda de rotas: só deixa passar quem está logado E tem o nível certo.
//   <Route element={<RequireAuth nivel={NIVEL.PROFISSIONAL} />}> ... </Route>
// - Deslogado            -> /login
// - Logado, nível errado -> manda para a área do próprio nível
// - Paciente ou profissional em primeiro acesso -> tela de primeiro acesso do nível
//     paciente     -> /personalizar-experiencia
//     profissional -> /boas-vindas-profissional
//     administrador -> /primeiro-acesso (enquanto a senha for provisória)
//   (exigirPrimeiroAcesso={false} desliga isso: é o que as próprias telas de primeiro acesso usam)
// ============================================================
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { rotaInicialPorNivel, rotaPrimeiroAcesso, precisaPrimeiroAcesso } from '../utils/rotasPorNivel'

export default function RequireAuth({ nivel, exigirPrimeiroAcesso = true }) {
  const { auth } = useAuth()

  if (!auth) {
    return <Navigate to="/login" replace />
  }

  if (auth.nivel !== nivel) {
    const propriaRota = rotaInicialPorNivel(auth.nivel)
    return <Navigate to={propriaRota ?? '/login'} replace />
  }

  const pendente = precisaPrimeiroAcesso(auth)

  // Ainda não fez o primeiro acesso: não entra nas telas do sistema
  if (exigirPrimeiroAcesso && pendente) {
    return <Navigate to={rotaPrimeiroAcesso(auth.nivel)} replace />
  }

  // Já concluiu: não volta para as telas de primeiro acesso
  if (!exigirPrimeiroAcesso && !pendente && rotaPrimeiroAcesso(auth.nivel)) {
    return <Navigate to={rotaInicialPorNivel(auth.nivel)} replace />
  }

  return <Outlet />
}
