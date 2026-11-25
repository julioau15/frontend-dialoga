import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { nomeDaSidebar } from '../../utils/formatadores'
import { IconeUsuario } from '../Icones'
import BotaoTema from '../BotaoTema'
import logoPadrao from '../../assets/auth/logo-dialoga.png'

// ajuste nomes e extensões para os arquivos reais de src/assets/sidebar
import iconeDashboard from '../../assets/sidebar/dashboard.png'
import iconeAgenda from '../../assets/sidebar/agenda.png'
import iconeTarefas from '../../assets/sidebar/tarefas.png'
import iconeTratamentos from '../../assets/sidebar/tratamentos.png'
import iconeProfissionais from '../../assets/sidebar/profissionais.png'
import iconePacientes from '../../assets/sidebar/profissionais.png'
import iconeRelatorios from '../../assets/sidebar/relatorios.png'
import iconeNotificacoes from '../../assets/sidebar/notificacao.png'
import iconePerfil from '../../assets/sidebar/perfil.png'
import iconeSair from '../../assets/sidebar/sair.png'

const icones = {
  dashboard: iconeDashboard,
  agenda: iconeAgenda,
  tarefas: iconeTarefas,
  tratamentos: iconeTratamentos,
  profissionais: iconeProfissionais,
  pacientes: iconePacientes,
  relatorios: iconeRelatorios,
  notificacoes: iconeNotificacoes,
  perfil: iconePerfil,
  sair: iconeSair,
}

// A sidebar fixa aparece a partir de `lg` (1024px).
// Abaixo disso (tablet e celular) o menu vira uma gaveta com barra superior.
const QUERY_DESKTOP = '(min-width: 1024px)'

function IconeMenu({ nome, ativo = false, tamanho = 18 }) {
  const src = icones[nome]
  if (!src) return null

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      width={tamanho}
      height={tamanho}
      className={`shrink-0 ${ativo ? 'brightness-0 invert' : ''}`}
    />
  )
}

