// ============================================================
// estilosTratamentos
// Classes do Tailwind repetidas nos pop-ups e avisos da tela de Tratamentos,
// nas medidas do Figma. O Modal, o Button e o Toast compartilhados não mudam:
// o contêiner só ajusta as medidas (mesmo recurso usado nas telas do profissional).
// ============================================================

// cabeçalho do Modal: título de 16px em negrito, 63px de altura e o X de 18px (traço 1.8);
// no mobile (403px) o pop-up fica com 351px de largura, como no Figma
export const AJUSTE_MODAL = [
  '[&_dialog]:w-[calc(100%-52px)]',
  '[&_dialog>div>div:first-child]:py-[19px]',
  '[&_h2]:text-[16px] [&_h2]:font-bold [&_h2]:leading-6',
  '[&_h2+button]:mt-0 [&_h2+button]:mr-[3px]',
  '[&_h2+button_svg]:h-[18px] [&_h2+button_svg]:w-[18px] [&_h2+button_svg]:[stroke-width:1.8]',
].join(' ')

// botões do rodapé: 44px de altura, cantos de 12px e texto de 14px em negrito
const BOTAO_RODAPE = 'h-11! rounded-xl! px-5! text-[14px]! font-bold!'
// botão claro ("Adicionar outro" e "Cancelar"): contorno lilás de 2px por fora
export const BOTAO_CLARO = `${BOTAO_RODAPE} border-0! px-[18px]! shadow-[0_0_0_2px_var(--color-borda)]`
// botão principal ("Salvar", "Salvar alterações" e "Excluir")
export const BOTAO_PRINCIPAL = `${BOTAO_RODAPE} shadow-sm`

// Toast: 44px de altura, cantos de 12px, texto de 14px e o ícone de 16px (traço 1.8),
// com as cores do componente (verde escuro e vermelho, que passam no contraste AA)
export const AJUSTE_TOAST =
  '[&>div]:h-11 [&>div]:rounded-xl [&>div]:py-0 [&>div]:text-[14px] [&>div_svg]:h-4 [&>div_svg]:w-4 [&>div_svg]:[stroke-width:1.8]'
