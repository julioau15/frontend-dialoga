// ============================================================
// Dados fixos (mock) da aba Disponibilidade, iguais ao Figma.
// Dia: 0 = domingo ... 6 = sábado. "Única vez" tem data (02/10/2026 é sexta).
// TODO: trocar por GET /disponibilidade quando o back-end estiver integrado.
// ============================================================
export const DISPONIBILIDADES_MOCK = [
  { id: 1, dia: 1, inicio: '08:00', fim: '12:00', tipo: 'semanal' },
  { id: 2, dia: 2, inicio: '13:00', fim: '17:00', tipo: 'semanal' },
  { id: 3, dia: 4, inicio: '08:00', fim: '17:00', tipo: 'semanal' },
  { id: 4, dia: 5, inicio: '08:00', fim: '12:00', tipo: 'unica', data: '2026-10-02' },
]
