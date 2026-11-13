// ============================================================
// ModalDetalhes
// Pop-up "Detalhes da consulta": título, paciente, data, horário, anotações e
// lembrete, com os botões Excluir e Editar.
// Props: consulta, onFechar, onEditar, onExcluir
// ============================================================
import Modal from '../../../../components/Modal'
import Button from '../../../../components/Button'
import { IconeLixeira } from '../../../../components/Icones'
import { IconeCalendarioPequeno, IconeRelogioPequeno, IconeSino } from '../../../../components/IconesAgenda'
import { doisPrimeirosNomes } from '../../../../utils/formatadores'
import { dataPorExtensoTitulo } from '../../../../utils/datasAgenda'

const iniciaisDe = (nome) => doisPrimeirosNomes(nome).map((parte) => parte[0]).join('').toUpperCase()

function Informacao({ icone, rotulo, children }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-borda bg-branco p-3">
      <span className="flex items-center gap-1 text-[10px] text-secundaria">{icone}{rotulo}</span>
      <span className="text-[12px] font-bold text-texto">{children}</span>
    </div>
  )
}

export default function ModalDetalhes({ consulta, onFechar, onEditar, onExcluir }) {
  const { titulo, paciente, especialidade, data, hora, anotacoes, lembrete } = consulta

  return (
    <Modal
      aberto
      comDivisores
      largura="max-w-[432px]"
      titulo="Detalhes da consulta"
      onFechar={onFechar}
      rodape={
        <>
          <Button type="button" variante="perigo-contorno" larguraAuto onClick={onExcluir}>
            <IconeLixeira tamanho={12} />
            Excluir
          </Button>
          <Button type="button" larguraAuto onClick={onEditar}>Editar</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-borda bg-fundo-suave-2 p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primaria text-[13px] font-extrabold text-branco">
            {iniciaisDe(paciente)}
          </span>
          <div className="flex min-w-0 flex-col">
            {titulo && <span className="truncate text-[10px] font-semibold text-primaria">{titulo}</span>}
            <span className="truncate text-[13px] font-extrabold text-texto">{paciente}</span>
            <span className="text-[10px] text-secundaria">{especialidade}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Informacao icone={<IconeCalendarioPequeno tamanho={10} />} rotulo="Data">{dataPorExtensoTitulo(data)}</Informacao>
          <Informacao icone={<IconeRelogioPequeno tamanho={10} />} rotulo="Horário">{hora}</Informacao>
        </div>

        <p className="rounded-xl border border-borda px-3 py-4 text-center text-[10px] text-secundaria">
          {anotacoes || 'Sem anotações para esta consulta.'}
        </p>

        <p className="flex items-center gap-1.5 text-[10px] text-secundaria">
          <IconeSino tamanho={11} className="text-primaria" />
          {lembrete ? 'Lembrete ativado' : 'Lembrete desativado'}
        </p>
      </div>
    </Modal>
  )
}
