import { test } from 'node:test'
import assert from 'node:assert'
import { acessoDoPerfil, montarIndicadores, historicoDoPaciente, resumoDoPaciente } from '../src/utils/perfilPaciente.js'

const HOJE = '2026-11-22'
const REG = [
  { id: 1, data: '2026-11-20T03:00:00.000Z', sentimento: 'Feliz', energia: 'Alta', humor: 'Bom', padrao_pensamentos: 'Positivos', horas_sono: '8', relato: 'Dia bom' },
  { id: 2, data: '2026-11-21T03:00:00.000Z', sentimento: 'Ansioso', energia: 'Baixa', humor: 'Ruim', padrao_pensamentos: 'Negativos', horas_sono: '6', relato: null },
  { id: 3, data: '2026-10-01T03:00:00.000Z', sentimento: 'Calmo', energia: 'Média', humor: 'Neutro', padrao_pensamentos: 'Neutros', horas_sono: '7', relato: 'Antigo' },
]
const TODAS = ['Sentimento', 'Energia', 'Humor', 'Pensamentos', 'Horas de sono', 'Acontecimentos', 'Tratamentos']

test('acesso da tela a partir do status da API', () => {
  assert.strictEqual(acessoDoPerfil('aprovada'), 'aprovado')
  assert.strictEqual(acessoDoPerfil('pendente'), 'pendente')
  assert.strictEqual(acessoDoPerfil('sem_acesso'), 'nao_solicitado')
  assert.strictEqual(acessoDoPerfil('reprovada'), 'nao_solicitado')
})

test('7d: só registros do período, médias, sono e anotações', () => {
  const ind = montarIndicadores({ registros: REG, categorias: TODAS, tratamentos: [], historico: [], hoje: HOJE })['7d']
  assert.strictEqual(ind.emocionais.registros, 2)
  const energia = ind.emocionais.itens.find((i) => i.id === 'energia')
  assert.deepStrictEqual({ valor: energia.valor, maximo: energia.maximo }, { valor: 2, maximo: 3 })
  assert.deepStrictEqual(ind.sono, { media: 7, dias: [{ data: '20/11', horas: 8 }, { data: '21/11', horas: 6 }] })
  assert.deepStrictEqual(ind.anotacoesPaciente.map((a) => a.texto), ['Dia bom'])
  assert.deepStrictEqual(ind.negadas, [])
})

test('categorias negadas: cartões somem e a lista de negadas aparece', () => {
  const ind = montarIndicadores({ registros: REG, categorias: ['Humor'], tratamentos: [{ id: 1, nome_medicamento: 'X', dosagem: '1 mg' }], historico: [], hoje: HOJE })['30d']
  assert.deepStrictEqual(ind.emocionais.itens.map((i) => i.id), ['humor'])
  assert.strictEqual(ind.sono, null)
  assert.strictEqual(ind.anotacoesPaciente, null)
  assert.strictEqual(ind.aderencia, null)
  assert.deepStrictEqual(ind.negadas, ['Sentimento', 'Energia', 'Pensamentos', 'Horas de sono', 'Acontecimentos', 'Tratamentos'])
})

test('tratamentos autorizados aparecem sem percentual (o profissional não recebe as doses)', () => {
  const ind = montarIndicadores({ registros: [], categorias: ['Tratamentos'], tratamentos: [{ id: 1, nome_medicamento: 'Sertralina', dosagem: '50 mg' }], historico: [], hoje: HOJE })['7d']
  assert.deepStrictEqual(ind.aderencia, [{ id: 1, nome: 'Sertralina 50 mg', percentual: null }])
})

test('histórico: tarefas do profissional enviadas ao paciente', () => {
  const tarefas = [{ id: 7, titulo: 'Diário', data_envio: '2026-11-01T12:00:00.000Z', perguntas: [{}, {}] }]
  const destinatarios = [
    { id: 70, id_tarefa: 7, id_paciente: 1, status: 'concluida', prazo: '2026-11-10T02:59:00.000Z' },
    { id: 71, id_tarefa: 7, id_paciente: 2, status: 'pendente', prazo: null },
  ]
  assert.deepStrictEqual(historicoDoPaciente({ tarefas, destinatarios, idPaciente: 1, respondidasPorEnvio: {} }), [
    { id: 70, idEnvio: 70, titulo: 'Diário', enviadaEm: '2026-11-01', prazo: '2026-11-10', status: 'respondida', respondidas: 2, perguntas: 2 },
  ])
})

test('resumo: sessões passadas não canceladas, tarefas e taxa de resposta', () => {
  const historico = [{ status: 'respondida' }, { status: 'em_andamento' }, { status: 'nao_preenchido' }]
  const consultas = [
    { data: '2026-11-01', status: 'agendada' }, { data: '2026-11-10', status: 'cancelada' }, { data: '2026-12-01', status: 'agendada' },
  ]
  assert.deepStrictEqual(resumoDoPaciente({ historico, consultas, hoje: HOJE }), { sessoes: 1, tarefasEnviadas: 3, taxaResposta: 33 })
})
