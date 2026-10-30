// ============================================================
// components/CartaoPessoa
// Cartão clicável de uma pessoa (avatar com iniciais, nome e uma linha de detalhe).
// Usado nas buscas: profissional (detalhe = especialidade) e paciente (detalhe = e-mail).
// Props:
//   nome        -> nome completo (as iniciais são tiradas dele)
//   detalhe     -> texto abaixo do nome
//   selecionado -> true deixa o cartão verde com ✓
// Aceita as props normais de <button> (onClick, ...).
// ============================================================
export default function CartaoPessoa({ nome, detalhe, selecionado = false, ...props }) {
    // "Carlos Eduardo Mendes" -> "CE"
    const iniciais = nome.split(' ').filter(Boolean).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase()
  
    return (
      <button
        type="button"
        aria-pressed={selecionado}
        className={`flex items-center gap-3 w-full p-3 rounded-[10px] text-left cursor-pointer transition-[background,border-color] duration-200 ease-[ease] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
          selecionado
            ? 'bg-sucesso-fundo border border-sucesso-borda'
            : 'bg-branco border border-borda shadow-[0_2px_6px_var(--color-sombra)] hover:bg-fundo-suave-2'
        }`}
        {...props}
      >
        <span className="grid place-items-center shrink-0 w-8 h-8 rounded-full bg-borda-forte text-[10px] font-bold text-primaria-escura" aria-hidden="true">
          {iniciais}
        </span>
  
        <span className="flex flex-col flex-1 min-w-0">
          <span className="text-[12px] font-bold text-texto">{nome}</span>
          <span className="text-[11px] text-secundaria break-words">{detalhe}</span>
        </span>
  
        {selecionado && <span className="text-[14px] font-bold text-sucesso" aria-hidden="true">✓</span>}
      </button>
    )
  }
  
