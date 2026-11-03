// ============================================================
// Dashboard/components/CardPacientesRecentes
// Lista os pacientes vinculados com a data da próxima consulta.
// Props:
//   pacientes -> [{ id, nome_completo, status_atividade, proxima_consulta }]
// ============================================================
import AvatarIniciais from '../../../../../components/AvatarIniciais'
import { Usuarios } from '../../../../../components/Icones'
import Selo from '../../../../../components/Selo'
import { formatarDataBR } from '../../../../../utils/formatadores'
import CardLista from '../CardLista'

// "ativo" -> "Ativo"
const capitalizar = (texto = '') => texto.charAt(0).toUpperCase() + texto.slice(1)

export default function CardPacientesRecentes({ pacientes }) {
  return (
    <CardLista
      icone={Usuarios}
      titulo="Pacientes recentes"
      linkTexto="Ver todos"
      linkPara="/profissional/pacientes"
      vazio="Você ainda não tem pacientes vinculados."
    >
      {pacientes.map((p) => (
        <li key={p.id} className="flex items-center gap-3 px-5 py-3">
          <AvatarIniciais nome={p.nome_completo} tom="rosa" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-texto">{p.nome_completo}</p>
            <p className="truncate text-xs text-secundaria">
              {p.proxima_consulta ? `Próx. ${formatarDataBR(p.proxima_consulta)}` : 'Sem consulta agendada'}
            </p>
          </div>
          <Selo tom={p.status_atividade === 'ativo' ? 'sucesso' : 'neutro'}>
            {capitalizar(p.status_atividade)}
          </Selo>
        </li>
      ))}
    </CardLista>
  )
}
