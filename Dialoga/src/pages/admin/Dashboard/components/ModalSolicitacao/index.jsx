// ============================================================
// ModalSolicitacao
// "Solicitação de acesso": dados do profissional + botões Recusar / Aprovar.
// Se a solicitação já foi decidida, não mostra os botões de decisão (só "Fechar").
// Props:
//   solicitacao -> a solicitação aberta (ou null com o modal fechado)
//   onFechar    -> fecha o modal (X, fundo escuro, Esc ou "Fechar")
//   onAprovar   -> clique em Aprovar (a página abre a confirmação)
//   onRecusar   -> clique em Recusar (a página abre a confirmação)
// ============================================================
import Modal from '../../../../../components/Modal'
import Button from '../../../../../components/Button'
import { IconeAlerta, IconeCheck, IconeEmail, IconeTelefone, IconeUsuario, IconeX } from '../../../../../components/Icones'
import { formatarCpf, iniciais } from '../../../../../utils/formatadores'
import SeloStatus from '../SeloStatus'

// Quadradinho de informação (rótulo com ícone + valor)
function Dado({ Icone, rotulo, valor }) {
  return (
    <div className="p-3 bg-fundo-card rounded-lg min-w-0">
      <p className="flex items-center gap-1.5 text-[10.5px] text-secundaria">
        <Icone tamanho={11} />
        {rotulo}
      </p>
      <p className="mt-1 text-[12px] font-semibold text-texto break-words">{valor || '—'}</p>
    </div>
  )
}

export default function ModalSolicitacao({ solicitacao, onFechar, onAprovar, onRecusar }) {
  const pendente = solicitacao?.status === 'pendente'

  const rodape = pendente ? (
    <>
      <Button type="button" variante="perigo-contorno" larguraAuto onClick={onRecusar}>
        <IconeX tamanho={13} />
        Recusar
      </Button>
      <Button type="button" variante="sucesso" larguraAuto onClick={onAprovar}>
        <IconeCheck tamanho={13} />
        Aprovar
      </Button>
    </>
  ) : (
    <Button type="button" variante="suave" larguraAuto onClick={onFechar}>Fechar</Button>
  )

  return (
    <Modal aberto={!!solicitacao} titulo="Solicitação de acesso" onFechar={onFechar} largura="max-w-[416px]" comDivisores rodape={rodape}>
      {solicitacao && (
        <>
          <div className="flex items-start gap-3 pb-4 border-b border-borda">
            <span className="grid place-items-center shrink-0 w-[52px] h-[52px] rounded-xl bg-borda-forte text-[18px] font-extrabold text-primaria" aria-hidden="true">
              {iniciais(solicitacao.nome)}
            </span>
            <div className="flex flex-col items-start gap-0.5 min-w-0">
              <p className="text-[14px] font-extrabold text-texto">{solicitacao.nome}</p>
              <p className="text-[12px] text-secundaria">{solicitacao.especialidade}</p>
              {solicitacao.clinica && <p className="text-[10.5px] text-secundaria">{solicitacao.clinica}</p>}
              <div className="mt-1"><SeloStatus status={solicitacao.status} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2.5 mt-4">
            <Dado Icone={IconeEmail} rotulo="E-mail" valor={solicitacao.email} />
            <Dado Icone={IconeTelefone} rotulo="Telefone" valor={solicitacao.telefone} />
            <Dado Icone={IconeUsuario} rotulo="CRP" valor={solicitacao.crp} />
            <Dado Icone={IconeUsuario} rotulo="CPF" valor={formatarCpf(solicitacao.cpf)} />
          </div>

          {pendente && (
            <p className="flex items-start gap-2 mt-4 p-3 bg-alerta-fundo border border-alerta-borda-suave rounded-lg text-[11px] text-alerta-escura">
              <IconeAlerta tamanho={13} className="mt-px shrink-0" />
              Ao aprovar ou recusar, o profissional será notificado automaticamente por e-mail.
            </p>
          )}
        </>
      )}
    </Modal>
  )
}
