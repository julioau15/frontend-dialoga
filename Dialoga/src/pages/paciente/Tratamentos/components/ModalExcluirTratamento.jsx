// ============================================================
// ModalExcluirTratamento
// Pop-up de confirmação "Excluir tratamento" (RF357–RF360), como no Figma:
// "Tem certeza que deseja excluir este tratamento? Esta ação não pode ser desfeita."
// com os botões Cancelar e Excluir (vermelho). 384px de largura.
// Props: onFechar() (X, fundo escuro, Esc ou Cancelar) e onConfirmar() (Excluir)
// ============================================================
import Button from '../../../../components/Button'
import Modal from '../../../../components/Modal'
import { AJUSTE_MODAL, BOTAO_CLARO, BOTAO_PRINCIPAL } from './estilosTratamentos'

export default function ModalExcluirTratamento({ onFechar, onConfirmar }) {
  const rodape = (
    <>
      <Button type="button" variante="suave" larguraAuto className={BOTAO_CLARO} onClick={onFechar}>
        Cancelar
      </Button>
      <Button type="button" variante="perigo" larguraAuto className={BOTAO_PRINCIPAL} onClick={onConfirmar}>
        Excluir
      </Button>
    </>
  )

  return (
    <div className={AJUSTE_MODAL}>
      <Modal aberto comDivisores largura="max-w-[384px]" titulo="Excluir tratamento" onFechar={onFechar} rodape={rodape}>
        {/* -my-1: no Figma o texto tem 20px de respiro em cima e embaixo */}
        <p className="-my-1 text-[14px] leading-5 text-secundaria">
          Tem certeza que deseja excluir este tratamento? Esta ação não pode ser desfeita.
        </p>
      </Modal>
    </div>
  )
}
