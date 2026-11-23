// ============================================================
// components/Modal/estilosModal.js
// Medidas do Figma para os pop-ups do paciente, iguais em todas as telas
// (Agenda, Tarefas, Tratamentos e Profissionais). O Modal e o Button compartilhados
// não mudam: o contêiner ajusta as medidas com estas classes.
// Uso: <div className={AJUSTE_MODAL}><Modal ... rodape={<Button className={BOTAO_CLARO} />...} /></div>
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

// botão claro ("Cancelar", "Adicionar outra"): contorno lilás de 2px por fora
export const BOTAO_CLARO = `${BOTAO_RODAPE} border-0! px-[18px]! shadow-[0_0_0_2px_var(--color-borda)]`

// botão principal ("Salvar", "Excluir", "Confirmar envio")
export const BOTAO_PRINCIPAL = `${BOTAO_RODAPE} shadow-sm`

// larguras do Figma: confirmação (384px) e formulário (448px)
export const LARGURA_CONFIRMACAO = 'max-w-[384px]'
export const LARGURA_FORMULARIO = 'max-w-[448px]'

// texto das confirmações: 14px, cinza, com 20px de respiro em cima e embaixo
export const TEXTO_CONFIRMACAO = '-my-1 text-[14px] leading-5 text-secundaria'
