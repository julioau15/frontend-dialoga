// ============================================================
// ResumoAprovacoes
// Os 3 cartões do topo com a contagem de pendentes, aprovados e recusados.
// Props: pendentes, aprovados, recusados (números)
// ============================================================
const CARTOES = [
  { chave: 'pendentes', rotulo: 'Pendentes', classes: 'bg-alerta-fundo border-alerta-borda-suave text-alerta' },
  { chave: 'aprovados', rotulo: 'Aprovados', classes: 'bg-sucesso-fundo border-sucesso-borda-suave text-sucesso' },
  { chave: 'recusados', rotulo: 'Recusados', classes: 'bg-erro-fundo border-erro-borda text-erro' },
]

export default function ResumoAprovacoes({ pendentes, aprovados, recusados }) {
  const valores = { pendentes, aprovados, recusados }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {CARTOES.map(({ chave, rotulo, classes }) => (
        <div key={chave} className={`px-4 py-3 border rounded-xl ${classes}`}>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
            {rotulo}
          </p>
          <p className="mt-1 text-[28px] font-extrabold leading-none">{valores[chave]}</p>
        </div>
      ))}
    </div>
  )
}
