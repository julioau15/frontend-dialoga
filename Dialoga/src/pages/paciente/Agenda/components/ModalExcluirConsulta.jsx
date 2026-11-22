// ============================================================
// ModalExcluirConsulta (paciente)
// Pop-up de confirmação "Excluir consulta", como no Figma ("Excluir consulta - Paciente"):
// 384px, cabeçalho de 16px, texto de 14px e os botões Cancelar e Excluir (vermelho) de 44px,
// com as mesmas medidas dos pop-ups "Excluir tratamento" e "Excluir profissional".
// Props: consulta (a que será excluída), onFechar, onConfirmar
// ============================================================
import Modal from '../../../../components/Modal'
import Button from '../../../../components/Button'
import { AJUSTE_MODAL, BOTAO_CLARO, BOTAO_PRINCIPAL, LARGURA_CONFIRMACAO, TEXTO_CONFIRMACAO } from '../../../../components/Modal/estilosModal'
import { dataCurta } from '../../../../utils/datasAgenda'

export default function ModalExcluirConsulta({ consulta, onFechar, onConfirmar }) {
  return (
    <div className={AJUSTE_MODAL}>
      <Modal
        aberto
        comDivisores
        largura={LARGURA_CONFIRMACAO}
        titulo="Excluir consulta"
        onFechar={onFechar}
        rodape={
          <>
            <Button type="button" variante="suave" larguraAuto className={BOTAO_CLARO} onClick={onFechar}>Cancelar</Button>
            <Button type="button" variante="perigo" larguraAuto className={BOTAO_PRINCIPAL} onClick={onConfirmar}>Excluir</Button>
          </>
        }
      >
        <p className={TEXTO_CONFIRMACAO}>
          Tem certeza que deseja excluir a consulta{' '}
          <strong className="font-bold text-texto">{consulta.titulo || consulta.profissional}</strong> em{' '}
          <strong className="font-bold text-texto">{dataCurta(consulta.data)} às {consulta.hora}</strong>? Esta ação não pode ser desfeita.
        </p>
      </Modal>
    </div>
  )
}
