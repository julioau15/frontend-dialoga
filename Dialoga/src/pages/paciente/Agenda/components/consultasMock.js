// ============================================================
// Dados fixos (mock) da Agenda do paciente.
// "Hoje" fixo em 08/09/2026, igual ao Figma. Datas em 'AAAA-MM-DD'.
// TODO: trocar por dados da API quando o back-end estiver integrado.
// ============================================================
export const HOJE = '2026-09-08'

export const CONSULTAS_MOCK = [
  { id: 1, titulo: 'Sessão de acompanhamento', profissional: 'Carlos Eduardo Mendes', especialidade: 'Psicologia Clínica', data: '2026-09-10', hora: '14:00', observacoes: '', lembrete: true },
  { id: 2, titulo: 'Sessão de terapia', profissional: 'Carlos Eduardo Mendes', especialidade: 'Psicologia Clínica', data: '2026-09-24', hora: '14:00', observacoes: '', lembrete: true },
  { id: 3, titulo: 'Avaliação inicial', profissional: 'Patrícia Lima', especialidade: 'Psicologia Clínica', data: '2026-10-05', hora: '10:30', observacoes: '', lembrete: true },
]
