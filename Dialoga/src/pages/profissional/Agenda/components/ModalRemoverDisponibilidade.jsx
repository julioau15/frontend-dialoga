// ============================================================
// ModalRemoverDisponibilidade
// Pop-up de confirmação para remover uma disponibilidade (RF37, RF40).
// Frame: Remover disponibilidade - Profissional
// Props:
//   item        -> disponibilidade escolhida ({ dia, inicio, fim, tipo, data? })
//   onFechar    -> fecha sem remover (X, fundo escuro, Esc ou Cancelar)
//   onConfirmar -> remove de fato (a página tira da lista e mostra o toast)
// ============================================================
import Modal from '../../../../components/Modal'
import Button from '../../../../components/Button'
import { DIAS, faixaDeHorario } from '../../../../utils/disponibilidade'
import { dataCurta } from '../../../../utils/datasAgenda'

const nomeDoDia = (dia) => DIAS.find((d) => d.id === dia)?.nome ?? ''

export default function ModalRemoverDisponibilidade({ item, onFechar, onConfirmar }) {
  const repeticao = item.tipo === 'unica' ? `única vez, em ${dataCurta(item.data)}` : 'toda semana'

  return (
    <Modal
      aberto
      comDivisores
      largura="max-w-[420px]"
      titulo="Remover disponibilidade"
      onFechar={onFechar}
      rodape={
        <>
          <Button type="button" variante="suave" larguraAuto onClick={onFechar}>Cancelar</Button>
          <Button type="button" variante="perigo" larguraAuto onClick={onConfirmar}>Remover</Button>
        </>
      }
    >
      <p className="text-[12px] leading-relaxed text-secundaria">
        Tem certeza que deseja remover a disponibilidade de{' '}
        <strong className="font-extrabold text-texto">{nomeDoDia(item.dia)}</strong>, das{' '}
        <strong className="font-bold text-texto">{faixaDeHorario(item)}</strong> ({repeticao})? Os pacientes não
        poderão mais agendar nesse horário.
      </p>
    </Modal>
  )
}
