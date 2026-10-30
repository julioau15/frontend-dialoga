// ============================================================
// ModalProfissionalEncontrado
// Aviso mostrado quando o paciente escolhe um profissional na busca.
// Só layout: nenhuma lógica aqui.
// Props:
//   aberto    -> mostra ou esconde o modal
//   nome      -> nome do profissional encontrado
//   onFechar  -> chamado ao fechar (X, fundo escuro ou Esc)
//   onEntendi -> chamado ao clicar em "Entendi"
// ============================================================
import Modal from '../../../../../components/Modal'
import Button from '../../../../../components/Button'

export default function ModalProfissionalEncontrado({ aberto, nome, onFechar, onEntendi }) {
  return (
    <Modal aberto={aberto} titulo="Profissional encontrado" onFechar={onFechar}>
      <div className="flex items-start gap-2 mt-4">
        <svg className="mt-0.5 shrink-0 text-primaria" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
        <p className="text-[12px] text-texto">
          Seu profissional foi localizado e recebeu uma notificação informando que você deseja adicioná-lo.
        </p>
      </div>

      <p className="mt-4 p-3 bg-fundo-card border border-borda-forte rounded-lg text-[11px] text-texto">
        Após a confirmação de <strong className="font-bold">{nome}</strong>, seu vínculo será criado e você poderá
        compartilhar seus dados.
      </p>

      <div className="mt-5">
        <Button type="button" onClick={onEntendi}>Entendi</Button>
      </div>
    </Modal>
  )
}
