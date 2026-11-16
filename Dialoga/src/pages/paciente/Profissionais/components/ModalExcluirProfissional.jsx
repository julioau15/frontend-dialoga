// ============================================================
// ModalExcluirProfissional
// Pop-up de confirmação "Excluir profissional" (RF327), como no Figma
// ("Excluir profissional - Paciente"): avisa que o profissional sai do acompanhamento
// ativo e vai para o histórico com status inativo. Botões Cancelar e Excluir (vermelho).
// Props:
//   profissional  -> profissional que será excluído (o nome aparece em negrito no texto)
//   onFechar()    -> X, fundo escuro, Esc ou Cancelar
//   onConfirmar() -> Excluir
//   excluindo     -> true enquanto a API responde (o botão fica desabilitado, evita clique duplo)
// ============================================================
import Button from '../../../../components/Button'
import Modal from '../../../../components/Modal'
import { AJUSTE_MODAL, BOTAO_CLARO, BOTAO_PRINCIPAL } from './estilosProfissionais'

export default function ModalExcluirProfissional({ profissional, onFechar, onConfirmar, excluindo = false }) {
  const rodape = (
    <>
      <Button type="button" variante="suave" larguraAuto className={BOTAO_CLARO} onClick={onFechar}>
        Cancelar
      </Button>
      <Button type="button" variante="perigo" larguraAuto carregando={excluindo} className={BOTAO_PRINCIPAL} onClick={onConfirmar}>
        {excluindo ? 'Excluindo...' : 'Excluir'}
      </Button>
    </>
  )

  return (
    <div className={AJUSTE_MODAL}>
      <Modal aberto comDivisores largura="max-w-[384px]" titulo="Excluir profissional" onFechar={onFechar} rodape={rodape}>
        {/* -my-1: no Figma o texto tem 20px de respiro em cima e embaixo */}
        <p className="-my-1 text-[14px] leading-[23px] text-secundaria">
          Tem certeza que deseja remover <strong className="font-bold text-texto">{profissional.nome}</strong> do
          acompanhamento ativo? O profissional será movido para o histórico com status inativo.
        </p>
      </Modal>
    </div>
  )
}
