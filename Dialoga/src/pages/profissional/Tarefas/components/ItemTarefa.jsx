// ============================================================
// ItemTarefa
// Linha da lista de tarefas do profissional: nome do questionário,
// número de perguntas, prazo, selo de status e botão de editar (RF290).
// Selo por status:
//   em_andamento -> azul | pendente -> lilás | respondida -> verde | atrasada -> vermelho
//   rascunho     -> cinza ("Rascunho")
// Props: tarefa, onEditar(tarefa) (clique no lápis; quem decide a ação é a página Tarefas)
// No mobile o selo fica abaixo do prazo; a partir de sm, ao lado do lápis.
// ============================================================
import { useId } from 'react'
import Card from '../../../../components/Card'
import Selo from '../../../../components/Selo'
import { IconeRelogio } from '../../../../components/Icones'
import { IconeLapis } from '../../../../components/IconesPerfil'
import { formatarDataBR } from '../../../../utils/formatadores'
import { RASCUNHO, STATUS } from './statusTarefa'

// "1 pergunta" | "5 perguntas"
function textoPerguntas(qtd) {
  return qtd === 1 ? '1 pergunta' : `${qtd} perguntas`
}

export default function ItemTarefa({ tarefa, onEditar }) {
  const idTitulo = useId()
  const { titulo, total_perguntas, prazo, status, is_rascunho } = tarefa
  // status desconhecido cai em "Pendente" (mesmo comportamento do Dashboard)
  const config = is_rascunho ? RASCUNHO : STATUS[status] ?? STATUS.pendente

  return (
    <Card as="article" aria-labelledby={idTitulo} className="flex items-start justify-between gap-3 p-4 sm:p-5">
      <div className="min-w-0">
        <h2 id={idTitulo} className="text-[16px] font-bold leading-snug text-texto">{titulo}</h2>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-secundaria sm:text-[13px]">
          <span>{textoPerguntas(total_perguntas)}</span>
          <span className="flex items-center gap-1">
            <IconeRelogio tamanho={12} />
            {prazo ? `Prazo: ${formatarDataBR(prazo)}` : 'Sem prazo'}
          </span>
        </p>
        {/* no mobile o selo fica abaixo do prazo, para o título ter a largura toda */}
        <div className="mt-2 sm:hidden">
          <Selo tom={config.tom}>{config.rotulo}</Selo>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* a partir de sm (tablet/desktop) o selo fica ao lado do lápis */}
        <div className="hidden sm:block">
          <Selo tom={config.tom}>{config.rotulo}</Selo>
        </div>
        {/* botão só com ícone: o aria-label diz para leitores de tela qual tarefa será editada */}
        <button
          type="button"
          aria-label={`Editar ${titulo}`}
          onClick={() => onEditar?.(tarefa)}
          className="grid h-8 w-8 place-items-center rounded-lg text-secundaria cursor-pointer transition-colors duration-200 hover:bg-fundo-suave-2 hover:text-primaria focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
        >
          <IconeLapis tamanho={16} />
        </button>
      </div>
    </Card>
  )
}
