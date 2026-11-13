// ============================================================
// components/CartaoConsulta
// Cartão de uma consulta na lista da Agenda. Clicável (abre os detalhes).
// Props:
//   consulta  -> { titulo, paciente, especialidade, data, hora, anotacoes, lembrete }
//   variante  -> 'dia'     (consultas do dia escolhido: borda roxa + horário em destaque)
//                'proxima' (próximos atendimentos: data em destaque + horário e especialidade)
//                'semana'  (visão Semana: igual à 'proxima', com traçado roxo 4px à esquerda e 1px no resto)
//   onAbrir   -> clique no cartão
// ============================================================
import { diaEMesAbreviado } from '../../utils/datasAgenda'
import { IconeRelogioPequeno, IconeSino } from '../IconesAgenda'

// traçado interno roxo (4px à esquerda, 1px no resto) + sombras 0 1px 3px e 0 1px 2px -1px, preto 10%
const TRACADO = 'border border-l-4 border-primaria shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1)]'

const BASE = 'flex w-full items-center gap-3 px-4 py-3 rounded-xl bg-branco text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria'

export default function CartaoConsulta({ consulta, variante = 'dia', onAbrir }) {
  const { titulo, paciente, especialidade, data, hora, anotacoes, lembrete } = consulta
  // título da consulta (só aparece se existir)
  const linhaTitulo = titulo && <span className="truncate text-[10px] font-semibold text-primaria">{titulo}</span>

  if (variante === 'proxima' || variante === 'semana') {
    const { dia, mes } = diaEMesAbreviado(data)
    const estilo = variante === 'semana' ? TRACADO : 'shadow-[0_1px_3px_var(--color-sombra)]'
    return (
      <button type="button" onClick={onAbrir} className={`${BASE} ${estilo}`}>
        <span className="grid h-10 w-10 shrink-0 place-content-center rounded-lg bg-fundo-suave-2 text-center leading-tight text-primaria">
          <span className="text-[12px] font-extrabold">{dia}</span>
          <span className="text-[9px]">{mes}</span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          {linhaTitulo}
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
    <button type="button" onClick={onAbrir} className={`${BASE} items-start ${TRACADO}`}>
      <span className="grid h-7 min-w-[52px] shrink-0 place-items-center rounded-lg bg-fundo-suave-2 px-2.5 text-[11px] font-extrabold text-primaria">
        {hora}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        {linhaTitulo}
        <span className="truncate text-[12px] font-bold text-texto">{paciente}</span>
        <span className="truncate text-[10px] text-secundaria">{especialidade}</span>
        {anotacoes && <span className="mt-0.5 text-[10px] italic text-secundaria">{anotacoes}</span>}
      </span>
      {lembrete && <IconeSino tamanho={12} className="mt-1 text-primaria" />}
    </button>
  )
}
