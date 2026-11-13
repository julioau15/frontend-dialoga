// ============================================================
// ModalConfirmarEnvio
// Pop-up "Confirmar envio" (frame "Adicionar tarefa - Paciente").
// Props: aberto, onCancelar(), onConfirmar()
// ============================================================
import Button from '../../../../components/Button'
import Modal from '../../../../components/Modal'

export default function ModalConfirmarEnvio({ aberto, onCancelar, onConfirmar }) {
  return (
    <Modal
      aberto={aberto}
      titulo="Confirmar envio"
      onFechar={() => { if (aberto) onCancelar() }}
      comDivisores
      largura="max-w-[360px]"
      rodape={
        <>
          <Button type="button" variante="suave" larguraAuto className="px-4" onClick={onCancelar}>Cancelar</Button>
          <Button type="button" larguraAuto className="px-4" onClick={onConfirmar}>Confirmar envio</Button>
        </>
      }
    >
      <p className="text-[12px] leading-relaxed text-secundaria">
        Após o envio, as respostas serão compartilhadas com seu profissional e não poderão ser alteradas.
      </p>
    </Modal>
  )
}
