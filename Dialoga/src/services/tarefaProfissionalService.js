// ============================================================
// services/tarefaProfissionalService.js
// Requisições das telas de Tarefas do profissional (só API, sem tela e sem estado).
// Todas lançam Error com .message pronta para a tela e .status com o código HTTP.
//
// Leitura
//   listarPacientesVinculados -> GET /profissionais/me/pacientes (vínculo aceito)
//   listarPacientesParaTarefa -> o mesmo, só com pacientes ativos (os que podem receber tarefa)
//   listarTarefas             -> GET /tarefas (as do profissional do token, com perguntas)
//   buscarTarefa              -> GET /tarefas/:id (com perguntas e opções)
//   listarDestinatarios       -> GET /tarefas-destinatarios?id_tarefa=:id
//   buscarDestinatario        -> GET /tarefas-destinatarios/:id
//   listarRespostas           -> GET /tarefas-destinatarios/:id/respostas
// Escrita
//   criarTarefa               -> POST /tarefas (multipart) + POST /tarefas/:id/perguntas + PUT /tarefas/:id/enviar
//   editarTarefa              -> PUT /tarefas/:id (multipart), perguntas e destinatários, PUT /tarefas/:id/enviar
//   excluirTarefa             -> DELETE /tarefas/:id
//
// O back usa 404 para "lista vazia": nas leituras isso vira [].
// ============================================================
import { requisicao } from './pacienteService'
import { paraBooleano, prazoParaApi, prazoParaIso, perguntaFormParaApi } from '../utils/tarefasProfissional'

const enc = encodeURIComponent

// ---------- leitura ----------

// Pacientes com vínculo aceito: { id, nome, email, telefone, origem: 'plataforma', ativo }  (id = id do PACIENTE)
// O back só devolve e-mail e celular depois que o vínculo é aceito.
export async function listarPacientesVinculados(token, signal) {
  try {
    const dados = await requisicao('/profissionais/me/pacientes', {
      token,
      signal,
      mensagemErro: 'Não foi possível carregar seus pacientes.',
    })
    return (dados.response?.paciente ?? [])
      .filter((p) => String(p.status_vinculo) === '1')
      .map((p) => ({
        id: p.id,
        nome: p.nome_completo,
        email: p.email ?? '',
        telefone: p.celular ?? '',
        fotoUrl: p.foto_avatar ?? null, // foto do perfil do paciente (sem foto: iniciais)
        origem: 'plataforma',
        ativo: String(p.status_atividade ?? '').toLowerCase() !== 'inativo',
      }))
  } catch (erro) {
    if (erro.status === 404) return []
    throw erro
  }
}

// Pacientes que podem receber tarefa: vínculo aceito e paciente ativo
// (o back recusa o envio para quem não tem vínculo aceito ou está inativo)
export async function listarPacientesParaTarefa(token, signal) {
  const todos = await listarPacientesVinculados(token, signal)
  return todos.filter((p) => p.ativo)
}

// Todas as tarefas do profissional (enviadas e rascunhos), cada uma com "perguntas"
export async function listarTarefas(token, signal) {
  try {
    const dados = await requisicao('/tarefas', {
      token,
      signal,
      mensagemErro: 'Não foi possível carregar suas tarefas.',
    })
    return dados.response?.tarefa ?? []
  } catch (erro) {
    if (erro.status === 404) return []
    throw erro
  }
}

// Uma tarefa com perguntas e opções; null quando não existe
export async function buscarTarefa(token, id, signal) {
  try {
    const dados = await requisicao(`/tarefas/${enc(id)}`, {
      token,
      signal,
      mensagemErro: 'Não foi possível carregar a tarefa.',
    })
    return dados.response?.tarefa?.[0] ?? null
  } catch (erro) {
    if (erro.status === 404) return null
    throw erro
  }
}

// Destinatários de uma tarefa: [{ id, prazo, status, data_conclusao, id_tarefa, id_paciente, nome_paciente, nome_tarefa, perguntas }]
export async function listarDestinatarios(token, idTarefa, signal) {
  try {
    const dados = await requisicao(`/tarefas-destinatarios?id_tarefa=${enc(idTarefa)}`, {
      token,
      signal,
      mensagemErro: 'Não foi possível carregar os envios da tarefa.',
    })
    return dados.response?.tarefaDestinatario ?? []
  } catch (erro) {
    if (erro.status === 404) return []
    throw erro
  }
}

// Um destinatário ({ id, prazo, status, data_conclusao, id_tarefa, id_paciente, perguntas }); null quando não existe
export async function buscarDestinatario(token, id, signal) {
  try {
    const dados = await requisicao(`/tarefas-destinatarios/${enc(id)}`, {
      token,
      signal,
      mensagemErro: 'Não foi possível carregar a resposta.',
    })
    return dados.response?.tarefaDestinatario?.[0] ?? null
  } catch (erro) {
    if (erro.status === 404) return null
    throw erro
  }
}

