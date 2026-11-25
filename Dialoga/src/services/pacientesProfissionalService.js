// ============================================================
// services/pacientesProfissionalService.js
// Requisições da tela Pacientes do profissional (só API, sem tela e sem estado).
//   GET  /profissionais/me/pacientes      -> pacientes vinculados (e pedidos pendentes)
//   GET  /profissionais/me/consultas      -> usado só para achar a "Próxima consulta"
//   POST /pacientes/:id/anotacoes         -> nova anotação privada
//   PUT  /vinculos/:id/aceitar | /recusar -> responde ao pedido de um paciente
// O vínculo novo (POST /profissionais/me/pacientes/:id) e a busca de pacientes
// já existem em profissionalService (vincularPaciente e buscarPacientes).
// O back usa 404 para "lista vazia": aqui isso vira [].
// Em caso de erro, lançam Error com .message pronta para a tela (vinda do back).
// ============================================================
import { requisicao } from './pacienteService'
import { buscarConsultas } from './agendaProfissionalService'
import { dataLocalISO } from '../utils/formatadores'

// O mysql2 devolve DATETIME como "2026-09-02T03:00:00.000Z": para o "Desde" só importa AAAA-MM
const soAnoMes = (valor) => String(valor ?? '').slice(0, 7)

// origem_cadastro: 1 / 'profissional' = o profissional convidou; 2 / 'paciente' = o paciente pediu
const pacienteQuemPediu = (origem) => ['2', 'paciente'].includes(String(origem ?? '').toLowerCase())

// ---------- Próxima consulta ----------
// Mapa { idVinculo -> 'AAAA-MM-DD' } com a primeira consulta que ainda vai acontecer.
// (buscarConsultas já descarta as canceladas.)
function proximasConsultas(consultas, agora = new Date()) {
  const hh = String(agora.getHours()).padStart(2, '0')
  const mm = String(agora.getMinutes()).padStart(2, '0')
  const limite = `${dataLocalISO(agora)}T${hh}:${mm}` // "AAAA-MM-DDTHH:mm" compara certo como texto

  const primeiras = new Map() // idVinculo -> { quando, data }
  for (const c of consultas) {
    const quando = `${c.data}T${c.hora}`
    if (quando < limite) continue
    const atual = primeiras.get(c.idVinculo)
    if (!atual || quando < atual.quando) primeiras.set(c.idVinculo, { quando, data: c.data })
  }
  return new Map([...primeiras].map(([idVinculo, { data }]) => [idVinculo, data]))
}

// ---------- Pacientes ----------
// Status da tela:
//   'pendente' -> vínculo ainda não aceito (status_vinculo 0)
//   'inativo'  -> vínculo aceito, mas o paciente está inativo
//   'ativo'    -> vínculo aceito e paciente ativo
const paraPaciente = (p, proximas) => {
  let status = 'ativo'
  if (String(p.status_vinculo) !== '1') status = 'pendente'
  else if (String(p.status_atividade ?? '').toLowerCase() === 'inativo') status = 'inativo'

  return {
    id: p.id, // id do PACIENTE (é o que as rotas /pacientes/:id e o vínculo esperam)
    idVinculo: p.id_vinculo,
    nome: p.nome_completo,
    email: p.email ?? null, // o back só devolve o e-mail depois que o vínculo é aceito
    fotoUrl: p.foto_avatar ?? null, // foto que o paciente enviou no perfil (sem foto: iniciais)
    origem: 'plataforma', // todo paciente vindo da API tem conta no Dialoga
    pedidoPor: pacienteQuemPediu(p.origem_cadastro) ? 'paciente' : 'profissional',
    desde: soAnoMes(p.desde),
    proximaConsulta: proximas.get(p.id_vinculo) ?? null,
    status,
  }
}

// Lista os pacientes do profissional já no formato da tela.
// Se só a leitura das consultas falhar, a lista aparece mesmo assim (sem "Próxima consulta").
export async function buscarPacientesDoProfissional(token, signal) {
  const [vinculos, consultas] = await Promise.all([
    requisicao('/profissionais/me/pacientes', {
      token,
      signal,
      mensagemErro: 'Não foi possível carregar seus pacientes.',
    })
      .then((dados) => dados.response?.paciente ?? [])
      .catch((erro) => {
        if (erro.status === 404) return []
        throw erro
      }),
    buscarConsultas(token, signal).catch((erro) => {
      if (signal?.aborted) throw erro
      return []
    }),
  ])

  const proximas = proximasConsultas(consultas)
  return vinculos.map((p) => paraPaciente(p, proximas))
}

// ---------- Anotações ----------
// dados = { titulo, conteudo }. O back só aceita se o paciente já aceitou o vínculo (senão 403).
export const criarAnotacao = (token, idPaciente, { titulo, conteudo }) =>
  requisicao(`/pacientes/${encodeURIComponent(idPaciente)}/anotacoes`, {
    token,
    method: 'POST',
    body: { titulo, conteudo },
    mensagemErro: 'Não foi possível salvar a anotação.',
  })

// ---------- Pedidos de vínculo feitos pelo paciente ----------
// idVinculo = campo idVinculo do paciente (não é o id do paciente).
export const aceitarVinculo = (token, idVinculo) =>
  requisicao(`/vinculos/${encodeURIComponent(idVinculo)}/aceitar`, {
    token,
    method: 'PUT',
    mensagemErro: 'Não foi possível aceitar o pedido.',
  })

export const recusarVinculo = (token, idVinculo) =>
  requisicao(`/vinculos/${encodeURIComponent(idVinculo)}/recusar`, {
    token,
    method: 'PUT',
    mensagemErro: 'Não foi possível recusar o pedido.',
  })