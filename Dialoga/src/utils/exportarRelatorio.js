// ============================================================
// utils/exportarRelatorio.js
// "Exportar Relatório" da tela Relatórios do paciente (RF211): gera e baixa um PDF
// com o período escolhido no calendário, com os mesmos gráficos da tela:
//   - "Energia · Sentimento · Humor · Pensamentos": uma barra por indicador, altura pela média
//     na escala de cada um, cor da faixa (verde Positivo, roxo Moderado, vermelho Atenção),
//     nome e valor ("1.9/3") embaixo e a legenda (como o CartaoIndicadores);
//   - "Horas de sono": curva roxa com área em degradê, linha pontilhada do ideal (7h), ponto
//     vermelho abaixo do ideal, dias embaixo e o quadro "Resumo" com média, mínimo, máximo e o
//     alerta "Abaixo do recomendado" (como o CartaoSonoPeriodo; contas em utils/graficoSono).
//   - "Tarefas deste período": uma linha por tarefa com título, prazo, barra de progresso com a
//     porcentagem real (respostas já salvas, mesma regra da tela Tarefas) e o status (Selo),
//     como o CartaoTarefasPeriodo.
// Depois dos gráficos: registros diários e anotações (texto); por último as tarefas.
//   montarConteudoRelatorio({ nome, periodo, registros, tarefas }) -> textos e dados dos gráficos (função pura)
//   montarBlocosRelatorio(dados) -> { conteudo, blocos } prontos para o gerarPdf (função pura)
//   gerarPdf(blocos) -> bytes de um PDF A4 (Helvetica e desenho vetorial), sem biblioteca externa
//   exportarRelatorioPdf(dados) -> gera o PDF e baixa o arquivo
// registros: já filtrados pelo período (formato de utils/relatorios.registroApiParaRelatorio)
// tarefas: todas as tarefas do paciente (formato da tela de Tarefas); entram as com prazo no período
// Emojis da tela (⚡ 💭 😊 🧠 🌙) ficam de fora: as fontes padrão do PDF não têm esses símbolos.
// ============================================================
import { INDICADORES, SONO_MAXIMO, SONO_MINIMO, diaMes, faixaDe, media, notaMaxima } from './relatorios.js'
import { MAX_ROTULOS, escalaSono, segmentosSuaves } from './graficoSono.js'
import { STATUS } from '../pages/paciente/Tarefas/components/statusTarefa.js'

const FAIXAS = { positivo: 'Positivo', moderado: 'Moderado', atencao: 'Atenção' }
const STATUS_TAREFA = { pendente: 'Pendente', andamento: 'Em andamento', atrasada: 'Em atraso', concluida: 'Concluída' }

// 'AAAA-MM-DD' -> 'DD/MM/AAAA'
const dataBr = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '')

const numeroBr = (n) => String(n).replace('.', ',')

