// ============================================================
// components/BotaoTema
// Botão que troca entre o tema claro e o escuro.
// Props:
//   comRotulo -> false (padrão): só o ícone (sol/lua), quadrado
//                true: linha larga com texto "Modo escuro" / "Modo claro" (para dentro de menus)
//   className -> classes extras (opcional)
// ============================================================
import { useTema } from '../../hooks/useTema'

function IconeLua() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  )
}

function IconeSol() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria'

export default function BotaoTema({ comRotulo = false, className = '' }) {
  const { escuro, alternarTema } = useTema()

  // o texto/ícone mostram para ONDE o clique vai levar
  const rotulo = escuro ? 'Modo claro' : 'Modo escuro'
  const Icone = escuro ? IconeSol : IconeLua

  if (comRotulo) {
    return (
      <button
        type="button"
        onClick={alternarTema}
        className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-secundaria transition-colors hover:bg-fundo-card cursor-pointer ${FOCO} ${className}`}
      >
        <Icone />
        {rotulo}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={alternarTema}
      aria-label={`Ativar ${rotulo.toLowerCase()}`}
      title={rotulo}
      className={`flex h-11 w-11 items-center justify-center rounded-xl text-secundaria transition-colors hover:bg-fundo-card cursor-pointer ${FOCO} ${className}`}
    >
      <Icone />
    </button>
  )
}
