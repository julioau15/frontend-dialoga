// ============================================================
// ModalProfissionalEncontrado
// Pop-up "Profissional encontrado" (RF320), como no Figma ("Novo profissional - Paciente-2"):
// aberto ao salvar um profissional achado pelo CPF. Avisa que ele recebeu uma notificação e
// que o vínculo só é criado depois da confirmação dele (por isso ele ainda não entra na lista).
// Sem o X e sem linhas divisórias, com o botão "Entendi" na largura toda.
// Props:
//   profissional -> { nome } (o nome aparece em negrito no quadro lilás)
//   onFechar()   -> "Entendi", fundo escuro ou Esc
// ============================================================
import Button from '../../../../components/Button'
import { IconeEmail } from '../../../../components/Icones'
import Modal from '../../../../components/Modal'
import { BOTAO_PRINCIPAL } from './estilosProfissionais'

// largura de 351px no mobile, título de 16px em negrito e sem o X (o Figma não mostra);
// Esc e o fundo escuro continuam fechando o pop-up
const AJUSTE_ENCONTRADO = [
  '[&_dialog]:w-[calc(100%-52px)]',
  '[&_h2]:text-[16px] [&_h2]:font-bold [&_h2]:leading-6',
  '[&_h2+button]:hidden',
].join(' ')

export default function ModalProfissionalEncontrado({ profissional, onFechar }) {
  return (
    <div className={AJUSTE_ENCONTRADO}>
      <Modal aberto largura="max-w-[384px]" titulo="Profissional encontrado" onFechar={onFechar}>
        <div className="mt-[30px] flex gap-3">
          <IconeEmail tamanho={20} className="mt-0.5 shrink-0 text-primaria [stroke-width:1.6]" />
          <p className="text-[14px] leading-[22.5px] text-texto">
            Seu profissional foi localizado e recebeu uma notificação informando que você deseja adicioná-lo.
          </p>
        </div>

        <p className="mt-[17px] mr-4 ml-5 rounded-xl border border-borda-forte bg-fundo-card px-3 py-[10px] text-[12px] leading-[19.5px] text-secundaria">
          Após a confirmação de <strong className="font-bold text-secundaria-escura">{profissional.nome}</strong>, seu vínculo
          será criado e você poderá compartilhar seus dados.
        </p>

        <Button type="button" className={`mt-[38px] -mb-[7px] ${BOTAO_PRINCIPAL}`} onClick={onFechar}>
          Entendi
        </Button>
      </Modal>
    </div>
  )
}
