// ============================================================
// pages/paciente/ConfiguracoesNotificacao
// Tela de configurações de notificações do paciente (versão Mobile do
// modal), com seta Voltar, "Desligar todas", Tarefas, Tratamentos e Agenda
// com contagem de ativas e o botão "Salvar preferências"
// (RF132–RF134, RF362, RF364, RF366). Dados fixos, sem integração.
// Ao salvar, volta para Notificações, que exibe o aviso "Preferências salvas!".
// Rota: /paciente/notificacoes/configuracoes
// ============================================================
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/Button'
import Icone from '../../../components/Icone'
import PainelNotificacoes from '../../../components/PainelNotificacoes'
import { useConfiguracoesNotificacao } from '../../../hooks/useConfiguracoesNotificacao'
import { CATEGORIAS_PACIENTE } from '../../../services/notificacoesExemplo'

// Exibe a tela de configurações de notificações do paciente
export default function ConfiguracoesNotificacaoPaciente() {
  const navigate = useNavigate()
  const config = useConfiguracoesNotificacao(CATEGORIAS_PACIENTE, ['tarefas'])

  // Salva as preferências e volta para Notificações, que exibe o aviso (RF134)
  function salvar() {
    config.salvar()
    navigate('/paciente/notificacoes', { replace: true, state: { preferenciasSalvas: true } })
  }

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave px-4 py-6 sm:px-8">
      <section className="mx-auto w-full max-w-[624px] py-2 lg:py-6">
        {/* Cabeçalho com a seta Voltar acima do título */}
        <header>
          <button
            type="button"
            aria-label="Voltar"
            onClick={() => navigate(-1)}
            className="grid h-8 w-8 -ml-2 place-items-center rounded-md text-secundaria cursor-pointer hover:bg-borda focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
          >
            <Icone nome="seta" tamanho={16} className="rotate-180" />
          </button>
          <h1 className="mt-2 text-[22px] font-extrabold text-texto lg:text-[24px]">Configurações de notificações</h1>
          <p className="mt-1 text-[13px] text-secundaria">Escolha quais alertas receber</p>
        </header>

        <div className="mt-6">
          <PainelNotificacoes config={config} mostrarContagem />
        </div>

        {/* Salva as preferências e exibe o aviso (RF134) */}
        <div className="mt-5 flex justify-end">
          <Button type="button" larguraAuto className="h-10 px-5" onClick={salvar}>
            Salvar preferências
          </Button>
        </div>
      </section>
    </div>
  )
}
