// ============================================================
// Dashboard/components/CardAtividadesEnviadas
// Lista as últimas tarefas enviadas aos pacientes e a situação de cada uma.
// Props:
//   atividades -> [{ id, titulo, nome_paciente, situacao }]
//   situacao vem da API: 'pendente' | 'em_andamento' | 'respondida' | 'atrasada'
// ============================================================
import { CheckQuadrado } from '../../../../../components/Icones'
import Selo from '../../../../../components/Selo'
import CardLista from '../CardLista'

const SITUACOES = {
  pendente: { texto: 'Pendente', tom: 'primaria' },
  em_andamento: { texto: 'Em andamento', tom: 'info' },
  respondida: { texto: 'Respondida', tom: 'sucesso' },
  atrasada: { texto: 'Em atraso', tom: 'erro' },
}

export default function CardAtividadesEnviadas({ atividades }) {
  return (
    <CardLista
      icone={CheckQuadrado}
      titulo="Atividades enviadas"
      linkTexto="Gerenciar"
      linkPara="/profissional/tarefas"
      vazio="Você ainda não enviou nenhuma atividade."
    >
      {atividades.map((t) => {
        const situacao = SITUACOES[t.situacao] ?? SITUACOES.pendente
        return (
          <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-texto">{t.titulo}</p>
              <p className="truncate text-xs text-secundaria">Para: {t.nome_paciente}</p>
            </div>
            <Selo tom={situacao.tom}>{situacao.texto}</Selo>
          </li>
        )
      })}
    </CardLista>
  )
}
