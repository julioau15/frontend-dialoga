// ============================================================
// services/agendaPacienteService.js
// Requisições da Agenda do paciente (só API, sem tela e sem estado).
//   GET    /pacientes/me/consultas                  -> consultas do paciente
//   GET    /consultas/vinculos/:id/horarios         -> dias e horários livres do profissional daquele vínculo
//   POST   /consultas                               -> nova consulta
//   DELETE /consultas/:id                           -> excluir consulta
// Os profissionais para escolher vêm de listarMeusProfissionais (profissionaisPacienteService).
// O back valida vínculo ativo, data futura, horário dentro da disponibilidade e sem conflito;
// a mensagem de erro dele vai direto para a tela.
// O back usa 404 para "lista vazia": aqui isso vira [].
// ============================================================
import { requisicao } from './pacienteService'
import { criarConsulta, excluirConsulta } from './agendaProfissionalService'

export { criarConsulta, excluirConsulta }

// O mysql2 devolve DATE/TIME como "2026-09-02T03:00:00.000Z" e "09:00:00": ficamos só com AAAA-MM-DD e HH:mm
const soData = (valor) => String(valor ?? '').slice(0, 10)
const soHora = (valor) => String(valor ?? '').slice(0, 5)

// Consultas do paciente (sem as canceladas), no formato das telas da Agenda
export async function buscarConsultas(token, signal) {
  try {
    const dados = await requisicao('/pacientes/me/consultas', {
      token,
      signal,
      mensagemErro: 'Não foi possível carregar suas consultas.',
    })
    return (dados.response?.consulta ?? [])
      .filter((c) => String(c.status).toLowerCase() !== 'cancelada')
      .map((c) => ({
        id: c.id,
        titulo: c.nome_da_consulta,
        profissional: c.profissional_nome,
        idVinculo: c.id_vinculo,
        especialidade: c.especialidade ?? '',
        data: soData(c.data),
        hora: soHora(c.hora),
      }))
  } catch (erro) {
    if (erro.status === 404) return []
    throw erro
  }
}

// Horários livres do profissional do vínculo (próximos 60 dias).
// Devolve { especialidades: [texto], cadastrouDisponibilidade, dias: [{ data: 'AAAA-MM-DD', horarios: ['HH:mm'] }] }
export async function buscarHorariosDoVinculo(token, idVinculo, signal) {
  const dados = await requisicao(`/consultas/vinculos/${encodeURIComponent(idVinculo)}/horarios`, {
    token,
    signal,
    mensagemErro: 'Não foi possível carregar os horários do profissional.',
  })
  const h = dados.response?.horarios ?? {}
  return {
    especialidades: h.especialidades ?? [],
    cadastrouDisponibilidade: Boolean(h.cadastrou_disponibilidade),
    dias: h.dias ?? [],
  }
}
