// ============================================================
// CartaoLista
// Cartões "Tarefas ativas" e "Tratamentos vinculados" da tela do profissional, como no Figma:
// título de 18px, texto de apoio, a lista de itens (ItemAtividade) e o link "Ver todas/todos ..."
// no fim. Sem itens, mostra uma frase curta no lugar da lista.
// Props:
//   titulo, subtitulo  -> textos do topo
//   itens              -> [{ id, titulo, status, descricao, rotulo, valor }]
//   icone              -> ícone dos itens
//   textoVazio         -> frase quando não há itens
//   link               -> { para, rotulo } ("Ver todas as tarefas" -> /paciente/tarefas)
//   tituloInteiro      -> repassado ao ItemAtividade (true em "Tratamentos vinculados")
//   className          -> classes extras do cartão (ex.: altura mínima no desktop)
// ============================================================
import { useId } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../../../components/Card'
import ItemAtividade from './ItemAtividade'

export default function CartaoLista({ titulo, subtitulo, itens, icone, textoVazio, link, tituloInteiro = false, className = '' }) {
  const idTitulo = useId()

  return (
    <Card as="section" aria-labelledby={idTitulo} className={`flex flex-col rounded-2xl! px-4 pt-4 pb-5 shadow-[0_1px_2px_var(--color-borda)]! sm:px-[23px] sm:pt-[23px] sm:pb-[25px] ${className}`}>
      <h2 id={idTitulo} className="text-[16px] font-extrabold leading-6 text-texto sm:text-[18px]">
        {titulo}
      </h2>
      <p className="mt-1 text-[13px] leading-[18px] text-secundaria sm:mt-[6px] sm:text-[14px] sm:leading-5">{subtitulo}</p>

      {itens.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2.5 sm:mt-[19px] sm:gap-3">
          {itens.map((item) => (
            <ItemAtividade key={item.id} item={item} icone={icone} tituloInteiro={tituloInteiro} />
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-[13px] text-secundaria sm:mt-[22px]">{textoVazio}</p>
      )}

      {/* mt-auto: no desktop, com altura mínima, o link fica no pé do cartão (como no Figma) */}
      <Link
        to={link.para}
        className="mt-4 w-fit rounded-sm text-[13px] font-semibold text-primaria hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria sm:mt-[22px] xl:mt-auto xl:pt-[19px]"
      >
        {link.rotulo}
      </Link>
    </Card>
  )
}
