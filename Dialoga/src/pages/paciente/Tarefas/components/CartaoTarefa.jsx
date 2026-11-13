// ============================================================
// CartaoTarefa
// Cartão de uma tarefa: título, quem enviou (ou "Você (autotarefa)"), prazo,
// etiqueta de status, barra de progresso e botão de ação.
// Uma variação por status:
//   pendente  -> etiqueta lilás | barra | "Abrir tarefa"
//   andamento -> etiqueta azul  | barra | "Continuar"
//   atrasada  -> etiqueta verm. | barra | "Abrir tarefa"
//   concluida -> etiqueta verde | sem barra | "Ver respostas" (verde claro)
//   autotarefa pendente/andamento/atrasada -> botão "Marcar como concluído"
// Props: tarefa, onAcao(tarefa) (clique no botão; quem decide a tela é a página Tarefas)
// ============================================================
import { useId } from 'react'
import Button from '../../../../components/Button'
import Card from '../../../../components/Card'
import Selo from '../../../../components/Selo'
import BarraProgresso from '../../../../components/BarraProgresso'
import { IconeRelogioPequeno } from '../../../../components/IconesAgenda'

export const STATUS = {
  pendente: { rotulo: 'Pendente', tom: 'primaria', acao: 'Abrir tarefa', barra: true },
  andamento: { rotulo: 'Em andamento', tom: 'info', acao: 'Continuar', barra: true },
  atrasada: { rotulo: 'Em atraso', tom: 'erro', acao: 'Abrir tarefa', barra: true },
  concluida: { rotulo: 'Concluída', tom: 'sucesso', acao: 'Ver respostas', barra: false },
}

// "Ver respostas" é um verde bem claro (o Button ainda não tem essa variante, por isso as classes extras)
const VER_RESPOSTAS = 'bg-sucesso-fundo! border-sucesso-fundo! text-sucesso-escura! enabled:hover:brightness-97'

export default function CartaoTarefa({ tarefa, onAcao }) {
  const idTitulo = useId()
  const { titulo, profissional, autotarefa, prazo, status, progresso } = tarefa
  const config = STATUS[status]
  const concluida = status === 'concluida'
  const textoAcao = autotarefa && !concluida ? 'Marcar como concluído' : config.acao

  return (
    <Card as="article" aria-labelledby={idTitulo} className="flex flex-col gap-4 p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={idTitulo} className="text-[15px] font-bold leading-snug text-texto">{titulo}</h2>
          <p className="text-[13px] text-secundaria">{autotarefa ? 'Você (autotarefa)' : profissional}</p>
          <p className="mt-2 flex items-center gap-1 text-[11px] text-secundaria">
            <IconeRelogioPequeno tamanho={11} />
            Prazo: {prazo}
          </p>
        </div>
        <Selo tom={config.tom}>{config.rotulo}</Selo>
      </header>

      {config.barra && <BarraProgresso valor={progresso} />}

      {/* autotarefa concluída não tem respostas para ver, então fica sem botão */}
      {!(autotarefa && concluida) && (
        <Button
          type="button"
          variante={concluida ? 'sucesso' : 'primario'}
          className={concluida ? VER_RESPOSTAS : ''}
          onClick={() => onAcao?.(tarefa)}
        >
          {textoAcao}
        </Button>
      )}
    </Card>
  )
}
