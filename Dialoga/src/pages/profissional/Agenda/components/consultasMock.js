// ============================================================
// Dados fixos (mock) da Agenda do profissional.
// "Hoje" fixo em 02/09/2026, igual ao Figma. Datas em 'AAAA-MM-DD'.
// TODO: trocar por dados da API quando o back-end estiver integrado.
// ============================================================
export const HOJE = '2026-09-02'
const ESPECIALIDADE = 'Psicologia Clínica'

export const CONSULTAS_MOCK = [
  { id: 1, titulo: 'Sessão de acompanhamento', paciente: 'Ana Beatriz Ferreira', especialidade: ESPECIALIDADE, data: '2026-09-02', hora: '09:00', anotacoes: '', lembrete: true },
  { id: 2, titulo: 'Avaliação inicial', paciente: 'João Pedro Alves', especialidade: ESPECIALIDADE, data: '2026-09-02', hora: '11:00', anotacoes: 'Avaliação inicial do paciente.', lembrete: true },
  { id: 3, titulo: 'Sessão de terapia', paciente: 'Ricardo Sousa', especialidade: ESPECIALIDADE, data: '2026-09-02', hora: '14:30', anotacoes: '', lembrete: true },
  { id: 4, titulo: 'Sessão de terapia', paciente: 'Fernanda Gomes', especialidade: ESPECIALIDADE, data: '2026-09-04', hora: '15:00', anotacoes: '', lembrete: true },
  { id: 5, titulo: 'Retorno', paciente: 'Ricardo Sousa', especialidade: ESPECIALIDADE, data: '2026-09-09', hora: '13:00', anotacoes: '', lembrete: true },
  { id: 6, titulo: 'Sessão de acompanhamento', paciente: 'Ana Beatriz Ferreira', especialidade: ESPECIALIDADE, data: '2026-09-10', hora: '14:00', anotacoes: '', lembrete: true },
  { id: 7, titulo: 'Retorno', paciente: 'João Pedro Alves', especialidade: ESPECIALIDADE, data: '2026-09-18', hora: '10:00', anotacoes: '', lembrete: false },
]
