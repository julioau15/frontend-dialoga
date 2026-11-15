// ============================================================
// BotaoVoltar
// Link discreto com seta para a esquerda ("← Voltar às tarefas").
// Props: onClick, children (texto)
// ============================================================
import { IconeSetaVoltar } from './iconesNovaTarefa'

export default function BotaoVoltar({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-fit cursor-pointer items-center gap-2 rounded-md text-[13px] text-secundaria hover:text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
    >
      <IconeSetaVoltar tamanho={15} />
      {children}
    </button>
  )
}
