// ============================================================
// CartaoIndicadores
// Gráfico "Energia · Sentimento · Humor · Pensamentos" (RF194–RF198, RNF058), como no Figma:
//   - quantidade de registros e o período embaixo do título ("7 registro(s) · 26/08/2026 – 01/09/2026");
//   - uma barra por indicador, com a altura proporcional à média na escala de cada um
//     (Energia /3, Sentimento /4, Humor /5, Pensamentos /4) e a cor da faixa
//     (verde Positivo, roxo Moderado, vermelho Atenção);
//   - emoji, nome e valor ("1.9/3") embaixo de cada barra;
//   - legenda Positivo, Moderado e Atenção.
// Reaproveita o cabeçalho e as faixas do perfil do paciente (visão do profissional).
// Props:
//   registros -> registros do período (formato de utils/relatorios)
//   periodo   -> { inicio, fim } ('AAAA-MM-DD')
// ============================================================
import Card from '../../../../components/Card'
import { dataCurta } from '../../../../utils/datasAgenda'
import CabecalhoCartao from '../../../profissional/PerfilPaciente/components/CabecalhoCartao'
import { FAIXAS } from '../../../profissional/PerfilPaciente/components/textosPerfil'
import { INDICADORES, faixaDe, media, notaMaxima } from '../../../../utils/relatorios'

const ALTURA_MAXIMA = 120 // altura (px) da barra com a nota máxima (Figma: 1.9/3 = 74px)

// "26/08/2026 – 01/09/2026" (ou só um dia)
const textoPeriodo = ({ inicio, fim }) => (fim && fim !== inicio ? `${dataCurta(inicio)} – ${dataCurta(fim)}` : dataCurta(inicio))

export default function CartaoIndicadores({ registros, periodo }) {
  return (
    <Card as="section" aria-label="Indicadores emocionais" className="rounded-2xl! px-4 pt-[17px] pb-[15px] shadow-[0_2px_4px_var(--color-borda)]! sm:px-5 sm:pt-5 sm:pb-5 xl:flex xl:h-full xl:flex-col xl:pt-[21px] xl:pb-[23px]">
      <CabecalhoCartao
        titulo="Energia · Sentimento · Humor · Pensamentos"
        subtitulo={`${registros.length} registro(s) · ${textoPeriodo(periodo)}`}
      />

      {registros.length === 0 ? (
        <p className="grid h-[200px] place-items-center text-center text-[13px] text-secundaria xl:h-auto xl:min-h-[200px] xl:flex-1">Nenhum registro no período.</p>
      ) : (
        <ul className="grid grid-cols-4 gap-3 sm:gap-6 xl:flex-1 xl:content-end">
          {INDICADORES.map((ind) => {
            const maximo = notaMaxima(ind)
            const valor = media(registros.map((r) => ind.notas[r[ind.id]]))
            const faixa = faixaDe(valor, maximo)
            return (
              <li key={ind.id} className="flex min-w-0 flex-col items-center text-center">
                {/* barra: o leitor de tela lê o valor no texto abaixo */}
                <div aria-hidden="true" className="flex h-[294px] w-full items-end sm:h-[296px]">
                  <div
                    className={`w-full rounded-t-[10px] ${FAIXAS[faixa].fundo}`}
                    style={{ height: `${Math.round((valor / maximo) * ALTURA_MAXIMA)}px` }}
                  />
                </div>
                <span aria-hidden="true" className="mt-1.5 text-[10px] leading-3">
                  {ind.emoji}
                </span>
                <p className="mt-0.5 whitespace-nowrap text-[12px] font-bold leading-4 text-texto">{ind.rotulo}</p>
                <p className="mt-1.5 text-[12px] leading-4 text-secundaria">
                  {valor.toFixed(1)}/{maximo}
                  <span className="sr-only"> ({FAIXAS[faixa].rotulo})</span>
                </p>
              </li>
            )
          })}
        </ul>
      )}

      {/* RF198: legenda das faixas */}
      <ul aria-label="Legenda das faixas" className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {Object.entries(FAIXAS).map(([id, faixa]) => (
          <li key={id} className="flex items-center gap-[6px] text-[12px] leading-4 text-secundaria">
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${faixa.fundo}`} />
            {faixa.rotulo}
          </li>
        ))}
      </ul>
    </Card>
  )
}
