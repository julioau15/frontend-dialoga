// ============================================================
// components/OpcaoSelecionavel
// Botão de escolha (tipo "radio"): só uma opção do grupo fica marcada.
// Use dentro de um <div role="radiogroup" aria-labelledby="...">.
// Props:
//   selecionado -> true deixa o botão marcado (borda roxa)
// Aceita as props normais de <button> (onClick, ...).
// ============================================================
export default function OpcaoSelecionavel({ selecionado = false, children, ...props }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selecionado}
      className={`flex items-center justify-center gap-1.5 h-11 px-3 rounded-[10px] text-[12px] font-medium leading-[normal] cursor-pointer disabled:cursor-default transition-[background,border-color] duration-200 ease-[ease] enabled:hover:bg-fundo-suave-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
        selecionado ? 'bg-fundo-card border-2 border-primaria text-primaria-texto' : 'bg-superficie border border-borda text-secundaria'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}
