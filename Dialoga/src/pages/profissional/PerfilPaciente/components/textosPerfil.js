// ============================================================
// textosPerfil
// Rótulos e cores fixos do perfil do paciente, como no Figma:
// faixas dos indicadores, status das tarefas, períodos e abas.
// ============================================================

// faixas dos indicadores (RF230): verde = Positivo, roxo = Moderado, vermelho = Atenção
// (classes escritas por extenso para o Tailwind encontrá-las)
export const FAIXAS = {
  positivo: { rotulo: 'Positivo', fundo: 'bg-sucesso' },
  moderado: { rotulo: 'Moderado', fundo: 'bg-primaria' },
  atencao: { rotulo: 'Atenção', fundo: 'bg-erro' },
}

// status das tarefas do Histórico (tom do componente Selo)
export const STATUS_TAREFA = {
  respondida: { rotulo: 'Respondida', tom: 'sucesso' },
  em_andamento: { rotulo: 'Em andamento', tom: 'info' },
  nao_preenchido: { rotulo: 'Não preenchido', tom: 'neutro' },
}

// filtro de período da aba Indicadores (RF228)
export const PERIODOS = [
  { id: '7d', rotulo: '7d', dias: 7 },
  { id: '14d', rotulo: '14d', dias: 14 },
  { id: '30d', rotulo: '30d', dias: 30 },
]

// abas do perfil (RF219, RF309), com o emoji do Figma
export const ABAS_PERFIL = [
  { id: 'anotacoes', rotulo: 'Anotações', emoji: '📝' },
  { id: 'indicadores', rotulo: 'Indicadores', emoji: '📊' },
  { id: 'historico', rotulo: 'Histórico de tarefas', emoji: '✅' },
]
