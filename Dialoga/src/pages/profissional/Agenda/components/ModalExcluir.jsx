// ============================================================
// ModalExcluir
// Pop-up de confirmação para excluir uma consulta.
// Props: consulta, onFechar, onConfirmar
// ============================================================
import Modal from '../../../../components/Modal'
import Button from '../../../../components/Button'
import { dataCurta } from '../../../../utils/datasAgenda'

export default function ModalExcluir({ consulta, onFechar, onConfirmar }) {
  return (
    <Modal
      aberto
      comDivisores
      largura="max-w-[420px]"
      titulo="Detalhes da consulta"
      onFechar={onFechar}
      rodape={
        <>
          <Button type="button" variante="suave" larguraAuto onClick={onFechar}>Cancelar</Button>
          <Button type="button" variante="perigo" larguraAuto onClick={onConfirmar}>Confirmar exclusão</Button>
        </>
      }
    >
      <p className="text-[12px] leading-relaxed text-secundaria">
        Tem certeza que deseja excluir a consulta de{' '}
        <strong className="font-extrabold text-texto">{consulta.paciente}</strong> em{' '}
        <strong className="font-bold text-texto">{dataCurta(consulta.data)} às {consulta.hora}</strong>?
      </p>
    </Modal>
  )
}
