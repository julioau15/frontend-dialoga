// ============================================================
// ModalConfirmarEnvio
// Pop-up "Confirmar envio" (frame "Adicionar tarefa - Paciente"), com as mesmas medidas
// das outras confirmações do paciente (384px, cabeçalho de 16px, texto de 14px, botões de 44px).
// Props: aberto, onCancelar(), onConfirmar()
// ============================================================
import Button from '../../../../components/Button'
import Modal from '../../../../components/Modal'
import { AJUSTE_MODAL, BOTAO_CLARO, BOTAO_PRINCIPAL, LARGURA_CONFIRMACAO, TEXTO_CONFIRMACAO } from '../../../../components/Modal/estilosModal'

export default function ModalConfirmarEnvio({ aberto, onCancelar, onConfirmar }) {
  return (
    <div className={AJUSTE_MODAL}>
      <Modal
        aberto={aberto}
        titulo="Confirmar envio"
        onFechar={() => { if (aberto) onCancelar() }}
        comDivisores
        largura={LARGURA_CONFIRMACAO}
        rodape={
          <>
            <Button type="button" variante="suave" larguraAuto className={BOTAO_CLARO} onClick={onCancelar}>Cancelar</Button>
            <Button type="button" larguraAuto className={BOTAO_PRINCIPAL} onClick={onConfirmar}>Confirmar envio</Button>
          </>
        }
      >
        <p className={TEXTO_CONFIRMACAO}>
          Após o envio, as respostas serão compartilhadas com seu profissional e não poderão ser alteradas.
        </p>
      </Modal>
    </div>
  )
}