// Monta o texto de cada seção do relatório e os dados dos gráficos (sem desenhar nada)
export function montarConteudoRelatorio({ nome, periodo, registros, tarefas }) {
  const fim = periodo.fim ?? periodo.inicio
  const secoes = []

  // indicadores: média do período na escala de cada um
  const indicadores = INDICADORES.map((ind) => {
    const notas = registros.map((r) => ind.notas[r[ind.id]])
    const valor = media(notas)
    const maximo = notaMaxima(ind)
    const respondidos = notas.filter((n) => typeof n === 'number').length
    return { rotulo: ind.rotulo, valor, maximo, faixa: faixaDe(valor, maximo), respondidos }
  })
  secoes.push({
    titulo: 'Indicadores do período',
    grafico: 'indicadores',
    linhas: indicadores.map((i) =>
      i.respondidos ? `${i.rotulo}: ${numeroBr(i.valor)} de ${i.maximo} (${FAIXAS[i.faixa]})` : `${i.rotulo}: sem registros`,
    ),
  })

  // sono
  const sonos = registros.filter((r) => typeof r.sono === 'number')
  const horas = sonos.map((r) => r.sono)
  const abaixo = sonos.filter((r) => r.sono < SONO_MINIMO).length
  secoes.push({
    titulo: 'Horas de sono',
    grafico: 'sono',
    linhas: sonos.length
      ? [`Média: ${numeroBr(media(horas))}h por noite`, `Noites abaixo de ${SONO_MINIMO}h: ${abaixo}`]
      : ['Sem registros de sono no período.'],
  })

  // registros dia a dia
  secoes.push({
    titulo: 'Registros diários',
    linhas: registros.length
      ? registros.map((r) =>
          [
            dataBr(r.data),
            r.sentimento && `Sentimento: ${r.sentimento}`,
            r.energia && `Energia: ${r.energia}`,
            r.humor && `Humor: ${r.humor}`,
            r.pensamentos && `Pensamentos: ${r.pensamentos}`,
            typeof r.sono === 'number' && `Sono: ${numeroBr(r.sono)}h`,
          ]
            .filter(Boolean)
            .join(' | '),
        )
      : ['Nenhum registro de humor no período.'],
  })

  // anotações (relato do registro de humor)
  const anotacoes = registros.filter((r) => r.anotacao)
  secoes.push({
    titulo: 'Anotações',
    linhas: anotacoes.length ? anotacoes.map((r) => `${dataBr(r.data)}: ${r.anotacao}`) : ['Nenhuma anotação no período.'],
  })

  // tarefas com prazo no período
  const doPeriodo = tarefas.filter((t) => t.prazoIso && t.prazoIso >= periodo.inicio && t.prazoIso <= fim)
  secoes.push({
    titulo: 'Tarefas do período',
    grafico: 'tarefas',
    linhas: doPeriodo.length
      ? doPeriodo.map((t) => `${t.titulo} - prazo ${t.prazo} - ${STATUS_TAREFA[t.status] ?? t.status} (${t.progresso ?? 0}%)`)
      : ['Nenhuma tarefa com prazo no período.'],
  })

  // "26/08/2026 – 01/09/2026" (ou só um dia), como no cartão da tela
  const textoPeriodo = fim !== periodo.inicio ? `${dataBr(periodo.inicio)} – ${dataBr(fim)}` : dataBr(periodo.inicio)

  return {
    titulo: 'Relatório de saúde emocional - Dialoga',
    subtitulo: [nome && `Paciente: ${nome}`, `Período: ${dataBr(periodo.inicio)} a ${dataBr(fim)}`].filter(Boolean).join('  ·  '),
    arquivo: `relatorio-dialoga-${periodo.inicio}_a_${fim}.pdf`,
    secoes,
    graficos: {
      indicadores: { subtitulo: `${registros.length} registro(s) · ${textoPeriodo}`, itens: indicadores, vazio: registros.length === 0 },
      sono: {
        dias: sonos.map((r) => ({ rotulo: diaMes(r.data), horas: r.sono })),
        media: media(horas),
        minimo: horas.length ? Math.min(...horas) : 0,
        maximo: horas.length ? Math.max(...horas) : 0,
        alerta: horas.length > 0 && media(horas) < SONO_MINIMO,
      },
      // progresso real (vindo das respostas salvas, ver relatoriosService); concluída = 100%
      tarefas: doPeriodo.map((t) => {
        const status = STATUS[t.status] ? t.status : 'pendente'
        return { titulo: t.titulo, prazo: t.prazo, status, progresso: status === 'concluida' ? 100 : (t.progresso ?? 0) }
      }),
    },
  }
}

// ---------- PDF sem biblioteca ----------
// Gera um PDF 1.4 simples (A4, fontes padrão Helvetica e Helvetica-Bold com WinAnsiEncoding,
// que cobre os acentos do português, e desenho vetorial para os gráficos). Quebra as linhas
// pelo tamanho e cria páginas novas quando o conteúdo não cabe.
const PAGINA = { largura: 595.28, altura: 841.89 } // A4 em pontos
const MARGEM_PDF = 50

// cores do tema (styles/variebles.css)
const COR = {
  primaria: '#7B4FA6',
  secundaria: '#7C6B8A',
  texto: '#2D1B45',
  fundoCard: '#F3EDF9',
  borda: '#E8DFF0',
  bordaForte: '#DCCEED',
  sucesso: '#059669',
  erro: '#DC2626',
  alerta: '#D97706',
  alertaFundo: '#FFFBEB',
  alertaBorda: '#FEF3C6',
  info: '#155DFC',
  infoFundo: '#EFF6FF',
  sucessoFundo: '#F0FDF4',
  erroFundo: '#FEF2F2',
  branco: '#FFFFFF',
}
// cores do Selo por tom (components/Selo)
const COR_SELO = {
  primaria: { fundo: COR.fundoCard, texto: COR.primaria },
  info: { fundo: COR.infoFundo, texto: COR.info },
  erro: { fundo: COR.erroFundo, texto: COR.erro },
  sucesso: { fundo: COR.sucessoFundo, texto: COR.sucesso },
}
const COR_FAIXA = { positivo: COR.sucesso, moderado: COR.primaria, atencao: COR.erro }

