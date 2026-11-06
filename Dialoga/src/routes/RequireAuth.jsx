// ============================================================
// routes/RequireAuth.jsx
// Guarda de rotas: só deixa passar quem está logado E tem o nível certo.
//   <Route element={<RequireAuth nivel={NIVEL.PROFISSIONAL} />}> ... </Route>
// - Deslogado            -> /login
// - Logado, nível errado -> manda para a área do próprio nível
// - Paciente em primeiro acesso      -> /personalizar-experiencia (exigirPrimeiroAcesso={false} desliga isso)
// - Profissional em primeiro acesso  -> /boas-vindas-profissional (idem)
// ============================================================
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { rotaInicialPorNivel, rotaPrimeiroAcessoPorNivel, primeiroAcessoPendente } from '../utils/rotasPorNivel'

export default function RequireAuth({ nivel, exigirPrimeiroAcesso = true }) {
  const { auth } = useAuth()

  if (!auth) {
    return <Navigate to="/login" replace />
  }

  if (auth.nivel !== nivel) {
    const propriaRota = rotaInicialPorNivel(auth.nivel)
    return <Navigate to={propriaRota ?? '/login'} replace />
  }

  // Paciente ou profissional que ainda não concluiu o primeiro acesso
  // (sessão antiga não tem o campo: consulta o que ficou salvo no navegador)
  const pendente = primeiroAcessoPendente(auth)

  if (exigirPrimeiroAcesso && pendente) {
    return <Navigate to={rotaPrimeiroAcessoPorNivel(auth.nivel)} replace />
  }

  // Quem já concluiu não volta para a tela de primeiro acesso
  if (!exigirPrimeiroAcesso && rotaPrimeiroAcessoPorNivel(auth.nivel) !== null && !pendente) {
    return <Navigate to={rotaInicialPorNivel(auth.nivel)} replace />
  }

  return <Outlet />
}
