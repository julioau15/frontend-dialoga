// ============================================================
// iconesProfissionais
// Ícones usados só na tela Profissionais do paciente (traço, estilo Lucide, como no Figma).
// Herdam a cor do texto. Uso: <IconeCalendario tamanho={11} />
// A lixeira, o ✓ e o envelope vêm do componente compartilhado (components/Icones).
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

// "+" do botão "Novo profissional"
export const IconeMais = (props) => (
  <Base {...props}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </Base>
)

// setinha do dropdown "Especialidade" (profissional achado pelo CPF)
export const IconeChevronBaixo = (props) => (
  <Base {...props}>
    <path d="m6 9 6 6 6-6" />
  </Base>
)

// calendário: próxima consulta ("Próx. 10/09/2026")
export const IconeCalendario = (props) => (
  <Base {...props}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </Base>
)
