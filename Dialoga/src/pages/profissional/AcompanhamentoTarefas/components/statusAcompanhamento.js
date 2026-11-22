// ============================================================
// statusAcompanhamento
// Texto e tom do Selo de cada status no Acompanhamento de respostas (iguais ao Figma)
// e as opções do filtro "Status da tarefa".
// Usado pela lista (ItemAcompanhamento), pelo filtro e pela tela de resposta.
// TODO: na integração, converter os valores de tbl_tarefa_destinatario.status para estas chaves.
// ============================================================
export const STATUS_ACOMPANHAMENTO = {
  respondida: { rotulo: 'Respondida', tom: 'sucesso' },
  em_andamento: { rotulo: 'Em andamento', tom: 'info' },
  nao_preenchido: { rotulo: 'Não preenchido', tom: 'neutro' },
}

// filtro do chip: 'todos', 'pendente' (ainda não respondida) ou um status exato
export const passaNoFiltroStatus = (statusItem, filtro) =>
  filtro === 'todos' || (filtro === 'pendente' ? statusItem !== 'respondida' : statusItem === filtro)

// status desconhecido aparece como "Não preenchido"
export const statusDe = (status) => STATUS_ACOMPANHAMENTO[status] ?? STATUS_ACOMPANHAMENTO.nao_preenchido

// chips do filtro "Status da tarefa" ("Finalizado" mostra as respondidas;
// "Pendentes" mostra tudo que ainda não foi respondido, como o card "Pendentes resp." do dashboard)
export const FILTROS_STATUS = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'pendente', rotulo: 'Pendentes' },
  { id: 'em_andamento', rotulo: 'Em andamento' },
  { id: 'respondida', rotulo: 'Finalizado' },
  { id: 'nao_preenchido', rotulo: 'Não preenchido' },
]
