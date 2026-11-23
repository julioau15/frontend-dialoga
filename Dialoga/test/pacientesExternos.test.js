import { test, beforeEach } from 'node:test'
import assert from 'node:assert'

// localStorage falso (o Node não tem)
const guardado = new Map()
globalThis.localStorage = {
  getItem: (k) => (guardado.has(k) ? guardado.get(k) : null),
  setItem: (k, v) => guardado.set(k, String(v)),
  removeItem: (k) => guardado.delete(k),
}

const {
  validarNomeExterno, adicionarPacienteExterno, lerPacientesExternos, buscarPacienteExterno,
  ehPacienteExterno, removerPacienteExterno, salvarAnotacaoExterno, listarAnotacoesExterno, excluirAnotacaoExterno,
} = await import('../src/utils/pacientesExternos.js')

beforeEach(() => guardado.clear())

test('validação do nome externo (A2)', () => {
  assert.strictEqual(validarNomeExterno(''), 'Informe o nome completo do paciente.')
  assert.strictEqual(validarNomeExterno('Jo'), 'Informe o nome completo do paciente.')
  assert.strictEqual(validarNomeExterno('Jo@o Silva'), 'O nome deve conter apenas letras.')
  assert.strictEqual(validarNomeExterno('a'.repeat(101)), 'O nome pode ter no máximo 100 caracteres.')
  assert.strictEqual(validarNomeExterno("  Ana  D'Ávila-Souza "), '')
})

test('externo fica guardado por profissional, como "Ativo" e sem vínculo', () => {
  const novo = adicionarPacienteExterno(7, '  Carla   Mendes ')
  assert.ok(ehPacienteExterno(novo.id))
  assert.strictEqual(novo.nome, 'Carla Mendes')
  assert.strictEqual(novo.origem, 'externo')
  assert.strictEqual(novo.status, 'ativo')
  assert.deepStrictEqual(lerPacientesExternos(7).map((p) => p.nome), ['Carla Mendes'])
  assert.deepStrictEqual(lerPacientesExternos(8), []) // outro profissional não vê
  assert.strictEqual(buscarPacienteExterno(7, novo.id).nome, 'Carla Mendes')
})

test('mesmo nome (sem diferenciar maiúsculas/acentos) não entra duas vezes', () => {
  adicionarPacienteExterno(7, 'Joao Silva')
  assert.throws(() => adicionarPacienteExterno(7, 'JOÃO silva'), /Já existe um paciente externo com esse nome\./)
})

test('anotações do externo: criar, editar, excluir; remover o paciente apaga as notas', () => {
  const p = adicionarPacienteExterno(7, 'Carla Mendes')
  salvarAnotacaoExterno(7, p.id, { titulo: 'Primeira', conteudo: 'texto' })
  const [nota] = listarAnotacoesExterno(7, p.id)
  salvarAnotacaoExterno(7, p.id, { id: nota.id, titulo: 'Editada', conteudo: 'novo' })
  assert.strictEqual(listarAnotacoesExterno(7, p.id)[0].titulo, 'Editada')
  excluirAnotacaoExterno(7, p.id, nota.id)
  assert.deepStrictEqual(listarAnotacoesExterno(7, p.id), [])
  salvarAnotacaoExterno(7, p.id, { titulo: 'Outra', conteudo: 'x' })
  removerPacienteExterno(7, p.id)
  assert.deepStrictEqual(lerPacientesExternos(7), [])
  assert.deepStrictEqual(listarAnotacoesExterno(7, p.id), [])
})

test('ids da API não são externos', () => {
  assert.strictEqual(ehPacienteExterno(12), false)
  assert.strictEqual(ehPacienteExterno('12'), false)
})
