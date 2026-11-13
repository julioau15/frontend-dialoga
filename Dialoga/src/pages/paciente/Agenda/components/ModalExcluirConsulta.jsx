// ============================================================
// ModalExcluirConsulta (paciente)
// Pop-up de confirmação "Excluir consulta".
// Props: consulta (a que será excluída), onFechar, onConfirmar
// ============================================================
import Modal from '../../../../components/Modal'
import Button from '../../../../components/Button'
import { dataCurta } from '../../../../utils/datasAgenda'

export default function ModalExcluirConsulta({ consulta, onFechar, onConfirmar }) {
  return (
    <Modal
      aberto
      comDivisores
      largura="max-w-[360px]"
      titulo="Excluir consulta"
      onFechar={onFechar}
      rodape={
        <>
          <Button type="button" variante="suave" larguraAuto onClick={onFechar}>Cancelar</Button>
          <Button type="button" variante="perigo" larguraAuto onClick={onConfirmar}>Excluir</Button>
        </>
      }
    >
      <p className="text-[12px] leading-relaxed text-secundaria">
        Tem certeza que deseja excluir a consulta{' '}
        <strong>{consulta.titulo || consulta.profissional}</strong> em{' '}
        <strong>{dataCurta(consulta.data)} às {consulta.hora}</strong>? Esta ação não pode ser desfeita.
      </p>
    </Modal>
  )
}
