// ============================================================
// Dashboard/components/CardLista
// Moldura dos cards de lista: ícone + título à esquerda, link à direita
// e o conteúdo (as linhas) embaixo.
// Props:
//   icone     -> componente de ícone
//   titulo    -> título do card
//   linkTexto -> texto do link (ex.: "Agenda")
//   linkPara  -> rota do link (ex.: "/profissional/agenda")
//   vazio     -> texto mostrado quando não há itens (children vazio)
// Exporta também ItemLink: uma linha (<li>) clicável que abre o item na tela dele.
// ============================================================
import { Children, useId } from 'react'
import { Link } from 'react-router-dom'
import { SetaDireita } from '../../../../../components/Icones'

// linha clicável: o <li> inteiro é um link (para + state opcional)
export function ItemLink({ para, state, rotulo, className = '', children }) {
  return (
    <li>
      <Link
        to={para}
        state={state}
        aria-label={rotulo}
        className={`flex no-underline transition-colors duration-200 hover:bg-fundo-suave-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primaria ${className}`}
      >
        {children}
      </Link>
    </li>
  )
}

export default function CardLista({ icone: Icone, titulo, linkTexto, linkPara, vazio, className = '', children }) {
  const idTitulo = useId()
  const temItens = Children.toArray(children).flat().length > 0

  return (
    <section
      aria-labelledby={idTitulo}
      className={`flex flex-col overflow-hidden rounded-xl border border-borda bg-superficie shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between border-b border-borda px-5 py-4">
        <h2 id={idTitulo} className="flex items-center gap-2 text-sm font-semibold text-texto">
          <Icone className="h-4 w-4 text-primaria-texto" />
          {titulo}
        </h2>
        <Link
          to={linkPara}
          className="flex items-center gap-1 rounded text-xs font-semibold text-primaria-texto hover:text-primaria-escura-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
        >
          {linkTexto}
          <SetaDireita className="h-3 w-3" />
        </Link>
      </div>

      {temItens ? (
        <ul className="divide-y divide-borda">{children}</ul>
      ) : (
        <p className="px-5 py-8 text-center text-sm text-secundaria">{vazio}</p>
      )}
    </section>
  )
}
