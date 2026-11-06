// ============================================================
// services/profissionalService.js
// Requisições usadas no primeiro acesso do profissional (tela de boas-vindas).
// Só usa rotas que JÁ existem no back-end:
//   GET    /profissionais/me                -> id e nome do profissional logado
//   GET    /pacientes/busca?busca=texto     -> busca de pacientes por nome ou e-mail
//   GET    /vinculos                        -> vínculos (para saber quem já tem solicitação/acompanhamento)
//   GET    /categorias                      -> id da categoria "vinculo / solicitacao_recebida"
//   POST   /profissionais/me/pacientes/:id  -> cria o vínculo (o paciente poderá aceitar ou recusar)
//   POST   /notificacoes                    -> guarda a notificação do paciente no banco
//   DELETE /vinculos/:id                    -> desfaz o vínculo se a notificação falhar
// Só faz requisições (sem tela e sem controle de estado).
// Em caso de erro, lança um Error com .message pronta para a tela
// e .status com o código HTTP (quando houver resposta).
// ============================================================
import { API_URL } from '../config/api'
import { dataHoraSQL } from '../utils/formatadores'

const MAX_RESULTADOS = 8 // a rota de busca não limita a quantidade

const ERRO_CONEXAO = 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'
const ERRO_SESSAO = 'Sua sessão expirou. Faça login novamente.'
const ERRO_SERVIDOR = 'Tivemos um problema no servidor. Tente novamente em instantes.'

// Faz a requisição autenticada e devolve o JSON da API quando der certo.
//   caminho -> ex.: '/pacientes'
//   opcoes  -> { token, method, body, signal, mensagemErro, vazioEm404 }
// body (objeto) é enviado como JSON.
// vazioEm404 -> o back responde 404 quando uma lista está vazia: com true isso vira { response: {} }.
async function requisicao(caminho, { token, method = 'GET', body, signal, mensagemErro, vazioEm404 = false }) {
  // Sem token não adianta chamar a API: ela responderia 401
  if (!token) {
    const erro = new Error(ERRO_SESSAO)
    erro.status = 401
    throw erro
  }

  const headers = { 'x-access-token': token }

  // IMPORTANTE: o back compara o Content-Type exatamente com "application/json".
  // Não acrescente "; charset=utf-8", senão a API responde 415.
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let resposta
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (erro) {
    // Cancelamento (AbortController) não é falha de conexão: repassa como veio,
    // para quem chamou reconhecer e ignorar.
    if (signal?.aborted) throw erro
    throw new Error(ERRO_CONEXAO, { cause: erro })
  }

  // O fetch não rejeita em 400/500: lemos o JSON e conferimos o resultado
  const dados = await resposta.json().catch(() => null)

  if (vazioEm404 && resposta.status === 404) return { response: {} }

  if (!resposta.ok || !dados?.status) {
    let mensagem = dados?.message || mensagemErro || 'Não foi possível concluir a ação.'

    if (resposta.status === 401) mensagem = ERRO_SESSAO
    // As mensagens 500 do back são técnicas ("[ERRO NA CONTROLLER]"): trocamos por uma amigável
    if (resposta.status >= 500) mensagem = mensagemErro || ERRO_SERVIDOR

    const erro = new Error(mensagem)
    erro.status = resposta.status
    erro.campo = dados?.field
    throw erro
  }

  return dados
}

// No banco o status do vínculo é número (0 pendente, 1 ativo, 2 recusado), mas o seed de teste usa texto.
// Só "pendente" e "ativo" contam como vínculo em aberto: recusado/encerrado permitem pedir de novo.
function situacaoDoVinculo(status) {
  const valor = String(status).toLowerCase()
  if (valor === '1' || valor === 'ativo') return 'ativo'
  if (valor === '0' || valor === 'pendente') return 'pendente'
  return null
}

// { [idPaciente]: 'pendente' | 'ativo' } com os vínculos em aberto deste profissional ("ativo" vence "pendente")
function situacoesPorPaciente(vinculos, idProfissional) {
  const situacoes = {}
  for (const vinculo of vinculos) {
    if (vinculo.id_profissional !== idProfissional) continue // /vinculos traz os de todos os profissionais

    const situacao = situacaoDoVinculo(vinculo.status)
    if (situacao && situacoes[vinculo.id_paciente] !== 'ativo') situacoes[vinculo.id_paciente] = situacao
  }
  return situacoes
}