// Linhas de tbl_resposta do destinatário: [{ id, valor, data_envio, id_pergunta, id_opcao_pergunta }]
export async function listarRespostas(token, idDestinatario, signal) {
  try {
    const dados = await requisicao(`/tarefas-destinatarios/${enc(idDestinatario)}/respostas`, {
      token,
      signal,
      mensagemErro: 'Não foi possível carregar as respostas.',
    })
    return dados.response?.resposta ?? []
  } catch (erro) {
    if (erro.status === 404) return []
    throw erro
  }
}

// ---------- escrita ----------

// Corpo multipart de POST/PUT /tarefas.
//   arquivo  -> File novo (vira anexo_arquivo)
//   anexoUrl -> anexo que já existe (o PUT apagaria o anexo se ele não fosse reenviado)
//   prazosPorPaciente -> [{ paciente_id, prazo }] (só no POST: o back cria os destinatários e avisa os pacientes)
//   idProfissionalCriador -> só no PUT (o UPDATE do back zera o criador se ele não vier)
function formularioTarefa({ titulo, instrucoes, rascunho, arquivo, anexoUrl, temPerguntas, prazosPorPaciente, idProfissionalCriador }) {
  const form = new FormData()
  form.append('titulo', titulo.trim())
  // tbl_tarefa.tipo (até 20 caracteres): 'formulario' (com perguntas) ou 'arquivo' (só o anexo)
  form.append('tipo', temPerguntas || !(arquivo || anexoUrl) ? 'formulario' : 'arquivo')
  form.append('instrucoes', (instrucoes ?? '').trim())
  form.append('is_rascunho', rascunho ? '1' : '0')
  if (arquivo) form.append('anexo_arquivo', arquivo)
  else if (anexoUrl) form.append('anexo_url', anexoUrl)
  if (prazosPorPaciente) form.append('prazos_por_paciente', JSON.stringify(prazosPorPaciente))
  if (idProfissionalCriador) form.append('id_profissional_criador', String(idProfissionalCriador))
  return form
}

const bodyPerguntas = (perguntas) => perguntas.map((p, i) => perguntaFormParaApi(p, i + 1))

// Rascunho aceita pergunta ainda sem enunciado, mas o back não: essas ficam de fora
const comEnunciado = (perguntas) => perguntas.filter((p) => p.enunciado.trim())

const gravarPergunta = (token, idTarefa, corpo) =>
  requisicao(`/tarefas/${enc(idTarefa)}/perguntas`, {
    token,
    method: 'POST',
    body: corpo,
    mensagemErro: 'Não foi possível salvar as perguntas.',
  })

const enviarTarefa = (token, idTarefa) =>
  requisicao(`/tarefas/${enc(idTarefa)}/enviar`, {
    token,
    method: 'PUT',
    mensagemErro: 'Não foi possível enviar a tarefa ao paciente.',
  })

export const excluirTarefa = (token, idTarefa) =>
  requisicao(`/tarefas/${enc(idTarefa)}`, {
    token,
    method: 'DELETE',
    mensagemErro: 'Não foi possível excluir a tarefa.',
  })

// Cria a tarefa.
//   dados = { titulo, instrucoes, arquivo: File | null, pacientes: [{ id, prazo: 'AAAA-MM-DD' | '' }], perguntas, rascunho }
// O back cria a tarefa já com os destinatários e avisa cada paciente, por isso o rascunho vai SEM pacientes
// (o paciente não pode ser avisado de uma tarefa que ele ainda não vê). Os pacientes são escolhidos no envio.
// A tarefa nasce como rascunho e só "vira enviada" no fim, depois de gravar todas as perguntas:
// o paciente nunca vê uma tarefa pela metade. Se algo falhar no meio, a tarefa é apagada.
// Devolve o id da tarefa.
export async function criarTarefa(token, dados) {
  const perguntas = dados.rascunho ? comEnunciado(dados.perguntas) : dados.perguntas
  const prazosPorPaciente = dados.rascunho
    ? null
    : dados.pacientes.map((p) => ({ paciente_id: p.id, prazo: prazoParaApi(p.prazo) }))

  const resposta = await requisicao('/tarefas', {
    token,
    method: 'POST',
    body: formularioTarefa({
      titulo: dados.titulo,
      instrucoes: dados.instrucoes,
      rascunho: true,
      arquivo: dados.arquivo,
      temPerguntas: perguntas.length > 0,
      prazosPorPaciente,
    }),
    mensagemErro: dados.rascunho ? 'Não foi possível salvar o rascunho.' : 'Não foi possível enviar a tarefa.',
  })

  const idTarefa = resposta.response?.tarefa?.id
  if (!idTarefa) throw new Error('Não foi possível salvar a tarefa.')

  try {
    for (const corpo of bodyPerguntas(perguntas)) await gravarPergunta(token, idTarefa, corpo)
    if (!dados.rascunho) await enviarTarefa(token, idTarefa)
  } catch (erro) {
    await excluirTarefa(token, idTarefa).catch(() => {}) // limpeza: sem isso sobraria uma tarefa incompleta
    throw erro
  }
  return idTarefa
}

