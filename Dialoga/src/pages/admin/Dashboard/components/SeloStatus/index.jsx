// ============================================================
// SeloStatus
// Pílula com o status da solicitação (Pendente / Aprovado / Recusado).
// Prop: status -> 'pendente' | 'aprovado' | 'recusado'
// ============================================================
const ESTILOS = {
  pendente: { texto: 'Pendente', classes: 'bg-alerta-fundo border-alerta-borda text-alerta-escura' },
  aprovado: { texto: 'Aprovado', classes: 'bg-sucesso-fundo border-sucesso-borda text-sucesso' },
  recusado: { texto: 'Recusado', classes: 'bg-erro-fundo border-erro-borda text-erro' },
}

export default function SeloStatus({ status }) {
  const { texto, classes } = ESTILOS[status]
  return (
    <span className={`inline-flex items-center h-[22px] px-2.5 border rounded-full text-[11px] font-semibold leading-none ${classes}`}>
      {texto}
    </span>
  )
}
