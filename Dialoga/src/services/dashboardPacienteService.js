// ============================================================
// services/dashboardPacienteService.js
// Busca tudo o que o Dashboard do paciente precisa (só API, sem tela e sem estado):
//   GET /pacientes/me/registros-humor  -> indicadores e sono da semana
//   GET /pacientes/me/tratamentos      -> tratamentos ativos
//   GET /pacientes/me/consultas        -> próximas consultas
//   GET /tarefas                       -> tarefas recentes
//   GET /pacientes/me/profissionais    -> total de profissionais ativos
// A montagem fica em utils/dashboardPaciente.js (montarDashboardPaciente).
// O back usa 404 para "lista vazia": aqui isso vira [].
// ============================================================
import { requisicao } from './pacienteService'
import { buscarConsultas } from './agendaPacienteService'
import { listarMeusProfissionais } from './profissionaisPacienteService'
import { listarTratamentosRequest } from './tratamentoService'
import { buscarTarefasDoPaciente } from './relatoriosService'
import { montarDashboardPaciente } from '../utils/dashboardPaciente'
import { hojeNoBrasil } from '../utils/datasAgenda'

async function buscarRegistros(token, signal) {
  try {
    const dados = await requisicao('/pacientes/me/registros-humor', {
      token,
      signal,
      mensagemErro: 'Não foi possível carregar seus registros de humor.',
    })
    return dados.response?.registroHumor ?? []
  } catch (erro) {
    if (erro.status === 404) return []
    throw erro
  }
}

export async function buscarDashboardPaciente(token, signal) {
  const [registros, tratamentos, consultas, tarefas, profissionais] = await Promise.all([
    buscarRegistros(token, signal),
    listarTratamentosRequest(token, signal),
    buscarConsultas(token, signal),
    buscarTarefasDoPaciente(token, signal),
    listarMeusProfissionais(token, signal),
  ])

  return montarDashboardPaciente({ registros, tratamentos, consultas, tarefas, profissionais }, hojeNoBrasil())
}