// caracteres fora do WinAnsi viram equivalentes simples (o PDF não tem esses símbolos)
const paraWinAnsi = (texto) =>
  String(texto)
    .replace(/[–—]/g, '-')
    .replace(/•/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...')
    .replace(/[^\t\n\r\x20-\xff]/g, '?') // fora do Latin-1 (ex.: emoji) e controles

const escaparPdf = (texto) => texto.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')

// '#7B4FA6' -> '0.482 0.310 0.651' (cor do PDF, de 0 a 1)
const rgb = (hex) => [1, 3, 5].map((i) => (parseInt(hex.slice(i, i + 2), 16) / 255).toFixed(3)).join(' ')
const num = (v) => String(Math.round(v * 100) / 100)
// os desenhos usam y de cima para baixo (como na tela); o PDF conta de baixo para cima
const yPdf = (y) => num(PAGINA.altura - y)
const pontos = (...valores) => valores.map(num).join(' ')

// largura de cada caractere da Helvetica (em 1/1000 do tamanho), do espaço (32) ao til (126)
const LARGURAS = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556,
  556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556,
  556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
]

// largura aproximada do texto em pontos (para centralizar e alinhar à direita)
function larguraTexto(texto, tamanho, negrito = false) {
  let soma = 0
  for (const c of paraWinAnsi(texto)) {
    // letra acentuada usa a largura da letra sem acento ("í" = "i", "ç" = "c")
    const codigo = c === '\u00b7' ? 46 : c.normalize('NFD').charCodeAt(0)
    soma += codigo >= 32 && codigo <= 126 ? LARGURAS[codigo - 32] : 556
  }
  return (soma / 1000) * tamanho * (negrito ? 1.06 : 1)
}

// texto em (x, y da linha de base); alinhar: 'esquerda' | 'centro' | 'direita'
function textoPdf(x, y, conteudo, { tamanho = 10, negrito = false, cor = COR.texto, alinhar = 'esquerda' } = {}) {
  const texto = paraWinAnsi(conteudo)
  const largura = larguraTexto(texto, tamanho, negrito)
  const x0 = alinhar === 'centro' ? x - largura / 2 : alinhar === 'direita' ? x - largura : x
  return `BT /${negrito ? 'F2' : 'F1'} ${tamanho} Tf ${rgb(cor)} rg ${num(x0)} ${yPdf(y)} Td (${escaparPdf(texto)}) Tj ET`
}

// caminho de um retângulo com cantos arredondados (soTopo: só os dois de cima, como as barras)
function caminhoRetangulo(x, y, largura, altura, raio = 0, soTopo = false) {
  const r = Math.min(raio, largura / 2, soTopo ? altura : altura / 2)
  const rb = soTopo ? 0 : r
  const k = 0.5523 // aproximação do arco de 1/4 de círculo com Bézier
  const esq = x
  const dir = x + largura
  const topo = PAGINA.altura - y
  const base = PAGINA.altura - y - altura
  const ops = [`${pontos(esq + rb, base)} m`, `${pontos(dir - rb, base)} l`]
  if (rb) ops.push(`${pontos(dir - rb + k * rb, base, dir, base + rb - k * rb, dir, base + rb)} c`)
  ops.push(`${pontos(dir, topo - r)} l`)
  if (r) ops.push(`${pontos(dir, topo - r + k * r, dir - r + k * r, topo, dir - r, topo)} c`)
  ops.push(`${pontos(esq + r, topo)} l`)
  if (r) ops.push(`${pontos(esq + r - k * r, topo, esq, topo - r + k * r, esq, topo - r)} c`)
  ops.push(`${pontos(esq, base + rb)} l`)
  if (rb) ops.push(`${pontos(esq, base + rb - k * rb, esq + rb - k * rb, base, esq + rb, base)} c`)
  ops.push('h')
  return ops.join(' ')
}

function caminhoCirculo(cx, cy, r) {
  const y = PAGINA.altura - cy
  const k = 0.5523 * r
  return [
    `${pontos(cx + r, y)} m`,
    `${pontos(cx + r, y + k, cx + k, y + r, cx, y + r)} c`,
    `${pontos(cx - k, y + r, cx - r, y + k, cx - r, y)} c`,
    `${pontos(cx - r, y - k, cx - k, y - r, cx, y - r)} c`,
    `${pontos(cx + k, y - r, cx + r, y - k, cx + r, y)} c`,
    'h',
  ].join(' ')
}

