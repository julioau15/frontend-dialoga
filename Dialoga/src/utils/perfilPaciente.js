// ============================================================
// utils/perfilPaciente.js
// Monta os dados do Perfil do paciente (visão do profissional) a partir da API.
// Funções puras: sem requisição e sem estado. Os formatos devolvidos são os que os
// componentes de pages/profissional/PerfilPaciente já usavam.
// O profissional só recebe as categorias que o paciente autorizou
// (GET /pacientes/:id/indicadores-compartilhados -> categorias):
//   'Sentimento' | 'Energia' | 'Humor' | 'Pensamentos' | 'Horas de sono' | 'Acontecimentos' | 'Tratamentos'
// Categoria negada: o cartão dela não aparece e o nome vai para "negadas".
// ============================================================
import { INDICADORES, diaMes, faixaDe, media, notaMaxima, registroApiParaRelatorio } from './relatorios.js'
import { statusAcompanhamentoDe } from './tarefasProfissional.js'

export const CATEGORIAS_COMPARTILHAVEIS = ['Sentimento', 'Energia', 'Humor', 'Pensamentos', 'Horas de sono', 'Acontecimentos', 'Tratamentos']

// indicador do gráfico -> categoria que libera
const CATEGORIA_DO_INDICADOR = { energia: 'Energia', sentimento: 'Sentimento', humor: 'Humor', pensamentos: 'Pensamentos' }

const PERIODOS = { '7d': 7, '14d': 14, '30d': 30 }

// status da solicitação na API -> acesso da tela
export function acessoDoPerfil(statusApi) {
  const status = String(statusApi ?? '').toLowerCase()
  if (status === 'aprovada') return 'aprovado'
  if (status === 'pendente') return 'pendente'
  return 'nao_solicitado'
}

function somarDias(iso, n) {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10)
}

// rótulo que mais aparece no período (no empate, o mais recente)
function maisFrequente(valores) {
  const contagem = new Map()
  valores.forEach((v) => contagem.set(v, (contagem.get(v) ?? 0) + 1))
  let melhor = null
  for (const v of valores) {
    if (melhor === null || contagem.get(v) >= contagem.get(melhor)) melhor = v
  }
  return melhor
}

function emocionaisDo(registros, categorias) {
  const itens = INDICADORES.filter((ind) => categorias.includes(CATEGORIA_DO_INDICADOR[ind.id])).map((ind) => {
    const rotulos = registros.map((r) => r[ind.id]).filter(Boolean)
    const valor = media(rotulos.map((r) => ind.notas[r]))
    const maximo = notaMaxima(ind)
    return {
      id: ind.id,
      rotulo: ind.rotulo,
      emoji: ind.emoji,
      valor,
      maximo,
      faixa: faixaDe(valor, maximo),
      etiqueta: maisFrequente(rotulos) ?? '—',
    }
  })
  return itens.length ? { registros: registros.length, itens } : null
}

function sonoDo(registros) {
  const dias = registros.filter((r) => typeof r.sono === 'number').map((r) => ({ data: diaMes(r.data), horas: r.sono }))
  return { media: media(dias.map((d) => d.horas)), dias }
}

const INDICADOR_HUMOR = INDICADORES.find((i) => i.id === 'humor')

function anotacoesDo(registros) {
  return registros
    .filter((r) => r.anotacao)
    .map((r) => {
      const nota = INDICADOR_HUMOR.notas[r.humor]
      return {
        id: r.id,
        data: diaMes(r.data),
        humor: nota ? faixaDe(nota, notaMaxima(INDICADOR_HUMOR)) : 'moderado',
        etiquetas: [r.sentimento, r.energia, r.humor, r.pensamentos].filter(Boolean),
        sono: r.sono,
        texto: r.anotacao,
      }
    })
}

// conclusão das tarefas enviadas ao paciente (vale para todos os períodos)
function conclusaoDo(historico) {
  return {
    total: historico.length,
    respondidas: historico.filter((t) => t.status === 'respondida').length,
    emAndamento: historico.filter((t) => t.status === 'em_andamento').length,
  }
}

