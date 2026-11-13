// ============================================================
// components/CabecalhoNotificacoes
// Cabeçalho da página de Notificações: título, "N não lidas", botão
// "Marcar todas" (só quando há não lidas) e botão da engrenagem.
// Props:
//   naoLidas          -> quantidade de notificações não lidas
//   onMarcarTodas     -> chamado ao clicar em "Marcar todas"
//   rotaConfiguracoes -> rota da tela de configurações de notificação
//   onAbrirModal      -> opcional; quando informado, a engrenagem abre o modal
//                        a partir de 768px e leva à tela de configurações abaixo disso
// ============================================================
import { Link } from 'react-router-dom'
import { IconeCheck } from '../Icones'

const CLASSE_ENGRENAGEM =
  'h-9 w-9 shrink-0 place-items-center rounded-lg border border-borda bg-branco text-secundaria cursor-pointer hover:bg-fundo-suave-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria'

// Ícone de engrenagem (traço, estilo Lucide)
function IconeEngrenagem() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

// Exibe o cabeçalho da página de Notificações
export default function CabecalhoNotificacoes({ naoLidas, onMarcarTodas, rotaConfiguracoes, onAbrirModal }) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-[22px] font-extrabold text-texto lg:text-[24px]">Notificações</h1>
        <p className="mt-1 text-[13px] text-secundaria">
          {naoLidas} {naoLidas === 1 ? 'não lida' : 'não lidas'}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Marca todas como lidas; some quando não há não lidas */}
        {naoLidas > 0 && (
          <button
            type="button"
            onClick={onMarcarTodas}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-borda-forte bg-branco px-3 text-[11px] font-semibold text-primaria cursor-pointer hover:bg-fundo-suave-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
          >
            <IconeCheck tamanho={12} />
            Marcar todas
          </button>
        )}

        {/* Engrenagem que leva à tela de configurações (abaixo de 768px quando há modal) */}
        <Link
          to={rotaConfiguracoes}
          aria-label="Configurações de notificações"
          className={`${onAbrirModal ? 'grid md:hidden' : 'grid'} ${CLASSE_ENGRENAGEM}`}
        >
          <IconeEngrenagem />
        </Link>

        {/* Engrenagem que abre o modal de configurações (a partir de 768px) */}
        {onAbrirModal && (
          <button
            type="button"
            aria-label="Configurações de notificações"
            onClick={onAbrirModal}
            className={`hidden md:grid ${CLASSE_ENGRENAGEM}`}
          >
            <IconeEngrenagem />
          </button>
        )}
      </div>
    </header>
  )
}
