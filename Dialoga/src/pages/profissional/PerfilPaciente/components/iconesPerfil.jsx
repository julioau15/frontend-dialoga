// ============================================================
// iconesPerfil
// Ícones usados só no perfil do paciente (traço, estilo Lucide, como no Figma).
// Herdam a cor do texto. Uso: <IconeEditar tamanho={14} />
// ============================================================
function Base({ tamanho = 14, className = '', children }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

// lápis sobre o quadrado: editar anotação
export const IconeEditar = (props) => (
  <Base {...props}>
    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.4 2.6a2.1 2.1 0 1 1 3 3L12 15l-4 1 1-4Z" />
  </Base>
)

// lixeira com duas linhas: excluir anotação
export const IconeExcluir = (props) => (
  <Base {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 11v6M14 11v6" />
  </Base>
)

// linha de batimento: cartão "Indicadores emocionais"
export const IconeAtividade = (props) => (
  <Base {...props}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </Base>
)

// quadrado com ✓: cartão "Conclusão de tarefas"
export const IconeQuadradoCheck = (props) => (
  <Base {...props}>
    <path d="m9 11 3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </Base>
)

// "+" do botão "Nova nota"
export const IconeMaisFino = (props) => (
  <Base {...props}>
    <path d="M5 12h14M12 5v14" />
  </Base>
)
