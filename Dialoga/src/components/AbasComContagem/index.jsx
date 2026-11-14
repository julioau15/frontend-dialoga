// ============================================================
// components/AbasComContagem
// Abas em formato de botão com um número ao lado (ex.: "Pendentes 1").
// No mobile as abas ficam numa fileira só, com rolagem horizontal
// (a última aba aparece cortada na borda, indicando que dá para rolar).
// A partir de sm as abas quebram a linha.
// Props:
//   abas      -> [{ id, rotulo, contagem }]
//   ativa     -> id da aba selecionada
//   onMudar   -> chamado com o id ao clicar numa aba
//   painel    -> id do elemento que mostra o conteúdo da aba (acessibilidade)
//   rotulo    -> nome do grupo de abas para leitores de tela (opcional)
//   className -> classes extras do container (ex.: -mx-5 px-5 para a fileira ir até a borda da tela)
// ============================================================
export default function AbasComContagem({ abas, ativa, onMudar, painel, rotulo = 'Filtrar por status', className = '' }) {
  // ao selecionar, traz a aba para dentro da área visível (útil na rolagem do mobile)
  function selecionar(evento, id) {
    evento.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
    onMudar(id)
  }

  return (
    <div
      role="tablist"
      aria-label={rotulo}
      className={`flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible ${className}`}
    >
      {abas.map((aba) => {
        const selecionada = aba.id === ativa
        return (
          <button
            key={aba.id}
            id={`aba-${aba.id}`}
            type="button"
            role="tab"
            aria-selected={selecionada}
            aria-controls={painel}
            onClick={(e) => selecionar(e, aba.id)}
            className={`flex h-[38px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-4 text-[14px] font-semibold cursor-pointer shadow-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
              selecionada
                ? 'border-primaria bg-primaria text-branco'
                : 'border-borda bg-branco text-[var(--color-secundaria-escura,var(--color-secundaria))] hover:bg-fundo-suave-2'
            }`}
          >
            {aba.rotulo}
            <span
              className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold ${
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