// cartão branco com borda lilás e cantos de 12pt, com título e subtítulo (como o CabecalhoCartao)
function cartao(x, y, largura, altura, titulo, subtitulo) {
  return [
    `${rgb(COR.branco)} rg ${rgb(COR.borda)} RG 1 w ${caminhoRetangulo(x, y, largura, altura, 12)} B`,
    textoPdf(x + 16, y + 29, titulo, { tamanho: 11, negrito: true }),
    textoPdf(x + 16, y + 43, subtitulo, { tamanho: 9, cor: COR.secundaria }),
  ]
}

// ----- gráfico "Energia · Sentimento · Humor · Pensamentos" (CartaoIndicadores) -----
const AREA_BARRAS = 120 // altura da área das barras
const BARRA_MAXIMA = 110 // altura da barra com a nota máxima

function legendaFaixas(centro, y) {
  const itens = Object.entries(FAIXAS).map(([id, rotulo]) => ({ cor: COR_FAIXA[id], rotulo, largura: 12 + larguraTexto(rotulo, 9) }))
  const espaco = 16
  let x = centro - (itens.reduce((s, i) => s + i.largura, 0) + espaco * (itens.length - 1)) / 2
  return itens.flatMap((item) => {
    const ops = [
      `${rgb(item.cor)} rg ${caminhoCirculo(x + 3.5, y - 3, 3.5)} f`,
      textoPdf(x + 12, y, item.rotulo, { tamanho: 9, cor: COR.secundaria }),
    ]
    x += item.largura + espaco
    return ops
  })
}

function desenhoIndicadores({ subtitulo, itens, vazio }) {
  const altura = 232
  return {
    altura,
    desenhar(x, y, largura) {
      const ops = ['q', ...cartao(x, y, largura, altura, 'Energia · Sentimento · Humor · Pensamentos', subtitulo)]
      const topo = y + 56
      const base = topo + AREA_BARRAS
      if (vazio) {
        ops.push(textoPdf(x + largura / 2, topo + AREA_BARRAS / 2, 'Nenhum registro no período.', { cor: COR.secundaria, alinhar: 'centro' }))
      } else {
        const espaco = 18
        const coluna = (largura - 32 - espaco * 3) / 4
        itens.forEach((item, i) => {
          const xc = x + 16 + i * (coluna + espaco)
          const h = (item.valor / item.maximo) * BARRA_MAXIMA
          if (h > 0) ops.push(`${rgb(COR_FAIXA[item.faixa])} rg ${caminhoRetangulo(xc, base - h, coluna, h, 10, true)} f`)
          ops.push(textoPdf(xc + coluna / 2, base + 14, item.rotulo, { negrito: true, alinhar: 'centro' }))
          ops.push(textoPdf(xc + coluna / 2, base + 27, `${item.valor.toFixed(1)}/${item.maximo}`, { tamanho: 9, cor: COR.secundaria, alinhar: 'centro' }))
        })
      }
      ops.push(...legendaFaixas(x + largura / 2, base + 48), 'Q')
      return ops
    },
  }
}

// ----- gráfico "Horas de sono" (Grafico do SonoSemana + Resumo do CartaoSonoPeriodo) -----
const SONO = { altura: 190, topo: 24, direita: 12, baixo: 26, esquerda: 40 }
const LARGURA_RESUMO = 118
// degradê da área: roxo a 22% (sobre o branco) no alto da curva até branco na base
const CLARO_PRIMARIA = rgb(COR.primaria)
  .split(' ')
  .map((c) => (1 - 0.22 * (1 - Number(c))).toFixed(3))
  .join(' ')

function linhaSono(x1, x2, y, cor, espessura, tracejada = false) {
  return `${rgb(cor)} RG ${espessura} w ${tracejada ? '[2 3] 0 d' : '[] 0 d'} ${num(x1)} ${yPdf(y)} m ${num(x2)} ${yPdf(y)} l S`
}

