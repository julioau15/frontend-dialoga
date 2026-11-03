// ============================================================
// FiltrosAprovacoes
// Campo de busca + abas de filtro (Pendentes, Aprovados, Recusados, Todos).
// Props:
//   busca / onAlterarBusca -> texto digitado e função que o atualiza
//   filtro / onAlterarFiltro -> aba ativa ('pendente' | 'aprovado' | 'recusado' | 'todos') e função que a troca
//   contagens -> { pendente, aprovado, recusado } (números mostrados nas abas)
// ============================================================
import IconeBusca from '../../../../../components/IconeBusca'

const ABAS = [
  { valor: 'pendente', rotulo: 'Pendentes' },
  { valor: 'aprovado', rotulo: 'Aprovados' },
  { valor: 'recusado', rotulo: 'Recusados' },
  { valor: 'todos', rotulo: 'Todos' },
]

export default function FiltrosAprovacoes({ busca, onAlterarBusca, filtro, onAlterarFiltro, contagens }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2 flex-1 min-w-[220px] h-10 px-3 bg-branco border border-borda rounded-lg transition-[border-color,box-shadow] duration-200 ease-[ease] focus-within:border-primaria focus-within:shadow-[0_0_0_3px_var(--color-primaria-alfa-20)]">
        <span className="sr-only">Buscar por nome, e-mail ou especialidade</span>
        <IconeBusca />
        <input
          type="search"
          value={busca}
          onChange={(e) => onAlterarBusca(e.target.value)}
          placeholder="Buscar por nome, e-mail ou especialidade..."
          className="flex-1 min-w-0 border-0 outline-0 bg-transparent text-[12px] text-texto placeholder:text-secundaria"
        />
      </label>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por status">
        {ABAS.map(({ valor, rotulo }) => {
          const ativa = filtro === valor
          return (
            <button
              key={valor}
              type="button"
              aria-pressed={ativa}
              onClick={() => onAlterarFiltro(valor)}
              className={`h-10 px-3 rounded-lg border text-[11px] font-semibold cursor-pointer transition-[background,border-color] duration-200 ease-[ease] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
                ativa
                  ? 'bg-primaria border-primaria text-branco'
                  : 'bg-branco border-borda text-texto hover:bg-fundo-suave-2'
              }`}
            >
              {rotulo}
              {valor !== 'todos' && (
                <span className={`ml-1 font-normal ${ativa ? 'text-branco-alfa-80' : 'text-secundaria'}`}>
                  ({contagens[valor]})
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
