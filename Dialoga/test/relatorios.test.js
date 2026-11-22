import { test } from 'node:test'
import assert from 'node:assert'
import {
  registroApiParaRelatorio,
  solicitacaoApiParaTela,
  categoriasParaApi,
  media,
  periodoInicial,
} from '../src/utils/relatorios.js'

test('registro da API (valores do seed) vira o vocabulário dos cartões', () => {
  const r = registroApiParaRelatorio({
    id: 3, data: '2026-10-17T03:00:00.000Z', sentimento: 'animado', energia: 'alta', humor: 'otimo',
    padrao_pensamentos: 'pensamentos positivos', horas_sono: '8.25', relato: 'Dia ótimo',
  })
  assert.deepStrictEqual(r, {
    id: 3, data: '2026-10-17', sentimento: 'Feliz', energia: 'Alta', humor: 'Muito bem',
    pensamentos: 'Positivos', sono: 8.25, anotacao: 'Dia ótimo',
  })
})

test('registro com os rótulos do formulário e valores desconhecidos', () => {
  const r = registroApiParaRelatorio({
    id: 1, data: '2026-11-20', sentimento: 'Cansado', energia: 'Média', humor: 'Muito ruim',
    padrao_pensamentos: 'preocupação excessiva, catastrofização', horas_sono: null, relato: null,
  })
  assert.strictEqual(r.sentimento, 'Cansado')
  assert.strictEqual(r.energia, 'Média')
  assert.strictEqual(r.humor, 'Muito mal')
  assert.strictEqual(r.pensamentos, 'Negativos')
  assert.strictEqual(r.sono, null)
  assert.strictEqual(r.anotacao, null)
  assert.strictEqual(registroApiParaRelatorio({ id: 2, data: '2026-11-20', sentimento: 'xyz' }).sentimento, null)
})

test('média ignora valores ausentes', () => {
  assert.strictEqual(media([2, undefined, 4, null]), 3)
  assert.strictEqual(media([undefined]), 0)
})

test('solicitação da API ganha nome e especialidade do profissional e status da tela', () => {
  const profissionais = [{ id: 1, nome_completo: 'Dra. Ana Beatriz Souza', especialidades: 'Psicologia Clínica, TCC' }]
  const s = solicitacaoApiParaTela({ id: 9, status: 'aprovada', id_profissional: 1, categorias: ['Humor', 'Horas de sono', 'Tratamentos'] }, profissionais)
  assert.deepStrictEqual(s, {
    id: 9, idProfissional: 1, nome: 'Dra. Ana Beatriz Souza', especialidade: 'Psicologia Clínica',
    status: 'aprovado', indicadores: ['humor', 'sono', 'tratamentos'],
  })
  assert.strictEqual(solicitacaoApiParaTela({ id: 1, status: 'reprovada', id_profissional: 7, categorias: [] }, []).status, 'recusado')
  assert.strictEqual(solicitacaoApiParaTela({ id: 1, status: 'pendente', id_profissional: 7, categorias: [] }, []).nome, 'Profissional')
})

test('pendente começa com os indicadores básicos marcados (tratamentos só com escolha do paciente)', () => {
  const s = solicitacaoApiParaTela({ id: 1, status: 'pendente', id_profissional: 1, categorias: [] }, [])
  assert.deepStrictEqual(s.indicadores, ['sentimento', 'energia', 'humor', 'sono'])
})

test('ids da tela viram os nomes de categoria da API', () => {
  assert.deepStrictEqual(categoriasParaApi(['humor', 'sono', 'tratamentos', 'x']), ['Humor', 'Horas de sono', 'Tratamentos'])
})

test('período inicial: os últimos 7 dias até hoje', () => {
  assert.deepStrictEqual(periodoInicial('2026-11-22'), { inicio: '2026-11-16', fim: '2026-11-22' })
})