// Edita a tarefa e a envia ao paciente.
//   dados    = { titulo, instrucoes, arquivo: File | null, anexoUrl, pacientes: [{ id, prazo }], perguntas, rascunho }
//   original = { tarefa (linha da API), perguntasIds: [id], destinatarios: [{ id, id_paciente, prazo, status }] }
// - tarefa: PUT /tarefas/:id (manda o criador e o anexo atuais, senão o UPDATE do back os apaga);
// - perguntas: as que sumiram são excluídas, as que existem atualizadas e as novas criadas;
// - destinatários: paciente novo é criado, o que mudou de prazo é atualizado, o removido é excluído.
//   Quem já começou a responder NÃO é excluído (apagaria as respostas dele).
// Com rascunho = true só salva (continua rascunho, sem enviar).
export async function editarTarefa(token, idTarefa, dados, original) {
  const perguntas = dados.rascunho ? comEnunciado(dados.perguntas) : dados.perguntas
  const jaEnviada = !paraBooleano(original.tarefa.is_rascunho)

  // 1) a própria tarefa. Já enviada continua visível durante a edição; rascunho só vira enviada no fim.
  await requisicao(`/tarefas/${enc(idTarefa)}`, {
    token,
    method: 'PUT',
    body: formularioTarefa({
      titulo: dados.titulo,
      instrucoes: dados.instrucoes,
      rascunho: !jaEnviada,
      arquivo: dados.arquivo,
      anexoUrl: dados.anexoUrl,
      temPerguntas: perguntas.length > 0,
      idProfissionalCriador: original.tarefa.id_profissional_criador,
    }),
    mensagemErro: 'Não foi possível salvar a tarefa.',
  })

  // 2) perguntas
  const mantidas = new Set(perguntas.map((p) => p.idApi).filter(Boolean))
  for (const id of original.perguntasIds) {
    if (mantidas.has(id)) continue
    await requisicao(`/perguntas/${enc(id)}`, { token, method: 'DELETE', mensagemErro: 'Não foi possível excluir a pergunta.' })
  }
  const corpos = bodyPerguntas(perguntas)
  for (const [i, pergunta] of perguntas.entries()) {
    if (pergunta.idApi) {
      await requisicao(`/perguntas/${enc(pergunta.idApi)}`, {
        token,
        method: 'PUT',
        body: corpos[i],
        mensagemErro: 'Não foi possível atualizar as perguntas.',
      })
    } else {
      await gravarPergunta(token, idTarefa, corpos[i])
    }
  }

  // 3) destinatários
  const atuais = new Map(original.destinatarios.map((d) => [d.id_paciente, d]))
  const escolhidos = new Set(dados.pacientes.map((p) => p.id))

  for (const [idPaciente, d] of atuais) {
    if (escolhidos.has(idPaciente)) continue
    const naoComecou = !['concluida', 'andamento'].includes(String(d.status ?? '').toLowerCase())
    if (naoComecou) {
      await requisicao(`/tarefas-destinatarios/${enc(d.id)}`, { token, method: 'DELETE', mensagemErro: 'Não foi possível remover o paciente.' })
    }
  }
  for (const p of dados.pacientes) {
    const atual = atuais.get(p.id)
    if (!atual) {
      await requisicao('/tarefas-destinatarios', {
        token,
        method: 'POST',
        body: { prazo: prazoParaApi(p.prazo), status: 'pendente', id_tarefa: Number(idTarefa), id_paciente: p.id },
        mensagemErro: 'Não foi possível adicionar o paciente.',
      })
    } else if ((prazoParaIso(atual.prazo) ?? '') !== (p.prazo ?? '')) {
      await requisicao(`/tarefas-destinatarios/${enc(atual.id)}`, {
        token,
        method: 'PUT',
        body: { prazo: prazoParaApi(p.prazo) },
        mensagemErro: 'Não foi possível atualizar o prazo.',
      })
    }
  }

  // 4) envio
  if (!dados.rascunho) await enviarTarefa(token, idTarefa)
}
