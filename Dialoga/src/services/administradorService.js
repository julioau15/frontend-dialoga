// ============================================================
// services/administradorService.js
// Aqui ficam as funções de administradores que a tela usa.
// Por enquanto elas são MOCK: trabalho com uma lista na memória e
// simulo a demora da rede. Na integração, troco só o corpo de cada
// função pelo fetch indicado no comentário; o hook e a tela continuam
// iguais, porque a entrada e a saída já estão no formato final.
//   listarAdministradores(busca) -> GET    /administradores?busca=
//   criarAdministrador(dados)    -> POST   /administradores
//   removerAdministrador(id)     -> DELETE /administradores/{id}
// Formato de cada administrador que eu devolvo:
//   { id, idUsuario, nome, email, criadoPor, criadoEm }
// Em caso de erro, lanço um Error com .message (texto para a tela),
// .status (código HTTP) e, quando é de um campo, .campo.
// ============================================================
import { ADMINISTRADORES_EXEMPLO } from './administradoresExemplo'
import { textoParaBusca } from '../utils/formatadores'

const ESPERA_MS = 600 // simulo o tempo de resposta da API

// Mudo para true quando quero testar as mensagens de erro da tela
const SIMULAR_FALHA = false

// Minha "tabela" de mentira: começa com os dados de exemplo e muda quando crio ou removo.
// Ela volta ao estado inicial quando a página é recarregada.
let administradoresMock = [...ADMINISTRADORES_EXEMPLO]

function esperar() {
  return new Promise((resolve) => setTimeout(resolve, ESPERA_MS))
}

// Crio o erro no mesmo formato que o fetch vai lançar na integração
function erroSimulado(mensagem, status, campo) {
  const erro = new Error(mensagem)
  erro.status = status
  if (campo) erro.campo = campo
  return erro
}

export async function listarAdministradores(busca = '') {
  // Integração: GET `${API_URL}/administradores?busca=${busca}` com o header x-access-token.
  // O back devolve nome_completo, id_usuario e o e-mail dentro de "usuario":
  // vou converter para o formato do topo deste arquivo.
  await esperar()
  if (SIMULAR_FALHA) throw erroSimulado('Não foi possível carregar os administradores.', 500)

  const termo = textoParaBusca(busca.trim())
  const lista = termo
    ? administradoresMock.filter((a) => textoParaBusca(`${a.nome} ${a.email}`).includes(termo))
    : administradoresMock

  return lista.map((a) => ({ ...a })) // devolvo cópias para a tela não alterar a minha "tabela"
}

export async function criarAdministrador({ nome, email, criadoPor }) {
  // Integração: POST `${API_URL}/administradores` em FormData (o back usa multer),
  // com os campos nome_completo, email e senha_provisoria e o header x-access-token.
  // O envio do e-mail com as credenciais (RN01) fica por conta do back-end.
  await esperar()
  if (SIMULAR_FALHA) throw erroSimulado('Não foi possível criar o administrador. Tente novamente.', 500)

  const emailLimpo = email.trim().toLowerCase()

  // O back responde 409 quando o e-mail já existe; simulo o mesmo
  if (administradoresMock.some((a) => a.email.toLowerCase() === emailLimpo)) {
    throw erroSimulado('Já existe um administrador com este e-mail.', 409, 'email')
  }

  const id = Date.now() // id provisório; na integração uso os ids que o back-end devolver
  const novo = {
    id,
    idUsuario: id,
    nome: nome.trim(),
    email: emailLimpo,
    criadoPor: criadoPor ?? 'Sistema',
    criadoEm: new Date().toISOString(),
  }
  administradoresMock = [...administradoresMock, novo]
  return { ...novo }
}

export async function removerAdministrador(id) {
  // Integração: DELETE `${API_URL}/administradores/${id}` com o header x-access-token
  await esperar()
  if (SIMULAR_FALHA) throw erroSimulado('Não foi possível remover o administrador. Tente novamente.', 500)

  if (!administradoresMock.some((a) => a.id === id)) throw erroSimulado('Administrador não encontrado.', 404)

  // Proteção extra, como o back-end também deve ter: o sistema nunca fica sem administrador
  if (administradoresMock.length <= 1) throw erroSimulado('Não é possível remover o último administrador.', 403)

  administradoresMock = administradoresMock.filter((a) => a.id !== id)
}