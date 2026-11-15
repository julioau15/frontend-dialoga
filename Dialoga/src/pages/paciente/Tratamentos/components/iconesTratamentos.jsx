// ============================================================
// iconesTratamentos
// Ícones usados só na tela de Tratamentos (traço, estilo Lucide, como no Figma).
// Herdam a cor do texto. Uso: <IconeEditar tamanho={15} />
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

// "+" do botão "Novo tratamento"
export const IconeMais = (props) => (
  <Base {...props}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </Base>
)

// lápis sobre o quadrado: editar tratamento
export const IconeEditar = (props) => (
  <Base {...props}>
    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.4 2.6a2.1 2.1 0 1 1 3 3L12 15l-4 1 1-4Z" />
  </Base>
)

// lixeira com duas linhas: excluir tratamento
export const IconeLixeira = (props) => (
  <Base {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 11v6M14 11v6" />
  </Base>
)

// relógio: chips de horário e título "Horário" do pop-up
export const IconeRelogio = (props) => (
  <Base {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
)

// sino: "Lembrete ativo" e "Ativar lembretes e notificações"
export const IconeSino = (props) => (
  <Base {...props}>
    <path d="M10.3 21a2 2 0 0 0 3.4 0" />
    <path d="M3.3 15.3A1 1 0 0 0 4 17h16a1 1 0 0 0 .7-1.7C19.4 14 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.4 6-2.7 7.3" />
  </Base>
)

// setinha do campo "Frequência"
export const IconeChevronBaixo = (props) => (
  <Base {...props}>
    <path d="m6 9 6 6 6-6" />
  </Base>
)
