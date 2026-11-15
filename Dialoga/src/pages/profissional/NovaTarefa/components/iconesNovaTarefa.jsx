// ============================================================
// iconesNovaTarefa
// Ícones usados só na tela Nova tarefa (traço, estilo Lucide).
// Uso: <IconeCopiar tamanho={14} />  (herdam a cor do texto)
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

// seta para a esquerda ("Voltar às tarefas")
export const IconeSetaVoltar = (props) => (
  <Base {...props}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </Base>
)

// setinha para baixo da lista de tipos de resposta
export const IconeChevronBaixo = (props) => (
  <Base {...props}>
    <path d="m6 9 6 6 6-6" />
  </Base>
)

// seis pontinhos (alça de arrastar)
export const IconeArrastar = (props) => (
  <Base {...props}>
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="19" r="1" />
  </Base>
)

export const IconeCopiar = (props) => (
  <Base {...props}>
    <rect width="14" height="14" x="8" y="8" rx="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </Base>
)

export const IconeClipe = (props) => (
  <Base {...props}>
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </Base>
)

export const IconeArquivo = (props) => (
  <Base {...props}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
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
