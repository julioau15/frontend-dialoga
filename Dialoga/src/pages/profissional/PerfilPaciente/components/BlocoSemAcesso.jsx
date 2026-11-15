// ============================================================
// BlocoSemAcesso
// Mostrado nas abas Indicadores e Histórico quando o profissional ainda não pode
// ver os dados do paciente (RF223–RF226, RF312, RF313). Não há frame no Figma:
// segue o estado "Sem anotações" (emoji, título, texto e botão pequeno roxo).
//   'nao_solicitado' -> "Dados não compartilhados" + botão "Solicitar acesso";
//   'pendente'       -> "Aguardando aprovação" (o pedido já foi enviado);
//   'externo'        -> "Paciente externo" (sem conta no Dialoga, não há dados do app).
// Props:
//   acesso            -> 'nao_solicitado' | 'pendente' | 'externo'
//   onSolicitarAcesso -> clique em "Solicitar acesso"
// ============================================================
import Button from '../../../../components/Button'
import Card from '../../../../components/Card'
import { BOTAO_PEQUENO } from './estilosPerfil'

const TEXTOS = {
  nao_solicitado: {
    emoji: '🔒',
    titulo: 'Dados não compartilhados',
    texto: 'Solicite acesso para ver os indicadores e o histórico deste paciente.',
  },
  pendente: {
    emoji: '⏳',
    titulo: 'Aguardando aprovação',
    texto: 'A solicitação foi enviada. Os dados aparecem aqui quando o paciente aprovar.',
  },
  externo: {
    emoji: '👤',
    titulo: 'Paciente externo',
    texto: 'Este paciente não tem conta no Dialoga, então não há dados do aplicativo.',
  },
}

export default function BlocoSemAcesso({ acesso, onSolicitarAcesso }) {
  const { emoji, titulo, texto } = TEXTOS[acesso] ?? TEXTOS.nao_solicitado

  return (
    <Card className="flex flex-col items-center px-5 pt-[34px] pb-10 text-center">
      <span aria-hidden="true" className="text-[28px] leading-none">
        {emoji}
      </span>
      <p className="mt-4 text-[14px] font-bold text-texto">{titulo}</p>
      <p className="mt-1 max-w-[360px] text-[12px] text-secundaria">{texto}</p>
      {acesso === 'nao_solicitado' && (
        <div className="mt-3">
          <Button type="button" larguraAuto className={BOTAO_PEQUENO} onClick={onSolicitarAcesso}>
            Solicitar acesso
          </Button>
        </div>
      )}
    </Card>
  )
}
