// ============================================================
// components/NotificacoesVazias
// Estado vazio da página de Notificações ("Tudo em dia!").
// Props:
//   mensagem -> texto de apoio abaixo do título (muda por perfil)
//   titulo   -> título (padrão "Tudo em dia!")
//   emoji    -> emoji acima do título (padrão 🎉)
// ============================================================
import Card from '../Card'

// Exibe o aviso de que não há notificações para mostrar
export default function NotificacoesVazias({ mensagem, titulo = 'Tudo em dia!', emoji = '🎉' }) {
  return (
    <Card as="div" className="px-6 py-10 text-center">
      <p aria-hidden="true" className="text-[32px] leading-none">{emoji}</p>
      <p className="mt-3 text-[14px] font-bold text-texto">{titulo}</p>
      <p className="mt-1 text-[12px] text-secundaria">{mensagem}</p>
    </Card>
  )
}
