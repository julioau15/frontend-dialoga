// ============================================================
// TratamentosHoje
// Lista dos remédios/tratamentos do dia, com os horários.
// Props: tratamentos -> [{ id, nome, frequencia, horarios: ['08:00'] }]
// ============================================================
import CardLista, { LinhaLink } from '../CardLista'

export default function TratamentosHoje({ tratamentos }) {
  return (
    <CardLista icone="remedio" titulo="Tratamentos de hoje" linkTexto="Ver todos" linkPara="/paciente/tratamentos" vazio="Nenhum tratamento cadastrado.">
      {tratamentos.map(({ id, nome, frequencia, horarios }) => (
        // clicar leva ao cartão deste tratamento na tela de Tratamentos (em destaque)
        <LinhaLink
          key={id}
          para="/paciente/tratamentos"
          state={{ destacarTratamento: id }}
          rotulo={`Ver o tratamento ${nome}`}
          className="items-center justify-between gap-3 px-5 py-3"
        >
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
        </LinhaLink>
      ))}
    </CardLista>
  )
}
