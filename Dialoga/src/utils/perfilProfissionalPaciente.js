// ============================================================
// utils/perfilProfissionalPaciente.js
// Regras puras da tela de um profissional na visão do paciente (/paciente/profissionais/:id).
// Itens das listas no formato do ItemAtividade: { id, titulo, status, descricao, rotulo, valor }
// (o rótulo aparece em maiúsculas pela classe "uppercase").
// ============================================================

const STATUS_ATIVA = { pendente: 'Pendente', andamento: 'Em andamento', atrasada: 'Em atraso' }

const soData = (valor) => (valor ? String(valor).slice(0, 10) : null)
const diaMes = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

// 'pendente' | 'andamento' | 'atrasada' | 'concluida' (o atraso é calculado pelo prazo)
function situacao(statusApi, prazoIso, hoje) {
  const s = String(statusApi ?? '').toLowerCase()
  if (s.startsWith('conclu')) return 'concluida'
  if (prazoIso && prazoIso < hoje) return 'atrasada'
  if (s.includes('andamento')) return 'andamento'
  return 'pendente'
}

// tarefas (GET /tarefas do paciente) enviadas por este profissional e ainda não concluídas
export function tarefasAtivasDoProfissional(tarefas, idProfissional, hoje) {
  return tarefas
    .filter((t) => Number(t.id_profissional_criador) === Number(idProfissional))
    .map((t) => ({ t, prazo: soData(t.prazo), estado: situacao(t.status, soData(t.prazo), hoje) }))
    .filter(({ estado }) => estado !== 'concluida')
    .map(({ t, prazo, estado }) => {
      const perguntas = t.perguntas?.length ?? 0
      return {
        id: t.id,
        titulo: t.titulo,
        status: STATUS_ATIVA[estado],
        descricao: `${perguntas} ${perguntas === 1 ? 'pergunta' : 'perguntas'}`,
        rotulo: 'Prazo',
        valor: prazo ? diaMes(prazo) : 'Sem prazo',
      }
    })
}

// true quando o paciente aprovou uma solicitação deste profissional liberando 'Tratamentos'
export function tratamentosCompartilhadosCom(solicitacoes, idProfissional) {
  return solicitacoes.some(
    (s) =>
      Number(s.id_profissional) === Number(idProfissional) &&
      String(s.status).toLowerCase() === 'aprovada' &&
      (s.categorias ?? []).includes('Tratamentos'),
  )
}

// tratamento normalizado (utils/tratamentos.normalizarTratamento) -> item da lista
export function tratamentoParaItem(t) {
  return {
    id: t.id,
    titulo: [t.nome, t.dosagem].filter(Boolean).join(' '),
    status: t.lembrete ? 'Lembrete ativo' : 'Sem lembrete',
    descricao: t.horarios?.length ? `Horários: ${t.horarios.join(', ')}` : 'Sem horários definidos',
    rotulo: 'Frequência',
    valor: t.frequencia || '—',
  }
}
