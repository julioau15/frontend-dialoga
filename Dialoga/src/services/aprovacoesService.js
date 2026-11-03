// ============================================================
// services/aprovacoesService.js
// Comunicação com as rotas JÁ EXISTENTES do back-end para aprovar
// profissionais (/aprovacoes-profissionais). Só faz requisições:
// não mexe em tela nem em estado. Todas exigem o token do admin.
//
//   GET /aprovacoes-profissionais                 -> lista todas as solicitações
//   PUT /aprovacoes-profissionais/:idProfissional/aprovar
//   PUT /aprovacoes-profissionais/:idProfissional/recusar
//
// ATENÇÃO: nos PUT o :id é o id do PROFISSIONAL (não o id da linha da
// aprovação) — é assim que o back faz o UPDATE (WHERE id_profissional = ?).
// ============================================================
import { API_URL } from '../config/api'

const URL_APROVACOES = `${API_URL}/aprovacoes-profissionais`

// O back lê o token no header "x-access-token"
function cabecalhos(token) {
  return { 'Content-Type': 'application/json', 'x-access-token': token }
}

// fetch + leitura do JSON. Se não conseguir falar com o servidor, lança um erro amigável.
async function requisitar(url, opcoes) {
  let res
  try {
    res = await fetch(url, opcoes)
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique se a API está rodando.')
  }
  const data = await res.json().catch(() => null)
  return { res, data }
}

// No banco, status_aprovacao é TINYINT: NULL = pendente, 1 = aprovado, 0 = recusado.
// (A documentação OpenAPI fala em texto "Pendente/Aprovado/Recusado", então aceitamos os dois.)
function normalizarStatus(valor) {
  if (valor === 1 || valor === '1' || valor === true) return 'aprovado'
  if (valor === 0 || valor === '0' || valor === false) return 'recusado'
  const texto = String(valor ?? '').toLowerCase()
  if (texto.startsWith('aprov')) return 'aprovado'
  if (texto.startsWith('recus') || texto.startsWith('reprov')) return 'recusado'
  return 'pendente'
}

// Transforma o item do back no formato que as telas usam:
// { id, idProfissional, nome, especialidade, clinica, email, telefone, crp, cpf, status, enviadoEm }
function normalizarAprovacao(item) {
  // o back devolve "profissional" como lista de 1 item
  const p = (Array.isArray(item.profissional) ? item.profissional[0] : item.profissional) ?? {}
  const especialidades = Array.isArray(p.especialidade) ? p.especialidade : []

  return {
    id: item.id,
    idProfissional: p.id ?? item.id_profissional,
    nome: p.nome_completo ?? '',
    especialidade: especialidades.map((e) => e.especialidade).join(', '),
    clinica: p.instituicao_clinica ?? '',
    email: p.email ?? '',
    telefone: p.celular ?? '',
    crp: p.crp ?? '',
    cpf: p.cpf ?? '',
    status: normalizarStatus(item.status_aprovacao),
    enviadoEm: item.criado_em,
  }
}

// GET /aprovacoes-profissionais
// O back ainda NÃO filtra por status/busca (apesar de constar no OpenAPI):
// ele devolve tudo, então o filtro e a busca são feitos na tela.
export async function listarAprovacoes(token) {
  const { res, data } = await requisitar(URL_APROVACOES, { headers: cabecalhos(token) })

  if (res.status === 404) return [] // o back responde 404 quando não há nenhuma solicitação
  if (!data?.status) throw new Error(data?.message ?? 'Não foi possível carregar as solicitações.')

  return (data.response.administradorProfissional ?? []).map(normalizarAprovacao)
}

async function decidir(idProfissional, acao, token, mensagemErro) {
  const { data } = await requisitar(`${URL_APROVACOES}/${idProfissional}/${acao}`, {
    method: 'PUT',
    headers: cabecalhos(token),
  })
  if (!data?.status) throw new Error(data?.message ?? mensagemErro)
}

// PUT /aprovacoes-profissionais/:idProfissional/aprovar
export const aprovarProfissional = (idProfissional, token) =>
  decidir(idProfissional, 'aprovar', token, 'Não foi possível aprovar o profissional.')

// PUT /aprovacoes-profissionais/:idProfissional/recusar
export const recusarProfissional = (idProfissional, token) =>
  decidir(idProfissional, 'recusar', token, 'Não foi possível recusar o profissional.')
