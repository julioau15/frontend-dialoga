// ============================================================
// CartaoSono
// Cartão "Sono" da aba Indicadores (RF232), como no Figma: média por dia à direita
// e o gráfico de linha das horas dormidas (eixo de 4h a 10h, linha de referência
// de 7h, curva roxa com degradê embaixo, pontos vermelhos abaixo de 7h, o valor
// em cima de cada ponto e as datas embaixo).
// Feito sem biblioteca: a curva é um <svg> que estica na largura (preserveAspectRatio
// "none", com o traço sem distorcer) e os pontos/textos são posicionados em %.
// Com mais de 7 dias (14d e 30d), os pontos ficam menores, os valores em cima
// somem (não caberiam) e as datas embaixo mostram 7 dias espalhados.
// Props:
//   sono -> { media, dias: [{ data: 'DD/MM', horas }] } (do mais antigo para o mais recente)
// ============================================================
import { useId } from 'react'
import Card from '../../../../components/Card'
import CabecalhoCartao from './CabecalhoCartao'

const ALTURA = 130 // altura da área do gráfico (px)
const TOPO = 15.8 // distância (px) do topo até a linha de 10h
const PX_POR_HORA = 16.25 // 2 horas = 32,5px, como no Figma
const REFERENCIA = 7 // horas recomendadas (linha tracejada "7h✓")
const LINHAS = [10, 8, 6, 4] // linhas de grade com rótulo
const LARGURA_SVG = 1000 // largura interna do <svg> (estica na tela)

// posição vertical (px) de um valor em horas, limitado ao eixo de 4h a 10h
const yDe = (horas) => TOPO + (10 - Math.min(10, Math.max(4, horas))) * PX_POR_HORA

// "7.5" -> "7.5h" (ponto decimal, como no Figma)
const textoHoras = (horas) => `${horas}h`

// curva suave que passa por todos os pontos (as alças ficam na horizontal, como no Figma)
function caminho(pontos) {
  return pontos.reduce((d, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`
    const anterior = pontos[i - 1]
    const meio = (p.x - anterior.x) / 2
    return `${d} C${anterior.x + meio},${anterior.y} ${p.x - meio},${p.y} ${p.x},${p.y}`
  }, '')
}

// 7 datas espalhadas pelo período (todas, quando o período tem 7 dias)
function datasDoEixo(dias) {
  if (dias.length <= 7) return dias.map((d) => d.data)
  return Array.from({ length: 7 }, (_, i) => dias[Math.round((i * (dias.length - 1)) / 6)].data)
}

export default function CartaoSono({ sono }) {
  const idDegrade = useId()
  const { dias, media } = sono
  const poucos = dias.length <= 7 // período de 7 dias: mostra os valores em cima dos pontos
  const pontos = dias.map((d, i) => ({
    ...d,
    x: dias.length === 1 ? 0 : (i / (dias.length - 1)) * LARGURA_SVG,
    y: yDe(d.horas),
    porcento: dias.length === 1 ? 0 : (i / (dias.length - 1)) * 100,
  }))
  const linha = caminho(pontos)
  const area = `${linha} L${LARGURA_SVG},${ALTURA} L0,${ALTURA} Z`

  return (
    <Card as="section" aria-label="Sono" className="px-5 pt-[24px] pb-[22px]">
      <CabecalhoCartao
        icone={<span aria-hidden="true">🌙</span>}
        titulo="Sono"
        subtitulo="Horas dormidas no período"
        direita={
          <>
            <p className="text-[18px] font-extrabold leading-6 text-texto">{media}h</p>
            <p className="text-[11px] leading-4 text-secundaria">média/dia</p>
          </>
        }
      />

      {/* resumo do gráfico para leitores de tela */}
      <p className="sr-only">
        {`Horas de sono por dia: ${dias.map((d) => `${d.data}, ${d.horas} horas`).join('; ')}. Recomendado: ${REFERENCIA} horas.`}
      </p>

      <div aria-hidden="true" className="mt-[17px] flex gap-3">
        {/* rótulos do eixo vertical */}
        <div className="relative w-[30px] shrink-0" style={{ height: ALTURA }}>
          {[...LINHAS, REFERENCIA].map((h) => (
            <span
              key={h}
              className={`absolute right-0 -translate-y-1/2 text-[12px] leading-4 ${
                h === REFERENCIA ? 'font-bold text-primaria-texto' : 'text-secundaria'
              }`}
              style={{ top: yDe(h) }}
            >
              {h === REFERENCIA ? `${h}h✓` : textoHoras(h)}
            </span>
          ))}
        </div>

        {/* área do gráfico */}
        <div className="relative min-w-0 flex-1" style={{ height: ALTURA }}>
          {LINHAS.map((h) => (
            <span key={h} className="absolute inset-x-0 border-t border-borda" style={{ top: yDe(h) }} />
          ))}
          <span className="absolute inset-x-0 border-t border-dashed border-borda-forte" style={{ top: yDe(REFERENCIA) }} />

          <svg
            viewBox={`0 0 ${LARGURA_SVG} ${ALTURA}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <defs>
              <linearGradient id={idDegrade} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--color-primaria)" stopOpacity="0.2" />
                <stop offset="1" stopColor="var(--color-primaria)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#${idDegrade})`} />
            <path d={linha} fill="none" stroke="var(--color-primaria)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          </svg>

          {pontos.map((p) => (
            <span
              key={p.data}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.porcento}%`, top: p.y }}
            >
              {poucos && (
                <span className="absolute bottom-full left-1/2 mb-[3px] -translate-x-1/2 whitespace-nowrap text-[11px] font-bold leading-4 text-primaria-texto">
                  {textoHoras(p.horas)}
                </span>
              )}
              <span
                className={`block rounded-full ${poucos ? 'h-2.5 w-2.5' : 'h-1.5 w-1.5'} ${
                  p.horas < REFERENCIA ? 'bg-erro ring-2 ring-superficie' : 'border-2 border-primaria bg-superficie'
                }`}
              />
            </span>
          ))}
        </div>
      </div>

      {/* datas embaixo, em 7 colunas iguais como no Figma */}
      <div aria-hidden="true" className="mt-[7px] ml-[33px] flex">
        {datasDoEixo(dias).map((data) => (
          <span key={data} className="flex-1 text-center text-[12px] leading-4 text-secundaria">
            {data}
          </span>
        ))}
      </div>
    </Card>
  )
}