function graficoSono(x0, y0, largura, dias, ideal) {
  const areaX = x0 + SONO.esquerda
  const areaLargura = Math.max(largura - SONO.esquerda - SONO.direita, 0)
  const topo = y0 + SONO.topo
  const base = y0 + SONO.altura - SONO.baixo
  const { yMin, yMax, guias } = escalaSono(dias.map((d) => d.horas), ideal)
  const yDe = (valor) => base - ((valor - yMin) / (yMax - yMin)) * (base - topo)

  // cada dia ocupa uma "faixa" e o ponto fica no centro dela (alinhado ao rótulo)
  const faixa = areaLargura / dias.length
  const marcas = dias.map((d, i) => ({ ...d, x: areaX + faixa * (i + 0.5), y: yDe(d.horas) }))
  const passo = Math.ceil(dias.length / MAX_ROTULOS)
  const ops = []

  // linhas-guia e horas do eixo Y
  for (const h of guias) {
    ops.push(linhaSono(areaX, areaX + areaLargura, yDe(h), COR.borda, 1))
    ops.push(textoPdf(areaX - 6, yDe(h) + 3, `${h}h`, { tamanho: 8, cor: COR.secundaria, alinhar: 'direita' }))
  }

  // linha do ideal ("7h ✓")
  const yIdeal = yDe(ideal)
  ops.push(linhaSono(areaX, areaX + areaLargura, yIdeal, COR.bordaForte, 1.5, true), '[] 0 d')
  ops.push(textoPdf(areaX - 15, yIdeal + 3, `${ideal}h`, { tamanho: 8.5, negrito: true, cor: COR.primaria, alinhar: 'direita' }))
  ops.push(`${rgb(COR.primaria)} RG 1.2 w 1 J 1 j ${pontos(areaX - 12.5, PAGINA.altura - yIdeal)} m ${pontos(areaX - 10.5, PAGINA.altura - yIdeal - 2)} l ${pontos(areaX - 6.5, PAGINA.altura - yIdeal + 2.5)} l S`)

  // área (degradê) e linha
  if (marcas.length > 1) {
    const curva = [
      `${num(marcas[0].x)} ${yPdf(marcas[0].y)} m`,
      ...segmentosSuaves(marcas).map((s) => `${num(s.c1x)} ${yPdf(s.c1y)} ${num(s.c2x)} ${yPdf(s.c2y)} ${num(s.x)} ${yPdf(s.y)} c`),
    ].join(' ')
    const area = `${curva} ${num(marcas.at(-1).x)} ${yPdf(base)} l ${num(marcas[0].x)} ${yPdf(base)} l h`
    const alturaArea = Math.max(base - Math.min(...marcas.map((m) => m.y)), 1)
    ops.push(`q ${area} W n 1 0 0 ${num(alturaArea)} 0 ${yPdf(base)} cm /Sh1 sh Q`)
    ops.push(`${rgb(COR.primaria)} RG 4 w 1 J 1 j [] 0 d ${curva} S`)
  }

  // pontos (vermelho abaixo do ideal) e valores
  for (const m of marcas) {
    const abaixo = m.horas < ideal
    ops.push(`${rgb(abaixo ? COR.erro : COR.branco)} rg ${rgb(abaixo ? COR.branco : COR.primaria)} RG 1.5 w ${caminhoCirculo(m.x, m.y, 4)} B`)
    if (passo === 1) ops.push(textoPdf(m.x, m.y - 9, `${m.horas}h`, { tamanho: 8.5, negrito: true, alinhar: 'centro' }))
  }

  // dias embaixo (períodos longos pulam rótulos)
  marcas.forEach((m, i) => {
    if (i % passo === 0) ops.push(textoPdf(m.x, y0 + SONO.altura - 8, m.rotulo, { tamanho: 8.5, cor: COR.secundaria, alinhar: 'centro' }))
  })
  return ops
}

// fora do recomendado (RN75): menos de 7h ou mais de 9h
const foraDoRecomendado = (horas) => horas < SONO_MINIMO || horas > SONO_MAXIMO

// "Rótulo: valor" com o valor em outra cor/negrito (e um complemento opcional, como "/dia")
function linhaResumo(x, y, rotulo, valor, estilo, complemento = '') {
  const comum = { tamanho: 9, cor: COR.secundaria }
  const xValor = x + larguraTexto(rotulo, 9)
  const ops = [textoPdf(x, y, rotulo, comum), textoPdf(xValor, y, valor, { ...comum, ...estilo })]
  if (complemento) ops.push(textoPdf(xValor + larguraTexto(valor, 9, estilo.negrito), y, complemento, comum))
  return ops
}

