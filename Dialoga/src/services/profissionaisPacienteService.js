// ============================================================
// services/profissionaisPacienteService.js
// Requisições da tela Profissionais do paciente (RF317–RF331, RN99–RN104).
// Só faz requisições e converte as respostas para o formato da tela (sem estado).
//   listarMeusProfissionais -> GET /pacientes/me/profissionais (+ GET /pacientes/me/consultas)
//   buscarProfissionalPorCpf -> GET /profissionais (procura o CPF na lista)
//   aceitarVinculo           -> PUT /vinculos/:id/aceitar (solicitação recebida do profissional)
//   inativarVinculo          -> PUT /vinculos/:id/recusar (solicitação pendente)
//   encerrarVinculo          -> GET + PUT /vinculos/:id (acompanhamento ativo)
// O vínculo novo usa o vincularProfissional do pacienteService (POST /pacientes/me/profissionais/:id).
// O back usa 404 para "lista vazia": aqui isso vira [].
// ============================================================
import { requisicao } from './pacienteService'
import { dataLocalISO } from '../utils/formatadores'
import { limparCpf } from '../utils/validators'

// O mysql2 devolve DATE/DATETIME como "2026-09-02T03:00:00.000Z": ficamos só com AAAA-MM-DD
const soData = (valor) => String(valor ?? '').slice(0, 10)

// GET autenticado de uma lista; 404 (lista vazia no back) vira []
async function listar(token, caminho, chave, signal, mensagemErro) {
  try {
    const dados = await requisicao(caminho, { token, signal, mensagemErro })
    return dados.response?.[chave] ?? []
  } catch (erro) {
    if (erro.status === 404) return []
    throw erro
  }
}

// Status do vínculo no formato da tela. O back grava números (0 pendente, 1 ativo, 2 recusado)
// e os dados de exemplo usam texto ("ativo", "pendente", "encerrado"...).
// RN101: o vínculo removido não é apagado; tudo que não é ativo nem pendente vai para o Histórico.
export function statusDoVinculo(valor) {
  const status = String(valor ?? '').toLowerCase()
  if (status === '1' || status === 'ativo' || status === 'aceito') return 'ativo'
  if (status === '0' || status === 'pendente') return 'pendente'
  return 'inativo'
}

// Quem pediu o vínculo: o back grava 1 (ou "profissional") quando o profissional convidou o
// paciente e 2 (ou "paciente") quando o paciente pediu
const pedidoPeloProfissional = (origem) => ['1', 'profissional'].includes(String(origem ?? '').toLowerCase())

// Próxima consulta de cada vínculo (AAAA-MM-DD), a partir de hoje e sem as canceladas
function proximasConsultasPorVinculo(consultas) {
  const hoje = dataLocalISO() // data de hoje no fuso do navegador
  const proximas = {}
  for (const c of consultas) {
    const data = soData(c.data)
    if (!data || data < hoje || String(c.status).toLowerCase() === 'cancelada') continue
    if (!proximas[c.id_vinculo] || data < proximas[c.id_vinculo]) proximas[c.id_vinculo] = data
  }
  return proximas
}

// Converte um profissional da API para o formato do cartão (CartaoProfissional)
function paraProfissional(p, proximas) {
  const status = statusDoVinculo(p.status)
  // "Psicologia Clínica, Ansiedade" -> ["Psicologia Clínica", "Ansiedade"]
  const especialidades = String(p.especialidades ?? '').split(',').map((e) => e.trim()).filter(Boolean)
  return {
    id: p.id,
    idVinculo: p.id_vinculo,
    nome: p.nome_completo,
    especialidade: especialidades[0] ?? 'Especialidade não informada',
    especialidades,
    status,
    // solicitação recebida: o profissional convidou e o paciente ainda não respondeu (Aceitar/Recusar)
    recebida: status === 'pendente' && pedidoPeloProfissional(p.origem_cadastro),
    naPlataforma: true,
    desde: soData(p.desde).slice(0, 7), // 'AAAA-MM' (usado em "Desde março de 2025")
    // Inativo não tem próxima consulta (RF319)
    proximaConsulta: status === 'inativo' ? null : proximas[p.id_vinculo] ?? null,
  }
}

// GET /pacientes/me/profissionais e GET /pacientes/me/consultas (em paralelo)
// Devolve os profissionais vinculados no formato da tela, com a próxima consulta de cada um.
export async function listarMeusProfissionais(token, signal) {
  const mensagemErro = 'Não foi possível carregar seus profissionais.'
  const [profissionais, consultas] = await Promise.all([
    listar(token, '/pacientes/me/profissionais', 'profissional', signal, mensagemErro),
    listar(token, '/pacientes/me/consultas', 'consulta', signal, mensagemErro),
  ])
  const proximas = proximasConsultasPorVinculo(consultas)
  return profissionais.map((p) => paraProfissional(p, proximas))
}

