/** @type {import('../types').Consulta[]} */
export const consultas = [
  {
    id: 'con-1',
    pacienteId: 'pac-1',
    profissionalId: 'pro-1',
    dataHora: '2026-10-20T14:00:00-03:00',
    duracaoMin: 50,
    status: 'confirmada',
  },
  {
    id: 'con-2',
    pacienteId: 'pac-1',
    profissionalId: 'pro-2',
    dataHora: '2026-10-22T09:30:00-03:00',
    duracaoMin: 40,
    status: 'agendada',
  },
  {
    id: 'con-3',
    pacienteId: 'pac-2',
    profissionalId: 'pro-1',
    dataHora: '2026-10-21T16:00:00-03:00',
    duracaoMin: 50,
    status: 'agendada',
  },
  {
    id: 'con-4',
    pacienteId: 'pac-2',
    profissionalId: 'pro-1',
    dataHora: '2026-10-07T16:00:00-03:00',
    duracaoMin: 50,
    status: 'concluida',
    observacoes: 'Boa evolução desde a última sessão.',
  },
  {
    id: 'con-5',
    pacienteId: 'pac-3',
    profissionalId: 'pro-2',
    dataHora: '2026-10-09T10:00:00-03:00',
    duracaoMin: 40,
    status: 'cancelada',
  },
]
