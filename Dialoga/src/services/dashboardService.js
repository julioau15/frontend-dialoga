// ============================================================
// services/dashboardService.js
// Busca na API o que o dashboard do profissional precisa e entrega
// pronto para a tela. Só usa rotas que JÁ existem no back-end:
//   GET /profissionais/me              -> id do profissional
//   GET /profissionais/me/pacientes    -> pacientes dele (nome e status)
//   GET /vinculos                      -> liga consulta -> paciente
//   GET /consultas                     -> agenda
//   GET /tarefas-destinatarios         -> tarefas enviadas aos pacientes
//   GET /tarefas/:id                   -> dono da tarefa e se é rascunho
//   GET /tarefas-destinatarios/:id/respostas -> detecta "Em andamento"
// As regras (o que conta como ativo, atrasado etc.) ficam em
// utils/dashboardProfissional.js.
// ============================================================
import { API_URL } from '../config/api'
import {
  destinatariosDoProfissional,
  montarDashboard,
  tarefaRespondida,
  situacaoAtividade,
} from '../utils/dashboardProfissional'

// GET que devolve a lista que está em response[chave].
// O back usa 404 para "lista vazia" — por isso 404 vira [] (a não ser que vazioEm404 = false).
async function buscarLista(token, caminho, chave, { vazioEm404 = true } = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${caminho}`, { headers: { 'x-access-token': token } })
  } catch {
    // fetch só falha aqui quando não consegue falar com o servidor
    throw new Error('Não foi possível conectar ao servidor. Verifique se a API está rodando.')
  }

  const json = await res.json().catch(() => null)

  if (res.status === 404 && vazioEm404) return []
  if (!json?.status) throw new Error(json?.message ?? 'Não foi possível carregar o dashboard. Tente novamente.')

  return json.response[chave] ?? []
}

// Igual à de cima, mas nunca lança erro: usada nos detalhes opcionais (se falhar, só some o detalhe)
const buscarListaOuVazia = (token, caminho, chave) => buscarLista(token, caminho, chave).catch(() => [])

// Devolve { data, resumo, atendimentos_hoje, pacientes_recentes, atividades_enviadas }.
//   hoje -> "YYYY-MM-DD" (data local do navegador)
export async function buscarDashboardProfissional(token, hoje) {
  // 1) tudo o que não depende de nada, em paralelo
  const [perfil, vinculos, pacientes, consultas, destinatarios] = await Promise.all([
    buscarLista(token, '/profissionais/me', 'profissional', { vazioEm404: false }),
    buscarLista(token, '/vinculos', 'vinculo'),
    buscarLista(token, '/profissionais/me/pacientes', 'paciente'),
    buscarLista(token, '/consultas', 'consulta'),
    buscarLista(token, '/tarefas-destinatarios', 'tarefaDestinatario'),
  ])

  const idProfissional = perfil[0].id

  // /vinculos e /consultas trazem os dados de todos: ficamos só com os deste profissional
  const meusVinculos = vinculos.filter((v) => v.id_profissional === idProfissional)
  const idsMeusPacientes = new Set(meusVinculos.map((v) => v.id_paciente))

  // 2) das tarefas enviadas aos pacientes dele, descobre quais foram criadas por ele (e não são rascunho)
  const candidatos = destinatarios.filter((d) => idsMeusPacientes.has(d.id_paciente))
  const idsTarefas = [...new Set(candidatos.map((d) => d.id_tarefa))]
  const tarefas = await Promise.all(idsTarefas.map((id) => buscarListaOuVazia(token, `/tarefas/${id}`, 'tarefa')))
  const tarefasPorId = Object.fromEntries(tarefas.flat().map((t) => [t.id, t]))

  const meusDestinatarios = destinatariosDoProfissional({ destinatarios: candidatos, tarefasPorId, idProfissional })

  // 3) "Em andamento" = tarefa não respondida, no prazo, que já tem respostas salvas.
  //    Só confere as que aparecem na lista (as 4 mais recentes).
  const agora = new Date()
  const duvidosas = meusDestinatarios
    .slice(0, 4)
    .filter((d) => !tarefaRespondida(d) && situacaoAtividade(d, agora) === 'pendente')
  const respostasLidas = await Promise.all(
    duvidosas.map((d) => buscarListaOuVazia(token, `/tarefas-destinatarios/${d.id}/respostas`, 'resposta'))
  )
  const respostas = Object.fromEntries(duvidosas.map((d, i) => [d.id, respostasLidas[i].length > 0]))

  return montarDashboard({
    vinculos: meusVinculos,
    pacientes,
    consultas,
    destinatarios: meusDestinatarios,
    respostas,
    hoje,
    agora,
  })
}
