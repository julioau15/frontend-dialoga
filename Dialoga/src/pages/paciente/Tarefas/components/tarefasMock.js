// ============================================================
// Dados fixos (mock) da lista de tarefas do paciente.
// status: 'pendente' | 'andamento' | 'concluida' | 'atrasada'
// progresso: 0 a 100 (concluída não mostra a barra)
// autotarefa: true -> tarefa criada pelo próprio paciente (sem profissional)
// TODO: trocar por dados da API quando o back-end estiver integrado.
// ============================================================
export const TAREFAS_MOCK = [
  { id: 1, titulo: 'Diário de Humor Semanal', profissional: 'Carlos Eduardo Mendes', prazo: '07/09/2026', status: 'andamento', progresso: 60 },
  { id: 2, titulo: 'Escala de Ansiedade de Beck', profissional: 'Carlos Eduardo Mendes', prazo: '15/09/2026', status: 'pendente', progresso: 0 },
  { id: 3, titulo: 'Registro de Pensamentos Automáticos', profissional: 'Carlos Eduardo Mendes', prazo: '30/08/2026', status: 'concluida', progresso: 100 },
  { id: 4, titulo: 'Questionário de Qualidade de Sono', profissional: 'Carlos Eduardo Mendes', prazo: '01/09/2026', status: 'atrasada', progresso: 30 },
  // Exemplo de autotarefa (aparece no Figma só depois de "Adicionar tarefa").
  // Descomente para ver a variação "Você (autotarefa)" com o botão "Marcar como concluído":
  // { id: 5, titulo: 'Caminhada de 20 minutos', autotarefa: true, prazo: '03/09/2026', status: 'pendente', progresso: 0 },
]
