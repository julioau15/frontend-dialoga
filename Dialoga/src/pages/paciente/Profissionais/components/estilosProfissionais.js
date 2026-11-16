// ============================================================
// estilosProfissionais
// Classes do Tailwind repetidas nos pop-ups e avisos da tela Profissionais, nas medidas
// do Figma. O Modal, o Button, o TextField e o Toast compartilhados não mudam:
// o contêiner só ajusta as medidas (mesmo recurso usado em Tratamentos).
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
// botão claro ("Cancelar"): contorno lilás de 2px por fora
export const BOTAO_CLARO = `${BOTAO_RODAPE} border-0! px-[18px]! shadow-[0_0_0_2px_var(--color-borda)]`
// botão principal ("Salvar", "Excluir" e "Entendi")
export const BOTAO_PRINCIPAL = `${BOTAO_RODAPE} shadow-sm`

// campos do pop-up "Novo profissional" (TextField): rótulo de 14px seminegrito, 4px até a
// caixa de 46px com cantos de 12px, texto de 14px e o texto de ajuda de 11,5px
export const AJUSTE_CAMPO = [
  '[&>div]:gap-1',
  '[&_label]:text-[14px] [&_label]:font-semibold [&_label]:leading-5',
  '[&>div>div]:h-[46px] [&>div>div]:rounded-xl [&>div>div]:px-4',
  '[&_input]:text-[14px] [&_input]:placeholder:text-secundaria',
  '[&>div>span]:text-[11.5px] [&>div>span]:leading-4',
].join(' ')

// Toast: 44px de altura, cantos de 12px, texto de 14px e ícone de 16px (traço 1.8),
// com as cores do componente (verde escuro, que passa no contraste AA)
export const AJUSTE_TOAST =
  '[&>div]:min-h-11 [&>div]:rounded-xl [&>div]:py-2.5 [&>div]:text-[14px] [&>div_svg]:h-4 [&>div_svg]:w-4 [&>div_svg]:[stroke-width:1.8]'

// selo do Figma: 20px de altura, texto de 12px e 8px nas laterais (o Selo compartilhado não muda)
export const AJUSTE_SELO = 'inline-flex shrink-0 [&>span]:h-5 [&>span]:px-2 [&>span]:py-0 [&>span]:text-[12px]'
