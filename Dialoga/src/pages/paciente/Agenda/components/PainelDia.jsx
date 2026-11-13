// ============================================================
// PainelDia
// Cartão ao lado do calendário (visão Mês): dia escolhido e suas consultas.
// Props: data ('AAAA-MM-DD'), consultas (só as desse dia)
// ============================================================
import Card from '../../../../components/Card'
import { IconeRelogioPequeno } from '../../../../components/IconesAgenda'
import { dataPorExtenso } from '../../../../utils/datasAgenda'

export default function PainelDia({ data, consultas }) {
  return (
    <Card as="section" aria-label="Consultas do dia">
      <div className="px-4 py-3">
        <h2 className="text-[11px] font-extrabold text-texto">{dataPorExtenso(data)}</h2>
        <p className="text-[10px] text-secundaria">{consultas.length} consulta(s)</p>
      </div>

      <div className="border-t border-borda">
        {consultas.length === 0 ? (
          <p className="px-4 py-5 text-center text-[11px] text-secundaria">Não há consultas registradas</p>
        ) : (
          consultas.map((c) => (
            <div key={c.id} className="flex flex-col gap-0.5 border-b border-borda px-4 py-3 last:border-b-0">
              {c.titulo && <span className="text-[10px] font-semibold text-primaria">{c.titulo}</span>}
              <span className="text-[11px] font-bold text-texto">{c.profissional}</span>
              <span className="text-[10px] text-secundaria">{c.especialidade}</span>
              <span className="flex items-center gap-1 text-[10px] text-secundaria">
                <IconeRelogioPequeno tamanho={10} />
                {c.hora}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
