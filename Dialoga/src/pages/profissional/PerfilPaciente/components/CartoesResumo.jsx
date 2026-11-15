// ============================================================
// CartoesResumo
// Três números do paciente logo abaixo do cabeçalho (RF218, RF308), como no Figma:
// sessões, tarefas enviadas e taxa de resposta, com o número roxo em cima e o
// rótulo embaixo, centralizados. Sempre 3 lado a lado (no mobile o rótulo quebra).
// Props:
//   resumo -> { sessoes, tarefasEnviadas, taxaResposta }
// ============================================================
import Card from '../../../../components/Card'

export default function CartoesResumo({ resumo }) {
  const itens = [
    { id: 'sessoes', rotulo: 'Sessões', valor: resumo.sessoes },
    { id: 'tarefas', rotulo: 'Tarefas enviadas', valor: resumo.tarefasEnviadas },
    { id: 'taxa', rotulo: 'Taxa de resposta', valor: `${resumo.taxaResposta}%` },
  ]

  return (
    <ul aria-label="Resumo do paciente" className="grid grid-cols-3 gap-2.5">
      {itens.map(({ id, rotulo, valor }) => (
        <Card as="li" key={id} className="flex flex-col items-center justify-center px-2 pt-[13px] pb-[14px] text-center">
          <p className="text-[20px] font-extrabold leading-7 text-primaria">{valor}</p>
          <p className="mt-px text-[12px] leading-4 text-secundaria">{rotulo}</p>
        </Card>
      ))}
    </ul>
  )
}
