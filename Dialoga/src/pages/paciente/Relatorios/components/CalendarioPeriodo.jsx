// ============================================================
// CalendarioPeriodo
// "SELECIONAR PERÍODO" da tela Relatórios, como no Figma (RF190–RF193, RNF057):
//   - setas para trocar de mês e o nome do mês ("Agosto 2026");
//   - 1º clique escolhe o início, 2º clique o fim (se for antes do início, os dois trocam);
//     um 3º clique começa um novo período;
//   - ponto roxo embaixo dos dias com registro (branco no dia roxo);
//   - início e fim em roxo, dias do meio em lilás;
//   - período selecionado embaixo ("26/08/2026 – 01/09/2026") e a orientação fora do cartão
//     (no desktop, a orientação fica logo abaixo do calendário, como no Figma).
// O CalendarioMes compartilhado seleciona só um dia, por isso este é local
// (usa as mesmas funções de data de utils/datasAgenda).
// Props:
//   ano, mes          -> mês mostrado (mes de 0 a 11)
//   periodo           -> { inicio: 'AAAA-MM-DD', fim: 'AAAA-MM-DD' | null }
//   diasComRegistro   -> Set com os dias que têm registro
//   onMudarPeriodo(p) -> novo { inicio, fim }
//   onMudarMes(delta) -> -1 (mês anterior) ou 1 (próximo mês)
// ============================================================
import { useId } from 'react'
import Card from '../../../../components/Card'
import { IconeSetaDireita, IconeSetaEsquerda } from '../../../../components/IconesAgenda'
import { celulasDoMes, dataCurta, montarIso, tituloDoMes } from '../../../../utils/datasAgenda'

const SEMANA = [
  { id: 'dom', letra: 'D', nome: 'Domingo' },
  { id: 'seg', letra: 'S', nome: 'Segunda' },
  { id: 'ter', letra: 'T', nome: 'Terça' },
  { id: 'qua', letra: 'Q', nome: 'Quarta' },
  { id: 'qui', letra: 'Q', nome: 'Quinta' },
  { id: 'sex', letra: 'S', nome: 'Sexta' },
  { id: 'sab', letra: 'S', nome: 'Sábado' },
]

const BOTAO_SETA =
  'grid h-7 w-7 cursor-pointer place-items-center rounded-md text-secundaria hover:bg-fundo-suave focus-visible:outline-2 focus-visible:outline-primaria'

// texto do período: "26/08/2026 – 01/09/2026" (só o início enquanto falta o fim)
const textoPeriodo = ({ inicio, fim }) => (fim && fim !== inicio ? `${dataCurta(inicio)} – ${dataCurta(fim)}` : dataCurta(inicio))

export default function CalendarioPeriodo({ ano, mes, periodo, diasComRegistro, onMudarPeriodo, onMudarMes }) {
  const idTitulo = useId()
  const idOrientacao = useId()
  const celulas = celulasDoMes(ano, mes)
  const { inicio, fim } = periodo

  // regra dos cliques: início -> fim -> novo início
  function escolher(iso) {
    if (!inicio || fim) return onMudarPeriodo({ inicio: iso, fim: null })
    if (iso < inicio) return onMudarPeriodo({ inicio: iso, fim: inicio })
    onMudarPeriodo({ inicio, fim: iso })
  }

  return (
    <section aria-labelledby={idTitulo} className="max-xl:mb-0.5 xl:flex xl:flex-col">
      <h2 id={idTitulo} className="text-[12px] font-bold uppercase leading-4 tracking-[0.03em] text-secundaria xl:pl-0.5">
        Selecionar período
      </h2>

      <Card
        as="div"
        className="mt-2 rounded-2xl! px-[15px] pt-[14px] pb-4 shadow-[0_2px_4px_var(--color-borda)]! xl:mt-[10px] xl:rounded-xl! xl:px-[15px] xl:pt-[18px] xl:pb-[17px]"
      >
        {/* mês e setas */}
        <div className="flex items-center justify-between px-[13px] xl:px-[18px]">
          <button type="button" className={BOTAO_SETA} aria-label="Mês anterior" onClick={() => onMudarMes(-1)}>
            <IconeSetaEsquerda tamanho={15} />
          </button>
          <p className="text-[14px] font-bold leading-5 text-texto" aria-live="polite">
            {tituloDoMes(ano, mes)}
          </p>
          <button type="button" className={BOTAO_SETA} aria-label="Próximo mês" onClick={() => onMudarMes(1)}>
            <IconeSetaDireita tamanho={15} />
          </button>
        </div>

        {/* dias da semana + dias do mês (mobile e desktop: células quadradas que acompanham o cartão; tablet: 44px centralizadas) */}
        <div className="mt-[15px] grid grid-cols-7 gap-1 text-center xl:mt-[19px]" aria-describedby={idOrientacao}>
          {SEMANA.map((d) => (
            <abbr key={d.id} title={d.nome} className="pb-[9px] text-[12px] font-semibold leading-4 text-secundaria no-underline xl:pb-1">
              {d.letra}
            </abbr>
          ))}

          {celulas.map((dia, i) => {
            if (!dia) return <span key={`vazio-${i}`} aria-hidden="true" />
            const iso = montarIso(ano, mes, dia)
            const ponta = iso === inicio || iso === fim
            const dentro = !!fim && iso > inicio && iso < fim
            const temRegistro = diasComRegistro.has(iso)
            return (
              <button
                key={iso}
                type="button"
                aria-pressed={ponta || dentro}
                aria-label={`${dia} de ${tituloDoMes(ano, mes).split(' ')[0].toLowerCase()}${temRegistro ? ', com registro' : ''}`}
                onClick={() => escolher(iso)}
                className={`relative grid aspect-square w-full cursor-pointer place-items-center rounded-lg sm:mx-auto sm:aspect-auto sm:h-11 sm:w-11 xl:aspect-square xl:h-auto xl:w-full text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primaria ${
                  ponta ? 'bg-primaria bg-botao text-branco' : dentro ? 'bg-borda-forte text-primaria-texto' : 'text-texto hover:bg-fundo-suave'
                }`}
              >
                {dia}
                {/* RF192: ponto nos dias com registro (branco sobre o roxo) */}
                {temRegistro && (
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-[5px] h-1 w-1 rounded-full xl:bottom-1 ${ponta ? 'bg-branco' : 'bg-primaria'}`}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* RF193: período selecionado */}
        <p className="mt-[15px] border-t border-borda pt-[14px] text-center text-[12px] font-bold leading-4 text-texto xl:mt-3 xl:pt-3">
          <span className="sr-only">Período selecionado: </span>
          {textoPeriodo(periodo)}
        </p>
      </Card>

      {/* RNF057: orientação de uso */}
      <p id={idOrientacao} className="mt-1 pr-[26px] pl-1 text-[11px] leading-4 text-secundaria xl:mt-[13px] xl:pr-1">
        {fim ? 'Toque no primeiro dia, depois no último para definir o período. Pontos roxos = registros.' : 'Agora toque no último dia do período. Pontos roxos = registros.'}
      </p>
    </section>
  )
}
