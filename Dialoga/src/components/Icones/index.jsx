// ============================================================
// components/Icones
// Ícones em SVG (traço) usados nas telas. Herdam a cor do texto (currentColor).
//
// Há dois estilos de uso, mantidos dos dois projetos:
//  1) Telas de paciente/profissional (tamanho via className do Tailwind):
//       <Calendario className="h-4 w-4 text-primaria" />
//  2) Telas do administrador (prefixo "Icone", tamanho em px, padrão 16):
//       <IconeCheck tamanho={14} />
// ============================================================

// ---------- Estilo 1: tamanho pelo className ----------
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

// ---------- Estilo 2: tamanho pela prop "tamanho" (painel admin) ----------
// Base comum: só muda o desenho (children)
function Icone({ tamanho = 16, className = '', children }) {
  return (
    <svg
      className={className}
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const IconeCheck = (props) => <Icone {...props}><path d="M20 6 9 17l-5-5" /></Icone>

export const IconeX = (props) => <Icone {...props}><path d="M18 6 6 18M6 6l12 12" /></Icone>

export const IconeRelogio = (props) => (
  <Icone {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icone>
)

export const IconeEmail = (props) => (
  <Icone {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Icone>
)

export const IconeTelefone = (props) => (
  <Icone {...props}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </Icone>
)

export const IconeUsuario = (props) => (
  <Icone {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></Icone>
)

export const IconeUsuarios = (props) => (
  <Icone {...props}>
    <circle cx="9" cy="8" r="3.5" /><path d="M2 21a7 7 0 0 1 14 0" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7M22 21a7 7 0 0 0-4.5-6.5" />
  </Icone>
)

export const IconeAlerta = (props) => (
  <Icone {...props}><circle cx="12" cy="12" r="9" /><path d="M12 8v4.5M12 16h.01" /></Icone>
)

export const IconeEscudo = (props) => (
  <Icone {...props}><path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6z" /></Icone>
)

export const IconeSair = (props) => (
  <Icone {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></Icone>
)

export const IconeLixeira = (props) => (
  <Icone {...props}>
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
  </Icone>
)
