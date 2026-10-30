// ============================================================
// components/Chip
// Botão pequeno em formato de pílula, para escolher uma opção (ou várias).
// Props:
//   selecionado -> true deixa o chip marcado (borda e texto roxos)
//   className   -> classes extras (ex.: "w-full")
// Aceita as props normais de <button> (onClick, ...).
// ============================================================
export default function Chip({ selecionado = false, className = '', children, ...props }) {
    return (
      <button
        type="button"
        aria-pressed={selecionado}
        className={`h-8 px-3 rounded-full text-[11px] font-medium leading-[normal] cursor-pointer transition-[background,border-color] duration-200 ease-[ease] hover:bg-fundo-suave-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
          selecionado ? 'bg-fundo-card border border-primaria text-primaria' : 'bg-branco border border-borda text-secundaria'
        } ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
  
