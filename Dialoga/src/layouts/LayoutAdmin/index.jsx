// ============================================================
// layouts/LayoutAdmin
// Moldura de todas as telas do administrador: menu lateral (logo, perfil,
// navegação, sair) + área da página (<Outlet />).
// Em telas pequenas o menu vira uma faixa no topo.
// ============================================================
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Logo from '../../components/Logo'
import { iniciais } from '../../utils/formatadores'
import Button from '../../components/Button'
import { IconeAlerta, IconeCheck, IconeEscudo, IconeSair, IconeUsuario, IconeUsuarios } from '../../components/Icones'

const LINKS = [
  { para: '/admin/dashboard', rotulo: 'Aprovações', Icone: IconeCheck },
  { para: '/admin/administradores', rotulo: 'Administradores', Icone: IconeUsuarios },
  { para: '/admin/perfil', rotulo: 'Perfil', Icone: IconeUsuario },
]

const classeLink = ({ isActive }) =>
  `flex items-center gap-3 h-10 px-3.5 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-[background] duration-200 ease-[ease] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
    isActive ? 'bg-primaria text-branco' : 'text-secundaria hover:bg-fundo-suave'
  }`

// Foto do administrador no menu; sem foto (ou se a imagem não carregar) mostra as iniciais.
function AvatarAdmin({ nome, foto }) {
  // guarda QUAL url falhou: ao salvar uma foto nova a url muda e ela é tentada de novo
  const [fotoQuebrada, setFotoQuebrada] = useState(null)

  if (foto && foto !== fotoQuebrada) {
    return (
      <img
        src={foto}
        alt={`Foto de ${nome}`}
        onError={() => setFotoQuebrada(foto)}
        className="w-[60px] h-[60px] rounded-full object-cover"
      />
    )
  }

  return (
    <span className="grid place-items-center w-[60px] h-[60px] rounded-full bg-borda-forte text-[18px] font-extrabold text-primaria" aria-hidden="true">
      {iniciais(nome)}
    </span>
  )
}

function LayoutAdmin() {
  const { perfil, logout } = useAuth()
  const nome = perfil?.nome ?? 'Administrador' // vem de GET /administradores/:id (AuthContext)
  const foto = perfil?.fotoUrl ?? null
  const navigate = useNavigate()

  // apaga a sessão salva e volta para a tela de login
  function sair() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      {/* Regra de negócio: o administrador usa só computador.
          Abaixo de 1024px (lg) mostro apenas este aviso e o botão de sair. */}
      <section className="lg:hidden grid place-items-center min-h-svh px-6 bg-fundo-suave text-center">
        <div className="flex flex-col items-center gap-3 max-w-[320px]">
          <Logo className="w-[150px]! h-[51px]!" />
          <IconeAlerta tamanho={28} className="mt-4 text-primaria" />
          <h1 className="text-[18px] font-extrabold text-texto">Acesse pelo computador</h1>
          <p className="text-[13px] text-secundaria">
            A área administrativa do Dialoga está disponível apenas no computador.
          </p>
          <div className="w-full mt-2">
            <Button type="button" variante="suave" onClick={sair}>Sair da conta</Button>
          </div>
        </div>
      </section>

      {/* Antes era "min-h-svh md:flex bg-fundo-suave": agora o painel só aparece a partir de 1024px */}
      <div className="hidden lg:flex min-h-svh bg-fundo-suave">
        <aside className="flex flex-col bg-branco border-b md:border-b-0 md:border-r border-borda md:w-[238px] md:shrink-0 md:sticky md:top-0 md:h-svh">
          <div className="grid place-items-center py-3 border-b border-borda">
            {/* tamanho menor que o padrão do Logo (o "!" faz esta classe vencer) */}
            <Logo className="w-[150px]! h-[51px]!" />
          </div>

          <div className="hidden md:flex flex-col items-center gap-1 px-4 py-5 border-b border-borda">
            <AvatarAdmin nome={nome} foto={foto} />
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
    </>
  )
}

export default LayoutAdmin