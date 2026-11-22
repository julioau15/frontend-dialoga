import { test } from 'node:test'
import assert from 'node:assert'
import { resumirDestinatarios, tarefaApiParaLista } from '../src/utils/tarefasProfissional.js'
import { rotuloStatusTarefa } from '../src/pages/profissional/Tarefas/components/statusTarefa.js'

const HOJE = '2026-11-22'
const PRAZO = '2026-12-10'

test('2 destinatários, 1 concluída e 1 pendente -> parcial 1/2', () => {
  const r = resumirDestinatarios([{ status: 'concluida', prazo: PRAZO }, { status: 'pendente', prazo: PRAZO }], HOJE)
  assert.strictEqual(r.status, 'parcial')
  assert.strictEqual(r.respondidas, 1)
  assert.strictEqual(r.total, 2)
})

test('2 destinatários concluídos -> respondida', () => {
  const r = resumirDestinatarios([{ status: 'concluida', prazo: PRAZO }, { status: 'concluida', prazo: PRAZO }], HOJE)
  assert.strictEqual(r.status, 'respondida')
  assert.strictEqual(r.respondidas, 2)
  assert.strictEqual(r.total, 2)
})

test('1 destinatário em andamento -> em_andamento', () => {
  const r = resumirDestinatarios([{ status: 'andamento', prazo: PRAZO }], HOJE)
  assert.strictEqual(r.status, 'em_andamento')
})

test('ninguém começou -> pendente', () => {
  assert.strictEqual(resumirDestinatarios([{ status: 'pendente', prazo: PRAZO }, { status: 'pendente', prazo: PRAZO }], HOJE).status, 'pendente')
})

test('2 destinatários, um começou e nenhum concluiu -> parcial 0/2 (nunca "em andamento")', () => {
  const r = resumirDestinatarios([{ status: 'andamento', prazo: PRAZO }, { status: 'pendente', prazo: PRAZO }], HOJE)
  assert.strictEqual(r.status, 'parcial')
  assert.strictEqual(r.respondidas, 0)
})

test('rótulo do parcial e item da lista carregam a contagem', () => {
  const item = tarefaApiParaLista({ id: 1, titulo: 'T', is_rascunho: 0, perguntas: [] }, [
    { id: 10, status: 'concluida', prazo: PRAZO, data_conclusao: '2026-11-20' },
    { id: 11, status: 'pendente', prazo: PRAZO },
  ])
  assert.strictEqual(item.respondidas, 1)
  assert.strictEqual(item.total, 2)
  assert.deepStrictEqual(rotuloStatusTarefa(item), { rotulo: '1/2 respondidas', tom: 'info' })
  assert.deepStrictEqual(rotuloStatusTarefa({ status: 'respondida', is_rascunho: 0 }), { rotulo: 'Respondida', tom: 'sucesso' })
})
