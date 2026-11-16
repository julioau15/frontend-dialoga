// ============================================================
// services/tarefaPacienteService.js
// Requisições da tela "Tarefas" do paciente. Só fala com a API
// (sem tela e sem estado). Todas lançam Error com .message pronta
// para mostrar ao paciente e .status com o código HTTP.
//
//   listarMinhasTarefas        -> GET    /tarefas
//   listarProfissionais        -> GET    /pacientes/me/profissionais
//   listarRespostas            -> GET    /tarefas-destinatarios/:id/respostas
//   gravarRespostas            -> DELETE /respostas/:id (antigas) + POST /tarefas-destinatarios/:id/respostas
//   atualizarStatusDestinatario-> PUT    /tarefas-destinatarios/:id
//   criarAutotarefa            -> POST   /tarefas (multipart, aceita anexo)
//
// O back não tem "salvar rascunho": o POST de respostas sempre INSERE.
// Por isso gravarRespostas apaga as respostas antigas antes de gravar as novas.
// ============================================================
import { requisicao } from './pacienteService'

// GET /tarefas -> lista do paciente do token (já com perguntas e opções).
// O back responde 404 quando o paciente não tem nenhuma tarefa: tratamos como lista vazia.
export async function listarMinhasTarefas(token, signal) {
  try {
    const dados = await requisicao('/tarefas', { token, signal, mensagemErro: 'Não foi possível carregar suas tarefas.' })
    return dados.response?.tarefa ?? []
  } catch (erro) {
    if (erro.status === 404) return []
    throw erro
  }
}

// GET /pacientes/me/profissionais -> [{ id, nome_completo, ... }] usados para mostrar quem enviou a tarefa.
// Se falhar, a tela segue sem o nome (não vale bloquear as tarefas por isso).
export async function listarProfissionais(token, signal) {
  try {
    const dados = await requisicao('/pacientes/me/profissionais', { token, signal })
    return dados.response?.profissional ?? []
  } catch (erro) {
    if (signal?.aborted) throw erro
    return []
  }
}

// GET /tarefas-destinatarios/:id/respostas -> [{ id, valor, id_pergunta, id_opcao_pergunta }]
// 404 significa "ainda sem respostas".
export async function listarRespostas(token, idDestinatario, signal) {
  try {
    const dados = await requisicao(`/tarefas-destinatarios/${encodeURIComponent(idDestinatario)}/respostas`, {
      token,
      signal,
      mensagemErro: 'Não foi possível carregar suas respostas.',
    })
    return dados.response?.resposta ?? []
  } catch (erro) {
    if (erro.status === 404) return []
    throw erro
  }
}

// Grava as respostas da tarefa.
//   respostasApi        -> [{ valor, id_pergunta, id_opcao_pergunta }]
//   enviarDefinitivamente -> true: o back marca a tarefa como "concluida" e avisa o profissional
export async function gravarRespostas(token, idDestinatario, respostasApi, enviarDefinitivamente) {
  // 1) apaga o que já estava salvo (rascunho anterior) para não duplicar linhas
  const antigas = await listarRespostas(token, idDestinatario)
  for (const antiga of antigas) {
    await requisicao(`/respostas/${encodeURIComponent(antiga.id)}`, {
      token,
      method: 'DELETE',
      mensagemErro: 'Não foi possível atualizar suas respostas.',
    })
  }

  // 2) grava as novas
  return requisicao(`/tarefas-destinatarios/${encodeURIComponent(idDestinatario)}/respostas`, {
    token,
    method: 'POST',
    body: { respostas: respostasApi, enviar_definitivamente: !!enviarDefinitivamente },
    mensagemErro: enviarDefinitivamente ? 'Não foi possível enviar sua atividade.' : 'Não foi possível salvar o rascunho.',
  })
}

// PUT /tarefas-destinatarios/:id { status } (o back completa o resto com os dados atuais)
// status: 'pendente' | 'andamento' | 'concluida'
export async function atualizarStatusDestinatario(token, idDestinatario, status) {
  return requisicao(`/tarefas-destinatarios/${encodeURIComponent(idDestinatario)}`, {
    token,
    method: 'PUT',
    body: { status },
    mensagemErro: 'Não foi possível atualizar a tarefa.',
  })
}

// POST /tarefas (multipart/form-data) -> cria a autotarefa do paciente.
// O back identifica o paciente pelo token e já cria o destinatário com status "pendente".
//   dados = { titulo, prazo: 'AAAA-MM-DD', arquivo: File | null }
// Devolve a tarefa criada (com .id).
export async function criarAutotarefa(token, { titulo, prazo, arquivo }) {
  const form = new FormData()
  form.append('titulo', titulo)
  form.append('tipo', 'autotarefa')
  form.append('is_rascunho', '0')
  form.append('prazo', `${prazo} 23:59:00`)
  if (arquivo) form.append('anexo_arquivo', arquivo)

  const dados = await requisicao('/tarefas', {
    token,
    method: 'POST',
    body: form,
    mensagemErro: 'Não foi possível criar a tarefa.',
  })
  return dados.response?.tarefa
}
