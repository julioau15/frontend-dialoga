// ============================================================
// pages/paciente/Notificacoes
// Página de Notificações do paciente: cabeçalho com "N não lidas",
// "Marcar todas" e engrenagem, abas "Não lidas" e "Histórico" (só as lidas),
// cartões de notificação e o estado vazio "Tudo em dia!".
// A partir de 768px a engrenagem abre o modal de configurações e cada
// cartão não lido tem "Marcar como lida"; abaixo disso a engrenagem leva
// à tela de configurações e o cartão tem chip e "Ver →".
// Dados fixos, sem integração.
// Rota: /paciente/notificacoes
// ============================================================
import { useState } from 'react'
import AbasNotificacoes from '../../../components/AbasNotificacoes'
import CabecalhoNotificacoes from '../../../components/CabecalhoNotificacoes'
import CartaoNotificacao from '../../../components/CartaoNotificacao'
import NotificacoesVazias from '../../../components/NotificacoesVazias'
import Toast from '../../../components/Toast'
import { useNotificacoes } from '../../../hooks/useNotificacoes'
import { NOTIFICACOES_PACIENTE } from '../../../services/notificacoesRecebidasExemplo'
import ModalConfiguracoesNotificacao from './components/ModalConfiguracoesNotificacao'

// Exibe a página de Notificações do paciente
function Notificacoes() {
  const notificacoes = useNotificacoes(NOTIFICACOES_PACIENTE)
  // Abertura do modal de configurações (Desktop e Tablet)
  const [modalAberto, setModalAberto] = useState(false)

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave px-4 py-6 sm:px-8">
      <section className="mx-auto w-full max-w-[624px] py-2 lg:py-6">
        <CabecalhoNotificacoes
          naoLidas={notificacoes.totalNaoLidas}
          onMarcarTodas={notificacoes.marcarTodas}
          rotaConfiguracoes="/paciente/notificacoes/configuracoes"
          onAbrirModal={() => setModalAberto(true)}
        />

        <div className="mt-5">
          <AbasNotificacoes
            abas={notificacoes.abas}
            ativa={notificacoes.aba}
            onMudar={notificacoes.mudarAba}
            parentesesNoDesktop
          >
            {notificacoes.itens.length > 0 ? (
              <div className="flex flex-col gap-3">
                {notificacoes.itens.map((item) => (
                  <CartaoNotificacao
                    key={item.id}
                    notificacao={item}
                    prefixoRota="/paciente"
                    acao="ver-ou-marcar"
                    onMarcarLida={notificacoes.marcarComoLida}
                  />
                ))}
              </div>
            ) : notificacoes.aba === 'nao-lidas' ? (
              <NotificacoesVazias mensagem="Você não tem notificações pendentes." />
            ) : (
              <NotificacoesVazias emoji="📭" titulo="Histórico vazio" mensagem="As notificações lidas aparecem aqui." />
            )}
          </AbasNotificacoes>
        </div>

        {/* Modal de configurações; ao salvar, exibe o aviso nesta página */}
        <ModalConfiguracoesNotificacao
          aberto={modalAberto}
          onFechar={() => setModalAberto(false)}
          onSalvar={() => notificacoes.mostrarToast('Preferências salvas!')}
        />

        <Toast aberto={notificacoes.toast.aberto} mensagem={notificacoes.toast.mensagem} onFechar={notificacoes.fecharToast} />
      </section>
    </div>
  )
}

export default Notificacoes
