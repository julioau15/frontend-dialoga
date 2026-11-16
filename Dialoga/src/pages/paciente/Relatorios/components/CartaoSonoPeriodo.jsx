// ============================================================
// CartaoSonoPeriodo
// "Horas de sono" do período (RF199–RF201, RN75), como no Figma:
//   - gráfico de linha tracejada roxa, eixo Y de 0h a 24h e os dias do período embaixo;
//   - quadro "Resumo" com média (roxo), mínimo e máximo (vermelho fora de 7 a 9 horas,
//     verde dentro) e o alerta "Abaixo do recomendado (7–9h)" quando a média fica abaixo de 7h.
// Desktop: gráfico à esquerda e Resumo à direita. Tablet e Mobile: Resumo embaixo do gráfico.
// Props:
//   registros -> registros do período (relatoriosMock)
// ============================================================
import Card from '../../../../components/Card'
import CabecalhoCartao from '../../../profissional/PerfilPaciente/components/CabecalhoCartao'
import { SONO_MAXIMO, SONO_MINIMO, diaMes, media } from './relatoriosMock'

const ESCALA = 24 // eixo Y de 0h a 24h
const LINHAS = [24, 18, 12, 6, 0] // linhas de grade do eixo Y
const MAX_DATAS = 7 // quantas datas cabem embaixo do gráfico (com mais dias, mostra uma sim, outra não...)

// fora do recomendado (RN75): menos de 7h ou mais de 9h
const foraDoRecomendado = (horas) => horas < SONO_MINIMO || horas > SONO_MAXIMO

// posição (0 a 100) de um valor no eixo Y, de cima para baixo
const posicaoY = (horas) => 100 - (Math.min(horas, ESCALA) / ESCALA) * 100

export default function CartaoSonoPeriodo({ registros }) {
  const horas = registros.map((r) => r.sono)
  const mediaSono = media(horas)
  const minimo = horas.length ? Math.min(...horas) : 0
  const maximo = horas.length ? Math.max(...horas) : 0
  const alerta = horas.length > 0 && mediaSono < SONO_MINIMO

  // pontos da linha (x de 0 a 100 nas pontas do gráfico, como no Figma)
  const pontos = horas.map((h, i) => `${horas.length > 1 ? (i / (horas.length - 1)) * 100 : 50},${posicaoY(h)}`).join(' ')
  const passoDatas = Math.ceil(registros.length / MAX_DATAS)

  return (
    <Card as="section" aria-label="Horas de sono" className="rounded-2xl! px-4 pt-[13px] pb-[18px] shadow-[0_2px_4px_var(--color-borda)]! sm:px-5 sm:pt-5 sm:pb-5 xl:pb-[22px]">
      <CabecalhoCartao
        icone={
          <span aria-hidden="true" className="text-[13px] leading-none">
            🌙
          </span>
        }
        titulo="Horas de sono"
        subtitulo="Eixo Y: 0h – 24h · Dias do período"
      />

      <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:gap-[17px]">
        {/* gráfico (só visual; os valores estão no Resumo e na descrição para o leitor de tela) */}
        <figure className="m-0 min-w-0 flex-1 xl:pt-px">
          <figcaption className="sr-only">
            Horas de sono por dia: {registros.map((r) => `${diaMes(r.data)}, ${r.sono} horas`).join('; ')}.
          </figcaption>
          <div aria-hidden="true" className="flex gap-[13px]">
            {/* eixo Y */}
            <div className="relative h-[120px] w-[22px] shrink-0 text-right text-[12px] leading-4 text-secundaria">
              {/* no Figma os rótulos ficam a cada 26px, centralizados no 12h (mais juntos que as linhas) */}
              {LINHAS.map((l, i) => (
                <span key={l} className="absolute right-0 -translate-y-1/2" style={{ top: `calc(50% + ${(i - 2) * 26}px)` }}>
                  {l}h
                </span>
              ))}
            </div>

            <div className="min-w-0 flex-1">
              <div className="relative h-[120px]">
                {LINHAS.map((l) => (
                  <span key={l} className="absolute inset-x-0 border-t border-borda" style={{ top: `${posicaoY(l)}%` }} />
                ))}
                {horas.length > 1 && (
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
                    <polyline
                      points={pontos}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeDasharray="20 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      className="text-primaria"
                    />
                  </svg>
                )}
                {/* um dia só: um ponto no lugar da linha */}
                {horas.length === 1 && (
                  <span
                    className="absolute left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primaria"
                    style={{ top: `${posicaoY(horas[0])}%` }}
                  />
                )}
              </div>

              {/* dias do período embaixo do gráfico */}
              <ul className="mt-[5px] flex justify-between px-1.5 text-[12px] leading-4 text-secundaria">
                {registros.map((r, i) =>
                  i % passoDatas === 0 ? <li key={r.data}>{diaMes(r.data)}</li> : null,
                )}
              </ul>
            </div>
          </div>
        </figure>

        {/* RF200: resumo com média, mínimo e máximo */}
        <div className="rounded-xl border border-borda-forte bg-fundo-card px-[13px] pt-[13px] pb-[13px] xl:w-[143px] xl:shrink-0">
          <p className="text-[12px] font-bold leading-4 text-texto">Resumo</p>
          <dl className="text-[12px] leading-4 text-secundaria">
            {/* sem registros no período, os valores aparecem como "—" */}
            <div className="mt-2.5 flex gap-1">
              <dt>Média:</dt>
              <dd>
                {horas.length ? (
                  <>
                    <strong className="text-primaria">{mediaSono}h</strong>/dia
                  </>
                ) : (
                  '—'
                )}
              </dd>
            </div>
            <div className="mt-2.5 flex gap-1">
              <dt>Mínimo:</dt>
              <dd className={horas.length ? `font-bold ${foraDoRecomendado(minimo) ? 'text-erro' : 'text-sucesso'}` : ''}>
                {horas.length ? `${minimo}h` : '—'}
              </dd>
            </div>
            <div className="mt-1 flex gap-1">
              <dt>Máximo:</dt>
              <dd className={horas.length ? `font-bold ${foraDoRecomendado(maximo) ? 'text-erro' : 'text-sucesso'}` : ''}>
                {horas.length ? `${maximo}h` : '—'}
              </dd>
            </div>
          </dl>

          {/* RF201 / RN75: alerta de sono abaixo do recomendado */}
          {alerta && (
            <p role="alert" className="mt-[9px] rounded-lg border border-alerta-borda-suave bg-alerta-fundo px-2.5 py-2 text-[12px] leading-[15px] text-alerta">
              <span aria-hidden="true">⚠️ </span>
              Abaixo do recomendado ({SONO_MINIMO}–{SONO_MAXIMO}h)
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
