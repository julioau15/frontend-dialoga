import { test } from 'node:test'
import assert from 'node:assert'
import { montarConteudoRelatorio } from '../src/utils/exportarRelatorio.js'

const periodo = { inicio: '2026-11-16', fim: '2026-11-22' }
const registros = [
  { id: 1, data: '2026-11-20', sentimento: 'Feliz', energia: 'Alta', humor: 'Bem', pensamentos: 'Positivos', sono: 8, anotacao: 'Dia bom' },
  { id: 2, data: '2026-11-21', sentimento: 'Triste', energia: 'Baixa', humor: 'Mal', pensamentos: 'Negativos', sono: 5, anotacao: null },
]
const tarefas = [
  { id: 1, titulo: 'Diário', prazo: '21/11/2026', prazoIso: '2026-11-21', status: 'andamento', progresso: 50 },
  { id: 2, titulo: 'Fora', prazo: '01/12/2026', prazoIso: '2026-12-01', status: 'pendente', progresso: 0 },
]

test('relatório: cabeçalho, nome do arquivo e seções do período', () => {
  const c = montarConteudoRelatorio({ nome: 'Lúcia', periodo, registros, tarefas })
  assert.strictEqual(c.arquivo, 'relatorio-dialoga-2026-11-16_a_2026-11-22.pdf')
  assert.match(c.subtitulo, /Lúcia/)
  assert.match(c.subtitulo, /16\/11\/2026 a 22\/11\/2026/)
  const secao = (t) => c.secoes.find((s) => s.titulo === t).linhas
  assert.ok(secao('Indicadores do período').some((l) => l.startsWith('Humor: 3 de 5')))
  assert.deepStrictEqual(secao('Horas de sono'), ['Média: 6,5h por noite', 'Noites abaixo de 7h: 1'])
  assert.strictEqual(secao('Registros diários').length, 2)
  assert.deepStrictEqual(secao('Anotações'), ['20/11/2026: Dia bom'])
  assert.deepStrictEqual(secao('Tarefas do período'), ['Diário - prazo 21/11/2026 - Em andamento (50%)'])
})

test('relatório sem registros nem tarefas mostra mensagens de vazio', () => {
  const c = montarConteudoRelatorio({ nome: '', periodo: { inicio: '2026-11-22', fim: null }, registros: [], tarefas: [] })
  assert.strictEqual(c.arquivo, 'relatorio-dialoga-2026-11-22_a_2026-11-22.pdf')
  assert.ok(c.secoes.every((s) => s.linhas.length > 0))
})

test('gerarPdf: PDF válido, com acentos e várias páginas quando o texto é longo', async () => {
  const { gerarPdf } = await import('../src/utils/exportarRelatorio.js')
  const blocos = [{ texto: 'Relatório – Ação (teste) \\ ok', tamanho: 16, negrito: true }]
  for (let i = 0; i < 120; i++) blocos.push({ texto: `Linha ${i} com sentimento ansioso e pensamentos acelerados` })
  const bytes = gerarPdf(blocos)
  const texto = String.fromCharCode(...bytes)
  assert.ok(texto.startsWith('%PDF-1.4'))
  assert.ok(texto.trimEnd().endsWith('%%EOF'))
  assert.match(texto, /\/Count 3 >>/) // 121 linhas não cabem em 2 páginas A4
  assert.ok(texto.includes('(Relat\xf3rio - A\xe7\xe3o \\(teste\\) \\\\ ok)'))
  // a tabela xref aponta para o início de cada objeto
  const inicio = Number(texto.match(/startxref\n(\d+)/)[1])
  assert.ok(texto.slice(inicio).startsWith('xref'))
  const posicoes = [...texto.slice(inicio).matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]))
  posicoes.forEach((pos, i) => assert.ok(texto.slice(pos).startsWith(`${i + 1} 0 obj`)))
})

// confere a tabela xref (cada posição aponta para o início do objeto)
function conferirXref(texto) {
  const inicio = Number(texto.match(/startxref\n(\d+)/)[1])
  assert.ok(texto.slice(inicio).startsWith('xref'))
  const posicoes = [...texto.slice(inicio).matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]))
  posicoes.forEach((pos, i) => assert.ok(texto.slice(pos).startsWith(`${i + 1} 0 obj`)))
}

