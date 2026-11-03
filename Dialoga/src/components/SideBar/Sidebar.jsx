import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

import dashboard from '../../assets/sidebar/dashboard.png'
import relatorios from '../../assets/sidebar/relatorios.png'
import tratamentos from '../../assets/sidebar/tratamentos.png'
import agenda from '../../assets/sidebar/agenda.png'
import profissionais from '../../assets/sidebar/profissionais.png'
import pacientes from '../../assets/sidebar/profissionais.png'
import tarefas from '../../assets/sidebar/tarefas.png'
import notificacoes from '../../assets/sidebar/notificacao.png'
import perfil from '../../assets/sidebar/perfil.png'
import sair from '../../assets/sidebar/sair.png'
import logo from '../../assets/sidebar/logo.png'

const icones = {
  Dashboard: dashboard,
  Relatórios: relatorios,
  Tratamentos: tratamentos,
  Agenda: agenda,
  Profissionais: profissionais,
  Pacientes: pacientes,
  Tarefas: tarefas,
  Notificações: notificacoes,
  Perfil: perfil,
}

const classeLink = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B4EA3] ${
    isActive
      ? 'bg-[#7B4EA3] text-white shadow-md'
      : 'text-[#7D7490] hover:bg-[#F3EEF9]'
  }`

const PARTICULAS = ['de', 'da', 'do', 'das', 'dos', 'e']

function doisPrimeirosNomes(nome = '') {
  return nome
    .trim()
    .split(/\s+/)
    .filter((p) => p && !PARTICULAS.includes(p.toLowerCase()))
    .slice(0, 2)
}

function iniciais(nome = '') {
  const partes = doisPrimeirosNomes(nome)
  if (partes.length === 0) return ''
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[1][0]).toUpperCase()
}

function Avatar({ nome, foto }) {
  const [erro, setErro] = useState(false)

  useEffect(() => {
    setErro(false)
  }, [foto])

  if (foto && !erro) {
    return (
      <img
        src={foto}
        alt={`Foto de ${nome}`}
        onError={() => setErro(true)}
        className="h-16 w-16 rounded-full object-cover"
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DDD0EF] text-xl font-bold text-[#7B4EA3]"
    >
      {iniciais(nome)}
    </div>
  )
}

// itens: [{ rotulo, caminho }]
function Sidebar({nome = '', foto, itens = [], onSair }) {
  const nomeExibido = doisPrimeirosNomes(nome).join(' ')

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[#E8E3F0] bg-white md:sticky md:top-0 md:h-screen md:w-64 md:border-r md:border-b-0">
      {/* Logo */}
      <div className="flex items-center justify-center border-b border-[#E8E3F0] px-4 py-3">
        <img src={logo} alt="Dialoga" className="h-9" />
      </div>

      {/* Usuário (só em telas maiores) */}
      {nome && (
        <div className="hidden flex-col items-center gap-2 border-b border-[#E8E3F0] px-4 py-6 md:flex">
          <Avatar nome={nome} foto={foto} />
          <span className="text-sm font-bold text-[#2B1B3D]">{nomeExibido}</span>
        </div>
      )}

      {/* Menu */}
      <nav
        aria-label="Menu principal"
        className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-1 md:flex-col md:overflow-y-auto"
      >
        {itens.map(({ rotulo, caminho }) => (
          <NavLink key={caminho} to={caminho} className={classeLink}>
            {({ isActive }) => (
              <>
                <img
                  src={icones[rotulo]}
                  alt=""
                  className={`h-[18px] w-[18px] ${isActive ? 'brightness-0 invert' : ''}`}
                />
                {rotulo}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sair */}
      <div className="hidden border-t border-[#E8E3F0] px-3 py-3 md:block">
        <button
          type="button"
          onClick={onSair}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#7D7490] transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B4EA3]"
        >
          <img src={sair} alt="" className="h-[18px] w-[18px]" />
          Sair da conta
        </button>
      </div>
    </aside>
  )
}

export default Sidebar