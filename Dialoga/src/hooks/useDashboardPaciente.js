// ============================================================
// hooks/useDashboardPaciente.js
// Entrega os dados da tela "Dashboard do paciente".
// TODO: trocar os dados de exemplo por chamadas à API
//       (criar um services/dashboardPacienteService.js, como o authService.js)
//       e usar auth.token / auth.id vindos do useAuth().
// ============================================================
import { useMemo } from 'react'

const ROTULOS_DIA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// Associa cada valor ao dia da semana; o último valor é sempre "hoje".
function ultimosDias(horas) {
  const hoje = new Date()
  return horas.map((valor, i) => {
    const dia = new Date(hoje)
    dia.setDate(hoje.getDate() - (horas.length - 1 - i))
    return { rotulo: ROTULOS_DIA[dia.getDay()], horas: valor }
  })
}

// valor: 0 a 100
const INDICADORES = [
  { id: 'energia', emoji: '⚡', nome: 'Energia', valor: 84 },
  { id: 'sentimento', emoji: '💭', nome: 'Sentimento', valor: 73 },
  { id: 'humor', emoji: '😊', nome: 'Humor', valor: 67 },
  { id: 'pensamentos', emoji: '🧠', nome: 'Pensamentos', valor: 84 },
]

const TRATAMENTOS = [
  { id: 1, nome: 'Sertralina 50mg', frequencia: 'Uma vez ao dia', horarios: ['08:00'] },
  { id: 2, nome: 'Clonazepam 0,5mg', frequencia: 'Duas vezes ao dia', horarios: ['08:00', '22:00'] },
  { id: 3, nome: 'Melatonina 5mg', frequencia: 'Uma vez ao dia', horarios: ['21:30'] },
]

const CONSULTAS = [
  { id: 1, dia: 10, mes: 'Set.', profissional: 'Carlos Eduardo Mendes', especialidade: 'Psicologia Clínica', hora: '14:00' },
  { id: 2, dia: 24, mes: 'Set.', profissional: 'Carlos Eduardo Mendes', especialidade: 'Psicologia Clínica', hora: '14:00' },
]

// status: 'andamento' | 'pendente' | 'concluida'
const TAREFAS = [
  { id: 1, titulo: 'Diário de Humor Semanal', prazo: '07/09/2026', status: 'andamento', progresso: 40 },
  { id: 2, titulo: 'Escala de Ansiedade de Beck', prazo: '15/09/2026', status: 'pendente', progresso: 0 },
  { id: 3, titulo: 'Registro de Pensamentos Automáticos', prazo: '30/08/2026', status: 'concluida', progresso: 100 },
]

const TOTAL_PROFISSIONAIS = 2
const SONO_IDEAL = 7

export function useDashboardPaciente() {
  return useMemo(
    () => ({
      indicadores: INDICADORES,
      sono: { ideal: SONO_IDEAL, dias: ultimosDias([8, 6, 7.5, 5.5, 7.5, 8.5, 8]) },
      tratamentos: TRATAMENTOS,
      consultas: CONSULTAS,
      tarefas: TAREFAS,
      totalProfissionais: TOTAL_PROFISSIONAIS,
    }),
    [],
  )
}
