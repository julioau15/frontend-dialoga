// ============================================================
// Dados fixos (mock) da lista de tarefas do profissional.
// Campos com os mesmos nomes da API (tbl_tarefa / tbl_tarefa_destinatario):
//   is_rascunho     -> 1 = aba "Rascunhos" | 0 = aba "Enviadas"
//   status          -> 'pendente' | 'em_andamento' | 'respondida' | 'atrasada' (null no rascunho)
//   prazo           -> 'AAAA-MM-DD' (null = sem prazo definido)
//   total_perguntas -> quantidade de perguntas do questionário
// TODO: trocar por dados da API quando o back-end estiver integrado.
// ============================================================
export const TAREFAS_MOCK = [
  { id: 1, titulo: 'Diário de Humor Semanal', total_perguntas: 5, prazo: '2026-09-07', status: 'em_andamento', is_rascunho: 0 },
  { id: 2, titulo: 'Escala de Ansiedade de Beck', total_perguntas: 21, prazo: '2026-09-15', status: 'pendente', is_rascunho: 0 },
  { id: 3, titulo: 'Registro de Pensamentos Automáticos', total_perguntas: 4, prazo: '2026-08-30', status: 'respondida', is_rascunho: 0 },
  { id: 4, titulo: 'Questionário de Qualidade de Sono', total_perguntas: 8, prazo: '2026-09-01', status: 'atrasada', is_rascunho: 0 },
  { id: 5, titulo: 'Rotina de sono', total_perguntas: 3, prazo: null, status: null, is_rascunho: 1 },
  { id: 6, titulo: 'Checklist de autocuidado', total_perguntas: 1, prazo: '2026-09-20', status: null, is_rascunho: 1 },
]
