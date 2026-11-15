// ============================================================
// iconesPacientes
// Ícones usados só na tela Pacientes (traço, estilo Lucide, como no Figma).
// Uso: <IconeAnotacao />  (herda a cor do texto)
// ============================================================

// folha com o canto dobrado e duas linhas: ícone de anotação do cartão do paciente (RF306)
// (15px e traço 1.8, as medidas do Figma)
export function IconeAnotacao({ tamanho = 15, className = '' }) {
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
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  )
}
