import { test } from 'node:test'
import assert from 'node:assert'
import { pedidoRecebido, ordenarPacientes } from '../src/pages/profissional/Pacientes/components/statusPaciente.js'

const ativo = { id: 1, status: 'ativo', pedidoPor: 'profissional' }
const recebido = { id: 2, status: 'pendente', pedidoPor: 'paciente' }
const enviado = { id: 3, status: 'pendente', pedidoPor: 'profissional' }

test('pedido recebido: pendente e pedido pelo paciente', () => {
  assert.strictEqual(pedidoRecebido(recebido), true)
  assert.strictEqual(pedidoRecebido(enviado), false)
  assert.strictEqual(pedidoRecebido(ativo), false)
})

test('pedidos recebidos vêm primeiro, o resto mantém a ordem', () => {
  assert.deepStrictEqual(ordenarPacientes([ativo, enviado, recebido]).map((p) => p.id), [2, 1, 3])
})
