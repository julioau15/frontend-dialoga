// ============================================================
// services/aprovacoesService.js
// Comunicação com as rotas JÁ EXISTENTES do back-end para aprovar
// profissionais (/aprovacoes-profissionais). Só faz requisições:
// não mexe em tela nem em estado. Todas exigem o token do admin.
//
//   GET /aprovacoes-profissionais                 -> lista todas as solicitações
//                                                    (com o admin responsável de cada pendente)
//   PUT /aprovacoes-profissionais/:idProfissional/aprovar
//   PUT /aprovacoes-profissionais/:idProfissional/recusar
//
// ATENÇÃO: nos PUT o :id é o id do PROFISSIONAL (não o id da linha da
// aprovação) — é assim que o back faz o UPDATE (WHERE id_profissional = ?).
// ============================================================
import { API_URL } from '../config/api'

const CAMINHO = '/aprovacoes-profissionais'

// Cria erros com status para permitir tratamento pela interface.
function criarErro(mensagem, status) {
  const erro = new Error(mensagem)
  erro.status = status
  return erro
}

// Valida identificadores antes de montar uma URL de decisão.
function validarId(valor) {
  if (!/^[1-9]\d*$/.test(String(valor))) {
    throw criarErro('A solicitação possui um identificador inválido.', 400)
  }

  const id = Number(valor)
  if (!Number.isSafeInteger(id)) {
    throw criarErro('A solicitação possui um identificador inválido.', 400)
  }

  return id
}

// Executa requisições sem expor mensagens técnicas de erro do servidor.
async function requisitar(caminho, { token, signal, method = 'GET' }) {
  if (!token) {
    throw criarErro('Sua sessão expirou. Faça login novamente.', 401)
  }

  let resposta

  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method,
      headers: { 'x-access-token': token },
      signal,
    })
  } catch (erro) {
    if (signal?.aborted) throw erro
    throw new Error(
      'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
      { cause: erro },
    )
  }

  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok) {
    if (resposta.status === 401) {
      throw criarErro('Sua sessão expirou. Faça login novamente.', 401)
    }

    if (resposta.status === 403) {
      throw criarErro('Você não tem permissão para realizar esta ação.', 403)
    }

    // Somente o 404 JSON conhecido representa uma listagem vazia.
    if (
      method === 'GET' &&
      resposta.status === 404 &&
      dados?.status === false &&
      dados?.status_code === 404 &&
      dados?.message === 'Não foi possivel encontrar nenhum registro.'
    ) {
      return { response: { administradorProfissional: [] } }
    }

    // 409: a solicitação já foi decidida ou está atribuída a outro administrador
    if (resposta.status === 409) {
      throw criarErro(
        'Esta solicitação já foi decidida ou está atribuída a outro administrador. A lista foi atualizada.',
        409,
      )
    }

    throw criarErro(
      method === 'GET'
        ? 'Não foi possível carregar as solicitações.'
        : 'Não foi possível registrar a decisão. Tente novamente.',
      resposta.status,
    )
  }

  if (dados?.status !== true) {
    throw new Error('O servidor retornou uma resposta inválida.')
  }

  return dados
}

// Reconhece apenas os estados previstos no contrato atual.
function normalizarStatus(valor) {
  if (valor === null) return 'pendente'
  if ([1, '1', true].includes(valor)) return 'aprovado'
  if ([0, '0', false].includes(valor)) return 'recusado'

  const texto = String(valor ?? '').trim().toLowerCase()
  if (texto === 'pendente') return 'pendente'
  if (texto === 'aprovado') return 'aprovado'
  if (texto === 'recusado' || texto === 'reprovado') return 'recusado'

  throw new Error('O servidor retornou um status de solicitação inválido.')
}

// Converte o registro da API para o formato já utilizado pelos componentes.
function normalizarAprovacao(item) {
  if (!item || typeof item !== 'object') {
    throw new Error('O servidor retornou uma solicitação inválida.')
  }

  const profissional = Array.isArray(item.profissional)
    ? item.profissional[0]
    : item.profissional

  if (
    !profissional ||
    typeof profissional !== 'object' ||
    typeof profissional.nome_completo !== 'string' ||
    !profissional.nome_completo.trim()
  ) {
    throw new Error('Não foi possível identificar o profissional da solicitação.')
  }

  const especialidades = Array.isArray(profissional.especialidade)
    ? profissional.especialidade
    : []

  return {
    id: validarId(item.id),
    idProfissional: validarId(profissional.id ?? item.id_profissional),
    nome: profissional.nome_completo,
    especialidade: especialidades
      .map((especialidade) => especialidade.especialidade)
      .filter(Boolean)
      .join(', '),
    clinica: profissional.instituicao_clinica ?? '',
    email: profissional.email ?? '',
    telefone: profissional.celular ?? '',
    crp: profissional.crp ?? '',
    cpf: profissional.cpf ?? '',
    status: normalizarStatus(item.status_aprovacao),
    enviadoEm: item.criado_em,
    // divisão fixa: administrador responsável pela decisão (null quando ainda não há)
    responsavel: item.responsavel
      ? { id: item.responsavel.id, nome: item.responsavel.nome_completo ?? '' }
      : null,
    atribuidaAMim: item.atribuida_a_mim === true,
  }
}

// Carrega a lista completa; busca e filtros continuam no frontend.
export async function listarAprovacoes(token, signal) {
  const dados = await requisitar(CAMINHO, { token, signal })
  const lista = dados.response?.administradorProfissional

  if (!Array.isArray(lista)) {
    throw new Error('O servidor retornou uma lista de solicitações inválida.')
  }

  return lista.map(normalizarAprovacao)
}

// Registra uma decisão usando exclusivamente o ID do profissional.
async function decidir(idProfissional, acao, token) {
  const id = validarId(idProfissional)

  await requisitar(`${CAMINHO}/${id}/${acao}`, {
    token,
    method: 'PUT',
  })
}

// Aprova o profissional selecionado.
export function aprovarProfissional(idProfissional, token) {
  return decidir(idProfissional, 'aprovar', token)
}

// Recusa o profissional selecionado.
export function recusarProfissional(idProfissional, token) {
  return decidir(idProfissional, 'recusar', token)
}
