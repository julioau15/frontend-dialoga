// ============================================================
// CardLista
// Card com cabeçalho (ícone + título + link) e linhas separadas por divisória.
// Props: icone, titulo, linkTexto, linkPara, vazio (texto quando não há linhas), children (as linhas)
// Exporta também LinhaLink: uma linha clicável que abre o item na tela dele.
// ============================================================
import { Children } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../../../../components/Card'
import Icone from '../../../../../components/Icone'

// linha clicável: leva para a tela do item (o "state" diz qual item abrir lá)
export function LinhaLink({ para, state, rotulo, className = '', children }) {
  return (
    <Link
      to={para}
      state={state}
      aria-label={rotulo}
      className={`flex no-underline transition-colors duration-200 hover:bg-fundo-suave-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primaria ${className}`}
    >
      {children}
    </Link>
  )
}

export default function CardLista({ icone, titulo, linkTexto, linkPara, vazio, children }) {
  const semLinhas = Children.count(children) === 0

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
      {semLinhas && vazio ? (
        <p className="px-5 py-6 text-center text-xs text-secundaria">{vazio}</p>
      ) : (
        <div className="divide-y divide-borda">{children}</div>
      )}
    </Card>
  )
}
