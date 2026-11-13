// ============================================================
// iconesTarefas
// Ícones usados só na tela de Tarefas (traço, estilo Lucide), para a tela
// não depender de outros arquivos do projeto.
// Uso: <IconeRelogio tamanho={11} />  (herda a cor do texto)
// ============================================================
function Base({ tamanho = 16, children }) {
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
      className="shrink-0"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const IconeRelogio = (props) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Base>
)

export const IconeMais = (props) => (
  <Base {...props}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </Base>
)

export const IconeSetaEsquerda = (props) => (
  <Base {...props}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </Base>
)

export const IconeCalendario = (props) => (
  <Base {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </Base>
)

export const IconeSalvar = (props) => (
  <Base {...props}>
    <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
    <path d="M7 3v4a1 1 0 0 0 1 1h7" />
  </Base>
)

export const IconeEnviar = (props) => (
  <Base {...props}>
    <path d="M14.5 21.7a.5.5 0 0 0 .9-.1l6.6-18.5a.5.5 0 0 0-.6-.6L2.4 9.1a.5.5 0 0 0-.1.9l7.6 3.2a2 2 0 0 1 1 1z" />
    <path d="m21.9 2.1-11 11" />
  </Base>
)
