// ============================================================
// utils/dashboardPaciente.js
// Monta o que a tela "Dashboard do paciente" mostra a partir das respostas da API.
// Função pura: sem requisição e sem estado.
//   respostas = {
//     registros     -> GET /pacientes/me/registros-humor (linhas da API)
//     tratamentos   -> tratamentos normalizados (utils/tratamentos.normalizarTratamento)
//     consultas     -> consultas do paciente (agendaPacienteService.buscarConsultas)
//     tarefas       -> tarefas no formato da tela de Tarefas (tarefaApiParaTela)
//     profissionais -> profissionais do paciente com status ('ativo' | 'pendente' | 'inativo')
//   }
//   hoje -> 'AAAA-MM-DD'
// Devolve { semRegistros, indicadores, sono, tratamentos, consultas, tarefas, totalProfissionais }.
// ============================================================
import { diaEMesAbreviado } from './datasAgenda.js'
import { INDICADORES, media, notaMaxima, registroApiParaRelatorio } from './relatorios.js'

export const SONO_IDEAL = 7
const DIAS_DA_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const ORDEM_INDICADORES = ['energia', 'sentimento', 'humor', 'pensamentos']

function somarDias(iso, n) {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10)
}

const diaDaSemana = (iso) => {
  const [a, m, d] = iso.split('-').map(Number)
  return DIAS_DA_SEMANA[new Date(Date.UTC(a, m - 1, d)).getUTCDay()]
}

// indicadores dos últimos 7 dias: média de cada um em % da escala (0 a 100)
function indicadoresDa(registros) {
  return ORDEM_INDICADORES.map((id) => {
    const ind = INDICADORES.find((i) => i.id === id)
    const valor = media(registros.map((r) => ind.notas[r[id]]))
    return { id, emoji: ind.emoji, nome: ind.rotulo, valor: Math.round((valor / notaMaxima(ind)) * 100) }
  })
}

// tarefa da tela de Tarefas -> status do cartão do dashboard ("Em atraso" conta como pendente)
const statusDoCartao = (status) => (status === 'concluida' ? 'concluida' : status === 'andamento' ? 'andamento' : 'pendente')

export function montarDashboardPaciente({ registros, tratamentos, consultas, tarefas, profissionais }, hoje) {
  const inicioSemana = somarDias(hoje, -6)
  const daSemana = registros
    .map(registroApiParaRelatorio)
    .filter((r) => r.data >= inicioSemana && r.data <= hoje)
    .sort((a, b) => a.data.localeCompare(b.data))

  const proximas = consultas
    .filter((c) => String(c.status ?? 'agendada').toLowerCase() === 'agendada' && c.data >= hoje)
    .sort((a, b) => `${a.data}T${a.hora}`.localeCompare(`${b.data}T${b.hora}`))
    .slice(0, 2)
    .map((c) => {
      const { dia, mes } = diaEMesAbreviado(c.data)
      return { id: c.id, data: c.data, dia, mes, profissional: c.profissional, especialidade: c.especialidade, hora: c.hora }
    })

  return {
    // sem nenhum registro de humor na semana, a tela mostra "Ainda não há registros"
    semRegistros: daSemana.length === 0,
    indicadores: indicadoresDa(daSemana),
    sono: {
      ideal: SONO_IDEAL,
      dias: daSemana.filter((r) => typeof r.sono === 'number').map((r) => ({ rotulo: diaDaSemana(r.data), horas: r.sono })),
    },
    tratamentos: tratamentos.map((t) => ({
      id: t.id,
      nome: [t.nome, t.dosagem].filter(Boolean).join(' '),
      frequencia: t.frequencia,
      horarios: t.horarios,
    })),
    consultas: proximas,
    tarefas: [...tarefas]
      .sort((a, b) => b.id - a.id)
      .slice(0, 3)
      .map((t) => ({ id: t.id, titulo: t.titulo, prazo: t.prazo, status: statusDoCartao(t.status), progresso: t.progresso })),
    totalProfissionais: profissionais.filter((p) => p.status === 'ativo').length,
  }
}
