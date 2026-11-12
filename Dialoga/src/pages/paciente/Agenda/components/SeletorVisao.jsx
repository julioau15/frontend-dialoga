// ============================================================
// SeletorVisao
// Botões pequenos Mês | Semana | Dia no topo do calendário.
// Props: visao ('mes' | 'semana' | 'dia'), onMudar(visao)
// ============================================================
const OPCOES = [
  { id: 'mes', rotulo: 'Mês' },
  { id: 'semana', rotulo: 'Semana' },
  { id: 'dia', rotulo: 'Dia' },
]

export default function SeletorVisao({ visao, onMudar }) {
  return (
    <div role="tablist" aria-label="Visão do calendário" className="inline-flex gap-0.5 rounded-lg bg-borda p-0.5">
      {OPCOES.map((opcao) => {
        const ativa = opcao.id === visao
        return (
          <button
            key={opcao.id}
            type="button"
            role="tab"
            aria-selected={ativa}
            onClick={() => onMudar(opcao.id)}
            className={`h-6 rounded-md px-2.5 text-[10px] font-semibold cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primaria ${
              ativa ? 'bg-branco text-primaria shadow-sm' : 'text-secundaria-escura'
            }`}
          >
            {opcao.rotulo}
          </button>
        )
      })}
    </div>
  )
}
