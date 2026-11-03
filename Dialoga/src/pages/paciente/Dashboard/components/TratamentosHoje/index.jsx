// ============================================================
// TratamentosHoje
// Lista dos remédios/tratamentos do dia, com os horários.
// Props: tratamentos -> [{ id, nome, frequencia, horarios: ['08:00'] }]
// ============================================================
import CardLista from '../CardLista'

export default function TratamentosHoje({ tratamentos }) {
  return (
    <CardLista icone="remedio" titulo="Tratamentos de hoje" linkTexto="Ver todos" linkPara="/paciente/tratamentos">
      {tratamentos.map(({ id, nome, frequencia, horarios }) => (
        <div key={id} className="flex items-center justify-between gap-3 px-5 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-texto">{nome}</p>
            <p className="text-xs text-secundaria">{frequencia}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            {horarios.map((hora) => (
              <span key={hora} className="rounded-md bg-fundo-card px-2 py-1 text-xs font-semibold text-primaria">
                {hora}
              </span>
            ))}
          </div>
        </div>
      ))}
    </CardLista>
  )
}
