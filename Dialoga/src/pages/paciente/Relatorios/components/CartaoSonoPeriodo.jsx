// ============================================================
// CartaoSonoPeriodo
// "Horas de sono" do período (RF199–RF201, RN75):
//   - gráfico de linha igual ao "Sono da semana" do Dashboard (usa o mesmo Grafico): curva
//     roxa com área em degradê, linha pontilhada do ideal "7h ✓", ponto vermelho abaixo do
//     ideal e os dias do período embaixo. Com mais de 7 dias, os rótulos pulam e os valores
//     em cima dos pontos somem;
//   - quadro "Resumo" com média (roxo), mínimo e máximo (vermelho fora de 7 a 9 horas,
//     verde dentro) e o alerta "Abaixo do recomendado (7–9h)" quando a média fica abaixo de 7h.
// Desktop: gráfico à esquerda e Resumo à direita. Tablet e Mobile: Resumo embaixo do gráfico.
// Props:
//   registros -> registros do período (relatoriosMock)
// ============================================================
import Card from '../../../../components/Card'
import { useLargura } from '../../../../hooks/useLargura'
import { ALTURA, Grafico } from '../../Dashboard/components/SonoSemana'
import CabecalhoCartao from '../../../profissional/PerfilPaciente/components/CabecalhoCartao'
import { SONO_MAXIMO, SONO_MINIMO, diaMes, media } from './relatoriosMock'

// fora do recomendado (RN75): menos de 7h ou mais de 9h
const foraDoRecomendado = (horas) => horas < SONO_MINIMO || horas > SONO_MAXIMO

export default function CartaoSonoPeriodo({ registros }) {
  const [ref, largura] = useLargura()
  const horas = registros.map((r) => r.sono)
  const mediaSono = media(horas)
  const minimo = horas.length ? Math.min(...horas) : 0
  const maximo = horas.length ? Math.max(...horas) : 0
  const alerta = horas.length > 0 && mediaSono < SONO_MINIMO

  // dias no formato do Grafico do Dashboard ("26/08" embaixo de cada ponto)
  const dias = registros.map((r) => ({ rotulo: diaMes(r.data), horas: r.sono }))

  return (
    <Card as="section" aria-label="Horas de sono" className="rounded-2xl! px-4 pt-[13px] pb-[18px] shadow-[0_2px_4px_var(--color-borda)]! xl:px-5 xl:pt-5 xl:pb-[22px]">
      <CabecalhoCartao
        icone={
          <span aria-hidden="true" className="text-[13px] leading-none">
            🌙
          </span>
        }
        titulo="Horas de sono"
        subtitulo="Horas dormidas nos dias do período"
      />

      <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:gap-[17px]">
        {/* gráfico: a largura acompanha o cartão (useLargura), como no Dashboard.
            O contêiner com a ref fica sempre na tela porque o useLargura só mede na montagem. */}
        <div className="min-w-0 flex-1">
          <div ref={ref} className="w-full">
            {dias.length > 0 ? (
              <div style={{ height: ALTURA }}>
                {largura > 0 && <Grafico dias={dias} ideal={SONO_MINIMO} largura={largura} destacarUltimo={false} />}
              </div>
            ) : (
              <p className="py-10 text-center text-[13px] text-secundaria">Nenhum registro de sono no período.</p>
            )}
          </div>
        </div>

        {/* RF200: resumo com média, mínimo e máximo */}
        <div className="rounded-xl border border-borda-forte bg-fundo-card px-[13px] pt-[13px] pb-[13px] xl:w-[143px] xl:shrink-0 xl:self-start">
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
