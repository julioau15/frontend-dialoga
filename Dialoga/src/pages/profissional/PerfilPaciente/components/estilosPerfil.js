// ============================================================
// estilosPerfil
// Classes do Tailwind repetidas nos pop-ups e avisos do perfil do paciente
// (e no pop-up de anotação aberto pela lista de Pacientes), nas medidas do Figma.
// O Modal, o Button e o Toast compartilhados não mudam: o contêiner só ajusta
// as medidas (mesmo recurso usado no ModalNovoPaciente).
// ============================================================

// cabeçalho do Modal: título de 16px em negrito, 63px de altura e o X de 18px (traço 1.8)
const CABECALHO_MODAL = [
  '[&_dialog>div>div:first-child]:py-[19px]',
  '[&_h2]:text-[16px] [&_h2]:font-bold [&_h2]:leading-6',
  '[&_h2+button]:mt-0 [&_h2+button]:mr-[3px]',
  '[&_h2+button_svg]:h-[18px] [&_h2+button_svg]:w-[18px] [&_h2+button_svg]:[stroke-width:1.8]',
].join(' ')

// pop-up de anotação: 448px no desktop e 352px no mobile (403px)
export const AJUSTE_MODAL_ANOTACAO = `[&_dialog]:w-[calc(100%-51px)] ${CABECALHO_MODAL}`

// pop-ups de confirmação (excluir nota, solicitar acesso, remover paciente): 384px, também no mobile
export const AJUSTE_MODAL_CONFIRMACAO = `[&_dialog]:w-[calc(100%-19px)] ${CABECALHO_MODAL}`

// botões do rodapé dos pop-ups: 44px de altura, cantos de 12px e texto de 14px em negrito
const BOTAO_RODAPE = 'h-11! rounded-xl! px-5! text-[14px]! font-bold!'
// "Cancelar": contorno lilás de 2px por fora, como no Figma
export const BOTAO_CANCELAR = `${BOTAO_RODAPE} border-0! px-[18px]! shadow-[0_0_0_2px_var(--color-borda)]`
// botão principal (Salvar nota, Enviar solicitação, Excluir, Remover)
export const BOTAO_CONFIRMAR = `${BOTAO_RODAPE} shadow-sm`

// Toast: 44px de altura, cantos de 12px, texto de 14px e o ícone de 16px (traço 1.8),
// com a cor do componente (verde escuro e vermelho, que passam no contraste AA)
export const AJUSTE_TOAST =
  '[&>div]:h-11 [&>div]:rounded-xl [&>div]:py-0 [&>div]:text-[14px] [&>div_svg]:h-4 [&>div_svg]:w-4 [&>div_svg]:[stroke-width:1.8]'

// botão roxo pequeno ("Nova nota" do estado vazio e "Solicitar acesso" das abas sem acesso)
export const BOTAO_PEQUENO =
  'h-8! rounded-[10px]! px-4! text-[12px]! font-bold!'

// selo do Figma: 20px de altura, texto de 12px e 8px de espaço nas laterais (o Selo não muda)
export const AJUSTE_SELO =
  'inline-flex shrink-0 [&>span]:h-5 [&>span]:gap-1 [&>span]:px-2 [&>span]:py-0 [&>span]:text-[12px]'
