// ============================================================
// components/AbasComContagem
// Abas em formato de botão com um número ao lado (ex.: "Pendentes 1").
// Em telas estreitas a fileira rola na horizontal.
// Props:
//   abas    -> [{ id, rotulo, contagem }]
//   ativa   -> id da aba selecionada
//   onMudar -> chamado com o id ao clicar numa aba
//   painel  -> id do elemento que mostra o conteúdo da aba (acessibilidade)
// ============================================================
export default function AbasComContagem({ abas, ativa, onMudar, painel }) {
  return (
    <div role="tablist" className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0 sm:flex-wrap">
      {abas.map((aba) => {
        const selecionada = aba.id === ativa
        return (
          <button
            key={aba.id}
            type="button"
            role="tab"
            aria-selected={selecionada}
            aria-controls={painel}
            onClick={() => onMudar(aba.id)}
            className={`flex h-9 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-[12px] font-semibold cursor-pointer shadow-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
              selecionada
                ? 'border-primaria bg-primaria text-branco'
                : 'border-borda bg-branco text-[var(--color-secundaria-escura,var(--color-secundaria))] hover:bg-fundo-suave-2'
            }`}
          >
            {aba.rotulo}
            <span
              className={`grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-bold ${
                selecionada ? 'bg-branco-alfa-20 text-branco' : 'bg-fundo-card text-secundaria'
              }`}
            >
              {aba.contagem}
            </span>
          </button>
        )
      })}
    </div>
  )
}
