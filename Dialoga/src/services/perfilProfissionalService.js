// ============================================================
// services/perfilProfissionalService.js
// Dados da tela de um profissional na visão do paciente (só API, sem tela e sem estado).
//   buscarPerfilProfissional(token, basico, signal) -> junta aos dados básicos (lista de Profissionais):
//     tarefas                   <- GET /tarefas (as do paciente), só as deste profissional e não concluídas
//     tratamentosCompartilhados <- GET /solicitacoes-acesso: solicitação aprovada com 'Tratamentos'
//     tratamentos               <- GET /pacientes/me/tratamentos (só quando compartilhados)
// O card "Tratamentos vinculados" só aparece quando tratamentosCompartilhados é true.
// ============================================================
import { requisicao } from './pacienteService'
import { listarMinhasTarefas } from './tarefaPacienteService'
import { listarTratamentosRequest } from './tratamentoService'
import { hojeNoBrasil } from '../utils/datasAgenda'
import { tarefasAtivasDoProfissional, tratamentoParaItem, tratamentosCompartilhadosCom } from '../utils/perfilProfissionalPaciente'

async function listarSolicitacoes(token, signal) {
  try {
    const dados = await requisicao('/solicitacoes-acesso', { token, signal })
    return dados.response?.solicitacaoAcesso ?? []
  } catch (erro) {
    if (erro.status === 404) return []
    throw erro
  }
}

// basico: profissional da lista (ver profissionaisPacienteService); undefined se não existe
export async function buscarPerfilProfissional(token, basico, signal) {
  if (!basico) return undefined

  const perfil = {
    ...basico,
    nomeExibicao: basico.nome,
    registro: null,
    modalidades: [],
    especialidades: basico.especialidades?.length ? basico.especialidades : [basico.especialidade],
    proximaDisponivel: null,
    tarefas: [],
    tratamentos: [],
    tratamentosCompartilhados: false,
  }

  // profissional externo (cadastrado só pelo paciente): não há dados no Dialoga
  if (!basico.naPlataforma) return perfil

  const [tarefas, solicitacoes] = await Promise.all([listarMinhasTarefas(token, signal), listarSolicitacoes(token, signal)])
  const tratamentosCompartilhados = tratamentosCompartilhadosCom(solicitacoes, basico.id)
  const tratamentos = tratamentosCompartilhados ? await listarTratamentosRequest(token, signal) : []

  return {
    ...perfil,
    tarefas: tarefasAtivasDoProfissional(tarefas, basico.id, hojeNoBrasil()),
    tratamentos: tratamentos.map(tratamentoParaItem),
    tratamentosCompartilhados,
  }
}
