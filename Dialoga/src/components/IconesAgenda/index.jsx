// ============================================================
// components/IconesAgenda
// Ícones usados só na tela de Agenda (traço, estilo Lucide).
// Uso: <IconeSino tamanho={12} />  (herdam a cor do texto)
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
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const IconeSino = (props) => (
  <Base {...props}>
    <path d="M10.268 21a2 2 0 0 0 3.464 0" />
    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
  </Base>
)

export const IconeSetaEsquerda = (props) => (
  <Base {...props}>
    <path d="m15 18-6-6 6-6" />
  </Base>
)

export const IconeSetaDireita = (props) => (
  <Base {...props}>
    <path d="m9 18 6-6-6-6" />
  </Base>
)

export const IconeMais = (props) => (
  <Base {...props}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </Base>
)

export const IconeCalendarioPequeno = (props) => (
  <Base {...props}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </Base>
)

export const IconeRelogioPequeno = (props) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Base>
)
