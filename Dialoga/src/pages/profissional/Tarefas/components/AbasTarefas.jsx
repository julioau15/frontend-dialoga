// ============================================================
// AbasTarefas
// Abas "Enviadas (n)" e "Rascunhos (n)" da lista de tarefas do profissional,
// no formato de pílula que ocupa a largura toda (como no Figma, desktop e mobile).
// Props:
//   abas    -> [{ id, rotulo, contagem }]
//   ativa   -> id da aba selecionada
//   onMudar -> chamado com o id ao clicar numa aba
//   painel  -> id do elemento que mostra o conteúdo da aba (acessibilidade)
// ============================================================
export default function AbasTarefas({ abas, ativa, onMudar, painel }) {
  return (
    <div role="tablist" aria-label="Tipo de tarefa" className="flex w-full gap-1 rounded-xl bg-borda p-[3px]">
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
            onClick={() => onMudar(aba.id)}
            className={`h-[29px] flex-1 cursor-pointer rounded-[9px] text-[11px] font-bold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
              selecionada ? 'bg-branco text-primaria shadow-[0_1px_3px_var(--color-sombra)]' : 'text-secundaria hover:text-texto'
            }`}
          >
            {aba.rotulo} ({aba.contagem})
          </button>
        )
      })}
    </div>
  )
}