function resumoSono(x, y, largura, sono) {
  const tem = sono.dias.length > 0
  const altura = sono.alerta ? 104 : 70
  const corFaixa = (h) => ({ negrito: true, cor: foraDoRecomendado(h) ? COR.erro : COR.sucesso })
  const ops = [
    `${rgb(COR.fundoCard)} rg ${rgb(COR.bordaForte)} RG 1 w ${caminhoRetangulo(x, y, largura, altura, 10)} B`,
    textoPdf(x + 10, y + 17, 'Resumo', { tamanho: 9.5, negrito: true }),
    // sem registros no período, os valores aparecem como "—"
    ...(tem
      ? [
          ...linhaResumo(x + 10, y + 34, 'Média: ', `${sono.media}h`, { negrito: true, cor: COR.primaria }, '/dia'),
          ...linhaResumo(x + 10, y + 48, 'Mínimo: ', `${sono.minimo}h`, corFaixa(sono.minimo)),
          ...linhaResumo(x + 10, y + 60, 'Máximo: ', `${sono.maximo}h`, corFaixa(sono.maximo)),
        ]
      : [
          ...linhaResumo(x + 10, y + 34, 'Média: ', '—', {}),
          ...linhaResumo(x + 10, y + 48, 'Mínimo: ', '—', {}),
          ...linhaResumo(x + 10, y + 60, 'Máximo: ', '—', {}),
        ]),
  ]
  // RF201 / RN75: alerta de sono abaixo do recomendado
  if (sono.alerta) {
    ops.push(`${rgb(COR.alertaFundo)} rg ${rgb(COR.alertaBorda)} RG 1 w ${caminhoRetangulo(x + 8, y + 68, largura - 16, 28, 6)} B`)
    ops.push(textoPdf(x + 14, y + 79, 'Abaixo do recomendado', { tamanho: 8, cor: COR.alerta }))
    ops.push(textoPdf(x + 14, y + 90, `(${SONO_MINIMO}–${SONO_MAXIMO}h)`, { tamanho: 8, cor: COR.alerta }))
  }
  return ops
}

function desenhoSono(sono) {
  const altura = 56 + SONO.altura + 10
  return {
    altura,
    desenhar(x, y, largura) {
      const ops = ['q', ...cartao(x, y, largura, altura, 'Horas de sono', 'Horas dormidas nos dias do período')]
      const yGrafico = y + 56
      const larguraGrafico = largura - 32 - LARGURA_RESUMO - 14
      if (sono.dias.length) ops.push(...graficoSono(x + 16, yGrafico, larguraGrafico, sono.dias, SONO_MINIMO))
      else
        ops.push(
          textoPdf(x + 16 + larguraGrafico / 2, yGrafico + SONO.altura / 2, 'Nenhum registro de sono no período.', { cor: COR.secundaria, alinhar: 'centro' }),
        )
      ops.push(...resumoSono(x + 16 + larguraGrafico + 14, yGrafico, LARGURA_RESUMO, sono), 'Q')
      return ops
    },
  }
}

// ----- "Tarefas deste período" (CartaoTarefasPeriodo) -----
// corta o texto com "..." para caber na largura
function cortarTexto(texto, tamanho, larguraMax, negrito = false) {
  if (larguraTexto(texto, tamanho, negrito) <= larguraMax) return texto
  let corte = texto
  while (corte && larguraTexto(`${corte}...`, tamanho, negrito) > larguraMax) corte = corte.slice(0, -1)
  return `${corte.trimEnd()}...`
}

const ALTURA_LINHA_TAREFA = 40
const LARGURA_BARRA = 80

