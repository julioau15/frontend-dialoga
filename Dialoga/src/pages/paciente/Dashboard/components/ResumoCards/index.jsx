// ============================================================
// ResumoCards
// Quatro cards com números: tratamentos, consultas, tarefas e profissionais.
// Cada card é um link para a tela correspondente.
// Props: itens -> [{ rotulo, valor, icone, cor, para }]  (cor = classes bg-/text- dos tokens)
// ============================================================
import { Link } from 'react-router-dom'
import Icone from '../../../../../components/Icone'

const CARD =
  'block rounded-xl border border-borda bg-branco p-4 shadow-sm no-underline transition-[border-color,box-shadow] duration-200 hover:border-primaria hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria'

export default function ResumoCards({ itens }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {itens.map(({ rotulo, valor, icone, cor, para }) => (
        <Link key={rotulo} to={para} aria-label={`${rotulo}: ${valor}`} className={CARD}>
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${cor}`}>
            <Icone nome={icone} tamanho={18} />
          </span>
          <p className="mt-4 text-2xl font-extrabold text-texto">{valor}</p>
          <p className="mt-1 text-xs text-secundaria">{rotulo}</p>
        </Link>
      ))}
    </div>
  )
}