// Quem está logado (id e nome) e com quais pacientes ele já tem vínculo em aberto
async function carregarContexto(token, signal) {
  const [perfil, vinculos] = await Promise.all([
    requisicao('/profissionais/me', { token, signal, mensagemErro: 'Não foi possível carregar o seu cadastro.' }),
    requisicao('/vinculos', { token, signal, vazioEm404: true, mensagemErro: 'Não foi possível carregar os seus vínculos.' }),
  ])

  const eu = perfil.response?.profissional?.[0]
  if (!eu) throw new Error('Não foi possível identificar o seu cadastro de profissional.')

  return { eu, situacoes: situacoesPorPaciente(vinculos.response?.vinculo ?? [], eu.id) }
}

// { [idPaciente]: 'pendente' | 'ativo' } com quem já tem solicitação ou acompanhamento com este profissional.
// A rota de busca não informa isso, então a tela cruza o resultado da busca com este mapa.
export async function carregarSituacoesVinculo(token, signal) {
  const contexto = await carregarContexto(token, signal)
  return contexto.situacoes
}

// Na busca do back (LIKE), "%" e "_" funcionam como curingas ("%" sozinho devolveria TODOS os pacientes).
// Com "\" na frente eles valem como texto comum.
function escaparCuringas(texto) {
  return texto.replace(/[\\%_]/g, '\\$&')
}

// GET /pacientes/busca?busca=texto
// O back procura o texto no nome OU em qualquer parte do e-mail (sem diferenciar maiúsculas e acentos) e
// devolve 404 quando ninguém combina (aqui isso vira lista vazia). Texto em branco ou com mais de 150 caracteres dá 400.
// Devolve até 8 pacientes: [{ id, nome_completo, email, foto_avatar }]
export async function buscarPacientes(token, termo, signal) {
  const params = new URLSearchParams({ busca: escaparCuringas(termo) })

  const dados = await requisicao(`/pacientes/busca?${params}`, {
    token,
    signal,
    vazioEm404: true,
    mensagemErro: 'Não foi possível buscar os pacientes.',
  })

  return (dados.response?.paciente ?? []).slice(0, MAX_RESULTADOS).map((paciente) => ({
    id: paciente.id,
    nome_completo: paciente.nome_completo ?? '',
    email: paciente.email ?? '',
    foto_avatar: paciente.foto_avatar ?? null,
  }))
}

// Cria o vínculo e guarda a notificação para o paciente, que poderá aceitar ou recusar.
// O back não faz isso numa operação só, então:
//   1) confere tudo ANTES de gravar (sem vínculo em aberto, categoria da notificação existe)
//   2) cria o vínculo (o back responde 201 mesmo quando falha: o vínculo só vale se vier o "id")
//   3) grava a notificação; se falhar, desfaz o vínculo para não ficar solicitação sem aviso
// paciente = { id, ... } escolhido na busca. Erro 409 = já existe solicitação pendente ou acompanhamento ativo.
export async function vincularPaciente(token, paciente) {
  // 1) conferências
  const [contexto, categorias] = await Promise.all([
    carregarContexto(token),
    requisicao('/categorias', { token, mensagemErro: 'Não foi possível preparar o aviso ao paciente.' }),
  ])

  if (contexto.situacoes[paciente.id]) {
    const erro = new Error('Você já enviou uma solicitação para este paciente ou já o acompanha.')
    erro.status = 409
    throw erro
  }

  const categoria = (categorias.response?.categoria ?? []).find(
    (c) => c.categoria === 'vinculo' && c.tipo_especifico === 'solicitacao_recebida',
  )
  if (!categoria) throw new Error('Não foi possível preparar o aviso ao paciente.')

  // 2) vínculo
  const criado = await requisicao(`/profissionais/me/pacientes/${encodeURIComponent(paciente.id)}`, {
    token,
    method: 'POST',
    mensagemErro: 'Não foi possível enviar a solicitação ao paciente.',
  })

  const idVinculo = criado.response?.profissional?.id
  if (!idVinculo) throw new Error('Não foi possível enviar a solicitação ao paciente.')

  // 3) notificação (se falhar, desfaz só este vínculo)
  try {
    await requisicao('/notificacoes', {
      token,
      method: 'POST',
      body: {
        titulo_mensagem: `${contexto.eu.nome_completo} solicitou acompanhamento`,
        lida: 0,
        data_criacao: dataHoraSQL(),
        referencia_evento: `vinculo:${idVinculo}`,
        id_categoria: categoria.id,
        id_profissional: null,
        id_paciente: paciente.id,
      },
      mensagemErro: 'Não foi possível avisar o paciente. Tente novamente.',
    })
  } catch (erro) {
    const desfeito = await requisicao(`/vinculos/${idVinculo}`, { token, method: 'DELETE' }).then(() => true, () => false)

    if (!desfeito) {
      throw new Error('A solicitação foi registrada, mas não conseguimos avisar o paciente. Fale com o suporte.', { cause: erro })
    }
    throw erro
  }
}
