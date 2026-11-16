// ============================================================
// iconesPerfilProfissional
// Ícones usados só na tela do profissional (traço, estilo Lucide, como no Figma).
// Herdam a cor do texto. Uso: <IconeCirculoCheck tamanho={18} />
// ============================================================
function Base({ tamanho = 16, className = '', children }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

// círculo com ✓: itens de "Tarefas ativas"
export const IconeCirculoCheck = (props) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </Base>
)

// linha de batimento: itens de "Tratamentos vinculados"
export const IconeAtividade = (props) => (
  <Base {...props}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </Base>
)
