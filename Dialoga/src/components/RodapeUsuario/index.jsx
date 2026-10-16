import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { ROTA_LOGIN } from '../../routes/paths'
import Avatar from '../Avatar'
import './RodapeUsuario.css'

// Usuário logado + botão de sair, para o rodapé da BarraLateral
function RodapeUsuario() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  async function handleSair() {
    await logout()
    navigate(ROTA_LOGIN, { replace: true })
  }

  if (!usuario) return null

  return (
    <div className="rodape-usuario">
      <Avatar src={usuario.avatarUrl} name={usuario.nome} size="sm" />
      <span className="rodape-usuario__nome">{usuario.nome}</span>
      <button type="button" className="rodape-usuario__sair" onClick={handleSair}>
        Sair
      </button>
    </div>
  )
}

export default RodapeUsuario
