// ============================================================
// estilos (Nova tarefa)
// Classes Tailwind repetidas na tela Nova tarefa, com as medidas do Figma
// (campos de 46px com cantos de 12px, botões de 44px em negrito).
// ============================================================

// caixa dos campos de texto, área de texto e lista suspensa
export const CAIXA =
  'w-full rounded-xl border bg-branco px-4 text-[13px] text-texto outline-0 transition-[border-color,box-shadow] duration-200 placeholder:text-secundaria focus:border-primaria focus:shadow-[0_0_0_3px_var(--color-primaria-alfa-20)]'

// base dos botões grandes da página
const BOTAO =
  'flex h-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl px-5 text-[14px] font-bold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria'

// botão claro com borda lilás (Visualizar, Editar, Salvar rascunho)
export const BOTAO_CLARO = `${BOTAO} border-2 border-borda bg-fundo-suave-2 text-texto enabled:hover:bg-branco`

// botão roxo (Enviar ao paciente)
export const BOTAO_PRIMARIO = `${BOTAO} border border-primaria bg-primaria text-branco shadow-sm enabled:hover:bg-primaria-escura`

// botão vermelho (Excluir pergunta)
export const BOTAO_PERIGO = `${BOTAO} border border-erro bg-erro text-branco shadow-sm enabled:hover:brightness-95`
