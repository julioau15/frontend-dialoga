// ============================================================
// pages/profissional/Notificacoes
// Página de Notificações do profissional: cabeçalho com "N não lidas",
// "Marcar todas" e engrenagem (leva à tela de configurações), abas
// "Não lidas" e "Histórico" (só as lidas), cartões com chip e "Ver →"
// e o estado vazio "Tudo em dia!". Dados fixos, sem integração.
// Rota: /profissional/notificacoes
// ============================================================
import AbasNotificacoes from '../../../components/AbasNotificacoes'
import CabecalhoNotificacoes from '../../../components/CabecalhoNotificacoes'
import CartaoNotificacao from '../../../components/CartaoNotificacao'
import NotificacoesVazias from '../../../components/NotificacoesVazias'
import Toast from '../../../components/Toast'
import { useNotificacoes } from '../../../hooks/useNotificacoes'
import { NOTIFICACOES_PROFISSIONAL } from '../../../services/notificacoesRecebidasExemplo'

// Exibe a página de Notificações do profissional
function Notificacoes() {
  const notificacoes = useNotificacoes(NOTIFICACOES_PROFISSIONAL)

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave px-4 py-6 sm:px-8">
      <section className="mx-auto w-full max-w-[624px] py-2 lg:py-6">
        <CabecalhoNotificacoes
          naoLidas={notificacoes.totalNaoLidas}
          onMarcarTodas={notificacoes.marcarTodas}
          rotaConfiguracoes="/profissional/notificacoes/configuracoes"
        />

        <div className="mt-5">
          <AbasNotificacoes abas={notificacoes.abas} ativa={notificacoes.aba} onMudar={notificacoes.mudarAba}>
            {notificacoes.itens.length > 0 ? (
              <div className="flex flex-col gap-3">
                {notificacoes.itens.map((item) => (
                  <CartaoNotificacao key={item.id} notificacao={item} prefixoRota="/profissional" acao="ver" />
                ))}
              </div>
            ) : notificacoes.aba === 'nao-lidas' ? (
              <NotificacoesVazias mensagem="Nenhuma notificação pendente." />
            ) : (
              <NotificacoesVazias emoji="📭" titulo="Histórico vazio" mensagem="As notificações lidas aparecem aqui." />
            )}
          </AbasNotificacoes>
        </div>

        <Toast aberto={notificacoes.toast.aberto} mensagem={notificacoes.toast.mensagem} onFechar={notificacoes.fecharToast} />
      </section>
    </div>
  )
}

export default Notificacoes
