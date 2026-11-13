// ============================================================
// pages/profissional/ConfiguracoesNotificacao
// Tela de configurações de notificações do profissional, com seta Voltar,
// "Desligar todas", Agenda, Tarefas e Pacientes com contagem de ativas e
// o botão "Salvar preferências" (RF125–RF127, RF367, RF369, RF371).
// Dados fixos, sem integração.
// Ao salvar, volta para Notificações, que exibe o aviso "Preferências salvas!".
// Rota: /profissional/notificacoes/configuracoes
// ============================================================
import { useNavigate } from 'react-router-dom'
import Button from '../../../components/Button'
import Icone from '../../../components/Icone'
import PainelNotificacoes from '../../../components/PainelNotificacoes'
import { useConfiguracoesNotificacao } from '../../../hooks/useConfiguracoesNotificacao'
import { CATEGORIAS_PROFISSIONAL } from '../../../services/notificacoesExemplo'

// Exibe a tela de configurações de notificações do profissional
export default function ConfiguracoesNotificacaoProfissional() {
  const navigate = useNavigate()
  const config = useConfiguracoesNotificacao(CATEGORIAS_PROFISSIONAL, ['agenda'])

  // Salva as preferências e volta para Notificações, que exibe o aviso (RF127)
  function salvar() {
    config.salvar()
    navigate('/profissional/notificacoes', { replace: true, state: { preferenciasSalvas: true } })
  }

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave px-4 py-6 sm:px-8">
      <section className="mx-auto w-full max-w-[624px] py-2 lg:py-6">
        {/* Cabeçalho com a seta Voltar ao lado do título */}
        <header className="flex items-start gap-2 lg:-ml-12 lg:gap-4">
          <button
            type="button"
            aria-label="Voltar"
            onClick={() => navigate(-1)}
            className="mt-1.5 grid h-8 w-8 -ml-2 shrink-0 place-items-center rounded-md text-secundaria cursor-pointer hover:bg-borda focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria lg:ml-0"
          >
            <Icone nome="seta" tamanho={16} className="rotate-180" />
          </button>
          <div className="min-w-0">
            <h1 className="text-[22px] font-extrabold text-texto lg:text-[24px]">Configurações de notificações</h1>
            <p className="mt-1 text-[13px] text-secundaria">Configure seus alertas profissionais</p>
          </div>
        </header>

        <div className="mt-6">
          <PainelNotificacoes config={config} mostrarContagem />
        </div>

        {/* Salva as preferências e exibe o aviso (RF127) */}
        <div className="mt-5 flex justify-end">
          <Button type="button" larguraAuto className="h-10 px-5" onClick={salvar}>
            Salvar preferências
          </Button>
        </div>
      </section>
    </div>
  )
}
