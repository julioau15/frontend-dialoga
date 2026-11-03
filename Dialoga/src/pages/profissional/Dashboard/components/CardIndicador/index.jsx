// ============================================================
// Dashboard/components/CardIndicador
// Card com um número grande e um rótulo (os 4 cards do topo).
// Props:
//   icone  -> componente de ícone (de components/Icones)
//   tom    -> cor do ícone: 'primaria' | 'info' | 'sucesso' | 'alerta'
//   valor  -> número a mostrar
//   rotulo -> texto pequeno abaixo do número
// ============================================================
const TONS = {
  primaria: 'bg-fundo-card text-primaria',
  info: 'bg-info-fundo text-info',
  sucesso: 'bg-sucesso-fundo text-sucesso',
  alerta: 'bg-alerta-fundo text-alerta',
}

export default function CardIndicador({ icone: Icone, tom = 'primaria', valor, rotulo }) {
  return (
    <div className="rounded-xl border border-borda bg-branco p-4 shadow-sm">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${TONS[tom]}`}>
        <Icone className="h-[18px] w-[18px]" />
      </div>
      <p className="mt-3 text-2xl font-bold text-texto">{valor}</p>
      <p className="text-xs text-secundaria">{rotulo}</p>
    </div>
  )
}
