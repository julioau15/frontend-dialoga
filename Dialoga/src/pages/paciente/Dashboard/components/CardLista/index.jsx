// ============================================================
// CardLista
// Card com cabeçalho (ícone + título + link) e linhas separadas por divisória.
// Props: icone, titulo, linkTexto, linkPara, children (as linhas)
// ============================================================
import { Link } from 'react-router-dom'
import Card from '../../../../../components/Card'
import Icone from '../../../../../components/Icone'

export default function CardLista({ icone, titulo, linkTexto, linkPara, children }) {
  return (
    <Card className="overflow-hidden">
      <header className="flex items-center justify-between border-b border-borda px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-texto">
          <Icone nome={icone} tamanho={16} className="text-primaria" />
          {titulo}
        </h2>
        <Link
          to={linkPara}
          className="flex items-center gap-0.5 text-xs font-semibold text-primaria hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
        >
          {linkTexto}
          <Icone nome="seta" tamanho={14} />
        </Link>
      </header>
      <div className="divide-y divide-borda">{children}</div>
    </Card>
  )
}
