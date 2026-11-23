import { test } from 'node:test'
import assert from 'node:assert'
import { tarefasAtivasDoProfissional, tratamentosCompartilhadosCom, tratamentoParaItem } from '../src/utils/perfilProfissionalPaciente.js'

const HOJE = '2026-11-22'

test('tarefas ativas: só as do profissional e não concluídas', () => {
  const tarefas = [
    { id: 1, titulo: 'Diário', id_profissional_criador: 1, status: 'pendente', prazo: '2026-12-01T02:59:00.000Z', perguntas: [{}, {}] },
    { id: 2, titulo: 'Escala', id_profissional_criador: 1, status: 'concluida', prazo: null, perguntas: [] },
    { id: 3, titulo: 'De outro', id_profissional_criador: 2, status: 'pendente', prazo: null, perguntas: [] },
    { id: 4, titulo: 'Atrasada', id_profissional_criador: 1, status: 'andamento', prazo: '2026-11-01T02:59:00.000Z', perguntas: [{}] },
  ]
  assert.deepStrictEqual(tarefasAtivasDoProfissional(tarefas, 1, HOJE), [
    { id: 1, titulo: 'Diário', status: 'Pendente', descricao: '2 perguntas', rotulo: 'Prazo', valor: '01/12' },
    { id: 4, titulo: 'Atrasada', status: 'Em atraso', descricao: '1 pergunta', rotulo: 'Prazo', valor: '01/11' },
  ])
})

test('tratamentos compartilhados só com solicitação aprovada e categoria Tratamentos', () => {
  const s = (status, categorias, id_profissional = 1) => ({ status, categorias, id_profissional })
  assert.strictEqual(tratamentosCompartilhadosCom([s('aprovada', ['Humor', 'Tratamentos'])], 1), true)
  assert.strictEqual(tratamentosCompartilhadosCom([s('aprovada', ['Humor'])], 1), false)
  assert.strictEqual(tratamentosCompartilhadosCom([s('pendente', ['Tratamentos'])], 1), false)
  assert.strictEqual(tratamentosCompartilhadosCom([s('aprovada', ['Tratamentos'], 2)], 1), false)
  assert.strictEqual(tratamentosCompartilhadosCom([], 1), false)
})

test('tratamento vira item da lista', () => {
  assert.deepStrictEqual(
    tratamentoParaItem({ id: 1, nome: 'Sertralina', dosagem: '50 mg', frequencia: '1x ao dia', lembrete: true, horarios: ['08:00'] }),
    { id: 1, titulo: 'Sertralina 50 mg', status: 'Lembrete ativo', descricao: 'Horários: 08:00', rotulo: 'Frequência', valor: '1x ao dia' },
  )
})
