import { test } from 'node:test'
import assert from 'node:assert'
import { celularValido } from '../src/utils/validators.js'

// mesma tabela de casos do back (backend-dialoga/test/celular.test.js)
const CASOS = [
  ["(11) 98765-4321", true],
  ["11987654321", true],
  ["(21) 99876-5432", true],
  ["(00) 00000-0000", false],
  ["abc", false],
  ["(11) 8765-4321", false],
  ["(20) 98765-4321", false],
  ["(11) 99999-9999", false],
  ["(11) 88765-4321", false],
  ["(11) 98765-43210", false],
  ["", false]
]

for (const [entrada, esperado] of CASOS) {
  test(`celularValido('${entrada}') -> ${esperado}`, () => {
    assert.strictEqual(celularValido(entrada), esperado)
  })
}
