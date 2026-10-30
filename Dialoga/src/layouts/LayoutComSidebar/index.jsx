import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from '../../components/SideBar/Sidebar'

// Layout base: todos os layouts por nível usam este
function LayoutComSidebar({ itens }) {
  const { perfil, logout } = useAuth()
  const navigate = useNavigate()
  console.log(perfil)

  // apaga a sessão salva e volta para a tela de login
  function sair() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar
        nome={perfil?.nome}
        foto={perfil?.fotoUrl}
        itens={itens}
        onSair={sair}
      />
      <main className="min-w-0 flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default LayoutComSidebar