// uma linha: título e prazo à esquerda; barra de progresso, porcentagem e status à direita
function desenhoTarefa(tarefa, ultima) {
  return {
    altura: ALTURA_LINHA_TAREFA,
    desenhar(x, y, largura) {
      const status = STATUS[tarefa.status]
      const selo = COR_SELO[status.tom]
      const ops = ['q', linhaHorizontal(x, x + largura, y, COR.borda)]
      if (ultima) ops.push(linhaHorizontal(x, x + largura, y + ALTURA_LINHA_TAREFA, COR.borda))

      // status (Selo): pílula com o texto
      const larguraSelo = larguraTexto(status.rotulo, 8, true) + 16
      const xSelo = x + largura - larguraSelo
      ops.push(`${rgb(selo.fundo)} rg ${caminhoRetangulo(xSelo, y + 13, larguraSelo, 15, 7.5)} f`)
      ops.push(textoPdf(xSelo + larguraSelo / 2, y + 23.5, status.rotulo, { tamanho: 8, negrito: true, cor: selo.texto, alinhar: 'centro' }))

      // barra de progresso + porcentagem (a concluída aparece com 100%, como na tela)
      // a coluna do status tem a largura do maior selo: as barras ficam alinhadas entre as linhas
      const larguraColuna = Math.max(...Object.values(STATUS).map((st) => larguraTexto(st.rotulo, 8, true) + 16))
      const xPorcentagem = x + largura - larguraColuna - 10
      ops.push(textoPdf(xPorcentagem, y + 23.5, `${tarefa.progresso}%`, { tamanho: 8.5, negrito: true, cor: COR.texto, alinhar: 'direita' }))
      const xBarra = xPorcentagem - 26 - LARGURA_BARRA
      ops.push(`${rgb(COR.borda)} rg ${caminhoRetangulo(xBarra, y + 18, LARGURA_BARRA, 5, 2.5)} f`)
      if (tarefa.progresso > 0) {
        ops.push(`${rgb(COR.primaria)} rg ${caminhoRetangulo(xBarra, y + 18, Math.max((LARGURA_BARRA * tarefa.progresso) / 100, 5), 5, 2.5)} f`)
      }

      ops.push(textoPdf(x, y + 17, cortarTexto(tarefa.titulo, 10, xBarra - 12 - x), { tamanho: 10 }))
      ops.push(textoPdf(x, y + 30, `Prazo: ${tarefa.prazo}`, { tamanho: 8.5, cor: COR.secundaria }), 'Q')
      return ops
    },
  }
}

function linhaHorizontal(x1, x2, y, cor) {
  return `${rgb(cor)} RG 0.8 w [] 0 d ${num(x1)} ${yPdf(y)} m ${num(x2)} ${yPdf(y)} l S`
}

// quebra o texto em linhas de até "max" caracteres (sem cortar palavras curtas)
function quebrarLinhas(texto, max) {
  const linhas = []
  let atual = ''
  for (const palavra of texto.split(/\s+/).filter(Boolean)) {
    for (let resto = palavra; resto; resto = resto.slice(max)) {
      const pedaco = resto.slice(0, max)
      if (!atual) atual = pedaco
      else if (atual.length + 1 + pedaco.length <= max) atual += ' ' + pedaco
      else {
        linhas.push(atual)
        atual = pedaco
      }
    }
  }
  if (atual || linhas.length === 0) linhas.push(atual)
  return linhas
}

