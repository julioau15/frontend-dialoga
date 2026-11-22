import { test } from 'node:test'
import assert from 'node:assert'
import { separarSolicitacoesDoAdmin } from '../src/utils/aprovacoes.js'

const lista = [
  { id: 1, status: 'pendente', responsavel: { id: 1, nome: 'Admin Um' }, atribuidaAMim: true },
  { id: 2, status: 'pendente', responsavel: { id: 2, nome: 'Admin Dois' }, atribuidaAMim: false },
  { id: 3, status: 'pendente', responsavel: null, atribuidaAMim: false },
  { id: 4, status: 'aprovado', responsavel: null, atribuidaAMim: false },
]

test('pendentes de outro admin saem da lista; as minhas, as sem responsável e as decididas ficam', () => {
  const { visiveis, pendentesDeOutros } = separarSolicitacoesDoAdmin(lista)
  assert.deepStrictEqual(visiveis.map((s) => s.id), [1, 3, 4])
  assert.strictEqual(pendentesDeOutros, 1)
})

test('lista vazia', () => {
  assert.deepStrictEqual(separarSolicitacoesDoAdmin([]), { visiveis: [], pendentesDeOutros: 0 })
})
