// ============================================================
// services/administradorService.js
// Requisições de administradores na API (sem tela e sem controle de estado).
//   listarAdministradores(token, busca)         -> GET    /administradores
//   criarAdministrador(token, dados)            -> POST   /administradores (FormData)
//   removerAdministrador(token, id)             -> DELETE /administradores/:id
// O token é enviado no header x-access-token.
// Formato de cada administrador devolvido:
//   { id, idUsuario, nome, email, criadoPor, criadoEm }
// Em caso de erro, é lançado um Error com .message (texto para a tela),
// .status (código HTTP) e, quando o erro é do e-mail, .campo = 'email'.
// ============================================================
import { API_URL } from '../config/api'
import { textoParaBusca } from '../utils/formatadores'

const ERRO_CONEXAO = 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'
const ERRO_SESSAO = 'Sua sessão expirou. Faça login novamente.'
const ERRO_SERVIDOR = 'Tivemos um problema no servidor. Tente novamente em instantes.'

// Faz a requisição autenticada e devolve o JSON da API.
// Com FormData, o navegador define sozinho o Content-Type com o boundary.
async function requisicao(caminho, { token, method = 'GET', body, mensagemErro }) {
  if (!token) {
    const erro = new Error(ERRO_SESSAO)
    erro.status = 401
    throw erro
  }

  let resposta
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method,
      headers: { 'x-access-token': token },
      body,
    })
  } catch (erro) {
    throw new Error(ERRO_CONEXAO, { cause: erro })
  }

  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok || !dados?.status) {
    let mensagem = dados?.message || mensagemErro || 'Não foi possível concluir a ação.'

    if (resposta.status === 401) mensagem = ERRO_SESSAO
    // Troca as mensagens técnicas de erro 500 por um texto para a tela
    if (resposta.status >= 500) mensagem = mensagemErro || ERRO_SERVIDOR

    const erro = new Error(mensagem)
    erro.status = resposta.status
    // Somente o erro de e-mail é associado a um campo do formulário
    if (String(dados?.field ?? '').startsWith('[EMAIL]')) erro.campo = 'email'
    throw erro
  }

  return dados
}

// Converte o item da API para o formato usado na tela.
// A listagem traz os dados do usuário no próprio item; a criação traz em "usuario" (array).
function normalizarAdministrador(item) {
  const usuario = Array.isArray(item.usuario) ? item.usuario[0] : item.usuario

  return {
    id: item.id,
    idUsuario: item.id_usuario ?? usuario?.id,
    nome: item.nome_completo,
    email: item.email ?? usuario?.email,
    criadoPor: item.criado_por ?? null,
    criadoEm: item.data_criacao ?? usuario?.data_criacao ?? null,
  }
}

// Busca a lista de administradores.
// A API não filtra por texto, então a busca é aplicada sobre a lista recebida.
export async function listarAdministradores(token, busca = '') {
  let dados
  try {
    dados = await requisicao('/administradores', {
      token,
      mensagemErro: 'Não foi possível carregar os administradores.',
    })
  } catch (erro) {
    // A API responde 404 quando a tabela está vazia
    if (erro.status === 404) return []
    throw erro
  }

  const lista = (dados.response?.administrador ?? []).map(normalizarAdministrador)
  const termo = textoParaBusca(busca.trim())

  return termo ? lista.filter((a) => textoParaBusca(`${a.nome} ${a.email}`).includes(termo)) : lista
}

// Cria o administrador.
// O celular segue vazio porque a rota converte campo ausente no texto "undefined";
// vazio é gravado como NULL.
export async function criarAdministrador(token, { nome, email, senha }) {
  const corpo = new FormData()
  corpo.append('nome_completo', nome.trim())
  corpo.append('email', email.trim().toLowerCase())
  corpo.append('celular', '')
  corpo.append('senha_provisoria', senha)

  const dados = await requisicao('/administradores', {
    token,
    method: 'POST',
    body: corpo,
    mensagemErro: 'Não foi possível criar o administrador. Tente novamente.',
  })

  return normalizarAdministrador(dados.response.administrador)
}

// Remove o administrador e o usuário vinculado a ele.
export async function removerAdministrador(token, id) {
  await requisicao(`/administradores/${encodeURIComponent(id)}`, {
    token,
    method: 'DELETE',
    mensagemErro: 'Não foi possível remover o administrador. Tente novamente.',
  })
}
