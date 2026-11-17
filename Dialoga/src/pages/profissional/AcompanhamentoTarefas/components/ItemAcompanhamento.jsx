// ============================================================
// ItemAcompanhamento
// Cartão da lista do Acompanhamento de respostas (RF293), como no Figma:
// avatar colorido do paciente, nome da tarefa, paciente, "Última modificação: dd/mm/aaaa",
// selo de status e a setinha ">".
// No mobile o nome da tarefa é cortado com "…" e a data desce para a linha de baixo.
// O cartão inteiro é um link para a tela de resposta (/profissional/tarefas/acompanhamento/:id).
// Props: item ({ id, tarefa, paciente, status, ultimaModificacao }, ver utils/tarefasProfissional.js)
// ============================================================
import { Link } from 'react-router-dom'
import Card from '../../../../components/Card'
import Selo from '../../../../components/Selo'
import { IconeSetaDireita } from '../../../../components/IconesAgenda'
import { formatarDataBR } from '../../../../utils/formatadores'
import AvatarPaciente from './AvatarPaciente'
import { statusDe } from './statusAcompanhamento'

export default function ItemAcompanhamento({ item }) {
  const { tarefa, paciente, status, ultimaModificacao } = item
  const config = statusDe(status)

  return (
    <li>
      <Card
        as={Link}
        to={`/profissional/tarefas/acompanhamento/${item.id}`}
        aria-label={`${tarefa.titulo}, ${paciente.nome}, ${config.rotulo}. Ver respostas`}
        className="flex items-center gap-4 py-5 pr-4 pl-4 transition-colors duration-200 hover:bg-fundo-suave-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria sm:pr-5"
      >
        <AvatarPaciente paciente={paciente} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold leading-snug text-texto">{tarefa.titulo}</p>
          <p className="truncate text-[11px] leading-snug text-secundaria">{paciente.nome}</p>
          <p className="text-[11px] leading-snug text-secundaria">
            Última modificação: <span className="whitespace-nowrap">{formatarDataBR(ultimaModificacao)}</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <Selo tom={config.tom}>{config.rotulo}</Selo>
          <IconeSetaDireita tamanho={14} className="text-secundaria" />
        </div>
      </Card>
    </li>
  )
}
