// ============================================================
// pages/paciente/Notificacoes/components/ModalConfiguracoesNotificacao
// Modal de configurações de notificações do paciente (Desktop e Tablet),
// com "Desligar todas", Tarefas, Tratamentos e Agenda
// (RF132–RF134, RF362, RF364, RF366). Carrega as preferências na API ao abrir e salva com PUT /preferencias-notificacao.
// Props:
//   aberto   -> true mostra o modal
//   onFechar -> chamado ao fechar o modal (X, Fechar, fundo escuro, Esc ou depois de salvar)
//   onSalvar -> chamado depois de salvar; a página exibe o aviso "Preferências salvas!"
// ============================================================
import Button from '../../../../../components/Button'
import Modal from '../../../../../components/Modal'
import PainelNotificacoes from '../../../../../components/PainelNotificacoes'
import { useConfiguracoesNotificacao } from '../../../../../hooks/useConfiguracoesNotificacao'
import { CATEGORIAS_PACIENTE } from '../../../../../services/notificacoesExemplo'

// Exibe o modal de configurações de notificações do paciente
export default function ModalConfiguracoesNotificacao({ aberto, onFechar, onSalvar }) {
  const config = useConfiguracoesNotificacao(CATEGORIAS_PACIENTE, ['tarefas'], { ativo: aberto })

  // Fecha o modal sem salvar, descartando as alterações
  function fechar() {
    config.descartar()
    onFechar()
  }

  // Salva as preferências na API; se der certo, fecha o modal e avisa a página (RF134).
  // Se der erro, o modal continua aberto mostrando a mensagem.
  async function salvar() {
    const salvou = await config.salvar()
    if (!salvou) return
    onFechar()
    onSalvar?.()
  }

  return (
    <Modal
      aberto={aberto}
      titulo="Configurações de notificações"
      onFechar={fechar}
      largura="max-w-[448px]"
      comDivisores
      rodape={
        <>
          <Button type="button" variante="suave" larguraAuto className="h-11 px-4" onClick={fechar}>
            Fechar
          </Button>
          <Button
            type="button"
            larguraAuto
            className="h-11 px-5"
            onClick={salvar}
            carregando={config.salvando}
            disabled={config.carregando || !!config.erroCarregar}
          >
            {config.salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </>
      }
    >
      <PainelNotificacoes config={config} descricaoDesligar="Suspende todos os alertas" compacto />
    </Modal>
  )
}
