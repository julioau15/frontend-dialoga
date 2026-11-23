// ============================================================
// services/perfilPacienteService.js
// Requisições do Perfil do paciente na visão do profissional (só API, sem tela e sem estado).
//   buscarPerfilPaciente(token, idPaciente, signal) -> junta:
//     GET /profissionais/me/pacientes                (dados básicos e status do vínculo)
//     GET /pacientes/:id/perfil-profissional         (telefone; só com vínculo ativo)
//     GET /pacientes/:id/indicadores-compartilhados  (acesso e só as categorias autorizadas)
//     GET /tarefas + /tarefas-destinatarios?id_tarefa (histórico de tarefas enviadas)
//     GET /profissionais/me/consultas                (sessões)
//   pedirAcesso(token, idPaciente)                   -> POST   /pacientes/:id/solicitacoes-acesso
//   listarAnotacoes(token, idPaciente, signal)       -> GET    /pacientes/:id/anotacoes
//   salvarAnotacao(token, idPaciente, nota)          -> POST   /pacientes/:id/anotacoes | PUT /anotacoes/:id
//   excluirAnotacao(token, idAnotacao)               -> DELETE /anotacoes/:id
//   removerPaciente(token, idPaciente)               -> DELETE /profissionais/me/pacientes/:id
// O back usa 404 para "lista vazia": aqui isso vira [].
// ============================================================
import { requisicao } from './pacienteService'
import { buscarConsultas } from './agendaProfissionalService'
import { buscarPacientesDoProfissional } from './pacientesProfissionalService'
import { listarDestinatarios, listarRespostas, listarTarefas } from './tarefaProfissionalService'
import { hojeNoBrasil } from '../utils/datasAgenda'
import { acessoDoPerfil, historicoDoPaciente, montarIndicadores, resumoDoPaciente } from '../utils/perfilPaciente'
import { paraBooleano } from '../utils/tarefasProfissional'

// erro que não pode derrubar a tela inteira: devolve o valor padrão (mas respeita o cancelamento)
const ouPadrao = (promessa, padrao, signal) =>
  promessa.catch((erro) => {
    if (signal?.aborted) throw erro
    return padrao
  })

// telefone do paciente (a rota exige vínculo ativo)
async function buscarTelefone(token, idPaciente, signal) {
  const dados = await requisicao(`/pacientes/${encodeURIComponent(idPaciente)}/perfil-profissional`, { token, signal })
  return dados.response?.paciente?.[0]?.celular ?? null
}

// o que o paciente compartilhou: { status, categorias, registroHumor, tratamento }
async function buscarCompartilhados(token, idPaciente, signal) {
  const dados = await requisicao(`/pacientes/${encodeURIComponent(idPaciente)}/indicadores-compartilhados`, { token, signal })
  return dados.response ?? {}
}

// tarefas enviadas pelo profissional a este paciente, com quantas perguntas já têm resposta
async function buscarHistorico(token, idPaciente, signal) {
  const tarefas = (await listarTarefas(token, signal)).filter((t) => !paraBooleano(t.is_rascunho))
  const listas = await Promise.all(tarefas.map((t) => ouPadrao(listarDestinatarios(token, t.id, signal), [], signal)))
  const destinatarios = listas.flat().filter((d) => Number(d.id_paciente) === Number(idPaciente))

  // nas não concluídas, conta as perguntas respondidas (para "x/y respostas")
  const abertos = destinatarios.filter((d) => String(d.status).toLowerCase() !== 'concluida')
  const contagens = await Promise.all(
    abertos.map(async (d) => {
      const respostas = await ouPadrao(listarRespostas(token, d.id, signal), [], signal)
      return [d.id, new Set(respostas.map((r) => r.id_pergunta)).size]
    }),
  )

  return historicoDoPaciente({ tarefas, destinatarios, idPaciente, respondidasPorEnvio: Object.fromEntries(contagens) })
}

