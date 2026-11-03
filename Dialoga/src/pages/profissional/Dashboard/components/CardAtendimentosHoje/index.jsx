// ============================================================
// Dashboard/components/CardAtendimentosHoje
// Lista as consultas de hoje (paciente, nome da consulta e horário).
// Props:
//   atendimentos -> [{ id, nome_paciente, titulo, hora }]
// ============================================================
import AvatarIniciais from '../../../../../components/AvatarIniciais'
import { Calendario, Relogio } from '../../../../../components/Icones'
import CardLista from '../CardLista'

export default function CardAtendimentosHoje({ atendimentos }) {
  return (
    <CardLista
      icone={Calendario}
      titulo="Atendimentos de hoje"
      linkTexto="Agenda"
      linkPara="/profissional/agenda"
      vazio="Nenhum atendimento para hoje."
    >
      {atendimentos.map((a) => (
        <li key={a.id} className="flex items-center gap-3 px-5 py-3">
          <AvatarIniciais nome={a.nome_paciente} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-texto">{a.nome_paciente}</p>
            <p className="truncate text-xs text-secundaria">{a.titulo}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-fundo-card px-2 py-1 text-xs font-semibold text-primaria">
            <Relogio className="h-3 w-3" />
            {a.hora}
          </span>
        </li>
      ))}
    </CardLista>
  )
}
