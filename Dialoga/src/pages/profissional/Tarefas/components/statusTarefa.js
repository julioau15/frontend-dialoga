// ============================================================
// statusTarefa (profissional)
// Texto e tom do Selo de cada status da tarefa enviada ao paciente.
// As chaves seguem os valores da API (tbl_tarefa_destinatario.status),
// assim a troca do mock pela API não exige mudanças aqui.
// Usado pelo ItemTarefa.
// ============================================================
export const STATUS = {
  em_andamento: { rotulo: 'Em andamento', tom: 'info' },
  parcial: { rotulo: 'Respondida em parte', tom: 'info' },
  pendente: { rotulo: 'Pendente', tom: 'primaria' },
  respondida: { rotulo: 'Respondida', tom: 'sucesso' },
  atrasada: { rotulo: 'Em atraso', tom: 'erro' },
}

// rascunho ainda não foi enviado ao paciente, então não tem status de resposta
export const RASCUNHO = { rotulo: 'Rascunho', tom: 'neutro' }

// Texto e tom do selo de um item da lista ({ status, is_rascunho, respondidas, total }).
// Tarefa enviada a vários pacientes e respondida só por parte: "x/y respondidas".
// Status desconhecido cai em "Pendente".
export function rotuloStatusTarefa({ status, is_rascunho, respondidas, total }) {
  if (is_rascunho) return RASCUNHO
  if (status === 'parcial' && total > 0) return { rotulo: `${respondidas}/${total} respondidas`, tom: 'info' }
  return STATUS[status] ?? STATUS.pendente
}
