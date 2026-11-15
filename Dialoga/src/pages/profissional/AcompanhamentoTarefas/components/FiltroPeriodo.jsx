// ============================================================
// FiltroPeriodo
// "FILTRAR POR PERÍODO": pílulas Todos | Dia | Mês | Ano e, abaixo, o campo de cada período,
// como nos frames "Acompanhamento de tarefa dia / mês / ano":
//   Dia -> botão "📅 Selecionar dia ⌄" que abre o calendário logo abaixo (com pontinho nos dias
//          que têm tarefa); escolher um dia fecha o calendário e mostra a data no botão;
//   Mês -> campo com ícone de calendário e "mm/aaaa" (só números; a barra entra sozinha);
//   Ano -> lista "Selecionar ano".
// Todos não tem campo. Trocar de pílula guarda o que já foi preenchido em cada campo.
// Props:
//   periodo       -> { tipo, dia, mes, ano } (ver filtros.js)
//   onMudar       -> recebe o novo período
//   diasComTarefa -> Set com os dias 'AAAA-MM-DD' que têm tarefa (pontinhos do calendário)
//   mesInicial    -> { ano, mes } mostrado ao abrir o calendário (mes de 0 a 11)
//   anos          -> anos da lista, ex.: ['2026', '2025', '2024']
// ============================================================
import { useId, useState } from 'react'
import { Calendario } from '../../../../components/Icones'
import { formatarDataBR } from '../../../../utils/formatadores'
import { IconeChevronBaixo } from '../../NovaTarefa/components/iconesNovaTarefa'
import CalendarioDia from './CalendarioDia'
import FiltroChips from './FiltroChips'
import { mascaraMes } from './filtros'

const TIPOS = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'dia', rotulo: 'Dia' },
  { id: 'mes', rotulo: 'Mês' },
  { id: 'ano', rotulo: 'Ano' },
]

// caixa branca dos campos do período (cantos de 12px e borda lilás, como no Figma)
const CAIXA =
  'h-[41px] rounded-xl border-2 border-borda bg-branco text-[13px] text-texto outline-0 transition-[border-color,box-shadow] duration-200 focus-visible:border-primaria focus-visible:shadow-[0_0_0_3px_var(--color-primaria-alfa-20)]'

export default function FiltroPeriodo({ periodo, onMudar, diasComTarefa, mesInicial, anos }) {
  const idTitulo = useId()
  const [calendarioAberto, setCalendarioAberto] = useState(false)
  const [mesVisivel, setMesVisivel] = useState(mesInicial)

  // troca o tipo de período; ao escolher "Dia" o calendário já abre (como no Figma)
  function mudarTipo(tipo) {
    onMudar({ ...periodo, tipo })
    setCalendarioAberto(tipo === 'dia' && !periodo.dia)
  }

  // escolher um dia filtra por ele e fecha o calendário
  function escolherDia(iso) {
    onMudar({ ...periodo, dia: iso })
    setCalendarioAberto(false)
  }

  // setas do calendário: mês anterior ou próximo
  function mudarMes(delta) {
    setMesVisivel(({ ano, mes }) => {
      const novo = new Date(Date.UTC(ano, mes + delta, 1))
      return { ano: novo.getUTCFullYear(), mes: novo.getUTCMonth() }
    })
  }

  return (
    <FiltroChips id={idTitulo} rotulo="Filtrar por período" opcoes={TIPOS} valor={periodo.tipo} onMudar={mudarTipo}>
      {periodo.tipo === 'dia' && (
        <div className="mt-0.5 flex flex-col gap-[9px]">
          <button
            type="button"
            aria-expanded={calendarioAberto}
            aria-label={periodo.dia ? `Dia selecionado: ${formatarDataBR(periodo.dia)}. Trocar dia` : 'Selecionar dia'}
            onClick={() => setCalendarioAberto((aberto) => !aberto)}
            className={`${CAIXA} flex w-[160px] cursor-pointer items-center gap-1.5 pr-3 pl-4 hover:bg-fundo-suave-2`}
          >
            <span aria-hidden="true">📅</span>
            <span className="flex-1 text-left">{periodo.dia ? formatarDataBR(periodo.dia) : 'Selecionar dia'}</span>
            <IconeChevronBaixo tamanho={14} className="text-secundaria" />
          </button>
          {calendarioAberto && (
            <CalendarioDia
              ano={mesVisivel.ano}
              mes={mesVisivel.mes}
              selecionado={periodo.dia}
              diasComTarefa={diasComTarefa}
              onSelecionar={escolherDia}
              onMudarMes={mudarMes}
            />
          )}
        </div>
      )}

      {periodo.tipo === 'mes' && (
        <label className={`${CAIXA} mt-0.5 flex w-[220px] cursor-text items-center gap-2.5 px-5 focus-within:border-primaria focus-within:shadow-[0_0_0_3px_var(--color-primaria-alfa-20)] sm:w-[227px]`}>
          <Calendario className="h-4 w-4 shrink-0 text-texto" />
          <span className="sr-only">Mês (mm/aaaa)</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="mm/aaaa"
            maxLength={7}
            value={periodo.mes}
            onChange={(e) => onMudar({ ...periodo, mes: mascaraMes(e.target.value) })}
            className="w-full min-w-0 border-0 bg-transparent text-[13px] text-texto outline-0 placeholder:text-texto"
          />
        </label>
      )}

      {periodo.tipo === 'ano' && (
        <div className="relative mt-0.5 w-[220px] sm:w-[227px]">
          <select
            aria-label="Ano"
            value={periodo.ano}
            onChange={(e) => onMudar({ ...periodo, ano: e.target.value })}
            className={`${CAIXA} h-[42px] w-full cursor-pointer appearance-none pr-10 pl-5`}
          >
            <option value="">Selecionar ano</option>
            {anos.map((ano) => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
          <IconeChevronBaixo tamanho={15} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-texto" />
        </div>
      )}
    </FiltroChips>
  )
}
