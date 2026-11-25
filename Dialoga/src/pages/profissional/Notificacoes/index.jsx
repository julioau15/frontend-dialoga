// ============================================================
// pages/profissional/Notificacoes
// Página de Notificações do profissional: cabeçalho com "N não lidas",
// "Marcar todas" e engrenagem (leva à tela de configurações), abas
// "Não lidas" e "Histórico" (só as lidas), cartões com chip e "Ver →"
// e o estado vazio "Tudo em dia!". Carrega as notificações na API e marca como lidas (GET/PUT /notificacoes).
// Marcação individual disponível em todas as larguras; até 20 cartões por página local.
// Rota: /profissional/notificacoes
// ============================================================
import AbasNotificacoes from '../../../components/AbasNotificacoes'
import Button from '../../../components/Button'
import CabecalhoNotificacoes from '../../../components/CabecalhoNotificacoes'
import ListaNotificacoes from '../../../components/ListaNotificacoes'
import NotificacoesVazias from '../../../components/NotificacoesVazias'
import Toast from '../../../components/Toast'
import { useNotificacoes } from '../../../hooks/useNotificacoes'

// Exibe a página de Notificações do profissional
function Notificacoes() {
  const notificacoes = useNotificacoes('profissional')

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave bg-pagina px-4 py-6 sm:px-8">
      <section className="mx-auto w-full max-w-[624px] py-2 lg:py-6">
        <CabecalhoNotificacoes
          naoLidas={notificacoes.totalNaoLidas}
          onMarcarTodas={notificacoes.marcarTodas}
          salvando={notificacoes.salvando}
          rotaConfiguracoes="/profissional/notificacoes/configuracoes"
        />

        <div className="mt-5">
          <AbasNotificacoes abas={notificacoes.abas} ativa={notificacoes.aba} onMudar={notificacoes.mudarAba}>
            {notificacoes.carregando ? (
              // Enquanto as notificações chegam da API
              <p role="status" className="py-6 text-center text-[13px] text-secundaria">
                Carregando notificações...
              </p>
            ) : notificacoes.erroCarregar ? (
              // Falha ao buscar: mostra o erro e permite tentar de novo
              <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-erro-borda bg-erro-fundo p-5">
                <p className="text-[14px] text-erro-texto">{notificacoes.erroCarregar}</p>
                <Button type="button" variante="suave" larguraAuto className="h-10" onClick={notificacoes.recarregar}>
                  Tentar novamente
                </Button>
              </div>
            ) : notificacoes.itens.length > 0 ? (
              <ListaNotificacoes
                key={notificacoes.aba}
                itens={notificacoes.itens}
                prefixoRota="/profissional"
                onMarcarLida={notificacoes.marcarComoLida}
                salvando={notificacoes.salvando}
              />
            ) : notificacoes.aba === 'nao-lidas' ? (
              <NotificacoesVazias mensagem="Nenhuma notificação pendente." />
            ) : (
              <NotificacoesVazias emoji="📭" titulo="Histórico vazio" mensagem="As notificações lidas aparecem aqui." />
            )}
          </AbasNotificacoes>
        </div>

        <Toast
          aberto={notificacoes.toast.aberto}
          tipo={notificacoes.toast.tipo}
          mensagem={notificacoes.toast.mensagem}
          onFechar={notificacoes.fecharToast}
        />
      </section>
    </div>
  )
}

export default Notificacoes
