// ============================================================
// estilosRelatorios
// Classes do Tailwind repetidas no cartão "Solicitações de acesso" e no pop-up, nas medidas
// do Figma. O Selo compartilhado não muda: o contêiner só ajusta.
// ============================================================

// contêiner do AvatarIniciais compartilhado (o componente não muda, só as medidas do Figma):
// 40px com as iniciais de 15px; respondida: 36px e 13px no mobile e no tablet
// (no desktop fica igual à pendente)
const AJUSTE_AVATAR = 'shrink-0 [&>div]:h-10 [&>div]:w-10 [&>div]:text-[15px]'
export const AVATAR_PENDENTE = AJUSTE_AVATAR
export const AVATAR_RESPONDIDA = `${AJUSTE_AVATAR} max-xl:[&>div]:h-9 max-xl:[&>div]:w-9 max-xl:[&>div]:text-[13px]`

// selo do Figma: 22px de altura, texto de 13px seminegrito e 8px nas laterais
const AJUSTE_SELO = 'inline-flex shrink-0 [&>span]:h-[22px] [&>span]:px-2 [&>span]:py-0 [&>span]:text-[13px]'

// "Pendente": texto laranja do Figma
export const AJUSTE_SELO_PENDENTE = `${AJUSTE_SELO} [&>span]:text-alerta-texto`

// "Aprovado" (verde, com ícone) e "Recusado" (cinza)
export const AJUSTE_SELO_DECIDIDO = `${AJUSTE_SELO} [&>span]:gap-1`

// Toast: 44px de altura, cantos de 12px, texto de 14px e ícone de 16px (como no Figma)
export const AJUSTE_TOAST =
  '[&>div]:min-h-11 [&>div]:rounded-xl [&>div]:py-2.5 [&>div]:text-[14px] [&>div_svg]:h-4 [&>div_svg]:w-4 [&>div_svg]:[stroke-width:1.8]'
