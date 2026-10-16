import './EtiquetaStatus.css'

// Status conhecidos -> variante de cor e rótulo padrão
const STATUS = {
  agendada: { variant: 'info', label: 'Agendada' },
  confirmada: { variant: 'success', label: 'Confirmada' },
  pendente: { variant: 'warning', label: 'Pendente' },
  em_andamento: { variant: 'info', label: 'Em andamento' },
  concluida: { variant: 'success', label: 'Concluída' },
  cancelada: { variant: 'danger', label: 'Cancelada' },
  atrasada: { variant: 'danger', label: 'Atrasada' },
  ativo: { variant: 'success', label: 'Ativo' },
  inativo: { variant: 'neutral', label: 'Inativo' },
}

// variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
function EtiquetaStatus({ status, variant, children }) {
  const config = STATUS[status] ?? { variant: 'neutral', label: status }

  return (
    <span className={`etiqueta-status etiqueta-status--${variant ?? config.variant}`}>
      {children ?? config.label}
    </span>
  )
}

export default EtiquetaStatus
