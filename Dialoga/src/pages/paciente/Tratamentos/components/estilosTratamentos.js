// ============================================================
// estilosTratamentos
// Classes do Tailwind repetidas nos pop-ups e avisos da tela de Tratamentos,
// nas medidas do Figma. O Modal, o Button e o Toast compartilhados não mudam:
// o contêiner só ajusta as medidas (mesmo recurso usado nas telas do profissional).
// ============================================================

// cabeçalho e botões dos pop-ups: medidas do Figma compartilhadas por todas as telas do paciente
export { AJUSTE_MODAL, BOTAO_CLARO, BOTAO_PRINCIPAL } from '../../../../components/Modal/estilosModal'

// Toast: 44px de altura, cantos de 12px, texto de 14px e o ícone de 16px (traço 1.8),
// com as cores do componente (verde escuro e vermelho, que passam no contraste AA)
export const AJUSTE_TOAST =
  '[&>div]:h-11 [&>div]:rounded-xl [&>div]:py-0 [&>div]:text-[14px] [&>div_svg]:h-4 [&>div_svg]:w-4 [&>div_svg]:[stroke-width:1.8]'
