// ============================================================
// SonoSemana
// Card com o gráfico de linha das horas dormidas nos últimos 7 dias.
// Props:
//   dias  -> [{ rotulo: 'Dom', horas: 8 }, ...]  (o último item é "hoje")
//   ideal -> horas ideais de sono (linha pontilhada)
// Gráfico desenhado em SVG (sem biblioteca). A largura acompanha o card
// (hook useLargura); cores vêm dos tokens (fill-primaria, stroke-borda...).
// ============================================================
import { useId } from 'react'
import Card from '../../../../../components/Card'
import { useLargura } from '../../../../../hooks/useLargura'

const ALTURA = 240
const MARGEM = { topo: 30, direita: 16, baixo: 34, esquerda: 52 }
const Y_MIN = 4
const Y_MAX = 10
const GUIAS = [4, 6, 8, 10]

// Curva suave que passa por todos os pontos (Catmull-Rom -> Bézier)
function caminhoSuave(pontos) {
  if (pontos.length < 2) return ''
  let d = `M ${pontos[0].x} ${pontos[0].y}`
  for (let i = 0; i < pontos.length - 1; i++) {
    const p0 = pontos[i - 1] ?? pontos[i]
    const p1 = pontos[i]
    const p2 = pontos[i + 1]
    const p3 = pontos[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

function Grafico({ dias, ideal, largura }) {
  const idGradiente = useId()

  const areaX = MARGEM.esquerda
  const areaLargura = Math.max(largura - MARGEM.esquerda - MARGEM.direita, 0)
  const topo = MARGEM.topo
  const base = ALTURA - MARGEM.baixo
  const yDe = (horas) => base - ((horas - Y_MIN) / (Y_MAX - Y_MIN)) * (base - topo)

  // cada dia ocupa uma "faixa" e o ponto fica no centro dela (alinhado ao rótulo)
  const faixa = areaLargura / dias.length
  const pontos = dias.map((d, i) => ({ ...d, x: areaX + faixa * (i + 0.5), y: yDe(d.horas) }))
  const indiceHoje = pontos.length - 1
  const linha = caminhoSuave(pontos)
  const area = `${linha} L ${pontos[indiceHoje].x} ${base} L ${pontos[0].x} ${base} Z`
  const resumo = dias.map((d) => `${d.rotulo} ${d.horas}h`).join(', ')

  return (
    <svg
      width={largura}
      height={ALTURA}
      viewBox={`0 0 ${largura} ${ALTURA}`}
      role="img"
      aria-label={`Horas dormidas: ${resumo}`}
      className="block"
    >
      <defs>
        <linearGradient id={idGradiente} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" className="[stop-color:var(--color-primaria)]" stopOpacity="0.22" />
          <stop offset="100%" className="[stop-color:var(--color-primaria)]" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* linhas-guia e horas do eixo Y */}
      {GUIAS.map((h) => (
        <g key={h}>
          <line x1={areaX} x2={areaX + areaLargura} y1={yDe(h)} y2={yDe(h)} className="stroke-borda" strokeWidth="1" />
          <text x={areaX - 8} y={yDe(h)} textAnchor="end" dominantBaseline="middle" className="fill-secundaria text-[11px]">
            {h}h
          </text>
        </g>
      ))}

      {/* linha do ideal */}
      <line
        x1={areaX}
        x2={areaX + areaLargura}
        y1={yDe(ideal)}
        y2={yDe(ideal)}
        className="stroke-borda-forte"
        strokeWidth="1.5"
        strokeDasharray="2 3"
      />
      <text x={areaX - 8} y={yDe(ideal)} textAnchor="end" dominantBaseline="middle" className="fill-primaria text-xs font-semibold">
        {ideal}h ✓
      </text>

      {/* área e linha */}
      <path d={area} fill={`url(#${idGradiente})`} />
      <path d={linha} fill="none" className="stroke-primaria" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

      {/* pontos e valores */}
      {pontos.map((p, i) => {
        const hoje = i === indiceHoje
        const abaixo = p.horas < ideal
        return (
          <g key={`${p.rotulo}-${i}`}>
            {hoje && <circle cx={p.x} cy={p.y} r="13" className="fill-primaria-alfa-20" />}
            <circle
              cx={p.x}
              cy={p.y}
              r={hoje ? 8 : 4.5}
              strokeWidth={hoje ? 3 : 1.5}
              className={
                hoje
                  ? 'fill-primaria stroke-branco'
                  : abaixo
                    ? 'fill-erro stroke-branco'
                    : 'fill-branco stroke-primaria'
              }
            >
              <title>{`${p.rotulo}: ${p.horas}h dormidas`}</title>
            </circle>
            <text x={p.x} y={p.y - 14} textAnchor="middle" className="fill-texto text-xs font-bold">
              {p.horas}h
            </text>
          </g>
        )
      })}

      {/* dias da semana */}
      {pontos.map((p, i) => (
        <text key={`x-${p.rotulo}-${i}`} x={p.x} y={ALTURA - 10} textAnchor="middle" className="fill-secundaria text-xs">
          {p.rotulo}
        </text>
      ))}
    </svg>
  )
}

export default function SonoSemana({ dias, ideal }) {
  const [ref, largura] = useLargura()
  const media = (dias.reduce((soma, d) => soma + d.horas, 0) / dias.length).toFixed(1)

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-texto">
            <span aria-hidden="true">🌙 </span>Sono da semana
          </h2>
          <p className="mt-1 text-xs text-secundaria">Horas dormidas nos últimos 7 dias</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold leading-tight text-texto">{media}h</p>
          <p className="text-xs text-secundaria">média/dia</p>
        </div>
      </div>

      <div ref={ref} className="mt-3 w-full" style={{ height: ALTURA }}>
        {largura > 0 && <Grafico dias={dias} ideal={ideal} largura={largura} />}
      </div>

      <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-secundaria">
        <li className="flex items-center gap-1.5">
          <span className="w-5 border-t-2 border-dotted border-borda-forte" aria-hidden="true" />
          Ideal ({ideal}h)
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-erro ring-2 ring-branco outline outline-erro" aria-hidden="true" />
          Abaixo do ideal
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-branco bg-primaria shadow-[0_0_0_1.5px_var(--color-primaria)]" aria-hidden="true" />
          Hoje
        </li>
      </ul>
    </Card>
  )
}
