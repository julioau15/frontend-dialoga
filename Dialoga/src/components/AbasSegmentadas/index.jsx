// ============================================================
// components/AbasSegmentadas
// Abas em formato de "pílula" (ex.: Eventos | Disponibilidade).
// Props:
//   abas    -> [{ id, rotulo, icone, desabilitada }]
//   ativa   -> id da aba selecionada
//   onMudar -> chamado com o id ao clicar numa aba
// ============================================================
export default function AbasSegmentadas({ abas, ativa, onMudar }) {
  return (
    <div role="tablist" className="inline-flex gap-1 p-1 rounded-xl bg-borda">
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
            className={`flex items-center justify-center gap-1.5 h-8 min-w-[112px] px-4 rounded-lg text-[11px] font-semibold cursor-pointer disabled:cursor-default transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
              selecionada ? 'bg-branco text-texto shadow-sm' : 'text-secundaria'
            }`}
          >
            {aba.icone}
            {aba.rotulo}
          </button>
        )
      })}
    </div>
  )
}
