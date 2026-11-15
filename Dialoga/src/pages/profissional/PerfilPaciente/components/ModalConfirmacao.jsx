// ============================================================
// ModalConfirmacao
// Pop-up de confirmação do perfil do paciente, no modelo do Figma
// ("Excluir anotação" e "Solicitar acesso aos indicadores"): título, texto e os
// botões Cancelar e o de confirmar (vermelho ou roxo). 384px de largura.
// Usado em: excluir anotação (RF311), solicitar acesso (RF224, RF312) e
// remover paciente (RF315, sem frame no Figma: segue o "Excluir anotação").
// Props:
//   aberto          -> mostra ou esconde o pop-up
//   titulo          -> título do pop-up
//   children        -> texto do pop-up (pode ter <strong>)
//   rotuloConfirmar -> texto do botão de confirmar (ex.: "Excluir")
//   variante        -> 'perigo' (vermelho, padrão) | 'primario' (roxo)
//   onCancelar      -> chamado no X, no fundo escuro, no Esc ou no "Cancelar"
//   onConfirmar     -> chamado ao clicar no botão de confirmar
// ============================================================
import Button from '../../../../components/Button'
import Modal from '../../../../components/Modal'
import { AJUSTE_MODAL_CONFIRMACAO, BOTAO_CANCELAR, BOTAO_CONFIRMAR } from './estilosPerfil'

export default function ModalConfirmacao({ aberto, titulo, children, rotuloConfirmar, variante = 'perigo', onCancelar, onConfirmar }) {
  const rodape = (
    <>
      <Button type="button" variante="suave" larguraAuto className={BOTAO_CANCELAR} onClick={onCancelar}>
        Cancelar
      </Button>
      <Button type="button" variante={variante} larguraAuto className={BOTAO_CONFIRMAR} onClick={onConfirmar}>
        {rotuloConfirmar}
      </Button>
    </>
  )

  return (
    <div className={AJUSTE_MODAL_CONFIRMACAO}>
      <Modal aberto={aberto} titulo={titulo} onFechar={onCancelar} comDivisores rodape={rodape} largura="max-w-[384px]">
        {/* -my-1: no Figma o texto tem 20px de respiro em cima e embaixo */}
        <p className="-my-1 text-[14px] leading-[23px] text-secundaria [&_strong]:font-bold [&_strong]:text-texto">{children}</p>
      </Modal>
    </div>
  )
}
