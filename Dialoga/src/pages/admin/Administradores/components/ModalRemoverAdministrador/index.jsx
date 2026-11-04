// ============================================================
// ModalRemoverAdministrador
// Confirmação antes de remover um administrador: ícone de lixeira,
// pergunta com o nome, aviso de que não dá para desfazer e os botões
// Cancelar e Remover (vermelho).
// Segui o mesmo modelo do ModalConfirmarDecisao (Dashboard do admin).
// Props:
//   administrador -> administrador escolhido ou null (null = pop-up fechado)
//   onCancelar    -> chamado no X, no fundo escuro, no Esc ou no "Cancelar"
//   onConfirmar   -> chamado ao clicar em "Remover"
//   enviando      -> true enquanto o administrador é removido (trava os botões)
//   erro          -> mensagem de falha ao remover ('' quando não há erro)
// ============================================================
import Modal from '../../../../../components/Modal'
import Button from '../../../../../components/Button'
import { IconeLixeira } from '../../../../../components/Icones'

export default function ModalRemoverAdministrador({ administrador, enviando = false, erro = '', onCancelar, onConfirmar }) {
    const rodape = (
      <>
        {/* RF14: Cancelar não remove nada */}
        <Button type="button" variante="suave" larguraAuto disabled={enviando} onClick={onCancelar}>
          Cancelar
        </Button>
        {/* RF15: confirma a remoção */}
        <Button type="button" variante="perigo" larguraAuto carregando={enviando} onClick={onConfirmar}>
          <IconeLixeira tamanho={13} />
          {enviando ? 'Removendo...' : 'Remover'}
        </Button>
      </>
    )

  return (
    // O pop-up fica aberto enquanto existir um administrador escolhido
    <Modal
      aberto={administrador !== null}
      titulo="Remover administrador"
      onFechar={onCancelar}
      comDivisores
      rodape={rodape}
      largura="max-w-[384px]"
    >
      <div className="flex flex-col items-center text-center">
        <span className="grid place-items-center w-14 h-14 border rounded-xl bg-erro-fundo border-erro-borda text-erro">
          <IconeLixeira tamanho={24} />
        </span>
        <p className="mt-4 text-[14px] font-bold text-texto">Remover {administrador?.nome}?</p>
        <p className="mt-1.5 text-[12px] text-secundaria">
          Esta conta perderá acesso à área administrativa. A ação não pode ser desfeita.
        </p>
      </div>
    </Modal>
  )
}