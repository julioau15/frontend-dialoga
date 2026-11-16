// ============================================================
// services/notificacoesService.js
// Requisições das notificações recebidas (paciente e profissional).
// Só faz requisições: sem tela e sem controle de estado.
//   listarNotificacoesRequest(token, signal) -> GET /notificacoes (+ GET /categorias)
//   marcarNotificacaoLidaRequest(token, id)  -> PUT /notificacoes/:id/marcar-lida
//   marcarTodasLidasRequest(token)           -> PUT /notificacoes/marcar-todas-lidas
// O back identifica o usuário (paciente ou profissional) pelo token.
// O back usa 404 para "lista vazia": aqui isso vira [].
// ============================================================
import { requisicao } from './pacienteService'

// GET autenticado de uma lista; 404 (lista vazia no back) vira []
async function listar(token, caminho, chave, signal, mensagemErro) {
  try {
    const dados = await requisicao(caminho, { token, signal, mensagemErro })
    const lista = dados.response?.[chave]
    return Array.isArray(lista) ? lista : []
  } catch (erro) {
    if (erro.status === 404) return []
    throw erro
  }
}

// Busca as notificações do usuário logado e as categorias (a notificação só traz o id_categoria).
// Se só as categorias falharem, as notificações aparecem com a categoria genérica.
export async function listarNotificacoesRequest(token, signal) {
  const [notificacoes, categorias] = await Promise.all([
    listar(token, '/notificacoes', 'notificacao', signal, 'Não foi possível carregar suas notificações.'),
    listar(token, '/categorias', 'categoria', signal).catch((erro) => {
      if (signal?.aborted) throw erro
      return []
    }),
  ])

  return { notificacoes, categorias }
}

// Marca uma notificação como lida
export async function marcarNotificacaoLidaRequest(token, id) {
  await requisicao(`/notificacoes/${id}/marcar-lida`, {
    token,
    method: 'PUT',
    mensagemErro: 'Não foi possível marcar a notificação como lida.',
  })
}

// Marca todas as notificações do usuário logado como lidas
export async function marcarTodasLidasRequest(token) {
  await requisicao('/notificacoes/marcar-todas-lidas', {
    token,
    method: 'PUT',
    mensagemErro: 'Não foi possível marcar as notificações como lidas.',
  })
}