// GET /profissionais e procura o CPF digitado (RF320).
// O back não tem busca por CPF: a lista geral é a única rota que devolve o CPF.
// Devolve { id, nome, email, especialidades } ou null quando o CPF não tem cadastro.
export async function buscarProfissionalPorCpf(token, cpf, signal) {
  const numeros = limparCpf(cpf)
  const lista = await listar(token, '/profissionais', 'profissional', signal, 'Não foi possível verificar o CPF.')
  const achado = lista.find((p) => limparCpf(p.cpf ?? '') === numeros)
  if (!achado) return null

  // especialidade vem como [{ id, especialidade }] (completarDadosProfissional do back)
  const especialidades = Array.isArray(achado.especialidade)
    ? achado.especialidade.map((e) => e.especialidade).filter(Boolean)
    : []

  return {
    id: achado.id,
    nome: achado.nome_completo,
    email: achado.email ?? '',
    especialidades: especialidades.length ? especialidades : ['Especialidade não informada'],
  }
}

// PUT /vinculos/:id/aceitar
// O paciente aceita o convite do profissional: o vínculo fica ativo e o back avisa o profissional.
export async function aceitarVinculo(token, idVinculo) {
  return requisicao(`/vinculos/${encodeURIComponent(idVinculo)}/aceitar`, {
    token,
    method: 'PUT',
    mensagemErro: 'Não foi possível aceitar a solicitação.',
  })
}

// PUT /vinculos/:id/recusar
// RN101: remover o vínculo NÃO apaga o registro; o status muda e o profissional vai para o Histórico.
// (O DELETE /pacientes/me/profissionais/:id do back apaga a linha, por isso não é usado.)
export async function inativarVinculo(token, idVinculo) {
  return requisicao(`/vinculos/${encodeURIComponent(idVinculo)}/recusar`, {
    token,
    method: 'PUT',
    mensagemErro: 'Não foi possível remover o profissional do acompanhamento.',
  })
}

// Conferido na instalação local: mysql2 sem timezone explícito usa o fuso do Node
// (America/Sao_Paulo); MySQL usa SYSTEM (-03). Não depender do fuso do navegador.
const formatoDateTimeMysql = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
})

export function paraDateTimeMysql(valor) {
  if (valor === null) return null
  const erro = () => new Error('Não foi possível converter uma data do vínculo com segurança.')
  if (typeof valor === 'string') {
    const mysql = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(valor)
    const iso = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(valor)
    const partes = mysql || iso
    if (!partes) throw erro()
    const [, ano, mes, dia, hora, minuto, segundo] = partes.map(Number)
    const diasNoMes = new Date(Date.UTC(ano, mes, 0)).getUTCDate()
    if (ano < 1000 || mes < 1 || mes > 12 || dia < 1 || dia > diasNoMes ||
        hora > 23 || minuto > 59 || segundo > 59) throw erro()
    if (mysql) return valor
    if (iso[7] !== 'Z') {
      const [horas, minutos] = iso[7].slice(1).split(':').map(Number)
      if (horas > 23 || minutos > 59) throw erro()
    }
  } else if (!(valor instanceof Date)) {
    throw erro()
  }

  const data = valor instanceof Date ? valor : new Date(valor)
  if (!Number.isFinite(data.getTime())) throw erro()
  const partes = Object.fromEntries(formatoDateTimeMysql.formatToParts(data).map(({ type, value }) => [type, value]))
  if (!/^\d{4}$/.test(partes.year) || Number(partes.year) < 1000) throw erro()
  return `${partes.year}-${partes.month}-${partes.day} ${partes.hour}:${partes.minute}:${partes.second}`
}

export async function encerrarVinculo(token, idVinculo) {
  if (idVinculo == null || idVinculo === '') {
    throw new Error('Não foi possível identificar o vínculo.')
  }

  const caminho = `/vinculos/${encodeURIComponent(idVinculo)}`
  const dados = await requisicao(caminho, {
    token,
    mensagemErro: 'Não foi possível consultar o vínculo.',
  })
  const vinculo = dados.response?.vinculo?.[0]
  if (!vinculo || String(vinculo.id) !== String(idVinculo)) {
    throw new Error('O vínculo não foi retornado pela API.')
  }
  if (vinculo.status == null || vinculo.status === '') {
    throw new Error('A API não retornou todos os campos do vínculo.')
  }
  const status = statusDoVinculo(vinculo.status)
  if (status === 'inativo') return
  if (status !== 'ativo') {
    throw new Error('O vínculo não está mais ativo. Atualize a lista e tente novamente.')
  }

  const campos = ['origem_cadastro', 'data_solicitacao', 'data_aceite',
    'data_inicio_acompanhamento', 'data_fim', 'id_profissional', 'id_paciente']
  if (campos.some((campo) => vinculo[campo] === undefined) ||
      ['origem_cadastro', 'id_profissional', 'id_paciente'].some((campo) => vinculo[campo] == null || vinculo[campo] === '')) {
    throw new Error('A API não retornou todos os campos do vínculo.')
  }
  // Valida também a data que será substituída antes de permitir qualquer escrita.
  paraDateTimeMysql(vinculo.data_fim)
  return requisicao(caminho, {
    token,
    method: 'PUT',
    body: {
      status: 'encerrado',
      origem_cadastro: vinculo.origem_cadastro,
      data_solicitacao: paraDateTimeMysql(vinculo.data_solicitacao),
      data_aceite: paraDateTimeMysql(vinculo.data_aceite),
      data_inicio_acompanhamento: paraDateTimeMysql(vinculo.data_inicio_acompanhamento),
      data_fim: paraDateTimeMysql(new Date()),
      id_profissional: vinculo.id_profissional,
      id_paciente: vinculo.id_paciente,
    },
    mensagemErro: 'Não foi possível encerrar o acompanhamento.',
  })
}
