// ============================================================
// ProximasConsultas
// Lista das próximas consultas agendadas.
// Props: consultas -> [{ id, dia, mes, profissional, especialidade, hora }]
// ============================================================
import CardLista from '../CardLista'
import Icone from '../../../../../components/Icone'

export default function ProximasConsultas({ consultas }) {
  return (
    <CardLista icone="calendario" titulo="Próximas consultas" linkTexto="Agenda" linkPara="/paciente/agenda">
      {consultas.map(({ id, dia, mes, profissional, especialidade, hora }) => (
        <div key={id} className="flex items-start gap-3 px-5 py-4">
          <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-fundo-card text-primaria">
            <span className="text-lg font-extrabold leading-none">{dia}</span>
            <span className="text-[11px] font-semibold leading-tight">{mes}</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-texto">{profissional}</p>
            <p className="text-xs text-secundaria">{especialidade}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-secundaria">
              <Icone nome="relogio" tamanho={12} />
              {hora}
            </p>
          </div>
        </div>
      ))}
    </CardLista>
  )
}
