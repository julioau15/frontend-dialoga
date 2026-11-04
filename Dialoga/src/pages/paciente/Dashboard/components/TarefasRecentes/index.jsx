// ============================================================
// TarefasRecentes
// Lista de tarefas com prazo, barra de progresso e status.
// Props: tarefas -> [{ id, titulo, prazo, status, progresso (0 a 100) }]
//   status: 'andamento' | 'pendente' | 'concluida'
// ============================================================
import CardLista from '../CardLista'

const STATUS = {
  andamento: { texto: 'Em andamento', classe: 'bg-info-fundo text-info' },
  pendente: { texto: 'Pendente', classe: 'bg-fundo-card text-primaria' },
  concluida: { texto: 'Concluída', classe: 'bg-sucesso-fundo text-sucesso' },
}

export default function TarefasRecentes({ tarefas }) {
  return (
    <CardLista icone="tarefa" titulo="Tarefas recentes" linkTexto="Ver todas" linkPara="/paciente/tarefas">
      {tarefas.map(({ id, titulo, prazo, status, progresso }) => {
        const { texto, classe } = STATUS[status] ?? STATUS.pendente
        return (
          <div key={id} className="flex items-center justify-between gap-4 px-5 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-texto">{titulo}</p>
              <p className="text-xs text-secundaria">Prazo: {prazo}</p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {status !== 'concluida' && (
                <div
                  role="progressbar"
                  aria-label={`Progresso de ${titulo}`}
                  aria-valuenow={progresso}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-borda sm:block"
                >
                  <div className="h-full rounded-full bg-primaria" style={{ width: `${progresso}%` }} />
                </div>
              )}
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classe}`}>{texto}</span>
            </div>
          </div>
        )
      })}
    </CardLista>
  )
}
