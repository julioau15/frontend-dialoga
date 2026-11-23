import { test } from 'node:test'
import assert from 'node:assert'
import { diasComHorarioAtual, dataComDiaDaSemana } from '../src/utils/datasAgenda.js'

const DIAS = [
  { data: '2026-11-24', horarios: ['08:00', '09:00'] },
  { data: '2026-11-26', horarios: ['14:00'] },
]

test('sem horário atual (nova consulta) -> lista igual', () => {
  assert.deepStrictEqual(diasComHorarioAtual(DIAS, null), DIAS)
})

test('edição: horário atual entra no dia já existente, em ordem', () => {
  assert.deepStrictEqual(diasComHorarioAtual(DIAS, { data: '2026-11-24', hora: '08:30' }), [
    { data: '2026-11-24', horarios: ['08:00', '08:30', '09:00'] },
    { data: '2026-11-26', horarios: ['14:00'] },
  ])
})

test('edição: dia que não está livre é incluído na ordem das datas', () => {
  assert.deepStrictEqual(diasComHorarioAtual(DIAS, { data: '2026-11-25', hora: '03:00' }), [
    { data: '2026-11-24', horarios: ['08:00', '09:00'] },
    { data: '2026-11-25', horarios: ['03:00'] },
    { data: '2026-11-26', horarios: ['14:00'] },
  ])
})

test('edição: horário que já está na lista não duplica', () => {
  assert.deepStrictEqual(diasComHorarioAtual(DIAS, { data: '2026-11-26', hora: '14:00' }), DIAS)
})

test('rótulo do dia: dd/mm e dia da semana', () => {
  assert.strictEqual(dataComDiaDaSemana('2026-11-24'), '24/11, terça')
  assert.strictEqual(dataComDiaDaSemana('2026-11-29'), '29/11, domingo')
})
