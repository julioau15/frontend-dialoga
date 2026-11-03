// ============================================================
// components/Icones
// Ícones de traço (SVG) usados nas telas. Herdam a cor do texto
// (currentColor): para mudar a cor, use text-xxx; o tamanho vem do className.
// Uso:  <Calendario className="h-4 w-4 text-primaria" />
// ============================================================
function Base({ className = 'h-5 w-5', children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`inline shrink-0 ${className}`}
    >
      {children}
    </svg>
  )
}

export const Usuarios = (p) => (
  <Base {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Base>
)

export const Calendario = (p) => (
  <Base {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </Base>
)

export const CheckQuadrado = (p) => (
  <Base {...p}>
    <path d="m9 11 3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </Base>
)

export const Atividade = (p) => (
  <Base {...p}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </Base>
)

export const Relogio = (p) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Base>
)

export const SetaDireita = (p) => (
  <Base {...p}>
    <path d="m9 18 6-6-6-6" />
  </Base>
)
