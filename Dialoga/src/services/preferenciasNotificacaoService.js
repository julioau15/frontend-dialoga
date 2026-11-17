// ============================================================
// services/preferenciasNotificacaoService.js
// Requisições das preferências de notificação (paciente e profissional).
// Só faz requisições: sem tela e sem controle de estado.
//   carregarPreferenciasRequest(token, signal) -> GET /preferencias-notificacao
//   salvarPreferenciasRequest(token, preferencias) -> PUT /preferencias-notificacao
// O back identifica o usuário (paciente ou profissional) pelo token,
// enviado no header x-access-token.
// O GET devolve 404 quando o usuário ainda não salvou nada: vira lista vazia.
// O PUT substitui todas as preferências do usuário pela lista enviada.
// Em caso de erro lançam um Error com .message (texto para a tela)
// e .status (HTTP).
// ============================================================
import { API_URL } from '../config/api'

const CAMINHO = '/preferencias-notificacao'

const ERRO_CONEXAO = 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'
const ERRO_SESSAO = 'Sua sessão expirou. Faça login novamente.'
const ERRO_SERVIDOR = 'Tivemos um problema no servidor. Tente novamente em instantes.'

// Limites das colunas de tbl_preferencia_notificacao (iguais aos do back)
const MAX_CATEGORIA = 30
const MAX_TIPO = 50

// Faz a requisição e devolve o JSON da API quando der certo.
// vazioEm404 = true devolve null no 404 (usuário sem preferências salvas).
async function chamar({ token, method = 'GET', body, signal, mensagemErro, vazioEm404 = false }) {
  if (!token) {
    const erro = new Error(ERRO_SESSAO)
    erro.status = 401
    throw erro
  }

  // O Content-Type só é enviado quando há corpo (o back valida application/json)
  const headers = { 'x-access-token': token }
  if (body) headers['Content-Type'] = 'application/json'

  let resposta
  try {
    resposta = await fetch(`${API_URL}${CAMINHO}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (erro) {
    if (signal?.aborted) throw erro // cancelamento: quem chamou ignora
    throw new Error(ERRO_CONEXAO, { cause: erro })
  }

  if (resposta.status === 404 && vazioEm404) return null

  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok || !dados?.status) {
    let mensagem = dados?.message || mensagemErro
    if (resposta.status === 401) mensagem = ERRO_SESSAO
    // mensagens 500 do back são técnicas: troca por uma amigável
    if (resposta.status >= 500) mensagem = mensagemErro || ERRO_SERVIDOR

    const erro = new Error(mensagem)
    erro.status = resposta.status
    throw erro
  }

  return dados
}

// Confere a lista antes de enviar (mesmas regras do back).
// Devolve o texto do erro ou '' quando está tudo certo.
export function validarPreferencias(preferencias) {
  if (!Array.isArray(preferencias) || preferencias.length === 0) return 'Nenhuma preferência para salvar.'

  const invalida = preferencias.some(
    ({ categoria, tipo_especifico: tipo, ativo }) =>
      typeof categoria !== 'string' ||
      !categoria.trim() ||
      categoria.length > MAX_CATEGORIA ||
      (tipo != null && (typeof tipo !== 'string' || tipo.length > MAX_TIPO)) ||
      ![0, 1].includes(ativo),
  )

  return invalida ? 'Não foi possível salvar: há preferências inválidas.' : ''
}

// Busca as preferências salvas do usuário logado.
// Devolve a lista de linhas da API ([] quando ainda não salvou nada).
export async function carregarPreferenciasRequest(token, signal) {
  const dados = await chamar({
    token,
    signal,
    vazioEm404: true,
    mensagemErro: 'Não foi possível carregar suas preferências.',
  })

  const lista = dados?.response?.preferenciaNotificacao
  return Array.isArray(lista) ? lista : []
}

// Grava todas as preferências do usuário logado (substitui as anteriores).
export async function salvarPreferenciasRequest(token, preferencias) {
  const erroValidacao = validarPreferencias(preferencias)
  if (erroValidacao) throw new Error(erroValidacao)

  await chamar({
    token,
    method: 'PUT',
    body: { preferencias },
    mensagemErro: 'Não foi possível salvar suas preferências.',
  })
}