/**
 * Perfil completo no formato dos componentes de PerfilPaciente, ou null se o paciente não é do profissional:
 *   { ...dadosBasicos, telefone, acesso, resumo, indicadores | null, historico }
 */
export async function buscarPerfilPaciente(token, idPaciente, signal) {
  const pacientes = await buscarPacientesDoProfissional(token, signal)
  const basico = pacientes.find((p) => String(p.id) === String(idPaciente))
  if (!basico) return null

  const vinculoAtivo = basico.status !== 'pendente'
  const hoje = hojeNoBrasil()

  const [telefone, compartilhados, historico, consultas] = await Promise.all([
    vinculoAtivo ? ouPadrao(buscarTelefone(token, basico.id, signal), null, signal) : null,
    vinculoAtivo ? ouPadrao(buscarCompartilhados(token, basico.id, signal), {}, signal) : {},
    ouPadrao(buscarHistorico(token, basico.id, signal), [], signal),
    ouPadrao(buscarConsultas(token, signal), [], signal),
  ])

  const acesso = acessoDoPerfil(compartilhados.status)
  const categorias = compartilhados.categorias ?? []

  return {
    ...basico,
    telefone,
    acesso,
    resumo: resumoDoPaciente({ historico, consultas: consultas.filter((c) => c.idVinculo === basico.idVinculo), hoje }),
    indicadores:
      acesso === 'aprovado'
        ? montarIndicadores({
            registros: compartilhados.registroHumor ?? [],
            categorias,
            tratamentos: compartilhados.tratamento ?? [],
            historico,
            hoje,
          })
        : null,
    historico,
  }
}

// RF225: o profissional pede acesso aos indicadores (o paciente aprova em Relatórios)
export function pedirAcesso(token, idPaciente) {
  return requisicao(`/pacientes/${encodeURIComponent(idPaciente)}/solicitacoes-acesso`, {
    token,
    method: 'POST',
    mensagemErro: 'Não foi possível enviar a solicitação de acesso.',
  })
}

// anotações privadas do profissional, da mais antiga para a mais nova: [{ id, titulo, conteudo, data }]
export async function listarAnotacoes(token, idPaciente, signal) {
  try {
    const dados = await requisicao(`/pacientes/${encodeURIComponent(idPaciente)}/anotacoes`, {
      token,
      signal,
      mensagemErro: 'Não foi possível carregar as anotações.',
    })
    return (dados.response?.anotacao ?? [])
      .map((a) => ({ id: a.id, titulo: a.titulo, conteudo: a.conteudo, data: String(a.data_criacao ?? '').slice(0, 10) }))
      .sort((a, b) => a.data.localeCompare(b.data) || a.id - b.id)
  } catch (erro) {
    if (erro.status === 404) return []
    throw erro
  }
}

// cria ({ titulo, conteudo }) ou edita ({ id, titulo, conteudo })
export function salvarAnotacao(token, idPaciente, { id, titulo, conteudo }) {
  if (id != null) {
    return requisicao(`/anotacoes/${encodeURIComponent(id)}`, {
      token,
      method: 'PUT',
      body: { titulo, conteudo, id_paciente: Number(idPaciente) },
      mensagemErro: 'Não foi possível atualizar a anotação.',
    })
  }
  return requisicao(`/pacientes/${encodeURIComponent(idPaciente)}/anotacoes`, {
    token,
    method: 'POST',
    body: { titulo, conteudo },
    mensagemErro: 'Não foi possível salvar a anotação.',
  })
}

export function excluirAnotacao(token, idAnotacao) {
  return requisicao(`/anotacoes/${encodeURIComponent(idAnotacao)}`, {
    token,
    method: 'DELETE',
    mensagemErro: 'Não foi possível remover a anotação.',
  })
}

// RF315: encerra o vínculo com o paciente
export function removerPaciente(token, idPaciente) {
  return requisicao(`/profissionais/me/pacientes/${encodeURIComponent(idPaciente)}`, {
    token,
    method: 'DELETE',
    mensagemErro: 'Não foi possível remover o paciente.',
  })
}
