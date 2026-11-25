// ============================================================
// SeletorPeriodo
// Linha "PERÍODO" com as pílulas 7d | 14d | 30d da aba Indicadores (RF228), como no Figma:
// pílula marcada roxa; as outras brancas com contorno lilás de 2px por fora.
// (O FiltroPilulas da lista de Pacientes tem outra altura e contorno de 1px.)
// Props:
//   opcoes  -> [{ id, rotulo }]
//   valor   -> id do período marcado
//   onMudar -> recebe o id do período clicado
// ============================================================
export default function SeletorPeriodo({ opcoes, valor, onMudar }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p id="rotulo-periodo" className="text-[12px] font-semibold uppercase tracking-[0.04em] text-secundaria">
        Período
      </p>
      <div role="radiogroup" aria-labelledby="rotulo-periodo" className="flex gap-1">
        {opcoes.map((opcao) => {
          const marcada = opcao.id === valor
          return (
            <button
              key={opcao.id}
              type="button"
              role="radio"
              aria-checked={marcada}
              onClick={() => onMudar(opcao.id)}
              className={`h-8 cursor-pointer rounded-xl px-[15px] text-[12px] font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
                marcada
                  ? 'bg-primaria bg-botao text-branco'
                  : 'bg-superficie text-secundaria shadow-[0_0_0_2px_var(--color-borda)] hover:bg-fundo-suave-2'
              }`}
            >
              {opcao.rotulo}
            </button>
          )
        })}
      </div>
    </div>
  )
}
