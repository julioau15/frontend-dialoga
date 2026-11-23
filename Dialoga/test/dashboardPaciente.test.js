import { test } from 'node:test'
import assert from 'node:assert'
import { montarDashboardPaciente } from '../src/utils/dashboardPaciente.js'

const HOJE = '2026-11-22' // domingo

const RESPOSTAS = {
  registros: [
    { id: 1, data: '2026-11-21T03:00:00.000Z', energia: 'Alta', sentimento: 'Feliz', humor: 'Bom', padrao_pensamentos: 'Positivos', horas_sono: '8' },
    { id: 2, data: '2026-11-22T03:00:00.000Z', energia: 'Baixa', sentimento: 'Triste', humor: 'Ruim', padrao_pensamentos: 'Negativos', horas_sono: '6' },
    { id: 3, data: '2026-11-01T03:00:00.000Z', energia: 'Alta', horas_sono: '9' },
  ],
  tratamentos: [{ id: 1, nome: 'Sertralina', dosagem: '50 mg', frequencia: '1x ao dia', horarios: ['08:00'] }],
  consultas: [
    { id: 1, profissional: 'Ana', especialidade: 'Psicologia', data: '2026-11-25', hora: '09:00', status: 'agendada' },
    { id: 2, profissional: 'Ana', especialidade: 'Psicologia', data: '2026-11-20', hora: '09:00', status: 'agendada' },
    { id: 3, profissional: 'Ana', especialidade: 'Psicologia', data: '2026-11-23', hora: '10:00', status: 'cancelada' },
    { id: 4, profissional: 'Ana', especialidade: '', data: '2026-12-02', hora: '14:00' },
    { id: 5, profissional: 'Ana', especialidade: '', data: '2026-12-09', hora: '14:00' },
  ],
  tarefas: [
    { id: 1, titulo: 'A', prazo: '01/12/2026', status: 'concluida', progresso: 100 },
    { id: 2, titulo: 'B', prazo: '01/11/2026', status: 'atrasada', progresso: 0 },
    { id: 3, titulo: 'C', prazo: 'Sem prazo', status: 'andamento', progresso: 0 },
    { id: 4, titulo: 'D', prazo: 'Sem prazo', status: 'pendente', progresso: 0 },
  ],
  profissionais: [{ id: 1, status: 'ativo' }, { id: 2, status: 'pendente' }, { id: 3, status: 'inativo' }],
}

test('consultas: próximas 2, sem canceladas nem passadas', () => {
  const d = montarDashboardPaciente(RESPOSTAS, HOJE)
  assert.deepStrictEqual(d.consultas.map((c) => c.id), [1, 4])
  assert.deepStrictEqual(d.consultas[0], { id: 1, data: '2026-11-25', dia: '25', mes: 'Nov.', profissional: 'Ana', especialidade: 'Psicologia', hora: '09:00' })
})

test('tarefas: as 3 mais recentes, concluída continua concluída e atrasada vira pendente', () => {
  const d = montarDashboardPaciente(RESPOSTAS, HOJE)
  assert.deepStrictEqual(d.tarefas.map((t) => [t.id, t.status]), [[4, 'pendente'], [3, 'andamento'], [2, 'pendente']])
  const comConcluida = montarDashboardPaciente({ ...RESPOSTAS, tarefas: RESPOSTAS.tarefas.slice(0, 1) }, HOJE)
  assert.strictEqual(comConcluida.tarefas[0].status, 'concluida')
})

test('indicadores e sono dos últimos 7 dias', () => {
  const d = montarDashboardPaciente(RESPOSTAS, HOJE)
  const energia = d.indicadores.find((i) => i.id === 'energia')
  assert.strictEqual(energia.valor, 67) // média 2/3
  assert.deepStrictEqual(d.sono.dias, [{ rotulo: 'Sáb', horas: 8 }, { rotulo: 'Dom', horas: 6 }])
})

test('tratamentos, total de profissionais ativos e listas vazias', () => {
  const d = montarDashboardPaciente(RESPOSTAS, HOJE)
  assert.deepStrictEqual(d.tratamentos, [{ id: 1, nome: 'Sertralina 50 mg', frequencia: '1x ao dia', horarios: ['08:00'] }])
  assert.strictEqual(d.totalProfissionais, 1)
  const vazio = montarDashboardPaciente({ registros: [], tratamentos: [], consultas: [], tarefas: [], profissionais: [] }, HOJE)
  assert.deepStrictEqual(vazio.indicadores.map((i) => i.valor), [0, 0, 0, 0])
  assert.deepStrictEqual(vazio.sono.dias, [])
})

test('sem registros na semana: indicadores marcados como vazios (a tela mostra "Ainda não há registros")', () => {
  const vazio = montarDashboardPaciente({ registros: [], tratamentos: [], consultas: [], tarefas: [], profissionais: [] }, HOJE)
  assert.strictEqual(vazio.semRegistros, true)
  assert.strictEqual(montarDashboardPaciente(RESPOSTAS, HOJE).semRegistros, false)
})

test('itens trazem o que é preciso para abrir cada um', () => {
  const d = montarDashboardPaciente(RESPOSTAS, HOJE)
  assert.strictEqual(d.consultas[0].data, '2026-11-25')
})

test('cartões-resumo usam os totais, não as listas curtas', () => {
  const muitas = {
    ...RESPOSTAS,
    tarefas: [1, 2, 3, 4, 5].map((id) => ({ id, titulo: `T${id}`, prazo: 'Sem prazo', status: 'pendente', progresso: 0 })),
  }
  const d = montarDashboardPaciente(muitas, HOJE)
  assert.strictEqual(d.consultas.length, 2) // lista do cartão
  assert.strictEqual(d.totalConsultas, 3) // 25/11, 02/12 e 09/12 (sem passada e sem cancelada)
  assert.strictEqual(d.tarefas.length, 3) // lista do cartão
  assert.strictEqual(d.totalTarefasPendentes, 5)
  assert.strictEqual(montarDashboardPaciente(RESPOSTAS, HOJE).totalTarefasPendentes, 3)
})