const classeLink = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
    isActive
      ? 'bg-primaria bg-botao text-branco shadow-md'
      : 'text-secundaria hover:bg-fundo-card'
  }`

function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return ''
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

function Avatar({ nome, foto }) {
  // guarda QUAL foto falhou: se a foto mudar, tenta carregar de novo (sem setState em efeito)
  const [fotoComErro, setFotoComErro] = useState(null)
  const erro = fotoComErro === foto

  if (foto && !erro) {
    return (
      <img
        src={foto}
        alt={`Foto de ${nome}`}
        onError={() => setFotoComErro(foto)}
        className="h-16 w-16 rounded-full object-cover"
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className="flex h-16 w-16 items-center justify-center rounded-full bg-borda-forte text-xl font-bold text-primaria-texto"
    >
      {iniciais(nome)}
    </div>
  )
}

function IconeHamburguer() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function IconeFechar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

// Conteúdo compartilhado entre a sidebar fixa (desktop) e a gaveta (tablet/mobile)
// nome (dois primeiros nomes do profissional; primeiro nome dos outros) e, embaixo, a função
function ConteudoMenu({ nome, foto, funcao, nivel, itens, onSair }) {
  const nomeExibido = nomeDaSidebar(nome, nivel)

  return (
    <>
      {/* Usuário */}
      {nome && (
        <div className="flex flex-col items-center gap-2 border-b border-borda px-4 py-6">
          <Avatar nome={nome} foto={foto} />
          <span className="flex flex-col items-center gap-1 text-center">
            <span className="text-sm font-bold text-texto">{nomeExibido}</span>
            {/* função em selo de pílula, no mesmo formato do selo "Admin" do menu do administrador */}
            {funcao && (
              <span className="inline-flex h-[22px] items-center gap-1 rounded-full border border-borda-forte bg-fundo-card px-2.5 text-[10.5px] font-semibold text-primaria-texto">
                <IconeUsuario tamanho={11} />
                {funcao}
              </span>
            )}
          </span>
        </div>
      )}

      {/* Menu */}
      <nav aria-label="Menu principal" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3">
        {itens.map(({ rotulo, caminho, icone }) => (
          <NavLink key={caminho} to={caminho} className={classeLink}>
            {({ isActive }) => (
              <>
                {icone && <IconeMenu nome={icone} ativo={isActive} />}
                {rotulo}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Tema + Sair */}
      <div className="flex flex-col gap-1 border-t border-borda px-3 py-3">
        <BotaoTema comRotulo />
        <button
          type="button"
          onClick={onSair}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-secundaria transition-colors hover:bg-erro-fundo hover:text-erro-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
        >
          <IconeMenu nome="sair" />
          Sair da conta
        </button>
      </div>
    </>
  )
}

// itens: [{ rotulo, caminho, icone? }]  (icone = chave do objeto `icones` acima)
function Sidebar({ logo = logoPadrao, nome = '', foto, funcao = '', nivel, itens = [], onSair }) {
  const [aberto, setAberto] = useState(false)
  const { pathname } = useLocation()
  const botaoMenuRef = useRef(null)
  const botaoFecharRef = useRef(null)
  const jaAbriu = useRef(false)

  const fechar = () => setAberto(false)

  // fecha ao navegar (ajuste de estado durante a renderização, sem efeito)
  const [rotaAtual, setRotaAtual] = useState(pathname)
  if (rotaAtual !== pathname) {
    setRotaAtual(pathname)
    setAberto(false)
  }

  // fecha ao ir para o layout desktop (ex.: girar o tablet)
  useEffect(() => {
    const mq = window.matchMedia(QUERY_DESKTOP)
    const aoMudar = (e) => e.matches && setAberto(false)
    mq.addEventListener('change', aoMudar)
    return () => mq.removeEventListener('change', aoMudar)
  }, [])

  // Esc fecha e trava o scroll da página enquanto a gaveta está aberta
  useEffect(() => {
    if (!aberto) return

    const aoPressionar = (e) => e.key === 'Escape' && setAberto(false)
    document.addEventListener('keydown', aoPressionar)

    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', aoPressionar)
      document.body.style.overflow = overflowAnterior
    }
  }, [aberto])

  // gerencia o foco: vai para o X ao abrir e volta para o hambúrguer ao fechar
  useEffect(() => {
    if (aberto) {
      jaAbriu.current = true
      botaoFecharRef.current?.focus()
    } else if (jaAbriu.current) {
      botaoMenuRef.current?.focus()
    }
  }, [aberto])

  const sair = () => {
    fechar()
    onSair?.()
  }

  return (
    <>
      {/* ===== Tablet / mobile: barra superior ===== */}
      <header className="sticky top-0 z-30 grid h-16 grid-cols-[2.75rem_1fr_2.75rem] items-center border-b border-borda bg-superficie px-3 lg:hidden">
        <button
          ref={botaoMenuRef}
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
          aria-expanded={aberto}
          aria-controls="menu-gaveta"
          className="flex h-11 w-11 items-center justify-center rounded-xl text-secundaria transition-colors hover:bg-fundo-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
        >
          <IconeHamburguer />
        </button>
        <img src={logo} alt="Dialoga" className="logo-tema mx-auto h-9" />
        <BotaoTema />
      </header>

      {/* ===== Tablet / mobile: gaveta ===== */}
      <div className="lg:hidden">
        {/* Overlay */}
        <div
          onClick={fechar}
          aria-hidden="true"
          className={`fixed inset-0 z-40 bg-overlay backdrop-blur-sm transition-opacity duration-300 ${
            aberto ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />

        {/* Painel */}
        <aside
          id="menu-gaveta"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          aria-hidden={!aberto}
          className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col rounded-r-3xl bg-superficie shadow-xl transition-[transform,visibility] duration-300 ease-out ${
            aberto ? 'visible translate-x-0' : 'invisible -translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-borda py-3 pl-6 pr-3">
            <img src={logo} alt="Dialoga" className="logo-tema h-9" />
            <button
              ref={botaoFecharRef}
              type="button"
              onClick={fechar}
              aria-label="Fechar menu"
              className="flex h-11 w-11 items-center justify-center rounded-xl text-secundaria transition-colors hover:bg-fundo-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
            >
              <IconeFechar />
            </button>
          </div>

          <ConteudoMenu nome={nome} foto={foto} funcao={funcao} nivel={nivel} itens={itens} onSair={sair} />
        </aside>
      </div>

      {/* ===== Desktop: sidebar fixa ===== */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-borda bg-superficie lg:flex">
        <div className="flex items-center justify-center border-b border-borda px-4 py-3">
          <img src={logo} alt="Dialoga" className="logo-tema h-9" />
        </div>

        <ConteudoMenu nome={nome} foto={foto} funcao={funcao} nivel={nivel} itens={itens} onSair={onSair} />
      </aside>
    </>
  )
}

export default Sidebar