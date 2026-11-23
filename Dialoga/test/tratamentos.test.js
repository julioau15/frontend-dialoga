import { test } from 'node:test'
import assert from 'node:assert'
import { frequenciaDoRegistro, validarTratamento } from '../src/utils/tratamentos.js'

test('frequências antigas do banco viram as opções da lista', () => {
  assert.strictEqual(frequenciaDoRegistro('1x ao dia', 1), 'Uma vez ao dia')
  assert.strictEqual(frequenciaDoRegistro('2x ao dia', 2), 'Duas vezes ao dia')
  assert.strictEqual(frequenciaDoRegistro('3 vezes ao dia', 3), 'Três vezes ao dia')
  assert.strictEqual(frequenciaDoRegistro('Quatro vezes ao dia', 4), 'Quatro vezes ao dia')
})

test('frequência sem número usa a quantidade de horários', () => {
  assert.strictEqual(frequenciaDoRegistro('à noite', 1), 'Uma vez ao dia')
  assert.strictEqual(frequenciaDoRegistro('', 2), 'Duas vezes ao dia')
})

test('tratamento do seed convertido não tem erros', () => {
  const campos = { nome: 'Sertralina', dosagem: '50 mg', frequencia: frequenciaDoRegistro('1x ao dia', 1), horarios: ['08:00'], lembrete: true }
  assert.deepStrictEqual(validarTratamento(campos), {})
})
