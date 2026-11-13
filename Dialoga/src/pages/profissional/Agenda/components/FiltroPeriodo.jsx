// ============================================================
// FiltroPeriodo
// Botões Todos | Hoje | Semana ao lado da busca (como no Figma).
// Props: periodo ('todos' | 'hoje' | 'semana'), onMudar(periodo)
// ============================================================
const OPCOES = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'hoje', rotulo: 'Hoje' },
  { id: 'semana', rotulo: 'Semana' },
]

export default function FiltroPeriodo({ periodo, onMudar }) {
  return (
    <div role="tablist" aria-label="Período das consultas" className="flex shrink-0 gap-1">
      {OPCOES.map((opcao) => {
        const ativa = opcao.id === periodo
        return (
          <button
            key={opcao.id}
            type="button"
            role="tab"
            aria-selected={ativa}
            onClick={() => onMudar(opcao.id)}
            className={`h-10 rounded-lg border px-2.5 sm:px-3 text-[12px] font-bold cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
              ativa
                ? 'border-primaria bg-primaria text-branco shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1)]'
                : 'border-borda bg-branco text-texto'
            }`}
          >
            {opcao.rotulo}
          </button>
        )
      })}
    </div>
  )
}