// blocos -> Uint8Array com o PDF. Cada bloco é:
//   texto:   { texto, tamanho = 10, negrito = false, cor = COR.texto, espaco = 2, manterComProximo = false }
//            (manterComProximo: título que vai para a próxima página junto com o desenho seguinte)
//   desenho: { desenho: { altura, desenhar(x, yTopo, largura) -> [comandos] }, espaco = 2 }
//            (y de cima para baixo; se não couber no resto da página, vai para a próxima)
export function gerarPdf(blocos) {
  const largura = PAGINA.largura - MARGEM_PDF * 2
  const paginas = [[]]
  let y = PAGINA.altura - MARGEM_PDF

  blocos.forEach((bloco, indice) => {
    const proximo = blocos[indice + 1]
    if (bloco.manterComProximo && proximo?.desenho) {
      const precisa = (bloco.tamanho ?? 10) * 1.35 + (bloco.espaco ?? 2) + proximo.desenho.altura
      if (y - precisa < MARGEM_PDF && paginas.at(-1).length > 0) {
        paginas.push([])
        y = PAGINA.altura - MARGEM_PDF
      }
    }
    if (bloco.desenho) {
      const { altura, desenhar } = bloco.desenho
      if (y - altura < MARGEM_PDF && paginas.at(-1).length > 0) {
        paginas.push([])
        y = PAGINA.altura - MARGEM_PDF
      }
      paginas.at(-1).push(...desenhar(MARGEM_PDF, PAGINA.altura - y, largura))
      y -= altura + (bloco.espaco ?? 2)
      return
    }

    const { texto, tamanho = 10, negrito = false, cor = COR.texto, espaco = 2 } = bloco
    const altura = tamanho * 1.35
    const max = Math.floor(largura / (tamanho * 0.52)) // largura média de um caractere na Helvetica
    for (const linha of quebrarLinhas(paraWinAnsi(texto), max)) {
      if (y - altura < MARGEM_PDF) {
        paginas.push([])
        y = PAGINA.altura - MARGEM_PDF
      }
      y -= altura
      const fonte = negrito ? 'F2' : 'F1'
      paginas.at(-1).push(`BT /${fonte} ${tamanho} Tf ${rgb(cor)} rg ${MARGEM_PDF} ${y.toFixed(2)} Td (${escaparPdf(linha)}) Tj ET`)
    }
    y -= espaco
  })

  // objetos: 1 catálogo, 2 páginas, 3 e 4 fontes, 5 degradê do gráfico de sono;
  // depois, para cada página, a página e o conteúdo
  const objetos = []
  const idsPaginas = paginas.map((_, i) => 6 + i * 2)
  objetos[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objetos[2] = `<< /Type /Pages /Kids [${idsPaginas.map((id) => `${id} 0 R`).join(' ')}] /Count ${paginas.length} >>`
  objetos[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  objetos[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
  // degradê vertical: branco em y = 0 e roxo claro em y = 1 (o "cm" do gráfico ajusta à área)
  objetos[5] =
    '<< /ShadingType 2 /ColorSpace /DeviceRGB /Coords [0 0 0 1] /Extend [true true] ' +
    `/Function << /FunctionType 2 /Domain [0 1] /C0 [1 1 1] /C1 [${CLARO_PRIMARIA}] /N 1 >> >>`
  paginas.forEach((comandos, i) => {
    const id = idsPaginas[i]
    const conteudo = comandos.join('\n')
    objetos[id] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGINA.largura} ${PAGINA.altura}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> /Shading << /Sh1 5 0 R >> >> /Contents ${id + 1} 0 R >>`
    objetos[id + 1] = `<< /Length ${conteudo.length} >>\nstream\n${conteudo}\nendstream`
  })

  // monta o arquivo guardando a posição (em bytes) de cada objeto para a tabela xref
  // (todo caractere já está em WinAnsi/Latin-1, então 1 caractere = 1 byte)
  let pdf = '%PDF-1.4\n'
  const posicoes = []
  for (let id = 1; id < objetos.length; id++) {
    posicoes[id] = pdf.length
    pdf += `${id} 0 obj\n${objetos[id]}\nendobj\n`
  }
  const inicioXref = pdf.length
  pdf += `xref\n0 ${objetos.length}\n0000000000 65535 f \n`
  for (let id = 1; id < objetos.length; id++) pdf += `${String(posicoes[id]).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size ${objetos.length} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF\n`

  return Uint8Array.from(pdf, (c) => c.charCodeAt(0))
}

// Blocos do relatório: cabeçalho, os dois gráficos (no lugar das seções de indicadores e sono)
// e as demais seções em texto
export function montarBlocosRelatorio(dados, geradoEm = new Date()) {
  const conteudo = montarConteudoRelatorio(dados)
  const blocos = [
    { texto: conteudo.titulo, tamanho: 16, negrito: true, cor: COR.primaria },
    { texto: conteudo.subtitulo, tamanho: 10 },
    { texto: `Gerado em ${geradoEm.toLocaleString('pt-BR')}`, tamanho: 8, cor: COR.secundaria, espaco: 12 },
  ]
  for (const secao of conteudo.secoes) {
    if (secao.grafico === 'indicadores') {
      blocos.push({ desenho: desenhoIndicadores(conteudo.graficos.indicadores), espaco: 14 })
      continue
    }
    if (secao.grafico === 'sono') {
      blocos.push({ desenho: desenhoSono(conteudo.graficos.sono), espaco: 16 })
      continue
    }
    if (secao.grafico === 'tarefas') {
      const lista = conteudo.graficos.tarefas
      blocos.push({ texto: 'Tarefas deste período', tamanho: 12, negrito: true, espaco: 6, manterComProximo: true })
      if (lista.length === 0) blocos.push({ texto: 'Nenhuma tarefa com prazo no período.', cor: COR.secundaria, espaco: 10 })
      lista.forEach((t, i) => blocos.push({ desenho: desenhoTarefa(t, i === lista.length - 1), espaco: 0 }))
      continue
    }
    blocos.push({ texto: secao.titulo, tamanho: 12, negrito: true, espaco: 1 })
    secao.linhas.forEach((linha) => blocos.push({ texto: linha, espaco: 1 }))
    blocos[blocos.length - 1].espaco = 10
  }
  return { conteudo, blocos }
}

// Gera o PDF (A4) do relatório e baixa o arquivo
export async function exportarRelatorioPdf(dados) {
  const { conteudo, blocos } = montarBlocosRelatorio(dados)

  const arquivo = new Blob([gerarPdf(blocos)], { type: 'application/pdf' })
  const url = URL.createObjectURL(arquivo)
  const link = document.createElement('a')
  link.href = url
  link.download = conteudo.arquivo
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
