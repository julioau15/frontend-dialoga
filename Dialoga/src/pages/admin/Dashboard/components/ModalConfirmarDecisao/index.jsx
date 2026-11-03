// ============================================================
// ModalConfirmarDecisao
// Confirmação antes de aprovar ou recusar (mesma tela, muda só texto e cor).
// Props:
//   decisao     -> { tipo: 'aprovar' | 'recusar', solicitacao } ou null (modal fechado)
//   enviando    -> true desabilita os botões enquanto a API responde
//   onCancelar  -> fecha sem decidir (X, fundo escuro, Esc ou "Cancelar")
//   onConfirmar -> confirma a decisão
// ============================================================
import Modal from '../../../../../components/Modal'
import Button from '../../../../../components/Button'
import { IconeCheck, IconeX } from '../../../../../components/Icones'

const TEXTOS = {
  aprovar: {
    titulo: 'Confirmar aprovação',
    pergunta: 'Aprovar',
    destaque: 'e-mail de boas-vindas',
    depois: ' com as instruções de acesso à plataforma.',
    botao: 'Confirmar aprovação',
    variante: 'sucesso',
    Icone: IconeCheck,
    classesIcone: 'bg-sucesso-fundo border-sucesso-borda-suave text-sucesso',
  },
  recusar: {
    titulo: 'Confirmar recusa',
    pergunta: 'Recusar',
    destaque: 'e-mail de notificação',
    depois: ' informando que a solicitação não foi aprovada.',
    botao: 'Confirmar recusa',
    variante: 'perigo',
    Icone: IconeX,
    classesIcone: 'bg-erro-fundo border-erro-borda text-erro',
  },
}

export default function ModalConfirmarDecisao({ decisao, enviando = false, onCancelar, onConfirmar }) {
  const t = TEXTOS[decisao?.tipo ?? 'aprovar']

  const rodape = (
    <>
      <Button type="button" variante="suave" larguraAuto disabled={enviando} onClick={onCancelar}>Cancelar</Button>
      <Button type="button" variante={t.variante} larguraAuto carregando={enviando} onClick={onConfirmar}>
        <t.Icone tamanho={13} />
        {t.botao}
      </Button>
    </>
  )

  return (
    <Modal aberto={!!decisao} titulo={t.titulo} onFechar={onCancelar} comDivisores rodape={rodape}>
      <div className="flex flex-col items-center text-center">
        <span className={`grid place-items-center w-[60px] h-[60px] border rounded-xl ${t.classesIcone}`}>
          <t.Icone tamanho={24} />
        </span>
        <p className="mt-4 text-[14px] font-bold text-texto">
          {t.pergunta} {decisao?.solicitacao.nome}?
        </p>
        <p className="mt-1.5 text-[12px] text-secundaria">
          O profissional receberá um <strong className="font-bold">{t.destaque}</strong>{t.depois}
        </p>
      </div>
    </Modal>
  )
}
