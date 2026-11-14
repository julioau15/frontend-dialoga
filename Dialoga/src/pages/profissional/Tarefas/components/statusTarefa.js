// ============================================================
// statusTarefa (profissional)
// Texto e tom do Selo de cada status da tarefa enviada ao paciente.
// As chaves seguem os valores da API (tbl_tarefa_destinatario.status),
// assim a troca do mock pela API não exige mudanças aqui.
// Usado pelo ItemTarefa.
// ============================================================
export const STATUS = {
  em_andamento: { rotulo: 'Em andamento', tom: 'info' },
  pendente: { rotulo: 'Pendente', tom: 'primaria' },
  respondida: { rotulo: 'Respondida', tom: 'sucesso' },
  atrasada: { rotulo: 'Em atraso', tom: 'erro' },
}

// rascunho ainda não foi enviado ao paciente, então não tem status de resposta
export const RASCUNHO = { rotulo: 'Rascunho', tom: 'neutro' }
