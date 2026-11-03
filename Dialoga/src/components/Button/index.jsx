// ============================================================
// components/Button
// Botão padrão do sistema, ocupa 100% da largura do container.
// Props:
//   variante   -> 'primario' (roxo preenchido) | 'contorno' (borda roxa) | 'suave' (borda lilás clara)
//                 | 'sucesso' (verde preenchido) | 'perigo' (vermelho preenchido)
//                 | 'perigo-contorno' (borda e texto vermelhos)
//   carregando -> true desabilita o botão (evita clique duplo)
//   larguraAuto -> true deixa o botão com a largura do conteúdo (ex.: rodapé de modal)
//   className  -> classes extras (opcional)
// Aceita também as props normais de <button> (type, onClick, ...).
// ============================================================

// Base comum a todas as variantes
const BASE =
  'flex items-center justify-center gap-2 w-full h-10 px-4 rounded-lg ' +
  'text-[13px] font-semibold leading-none cursor-pointer ' +
  'transition-[background,border-color,opacity] duration-200 ease-[ease] ' +
  'disabled:opacity-60 disabled:cursor-not-allowed ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria' // acessibilidade (teclado)

// Variantes (classes escritas por extenso para o Tailwind encontrá-las)
const VARIANTES = {
  // fundo roxo
  primario: 'bg-primaria border border-primaria text-branco enabled:hover:bg-primaria-escura',
  // fundo branco e borda roxa
  contorno: 'bg-branco border border-primaria text-texto enabled:hover:bg-fundo-suave-2',
  // fundo branco e borda lilás clara (ex.: botão Voltar)
  suave: 'bg-branco border border-borda-forte text-texto enabled:hover:bg-fundo-suave-2',
  // fundo verde (ex.: Aprovar)
  sucesso: 'bg-sucesso border border-sucesso text-branco enabled:hover:brightness-95',
  // fundo vermelho (ex.: Confirmar recusa)
  perigo: 'bg-erro border border-erro text-branco enabled:hover:brightness-95',
  // fundo branco, borda e texto vermelhos (ex.: Recusar)
  'perigo-contorno': 'bg-branco border border-erro-borda text-erro enabled:hover:bg-erro-fundo',
}

export default function Button({ variante = 'primario', carregando = false, larguraAuto = false, className = '', children, ...props }) {
  const base = larguraAuto ? BASE.replace('w-full', 'w-auto') : BASE
  return (
    <button
      className={`${base} ${VARIANTES[variante]} ${className}`}
      {...props}
      disabled={carregando || props.disabled}
    >
      {children}
    </button>
  )
}
