// ============================================================
// ModalExcluirPergunta
// Pop-up de confirmação para excluir uma pergunta da Nova tarefa,
// no mesmo estilo dos pop-ups "Adicionar prazo?" e "Confirmar envio".
// "Cancelar", X, Esc ou clique fora fecham sem excluir.
// Props: numero (número da pergunta; null = fechado), onFechar(), onConfirmar()
// ============================================================
import Modal from '../../../../components/Modal'
import { BOTAO_CLARO, BOTAO_PERIGO } from './estilos'

export default function ModalExcluirPergunta({ numero, onFechar, onConfirmar }) {
  const aberto = numero !== null

  return (
    <Modal
      aberto={aberto}
      titulo="Excluir pergunta"
      onFechar={() => { if (aberto) onFechar() }}
      comDivisores
      largura="max-w-[384px]"
      rodape={
        <>
          <button type="button" className={`${BOTAO_CLARO} px-4`} onClick={onFechar}>Cancelar</button>
          <button type="button" className={`${BOTAO_PERIGO} px-5`} onClick={onConfirmar}>Excluir pergunta</button>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed text-secundaria">
        Tem certeza que deseja excluir a <strong className="font-bold text-texto">Pergunta {numero}</strong>? Essa ação não pode ser desfeita.
      </p>
    </Modal>
  )
}
