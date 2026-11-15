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

// status desconhecido aparece como "Não preenchido"
export const statusDe = (status) => STATUS_ACOMPANHAMENTO[status] ?? STATUS_ACOMPANHAMENTO.nao_preenchido

// chips do filtro "Status da tarefa" ("Finalizado" mostra as respondidas)
export const FILTROS_STATUS = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'em_andamento', rotulo: 'Em andamento' },
  { id: 'respondida', rotulo: 'Finalizado' },
  { id: 'nao_preenchido', rotulo: 'Não preenchido' },
]
