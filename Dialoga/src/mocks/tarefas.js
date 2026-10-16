/** @type {import('../types').Tarefa[]} */
export const tarefas = [
  {
    id: 'tar-1',
    pacienteId: 'pac-1',
    profissionalId: 'pro-1',
    titulo: 'Diário de emoções',
    descricao: 'Registrar três situações do dia e como se sentiu.',
    prazo: '2026-10-19',
    status: 'em_andamento',
  },
  {
    id: 'tar-2',
    pacienteId: 'pac-1',
    profissionalId: 'pro-2',
    titulo: 'Exercícios de respiração',
    descricao: 'Série de 5 minutos, duas vezes ao dia.',
    prazo: '2026-10-14',
    status: 'atrasada',
  },
  {
    id: 'tar-3',
    pacienteId: 'pac-2',
    profissionalId: 'pro-1',
    titulo: 'Leitura recomendada',
    prazo: '2026-10-25',
    status: 'pendente',
  },
  {
    id: 'tar-4',
    pacienteId: 'pac-2',
    profissionalId: 'pro-1',
    titulo: 'Registro de sono',
    prazo: '2026-10-10',
    status: 'concluida',
  },
]
