/** @type {import('../types').Notificacao[]} */
export const notificacoes = [
  {
    id: 'not-1',
    usuarioId: 'pac-1',
    titulo: 'Consulta confirmada',
    mensagem: 'Sua consulta com Ana Ribeiro em 20/10 às 14h foi confirmada.',
    criadaEm: '2026-10-15T10:12:00-03:00',
    lida: false,
  },
  {
    id: 'not-2',
    usuarioId: 'pac-1',
    titulo: 'Tarefa atrasada',
    mensagem: 'A tarefa "Exercícios de respiração" passou do prazo.',
    criadaEm: '2026-10-15T08:00:00-03:00',
    lida: true,
  },
  {
    id: 'not-3',
    usuarioId: 'pro-1',
    titulo: 'Nova consulta agendada',
    mensagem: 'Pedro Alves agendou uma consulta para 21/10 às 16h.',
    criadaEm: '2026-10-14T18:40:00-03:00',
    lida: false,
  },
  {
    id: 'not-4',
    usuarioId: 'adm-1',
    titulo: 'Cadastros aguardando aprovação',
    mensagem: 'Há 2 profissionais aguardando análise.',
    criadaEm: '2026-10-16T07:30:00-03:00',
    lida: false,
  },
]
