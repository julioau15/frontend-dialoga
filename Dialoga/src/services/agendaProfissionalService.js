// ============================================================
// services/agendaProfissionalService.js
// Requisições da Agenda do profissional (só API, sem tela e sem estado).
//   GET    /profissionais/me/consultas        -> consultas dos pacientes dele
//   GET    /profissionais/me/pacientes        -> pacientes vinculados (busca do pop-up)
//   GET    /profissionais/me/disponibilidades -> horários que ele atende
//   POST   /consultas                         -> nova consulta
//   PUT    /consultas/:id                     -> editar (reagendar)
//   DELETE /consultas/:id                     -> excluir
//   POST   /profissionais/me/disponibilidades -> nova disponibilidade
//   DELETE /disponibilidades/:id              -> remover disponibilidade
// O back usa 404 para "lista vazia": aqui isso vira [].
// As regras (data futura, horário livre, vínculo ativo, especialidade)
// são validadas pelo back; a mensagem de erro dele vai direto para a tela.
// ============================================================
import { requisicao } from './pacienteService'
import { diaDaSemana } from '../utils/disponibilidade'

// O mysql2 devolve DATE/TIME como "2026-09-02T03:00:00.000Z" e "09:00:00": ficamos só com AAAA-MM-DD e HH:mm
const soData = (valor) => String(valor ?? '').slice(0, 10)
const soHora = (valor) => String(valor ?? '').slice(0, 5)

async function listar(token, caminho, chave, signal) {
  try {
    const dados = await requisicao(caminho, { token, signal })
    return dados.response?.[chave] ?? []
  } catch (erro) {
    if (erro.status === 404) return []
    throw erro
  }
}

// ---------- Pacientes ----------
// Só aparece na busca quem pode receber consulta: vínculo ativo (status 1) e paciente não inativo.
export async function buscarPacientesDaAgenda(token, signal) {
  const lista = await listar(token, '/profissionais/me/pacientes', 'paciente', signal)
  return lista
    .filter((p) => String(p.status_vinculo) === '1' && String(p.status_atividade ?? '').toLowerCase() !== 'inativo')
    .map((p) => ({ idVinculo: p.id_vinculo, idPaciente: p.id, nome: p.nome_completo }))
}

// ---------- Consultas ----------
const paraConsulta = (c) => ({
  id: c.id,
  titulo: c.nome_da_consulta,
  paciente: c.paciente_nome,
  idVinculo: c.id_vinculo,
  especialidade: c.especialidade ?? '',
  data: soData(c.data),
  hora: soHora(c.hora),
  status: c.status,
})

export async function buscarConsultas(token, signal) {
  const lista = await listar(token, '/profissionais/me/consultas', 'consulta', signal)
  return lista.map(paraConsulta).filter((c) => String(c.status).toLowerCase() !== 'cancelada')
}

// dados = { titulo, idVinculo, especialidade, data, hora }
const corpoConsulta = ({ titulo, idVinculo, especialidade, data, hora }) => ({
  nome_da_consulta: titulo,
  id_vinculo: idVinculo,
  data,
  hora,
  // vazio: o back usa a única especialidade do profissional (se ele tiver só uma)
  ...(especialidade ? { especialidade } : {}),
})

export const criarConsulta = (token, dados) =>
  requisicao('/consultas', {
    token,
    method: 'POST',
    body: corpoConsulta(dados),
    mensagemErro: 'Não foi possível agendar a consulta.',
  })

export const atualizarConsulta = (token, id, dados) =>
  requisicao(`/consultas/${encodeURIComponent(id)}`, {
    token,
    method: 'PUT',
    body: corpoConsulta(dados),
    mensagemErro: 'Não foi possível atualizar a consulta.',
  })

export const excluirConsulta = (token, id) =>
  requisicao(`/consultas/${encodeURIComponent(id)}`, {
    token,
    method: 'DELETE',
    mensagemErro: 'Não foi possível excluir a consulta.',
  })

// ---------- Disponibilidades ----------
// O back guarda 1 registro com vários dias (1 = Dom ... 7 = Sáb). A tela mostra 1 item por dia (0 = Dom ... 6 = Sáb).
export async function buscarDisponibilidades(token, signal) {
  const lista = await listar(token, '/profissionais/me/disponibilidades', 'disponibilidade', signal)
  const itens = []

  for (const d of lista) {
    const base = { idApi: d.id, inicio: soHora(d.hora_inicio), fim: soHora(d.hora_fim) }

    if (d.tipo_repeticao === 'unica') {
      const data = soData(d.data_inicial)
      if (data) itens.push({ ...base, id: `${d.id}`, dia: diaDaSemana(data), tipo: 'unica', data })
      continue
    }

    // 'semanal' (e 'periodo', que o back aceita mas a tela ainda não cria)
    const dias = (d.dias_da_semana ?? []).map((x) => Number(x.id) - 1)
    for (const dia of dias) {
      itens.push({
        ...base,
        id: `${d.id}-${dia}`,
        dia,
        tipo: d.tipo_repeticao === 'periodo' ? 'periodo' : 'semanal',
        ...(d.tipo_repeticao === 'periodo' ? { data: soData(d.data_inicial), dataFinal: soData(d.data_final) } : {}),
        irmaos: dias.filter((o) => o !== dia), // outros dias do mesmo registro
      })
    }
  }
  return itens
}

// item = { dia, inicio, fim, tipo: 'semanal' | 'unica', data? }
export const criarDisponibilidade = (token, { dia, inicio, fim, tipo, data }) =>
  requisicao('/profissionais/me/disponibilidades', {
    token,
    method: 'POST',
    body: {
      hora_inicio: inicio,
      hora_fim: fim,
      tipo_repeticao: tipo,
      ...(tipo === 'unica' ? { data_inicial: data, data_final: data } : { dias_da_semana: [dia + 1] }),
    },
    mensagemErro: 'Não foi possível adicionar a disponibilidade.',
  })

export const excluirDisponibilidade = (token, idApi) =>
  requisicao(`/disponibilidades/${encodeURIComponent(idApi)}`, {
    token,
    method: 'DELETE',
    mensagemErro: 'Não foi possível remover a disponibilidade.',
  })
