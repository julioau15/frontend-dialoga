// ============================================================
// CartaoSolicitacao
// Uma linha da lista: avatar, nome, especialidade · clínica, data de envio,
// selo de status e (só se estiver pendente) botões de aprovar e recusar.
// Props:
//   solicitacao -> { nome, especialidade, clinica, enviadoEm, status }
//   onAbrir     -> clique na linha (abre o modal com os detalhes)
//   onAprovar   -> clique no ✓ (abre a confirmação de aprovação)
//   onRecusar   -> clique no ✕ (abre a confirmação de recusa)
// ============================================================
import { IconeCheck, IconeRelogio, IconeX } from '../../../../../components/Icones'
import { formatarData, iniciais } from '../../../../../utils/formatadores'
import SeloStatus from '../SeloStatus'

const BOTAO_ACAO =
  'grid place-items-center w-7 h-7 border rounded-md cursor-pointer transition-[background] duration-200 ease-[ease] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria'

export default function CartaoSolicitacao({ solicitacao, onAbrir, onAprovar, onRecusar }) {
  const { nome, especialidade, clinica, enviadoEm, status } = solicitacao
  const detalhe = [especialidade, clinica].filter(Boolean).join(' · ')

  return (
    <li className="flex items-center gap-3 p-4 bg-branco border border-borda rounded-xl shadow-[0_2px_6px_var(--color-sombra)]">
      {/* Área clicável: abre os detalhes */}
      <button
        type="button"
        onClick={onAbrir}
        aria-label={`Ver solicitação de ${nome}`}
        className="flex items-center flex-1 min-w-0 gap-3 text-left bg-transparent border-0 p-0 cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primaria"
      >
        <span className="grid place-items-center shrink-0 w-10 h-10 rounded-lg bg-borda-forte text-[12px] font-bold text-primaria-escura" aria-hidden="true">
          {iniciais(nome)}
        </span>

        <span className="flex flex-col flex-1 min-w-0 gap-0.5">
          <span className="text-[13px] font-bold text-texto">{nome}</span>
          {detalhe && <span className="text-[11px] text-secundaria">{detalhe}</span>}
          <span className="flex items-center gap-1 text-[10.5px] text-secundaria">
            <IconeRelogio tamanho={11} />
            Enviado em {formatarData(enviadoEm)}
          </span>
        </span>

        <SeloStatus status={status} />
      </button>

      {status === 'pendente' && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={`Aprovar ${nome}`}
            onClick={onAprovar}
            className={`${BOTAO_ACAO} bg-sucesso-fundo border-sucesso-borda-suave text-sucesso hover:bg-sucesso-borda-suave`}
          >
            <IconeCheck tamanho={14} />
          </button>
          <button
            type="button"
            aria-label={`Recusar ${nome}`}
            onClick={onRecusar}
            className={`${BOTAO_ACAO} bg-erro-fundo border-erro-borda text-erro hover:bg-erro-fundo-2`}
          >
            <IconeX tamanho={14} />
          </button>
        </div>
      )}
    </li>
  )
}
