// ============================================================
// services/tratamentoService.js
// Requisições de tratamentos do paciente autenticado.
// Não controla componentes nem persiste dados no navegador.
import { API_URL } from '../config/api'
import {
  montarPayloadTratamento,
  normalizarDose,
  normalizarTratamento,
} from '../utils/tratamentos'

const CAMINHO_PACIENTE = '/pacientes/me/tratamentos'
const CAMINHO_DOSES = '/pacientes/me/doses'

// Executa uma chamada autenticada e mantém o status para quem a utiliza.
async function chamar(token, caminho, {
  method = 'GET',
  body,
  signal,
} = {}) {
  if (!token) {
    const erro = new Error('Sua sessão expirou. Faça login novamente.')
    erro.status = 401
    throw erro
  }

  const headers = { 'x-access-token': token }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let resposta

  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (causa) {
    if (signal?.aborted) throw causa

    const erro = new Error(
      method === 'GET'
        ? 'Não foi possível conectar ao servidor.'
        : 'A conexão falhou. Atualize a lista para conferir se a operação foi concluída.',
      { cause: causa },
    )
    erro.resultadoIncerto = method !== 'GET'
    throw erro
  }

  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok || !dados?.status) {
    let mensagem = 'Não foi possível concluir a operação.'

    if (resposta.status === 401) {
      mensagem = 'Sua sessão expirou. Faça login novamente.'
    } else if (resposta.status === 403) {
      mensagem = 'Você não tem permissão para realizar esta operação.'
    } else if (resposta.status === 404) {
      mensagem = 'O registro solicitado não foi encontrado.'
    } else if (resposta.status === 400) {
      mensagem = 'Revise os dados informados.'
    } else if (resposta.status >= 500) {
      mensagem = 'O servidor apresentou um problema. Tente novamente.'
    }

    const erro = new Error(mensagem)
    erro.status = resposta.status
    // Um erro após o início de uma mutação pode ocorrer após gravação parcial.
    erro.resultadoIncerto =
      method !== 'GET' && (resposta.status >= 500 || resposta.ok)
    throw erro
  }

  return dados
}

// Confere identificadores antes de montar uma URL de alteração.
function validarId(id) {
  const numero = Number(id)
  if (!Number.isSafeInteger(numero) || numero <= 0) {
    throw new Error('Tratamento inválido.')
  }
  return numero
}

// Lista somente tratamentos do paciente identificado pelo token.
export async function listarTratamentosRequest(token, signal) {
  let dados

  try {
    dados = await chamar(token, CAMINHO_PACIENTE, { signal })
  } catch (erro) {
    if (erro.status !== 404) throw erro

    // O backend também usa 404 quando não encontra o paciente do token.
    // Só considera lista vazia depois de confirmar o perfil.
    const perfil = await chamar(token, '/pacientes/me', { signal })
    const paciente = perfil?.response?.paciente
    const encontrado = Array.isArray(paciente) ? paciente[0] : paciente

    if (!encontrado?.id) {
      throw new Error('Não foi possível identificar o paciente da sessão.', { cause: erro })
    }

    return []
  }

  const registros = dados?.response?.tratamento

  if (!Array.isArray(registros)) {
    throw new Error('A API retornou uma lista de tratamentos inválida.')
  }

  return registros.map(normalizarTratamento)
}

// Cria usando o paciente do token e devolve o ID gerado pelo servidor.
export async function criarTratamentoRequest(token, campos) {
  const dados = await chamar(token, CAMINHO_PACIENTE, {
    method: 'POST',
    body: montarPayloadTratamento(campos),
  })

  const id = Number(dados?.response?.tratamento?.id)

  if (!Number.isSafeInteger(id) || id <= 0) {
    const erro = new Error(
      'A operação foi aceita, mas o servidor não retornou o ID. Atualize a lista.',
    )
    erro.resultadoIncerto = true
    throw erro
  }

  return id
}

// Envia todos os horários porque o backend substitui os anteriores.
export async function editarTratamentoRequest(token, id, campos) {
  await chamar(token, `/tratamentos/${validarId(id)}`, {
    method: 'PUT',
    body: montarPayloadTratamento(campos),
  })
}

// Solicita a exclusão; a página deve reler a lista antes de confirmar.
export async function excluirTratamentoRequest(token, id) {
  await chamar(token, `/tratamentos/${validarId(id)}`, {
    method: 'DELETE',
  })
}

// Lista as doses de hoje do paciente do token (uma por horário), com a situação de cada uma.
// 404 (usuário sem perfil de paciente) vira lista vazia, como na listagem de tratamentos.
export async function listarDosesDoDiaRequest(token, signal) {
  let dados

  try {
    dados = await chamar(token, CAMINHO_DOSES, { signal })
  } catch (erro) {
    if (erro.status === 404) return []
    throw erro
  }

  const registros = dados?.response?.doses

  if (!Array.isArray(registros)) {
    throw new Error('A API retornou uma lista de doses inválida.')
  }

  return registros.map(normalizarDose)
}

// Confirma (marca como tomada) a dose de hoje do horário informado.
// A página relê as doses depois para confirmar o registro.
export async function confirmarDoseRequest(token, idHorario) {
  await chamar(token, `${CAMINHO_DOSES}/${validarId(idHorario)}/confirmar`, {
    method: 'POST',
  })
}