/**
 * Indicadores por período ('7d' | '14d' | '30d'):
 *   { emocionais | null, sono | null, anotacoesPaciente | null, conclusao, aderencia | null, negadas: [categorias] }
 * registros   -> registroHumor da API (só com os campos autorizados)
 * tratamentos -> tratamento da API (só vem com 'Tratamentos' autorizado)
 * historico   -> saída de historicoDoPaciente
 */
export function montarIndicadores({ registros, categorias, tratamentos, historico, hoje }) {
  const doRelatorio = registros.map(registroApiParaRelatorio).filter((r) => r.data).sort((a, b) => a.data.localeCompare(b.data))
  const negadas = CATEGORIAS_COMPARTILHAVEIS.filter((c) => !categorias.includes(c))

  const aderencia = categorias.includes('Tratamentos')
    ? tratamentos.map((t) => ({ id: t.id, nome: [t.nome_medicamento, t.dosagem].filter(Boolean).join(' '), percentual: null }))
    : null

  const resultado = {}
  for (const [id, dias] of Object.entries(PERIODOS)) {
    const inicio = somarDias(hoje, -(dias - 1))
    const doPeriodo = doRelatorio.filter((r) => r.data >= inicio && r.data <= hoje)
    resultado[id] = {
      emocionais: emocionaisDo(doPeriodo, categorias),
      sono: categorias.includes('Horas de sono') ? sonoDo(doPeriodo) : null,
      anotacoesPaciente: categorias.includes('Acontecimentos') ? anotacoesDo(doPeriodo) : null,
      conclusao: conclusaoDo(historico),
      aderencia,
      negadas,
    }
  }
  return resultado
}

/**
 * Histórico de tarefas que o profissional enviou ao paciente (mais recente primeiro):
 *   [{ id, idEnvio, titulo, enviadaEm, prazo, status, respondidas, perguntas }]
 * tarefas             -> GET /tarefas do profissional (não rascunho)
 * destinatarios       -> destinatários dessas tarefas (de todos os pacientes)
 * respondidasPorEnvio -> { [idEnvio]: quantas perguntas já têm resposta } (só para as não concluídas)
 */
export function historicoDoPaciente({ tarefas, destinatarios, idPaciente, respondidasPorEnvio = {} }) {
  const tarefaPorId = new Map(tarefas.map((t) => [Number(t.id), t]))

  return destinatarios
    .filter((d) => Number(d.id_paciente) === Number(idPaciente) && tarefaPorId.has(Number(d.id_tarefa)))
    .map((d) => {
      const tarefa = tarefaPorId.get(Number(d.id_tarefa))
      const perguntas = tarefa.perguntas?.length ?? 0
      const status = statusAcompanhamentoDe(d.status)
      return {
        id: d.id,
        idEnvio: d.id,
        titulo: tarefa.titulo,
        enviadaEm: String(tarefa.data_envio ?? tarefa.data_criacao ?? '').slice(0, 10),
        prazo: d.prazo ? String(d.prazo).slice(0, 10) : null,
        status,
        respondidas: status === 'respondida' ? perguntas : Math.min(respondidasPorEnvio[d.id] ?? 0, perguntas),
        perguntas,
      }
    })
    .sort((a, b) => b.enviadaEm.localeCompare(a.enviadaEm) || b.id - a.id)
}

// números do topo: sessões já realizadas (não canceladas, até hoje), tarefas enviadas e taxa de resposta
export function resumoDoPaciente({ historico, consultas, hoje }) {
  const sessoes = consultas.filter((c) => String(c.status).toLowerCase() !== 'cancelada' && c.data <= hoje).length
  const respondidas = historico.filter((t) => t.status === 'respondida').length
  return {
    sessoes,
    tarefasEnviadas: historico.length,
    taxaResposta: historico.length ? Math.round((respondidas / historico.length) * 100) : 0,
  }
}
