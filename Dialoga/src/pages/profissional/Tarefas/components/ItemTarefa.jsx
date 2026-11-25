// ============================================================
// ItemTarefa
// Cartão da lista de tarefas do profissional (frames "Tarefas - Profissional"
// e "Tarefas profissional - mobile"): nome do questionário,
// "N perguntas · Prazo: dd/mm/aaaa", selo de status e o lápis de editar (RF290).
// Ao lado do lápis fica o botão de respostas da tarefa (ícone de atividade, como no
// Figma do mobile; no desktop também), que leva direto para a tela de resposta dela.
// No mobile o nome é cortado com "…".
// Selo por status:
//   em_andamento -> azul | parcial -> azul ("x/y respondidas") | pendente -> lilás
//   respondida -> verde | atrasada -> vermelho
//   rascunho     -> cinza ("Rascunho")
// Props: tarefa, onEditar(tarefa), onVerRespostas(tarefa)
// ============================================================
import { useId } from 'react'
import Card from '../../../../components/Card'
import Selo from '../../../../components/Selo'
import { Atividade } from '../../../../components/Icones'
import { IconeLapis } from '../../../../components/IconesPerfil'
import { formatarDataBR } from '../../../../utils/formatadores'
import { rotuloStatusTarefa } from './statusTarefa'

// botões só com ícone (respostas e editar)
const BOTAO_ICONE =
  'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-secundaria cursor-pointer transition-colors duration-200 hover:bg-fundo-suave-2 hover:text-primaria-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria'

// "1 pergunta" | "5 perguntas"
function textoPerguntas(qtd) {
  return qtd === 1 ? '1 pergunta' : `${qtd} perguntas`
}

export default function ItemTarefa({ tarefa, onEditar, onVerRespostas }) {
  const idTitulo = useId()
  const { titulo, total_perguntas, prazo, is_rascunho } = tarefa
  // status desconhecido cai em "Pendente"; enviada a vários e respondida em parte: "x/y respondidas"
  const config = rotuloStatusTarefa(tarefa)

  return (
    <Card as="article" aria-labelledby={idTitulo} className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:pl-[17px] sm:pr-5">
      <div className="min-w-0 flex-1">
        <h2 id={idTitulo} title={titulo} className="truncate text-[14px] font-bold leading-snug text-texto">{titulo}</h2>
        <p className="mt-0.5 text-[11px] leading-snug text-secundaria">
          {textoPerguntas(total_perguntas)} · {prazo ? `Prazo: ${formatarDataBR(prazo)}` : 'Sem prazo'}
        </p>
      </div>

      {/* gap de 11px no mobile: mesma distância do Figma entre o selo e os dois ícones */}
      <div className="flex shrink-0 items-center gap-[11px] sm:gap-3">
        <Selo tom={config.tom}>{config.rotulo}</Selo>
        {/* respostas da tarefa: só para tarefas já enviadas */}
        {!is_rascunho && (
          <button type="button" aria-label={`Ver respostas de ${titulo}`} onClick={() => onVerRespostas?.(tarefa)} className={BOTAO_ICONE}>
            <Atividade className="h-4 w-4" />
          </button>
        )}
        {/* botão só com ícone: o aria-label diz para leitores de tela qual tarefa será editada */}
        <button type="button" aria-label={`Editar ${titulo}`} onClick={() => onEditar?.(tarefa)} className={BOTAO_ICONE}>
          <IconeLapis tamanho={16} />
        </button>
      </div>
    </Card>
  )
}
