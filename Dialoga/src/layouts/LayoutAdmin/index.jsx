// ============================================================
// layouts/LayoutAdmin
// Moldura de todas as telas do administrador: menu lateral (logo, perfil,
// navegação, sair) + área da página (<Outlet />).
// Em telas pequenas o menu vira uma faixa no topo.
// ============================================================
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Logo from '../../components/Logo'
import { IconeCheck, IconeEscudo, IconeSair, IconeUsuario, IconeUsuarios } from '../../components/Icones'
import { iniciais } from '../../utils/formatadores'

const LINKS = [
  { para: '/admin/dashboard', rotulo: 'Aprovações', Icone: IconeCheck },
  { para: '/admin/administradores', rotulo: 'Administradores', Icone: IconeUsuarios },
  { para: '/admin/perfil', rotulo: 'Perfil', Icone: IconeUsuario },
]

const classeLink = ({ isActive }) =>
  `flex items-center gap-3 h-10 px-3.5 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-[background] duration-200 ease-[ease] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
    isActive ? 'bg-primaria text-branco' : 'text-secundaria hover:bg-fundo-suave'
  }`

function LayoutAdmin() {
  const { perfil, logout } = useAuth()
  const nome = perfil?.nome ?? 'Administrador' // vem de GET /administradores/:id (AuthContext)
  const navigate = useNavigate()

  // apaga a sessão salva e volta para a tela de login
  function sair() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-svh md:flex bg-fundo-suave">
      <aside className="flex flex-col bg-branco border-b md:border-b-0 md:border-r border-borda md:w-[238px] md:shrink-0 md:sticky md:top-0 md:h-svh">
        <div className="grid place-items-center py-3 border-b border-borda">
          {/* tamanho menor que o padrão do Logo (o "!" faz esta classe vencer) */}
          <Logo className="w-[150px]! h-[51px]!" />
        </div>

        <div className="hidden md:flex flex-col items-center gap-1 px-4 py-5 border-b border-borda">
          <span className="grid place-items-center w-[60px] h-[60px] rounded-full bg-borda-forte text-[18px] font-extrabold text-primaria" aria-hidden="true">
            {iniciais(nome)}
          </span>
          <p className="mt-1 text-[13px] font-bold text-texto">{nome}</p>
          <span className="inline-flex items-center gap-1 h-[22px] px-2.5 bg-alerta-fundo border border-alerta-borda rounded-full text-[10.5px] font-semibold text-alerta-escura">
            <IconeEscudo tamanho={11} />
            Admin
          </span>
        </div>

        <nav aria-label="Menu do administrador" className="flex md:flex-col gap-1 p-3 overflow-x-auto">
          {LINKS.map(({ para, rotulo, Icone }) => (
            <NavLink key={para} to={para} className={classeLink}>
              <Icone tamanho={15} />
              {rotulo}
            </NavLink>
          ))}
        </nav>

        <div className="md:mt-auto p-3 border-t border-borda">
          <button
            type="button"
            onClick={sair}
            className="flex items-center gap-3 w-full h-10 px-3.5 rounded-xl text-[12px] text-secundaria bg-transparent border-0 cursor-pointer hover:bg-fundo-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
          >
            <IconeSair tamanho={15} />
            Sair da conta
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}

export default LayoutAdmin
