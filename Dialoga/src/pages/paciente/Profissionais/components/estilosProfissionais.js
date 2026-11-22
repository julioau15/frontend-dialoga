// ============================================================
// estilosProfissionais
// Classes do Tailwind repetidas nos pop-ups e avisos da tela Profissionais, nas medidas
// do Figma. O Modal, o Button, o TextField e o Toast compartilhados não mudam:
// o contêiner só ajusta as medidas (mesmo recurso usado em Tratamentos).
// ============================================================

// cabeçalho e botões dos pop-ups: medidas do Figma compartilhadas por todas as telas do paciente
export { AJUSTE_MODAL, BOTAO_CLARO, BOTAO_PRINCIPAL } from '../../../../components/Modal/estilosModal'

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
