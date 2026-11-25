// ============================================================
// Dashboard/components/CardIndicador
// Card com um número grande e um rótulo (os 4 cards do topo).
// Props:
//   icone  -> componente de ícone (de components/Icones)
//   tom    -> cor do ícone: 'primaria' | 'info' | 'sucesso' | 'alerta'
//   valor  -> número a mostrar
//   rotulo -> texto pequeno abaixo do número
//   para   -> rota de destino (opcional): com ela, o card inteiro vira um link
// ============================================================
import { Link } from 'react-router-dom'

const TONS = {
  primaria: 'bg-fundo-card text-primaria-texto',
  info: 'bg-info-fundo text-info-texto',
  sucesso: 'bg-sucesso-fundo text-sucesso-texto',
  alerta: 'bg-alerta-fundo text-alerta-texto',
}

const CLASSES_CARD = 'rounded-xl border border-borda bg-superficie p-4 shadow-sm'
const CLASSES_LINK =
  'block no-underline transition-[border-color,box-shadow] duration-200 hover:border-primaria hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria'

export default function CardIndicador({ icone: Icone, tom = 'primaria', valor, rotulo, para }) {
  const conteudo = (
    <>
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${TONS[tom]}`}>
        <Icone className="h-[18px] w-[18px]" />
      </div>
      <p className="mt-3 text-2xl font-bold text-texto">{valor}</p>
      <p className="text-xs text-secundaria">{rotulo}</p>
    </>
  )

  if (!para) return <div className={CLASSES_CARD}>{conteudo}</div>

  return (
    <Link to={para} aria-label={`${rotulo}: ${valor}`} className={`${CLASSES_CARD} ${CLASSES_LINK}`}>
      {conteudo}
    </Link>
  )
}
