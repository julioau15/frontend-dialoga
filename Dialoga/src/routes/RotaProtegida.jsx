import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Carregando } from '../components'
import useAuth from '../hooks/useAuth'
import { ROTA_INICIAL_POR_PERFIL, ROTA_LOGIN } from './paths'

// perfis: lista de perfis com acesso; vazio = qualquer usuário logado
function RotaProtegida({ perfis = [] }) {
  const { usuario, carregando } = useAuth()
  const location = useLocation()

  if (carregando) return <Carregando />

  if (!usuario) {
    // guarda a URL pedida para voltar a ela depois do login
    return <Navigate to={ROTA_LOGIN} replace state={{ from: location.pathname }} />
  }

  if (perfis.length > 0 && !perfis.includes(usuario.perfil)) {
    return <Navigate to={ROTA_INICIAL_POR_PERFIL[usuario.perfil]} replace />
  }

  return <Outlet />
}

export default RotaProtegida
