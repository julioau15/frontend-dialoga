// ============================================================
// ResumoCards
// Quatro cards com números: tratamentos, consultas, tarefas e profissionais.
// Props: itens -> [{ rotulo, valor, icone, cor }]  (cor = classes bg-/text- dos tokens)
// ============================================================
import Card from '../../../../../components/Card'
import Icone from '../../../../../components/Icone'

export default function ResumoCards({ itens }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {itens.map(({ rotulo, valor, icone, cor }) => (
        <Card key={rotulo} className="p-4">
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${cor}`}>
            <Icone nome={icone} tamanho={18} />
          </span>
          <p className="mt-4 text-2xl font-extrabold text-texto">{valor}</p>
          <p className="mt-1 text-xs text-secundaria">{rotulo}</p>
        </Card>
      ))}
    </div>
  )
}
