// ============================================================
// FiltroPilulas
// Filtro da lista por status: Todos | Ativos | Inativos (RF301).
// Só uma pílula marcada por vez, como no Figma:
//   marcada -> fundo roxo e texto branco, sem contorno;
//   as outras -> fundo branco, texto cinza-arroxeado e contorno lilás de 1px por fora.
// Props:
//   rotulo  -> nome do grupo para leitores de tela (ex.: "Filtrar por status")
//   opcoes  -> [{ id, rotulo }]
//   valor   -> id da opção marcada
//   onMudar -> recebe o id da opção clicada
// ============================================================
export default function FiltroPilulas({ rotulo, opcoes, valor, onMudar }) {
  return (
    <div role="radiogroup" aria-label={rotulo} className="flex shrink-0 gap-1">
      {opcoes.map((opcao) => {
        const marcada = opcao.id === valor
        return (
          <button
            key={opcao.id}
            type="button"
            role="radio"
            aria-checked={marcada}
            onClick={() => onMudar(opcao.id)}
            className={`h-[42px] cursor-pointer whitespace-nowrap rounded-xl px-[13px] text-[12px] font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
              marcada
                ? 'bg-primaria bg-botao text-branco'
                : 'bg-superficie text-secundaria shadow-[0_0_0_1px_var(--color-borda)] hover:bg-fundo-suave-2'
            }`}
          >
            {opcao.rotulo}
          </button>
        )
      })}
    </div>
  )
}
