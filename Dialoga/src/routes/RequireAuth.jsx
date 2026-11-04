// ============================================================
// routes/RequireAuth.jsx
// Guarda de rotas: só deixa passar quem está logado E tem o nível certo.
//   <Route element={<RequireAuth nivel={NIVEL.PROFISSIONAL} />}> ... </Route>
// - Deslogado            -> /login
// - Logado, nível errado -> manda para a área do próprio nível
// - Paciente em primeiro acesso -> /personalizar-experiencia (exigirPrimeiroAcesso={false} desliga isso)
// ============================================================
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { rotaInicialPorNivel, NIVEL, ROTA_PRIMEIRO_ACESSO } from '../utils/rotasPorNivel'
import { primeiroAcessoConcluido } from '../utils/primeiroAcesso'

export default function RequireAuth({ nivel, exigirPrimeiroAcesso = true }) {
  const { auth } = useAuth()

  if (!auth) {
    return <Navigate to="/login" replace />
  }

  if (auth.nivel !== nivel) {
    const propriaRota = rotaInicialPorNivel(auth.nivel)
    return <Navigate to={propriaRota ?? '/login'} replace />
  }

  // Paciente que ainda não respondeu as perguntas de primeiro acesso
  // (sessão antiga não tem o campo: consulta o que ficou salvo no navegador)
  if (exigirPrimeiroAcesso && auth.nivel === NIVEL.PACIENTE && !(auth.primeiroAcessoConcluido ?? primeiroAcessoConcluido(auth.id))) {
    return <Navigate to={ROTA_PRIMEIRO_ACESSO} replace />
  }

  // Paciente que já concluiu não volta para as perguntas de primeiro acesso
  if (!exigirPrimeiroAcesso && auth.nivel === NIVEL.PACIENTE && (auth.primeiroAcessoConcluido ?? primeiroAcessoConcluido(auth.id))) {
    return <Navigate to={rotaInicialPorNivel(auth.nivel)} replace />
  }

  return <Outlet />
}
