// ============================================================
// FiltroChips
// Grupo de filtro com título em maiúsculas e "pílulas" de escolha única,
// como no Figma ("FILTRAR POR PERÍODO" e "STATUS DA TAREFA").
// Pílula marcada: fundo roxo e texto branco; as outras: borda lilás.
// Props:
//   id      -> id do título (liga o grupo ao título para leitores de tela)
//   rotulo  -> texto do título (ex.: "Status da tarefa")
//   opcoes  -> [{ id, rotulo }]
//   valor   -> id da opção marcada
//   onMudar -> recebe o id da opção clicada
//   children -> (opcional) conteúdo logo abaixo das pílulas (ex.: campo do período)
// ============================================================
export default function FiltroChips({ id, rotulo, opcoes, valor, onMudar, children }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p id={id} className="text-[12px] font-bold uppercase tracking-[0.03em] text-secundaria">{rotulo}</p>
      <div role="radiogroup" aria-labelledby={id} className="flex flex-wrap gap-1.5 sm:gap-[7px]">
        {opcoes.map((opcao) => {
          const marcada = opcao.id === valor
          return (
            <button
              key={opcao.id}
              type="button"
              role="radio"
              aria-checked={marcada}
              onClick={() => onMudar(opcao.id)}
              className={`h-[30px] cursor-pointer whitespace-nowrap rounded-[10px] border-2 px-3 text-[12px] font-bold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria sm:h-8 ${
                marcada ? 'border-primaria bg-primaria bg-botao text-branco' : 'border-borda text-secundaria hover:bg-superficie'
              }`}
            >
              {opcao.rotulo}
            </button>
          )
        })}
      </div>
      {children}
    </div>
  )
}
