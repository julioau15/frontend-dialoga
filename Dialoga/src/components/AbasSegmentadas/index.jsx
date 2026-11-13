// ============================================================
// components/AbasSegmentadas
// Abas em formato de "pílula" (ex.: Eventos | Disponibilidade).
// No mobile ocupam a largura toda e escondem o ícone; a partir do tablet
// ficam com 384px e mostram o ícone (como no Figma).
// Props:
//   abas    -> [{ id, rotulo, icone, desabilitada }]
//   ativa   -> id da aba selecionada
//   onMudar -> chamado com o id ao clicar numa aba
// ============================================================
export default function AbasSegmentadas({ abas, ativa, onMudar }) {
  return (
    <div role="tablist" className="flex w-full gap-1 p-1 rounded-xl bg-borda md:w-[384px]">
      {abas.map((aba) => {
        const selecionada = aba.id === ativa
        return (
          <button
            key={aba.id}
            type="button"
            role="tab"
            aria-selected={selecionada}
            disabled={aba.desabilitada}
            onClick={() => onMudar(aba.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 h-8 px-4 rounded-lg text-[12px] font-bold cursor-pointer disabled:cursor-default transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
              selecionada
                ? 'bg-branco text-primaria shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1)]'
                : 'text-secundaria-escura'
            }`}
          >
            {aba.icone && <span className="hidden md:inline-flex">{aba.icone}</span>}
            {aba.rotulo}
          </button>
        )
      })}
    </div>
  )
}
