// ============================================================
// components/CartaoConsulta
// Cartão de uma consulta na lista da Agenda. Clicável (abre os detalhes).
// Props:
//   consulta  -> { paciente, especialidade, data, hora, anotacoes, lembrete }
//   variante  -> 'dia'     (consultas do dia escolhido: borda roxa + horário em destaque)
//                'proxima' (próximos atendimentos: data em destaque + horário e especialidade)
//   onAbrir   -> clique no cartão
// ============================================================
import { diaEMesAbreviado } from '../../utils/datasAgenda'
import { IconeRelogioPequeno, IconeSino } from '../IconesAgenda'

const BASE = 'flex w-full items-center gap-3 px-4 py-3 rounded-xl bg-branco text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria'

export default function CartaoConsulta({ consulta, variante = 'dia', onAbrir }) {
  const { paciente, especialidade, data, hora, anotacoes, lembrete } = consulta

  if (variante === 'proxima') {
    const { dia, mes } = diaEMesAbreviado(data)
    return (
      <button type="button" onClick={onAbrir} className={`${BASE} shadow-[0_1px_3px_var(--color-sombra)]`}>
        <span className="grid h-10 w-10 shrink-0 place-content-center rounded-lg bg-fundo-suave-2 text-center leading-tight text-primaria">
          <span className="text-[12px] font-extrabold">{dia}</span>
          <span className="text-[9px]">{mes}</span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-[12px] font-bold text-texto">{paciente}</span>
          <span className="flex items-center gap-1 text-[10px] text-secundaria">
            <IconeRelogioPequeno tamanho={10} />
            <span className="truncate">{hora} · {especialidade}</span>
          </span>
        </span>
        {lembrete && <IconeSino tamanho={12} className="text-primaria" />}
      </button>
    )
  }

  return (
    <button type="button" onClick={onAbrir} className={`${BASE} items-start border-[1.5px] border-primaria`}>
      <span className="grid h-7 min-w-[52px] shrink-0 place-items-center rounded-lg bg-fundo-suave-2 px-2.5 text-[11px] font-extrabold text-primaria">
        {hora}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[12px] font-bold text-texto">{paciente}</span>
        <span className="truncate text-[10px] text-secundaria">{especialidade}</span>
        {anotacoes && <span className="mt-0.5 text-[10px] text-secundaria">{anotacoes}</span>}
      </span>
      {lembrete && <IconeSino tamanho={12} className="mt-1 text-primaria" />}
    </button>
  )
}
