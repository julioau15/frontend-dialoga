import { Navigate, Outlet } from 'react-router-dom'
import { Carregando } from '../components'
import useAuth from '../hooks/useAuth'
import { ROTA_INICIAL_POR_PERFIL } from './paths'

// Telas de autenticação: quem já está logado vai direto para sua área
function RotaPublica() {
  const { usuario, carregando } = useAuth()

  if (carregando) return <Carregando />
  if (usuario) return <Navigate to={ROTA_INICIAL_POR_PERFIL[usuario.perfil]} replace />

  return <Outlet />
}

export default RotaPublica
