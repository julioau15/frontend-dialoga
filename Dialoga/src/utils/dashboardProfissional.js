// ============================================================
// utils/dashboardProfissional.js
// Regras do dashboard do profissional. São funções puras: recebem os
// dados que a API já devolve (vínculos, consultas, tarefas...) e montam
// o que a tela mostra. Não fazem requisição nem mexem em tela.
// ============================================================

// AJUSTE: valores de tbl_vinculo.status que significam "vínculo ativo".
// O script de inserts usa 'ativo', mas o aceitarVinculo do back grava 1.
const VINCULO_ATIVO = ['ativo', '1']

// tbl_tarefa_destinatario.status que significam "já respondida"
const STATUS_RESPONDIDA = ['concluida', 'respondida']

const LIMITE_LISTAS = 4

// A API manda datas como "2026-11-03T03:00:00.000Z" (DATE vira ISO no JSON).
// Pegar só os 10 primeiros caracteres mantém o dia certo.
const dia = (valor) => String(valor ?? '').slice(0, 10)

export const ehVinculoAtivo = (vinculo) => VINCULO_ATIVO.includes(String(vinculo.status).toLowerCase())

export const tarefaRespondida = (destinatario) =>
  Boolean(destinatario.data_conclusao) || STATUS_RESPONDIDA.includes(String(destinatario.status).toLowerCase())

// Devolve só as tarefas enviadas (não rascunho) pelo profissional, da mais recente para a mais antiga.
// tarefasPorId: { [id_tarefa]: tarefa } — cada tarefa traz id_profissional_criador e is_rascunho.
export function destinatariosDoProfissional({ destinatarios, tarefasPorId, idProfissional }) {
  const dataDaTarefa = (d) => {
    const t = tarefasPorId[d.id_tarefa]
    return String(t?.data_envio ?? t?.data_criacao ?? '')
  }

  return destinatarios
    .filter((d) => {
      const tarefa = tarefasPorId[d.id_tarefa]
      return tarefa && tarefa.id_profissional_criador === idProfissional && !tarefa.is_rascunho
    })
    .sort((a, b) => dataDaTarefa(b).localeCompare(dataDaTarefa(a)) || b.id - a.id)
}

// respondida > atrasada (prazo vencido) > em_andamento (já salvou respostas) > pendente
export function situacaoAtividade(destinatario, agora, temResposta = false) {
  if (tarefaRespondida(destinatario)) return 'respondida'
  if (destinatario.prazo && new Date(destinatario.prazo) < agora) return 'atrasada'
  if (temResposta || String(destinatario.status).toLowerCase() === 'em_andamento') return 'em_andamento'
  return 'pendente'
}

// Monta o objeto que a tela do dashboard usa.
//   vinculos      -> vínculos DO profissional
//   pacientes     -> pacientes dele (GET /profissionais/me/pacientes)
//   consultas     -> consultas (todas; aqui filtramos pelos vínculos dele)
//   destinatarios -> já filtrados e ordenados por destinatariosDoProfissional()
//   respostas     -> { [id_destinatario]: true } para quem já salvou respostas
//   hoje          -> "YYYY-MM-DD" (data local do navegador)
export function montarDashboard({ vinculos, pacientes, consultas, destinatarios, respostas = {}, hoje, agora = new Date() }) {
  const pacientePorId = new Map(pacientes.map((p) => [p.id, p]))
  const vinculoPorId = new Map(vinculos.map((v) => [v.id, v]))
  const vinculosAtivos = vinculos.filter(ehVinculoAtivo)

  // consultas que pertencem aos vínculos do profissional
  const minhasConsultas = consultas.filter((c) => vinculoPorId.has(c.id_vinculo))

  // ---- Atendimentos de hoje (sem canceladas), por horário
  const atendimentosHoje = minhasConsultas
    .filter((c) => dia(c.data) === hoje && c.status !== 'cancelada')
    .sort((a, b) => String(a.hora).localeCompare(String(b.hora)))
    .map((c) => {
      const idPaciente = vinculoPorId.get(c.id_vinculo).id_paciente
      return {
        id: c.id,
        titulo: c.nome_da_conculta, // (sic) é assim que a coluna se chama no banco
        especialidade: c.especialidade,
        status: c.status,
        hora: String(c.hora).slice(0, 5),
        id_paciente: idPaciente,
        nome_paciente: pacientePorId.get(idPaciente)?.nome_completo ?? 'Paciente',
      }
    })

  // ---- Pacientes recentes: vínculo ativo, ordenados pela próxima consulta agendada
  const proximaConsulta = (idVinculo) =>
    minhasConsultas
      .filter((c) => c.id_vinculo === idVinculo && c.status === 'agendada' && dia(c.data) >= hoje)
      .map((c) => dia(c.data))
      .sort()[0] ?? null

  const vistos = new Set()
  const pacientesRecentes = vinculosAtivos
    .filter((v) => pacientePorId.has(v.id_paciente) && !vistos.has(v.id_paciente) && vistos.add(v.id_paciente))
    .map((v) => ({
      id: v.id_paciente,
      nome_completo: pacientePorId.get(v.id_paciente).nome_completo,
      status_atividade: pacientePorId.get(v.id_paciente).status_atividade,
      proxima_consulta: proximaConsulta(v.id),
      inicio: String(v.data_inicio_acompanhamento ?? ''),
    }))
    .sort((a, b) => {
      if (a.proxima_consulta && b.proxima_consulta) return a.proxima_consulta.localeCompare(b.proxima_consulta)
      if (a.proxima_consulta) return -1 // quem tem consulta vem antes de quem não tem
      if (b.proxima_consulta) return 1
      return b.inicio.localeCompare(a.inicio)
    })
    .slice(0, LIMITE_LISTAS)
    .map(({ inicio, ...paciente }) => paciente) // eslint-disable-line no-unused-vars

  // ---- Atividades enviadas
  const atividadesEnviadas = destinatarios.slice(0, LIMITE_LISTAS).map((d) => ({
    id: d.id,
    titulo: d.nome_tarefa,
    nome_paciente: d.nome_paciente,
    situacao: situacaoAtividade(d, agora, Boolean(respostas[d.id])),
  }))

  return {
    data: hoje,
    resumo: {
      pacientes_ativos: vinculosAtivos.length,
      atendimentos_hoje: atendimentosHoje.length,
      tarefas_enviadas: destinatarios.length,
      pendentes_resposta: destinatarios.filter((d) => !tarefaRespondida(d)).length,
    },
    atendimentos_hoje: atendimentosHoje,
    pacientes_recentes: pacientesRecentes,
    atividades_enviadas: atividadesEnviadas,
  }
}
