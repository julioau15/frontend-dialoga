// ============================================================
// iconesRelatorios
// Ícones usados só na tela Relatórios do paciente (traço, estilo Lucide, como no Figma).
// Herdam a cor do texto. Uso: <IconeAnotacao tamanho={16} />
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

// folha com linhas: cartão "Anotações"
export const IconeAnotacao = (props) => (
  <Base {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </Base>
)

// quadrado com check: cartão "Tarefas deste período"
export const IconeTarefa = (props) => (
  <Base {...props}>
    <path d="M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    <path d="m9 11 3 3L22 4" />
  </Base>
)
