import { test } from 'node:test'
import assert from 'node:assert'
import { montarDashboard } from '../src/utils/dashboardProfissional.js'

test('atendimentos de hoje usam nome_da_consulta como título', () => {
  const dados = montarDashboard({
    vinculos: [{ id: 1, id_paciente: 10, status: 'ativo' }],
    pacientes: [{ id: 10, nome_completo: 'João' }],
    consultas: [{ id: 5, id_vinculo: 1, nome_da_consulta: 'Sessão', data: '2026-11-22', hora: '09:00:00', status: 'agendada' }],
    destinatarios: [],
    hoje: '2026-11-22',
  })
  assert.strictEqual(dados.atendimentos_hoje[0].titulo, 'Sessão')
})

test('atendimentos de hoje trazem a data (para abrir a Agenda no dia)', () => {
  const dados = montarDashboard({
    vinculos: [{ id: 1, id_paciente: 10, status: 'ativo' }],
    pacientes: [{ id: 10, nome_completo: 'João' }],
    consultas: [{ id: 5, id_vinculo: 1, nome_da_consulta: 'Sessão', data: '2026-11-22T03:00:00.000Z', hora: '09:00:00', status: 'agendada' }],
    destinatarios: [],
    hoje: '2026-11-22',
  })
  assert.strictEqual(dados.atendimentos_hoje[0].data, '2026-11-22')
})
