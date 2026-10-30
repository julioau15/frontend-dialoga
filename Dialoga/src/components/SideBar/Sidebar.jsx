import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

const classeLink = ({ isActive }) =>
  `flex items-center rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B4EA3] ${
    isActive
      ? 'bg-[#7B4EA3] text-white shadow-md'
      : 'text-[#7D7490] hover:bg-[#F3EEF9]'
  }`

function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return ''
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

function Avatar({ nome, foto }) {
  const [erro, setErro] = useState(false)

  // se a foto mudar, tenta carregar de novo
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
function Sidebar({ logo = '/logo.png', nome = '', foto, itens = [], onSair }) {
  const primeiroNome = nome.trim().split(/\s+/)[0]

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
          <span className="text-sm font-bold text-[#2B1B3D]">{primeiroNome}</span>
        </div>
      )}

      {/* Menu */}
      <nav
        aria-label="Menu principal"
        className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-1 md:flex-col md:overflow-y-auto"
      >
        {itens.map(({ rotulo, caminho }) => (
          <NavLink key={caminho} to={caminho} className={classeLink}>
            {rotulo}
          </NavLink>
        ))}
      </nav>

      {/* Sair */}
      <div className="hidden border-t border-[#E8E3F0] px-3 py-3 md:block">
        <button
          type="button"
          onClick={onSair}
          className="flex w-full items-center rounded-xl px-4 py-2.5 text-sm text-[#7D7490] transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7B4EA3]"
        >
          Sair da conta
        </button>
      </div>
    </aside>
  )
}

export default Sidebar