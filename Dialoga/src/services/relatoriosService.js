// ============================================================
// services/relatoriosService.js
// Requisições da tela Relatórios do paciente (só API, sem tela e sem estado).
//   buscarRegistrosHumor(token, signal)            -> GET /pacientes/me/registros-humor
//   buscarSolicitacoesAcesso(token, signal)        -> GET /solicitacoes-acesso (+ GET /pacientes/me/profissionais)
//   aprovarSolicitacaoAcesso(token, id, ids)       -> PUT /solicitacoes-acesso/:id/aprovar { categorias }
//   recusarSolicitacaoAcesso(token, id)            -> PUT /solicitacoes-acesso/:id/recusar
//   alterarPermissoesAcesso(token, id, ids)        -> PUT /solicitacoes-acesso/:id/categorias { categorias }
//   removerAcesso(token, id)                       -> DELETE /solicitacoes-acesso/:id (retira todas as permissões)
//   buscarTarefasDoPaciente(token, signal)         -> GET /tarefas (só as do paciente do token)
// O back usa 404 para "lista vazia": aqui isso vira [].
// ============================================================
import { requisicao } from './pacienteService'
import { listarMinhasTarefas, listarProfissionais } from './tarefaPacienteService'
import { categoriasParaApi, registroApiParaRelatorio, solicitacaoApiParaTela } from '../utils/relatorios'
import { tarefaApiParaTela } from '../pages/paciente/Tarefas/components/tarefasUtils'

const listaOuVazia = async (promessa) => {
  try {
    return await promessa
  } catch (erro) {
    if (erro.status === 404) return null
    throw erro
  }
}

// Todos os registros de humor do paciente, do mais antigo para o mais novo.
// O período é filtrado na tela (o calendário também precisa dos dias com registro).
export async function buscarRegistrosHumor(token, signal) {
  const dados = await listaOuVazia(
    requisicao('/pacientes/me/registros-humor', {
      token,
      signal,
      mensagemErro: 'Não foi possível carregar seus registros de humor.',
    }),
  )
  return (dados?.response?.registroHumor ?? [])
    .map(registroApiParaRelatorio)
    .filter((r) => r.data)
    .sort((a, b) => a.data.localeCompare(b.data))
}

// Solicitações de acesso recebidas, com o nome e a especialidade de cada profissional
export async function buscarSolicitacoesAcesso(token, signal) {
  const [dados, profissionais] = await Promise.all([
    listaOuVazia(
      requisicao('/solicitacoes-acesso', {
        token,
        signal,
        mensagemErro: 'Não foi possível carregar as solicitações de acesso.',
      }),
    ),
    listarProfissionais(token, signal),
  ])
  return (dados?.response?.solicitacaoAcesso ?? []).map((s) => solicitacaoApiParaTela(s, profissionais))
}

// Aprova compartilhando só os indicadores marcados (ids da tela)
export async function aprovarSolicitacaoAcesso(token, id, indicadores) {
  return requisicao(`/solicitacoes-acesso/${encodeURIComponent(id)}/aprovar`, {
    token,
    method: 'PUT',
    body: { categorias: categoriasParaApi(indicadores) },
    mensagemErro: 'Não foi possível aprovar a solicitação.',
  })
}

export async function recusarSolicitacaoAcesso(token, id) {
  return requisicao(`/solicitacoes-acesso/${encodeURIComponent(id)}/recusar`, {
    token,
    method: 'PUT',
    mensagemErro: 'Não foi possível recusar a solicitação.',
  })
}

// Muda o que um profissional já aprovado pode ver (ids da tela)
export async function alterarPermissoesAcesso(token, id, indicadores) {
  return requisicao(`/solicitacoes-acesso/${encodeURIComponent(id)}/categorias`, {
    token,
    method: 'PUT',
    body: { categorias: categoriasParaApi(indicadores) },
    mensagemErro: 'Não foi possível alterar as permissões.',
  })
}

// Retira o acesso: o profissional deixa de ver os indicadores (e pode pedir de novo)
export async function removerAcesso(token, id) {
  return requisicao(`/solicitacoes-acesso/${encodeURIComponent(id)}`, {
    token,
    method: 'DELETE',
    mensagemErro: 'Não foi possível remover o acesso.',
  })
}

// Tarefas do paciente no formato da tela de Tarefas ({ titulo, prazo, prazoIso, status, progresso })
export async function buscarTarefasDoPaciente(token, signal) {
  const [lista, profissionais] = await Promise.all([listarMinhasTarefas(token, signal), listarProfissionais(token, signal)])
  return lista.map((t) => tarefaApiParaTela(t, profissionais))
}
