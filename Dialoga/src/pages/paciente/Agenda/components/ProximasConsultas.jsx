// ============================================================
// ProximasConsultas
// Cartão "Próximas consultas": data, profissional, horário e lixeira.
// Sem consultas mostra "Não há consultas registradas".
// Props: consultas (já ordenadas), onExcluir(consulta)
// ============================================================
import Card from '../../../../components/Card'
import { IconeLixeira } from '../../../../components/Icones'
import { IconeRelogioPequeno } from '../../../../components/IconesAgenda'
import { diaEMesAbreviado } from '../../../../utils/datasAgenda'

export default function ProximasConsultas({ consultas, onExcluir }) {
  return (
    <Card as="section" aria-label="Próximas consultas">
      <h2 className="border-b border-borda px-4 py-3 text-[11px] font-extrabold text-texto">Próximas consultas</h2>

      {consultas.length === 0 ? (
        <p className="px-4 py-5 text-center text-[11px] text-secundaria">Não há consultas registradas</p>
      ) : (
        <ul>
          {consultas.map((c) => {
            const { dia, mes } = diaEMesAbreviado(c.data)
            return (
              <li key={c.id} className="flex items-center gap-3 border-b border-borda px-4 py-3 last:border-b-0">
                <span className="grid h-9 w-9 shrink-0 place-content-center rounded-lg bg-fundo-suave-2 text-center leading-tight text-primaria">
                  <span className="text-[11px] font-extrabold">{dia}</span>
                  <span className="text-[8px]">{mes}</span>
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[10px] font-bold text-texto">{c.profissional}</span>
                  <span className="flex items-center gap-1 text-[9px] text-secundaria">
                    <IconeRelogioPequeno tamanho={9} />
                    {c.hora}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={`Excluir consulta com ${c.profissional} em ${diaEMesAbreviado(c.data).dia} de ${mes}`}
                  onClick={() => onExcluir(c)}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-secundaria cursor-pointer hover:bg-fundo-suave hover:text-erro focus-visible:outline-2 focus-visible:outline-primaria"
                >
                  <IconeLixeira tamanho={12} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