test('PDF do relatório traz os gráficos de indicadores e de sono, como na tela', async () => {
  const { gerarPdf, montarBlocosRelatorio } = await import('../src/utils/exportarRelatorio.js')
  const { blocos, conteudo } = montarBlocosRelatorio({ nome: 'Lúcia', periodo, registros, tarefas })
  // dados dos gráficos: mesmas contas dos cartões da tela
  assert.deepStrictEqual(
    conteudo.graficos.indicadores.itens.map((i) => [i.rotulo, i.valor, i.maximo, i.faixa]),
    [['Energia', 2, 3, 'moderado'], ['Sentimento', 2.5, 4, 'moderado'], ['Humor', 3, 5, 'moderado'], ['Pensamentos', 2.5, 4, 'moderado']],
  )
  assert.deepStrictEqual(conteudo.graficos.sono.dias, [{ rotulo: '20/11', horas: 8 }, { rotulo: '21/11', horas: 5 }])
  assert.strictEqual(conteudo.graficos.sono.alerta, true) // média 6.5h < 7h

  const texto = String.fromCharCode(...gerarPdf(blocos))
  assert.ok(texto.startsWith('%PDF-1.4'))
  assert.match(texto, /\(Energia \xb7 Sentimento \xb7 Humor \xb7 Pensamentos\)/)
  assert.ok(texto.includes('(2.5/4)'))
  assert.ok(texto.includes('/Sh1 sh')) // área em degradê da curva de sono
  assert.ok(texto.includes('[2 3] 0 d')) // linha pontilhada do ideal
  assert.ok(texto.includes('(Abaixo do recomendado)'))
  assert.ok(texto.includes('(20/11)') && texto.includes('(21/11)'))
  assert.ok(texto.includes('0.863 0.149 0.149 rg')) // ponto vermelho (5h, abaixo do ideal)
  conferirXref(texto)
})

test('PDF sem registros: gráficos com a mensagem de vazio, sem curva', async () => {
  const { gerarPdf, montarBlocosRelatorio } = await import('../src/utils/exportarRelatorio.js')
  const { blocos } = montarBlocosRelatorio({ nome: '', periodo, registros: [], tarefas: [] })
  const texto = String.fromCharCode(...gerarPdf(blocos))
  assert.ok(texto.includes('(Nenhum registro no per\xedodo.)'))
  assert.ok(texto.includes('(Nenhum registro de sono no per\xedodo.)'))
  assert.ok(!texto.includes('/Sh1 sh'))
  conferirXref(texto)
})

test('escala do gráfico de sono: 4h–10h por padrão e aumenta para caber os valores', async () => {
  const { escalaSono } = await import('../src/utils/graficoSono.js')
  assert.deepStrictEqual(escalaSono([8, 6], 7), { yMin: 4, yMax: 10, guias: [4, 6, 8, 10] })
  assert.deepStrictEqual(escalaSono([3, 11.5], 7), { yMin: 2, yMax: 12, guias: [2, 4, 6, 8, 10, 12] })
})

test('PDF: tarefas do período com o progresso real, barra e status', async () => {
  const { gerarPdf, montarBlocosRelatorio } = await import('../src/utils/exportarRelatorio.js')
  const lista = [
    ...tarefas,
    { id: 3, titulo: 'Feita', prazo: '22/11/2026', prazoIso: '2026-11-22', status: 'concluida', progresso: 0 },
  ]
  const { blocos, conteudo } = montarBlocosRelatorio({ nome: '', periodo, registros, tarefas: lista })
  assert.deepStrictEqual(conteudo.graficos.tarefas, [
    { titulo: 'Diário', prazo: '21/11/2026', status: 'andamento', progresso: 50 },
    { titulo: 'Feita', prazo: '22/11/2026', status: 'concluida', progresso: 100 }, // concluída = 100%
  ])
  const texto = String.fromCharCode(...gerarPdf(blocos))
  assert.ok(texto.includes('(Tarefas deste per\xedodo)'))
  assert.ok(texto.includes('(50%)') && texto.includes('(Em andamento)') && texto.includes('(Conclu\xedda)'))
  assert.ok(texto.includes('(100%)')) // concluída aparece com a barra cheia, como na tela
  conferirXref(texto)
})
