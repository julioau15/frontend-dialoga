// ============================================================
// BotaoIcone
// Botão quadrado só com ícone (duplicar, excluir, remover...).
// Props:
//   rotulo -> texto para leitores de tela (aria-label) e dica ao passar o mouse
//   perigo -> true deixa o hover vermelho (ações de excluir/remover)
//   ...resto vai direto no <button> (onClick, disabled...)
// ============================================================
export default function BotaoIcone({ rotulo, perigo = false, children, ...props }) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      title={rotulo}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-secundaria cursor-pointer transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
        perigo ? 'enabled:hover:bg-erro-fundo enabled:hover:text-erro-texto' : 'enabled:hover:bg-fundo-suave-2 enabled:hover:text-primaria-texto'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}
