// ============================================================
// pages/profissional/BoasVindas
// Primeiro acesso do profissional, depois que o admin aprova o cadastro.
// Pergunta se ele quer vincular um paciente agora (busca na API + aviso) ou depois.
// Rota: /boas-vindas-profissional (exige login de profissional)
//
// Toda a lógica está em hooks/useBoasVindasProfissional.js; aqui só desenhamos.
// É uma tela só (SPA): a busca, o paciente escolhido, o modal "Paciente encontrado!"
// e o aviso de erro (Toast) aparecem sem trocar de página.
// ============================================================
import { useBoasVindasProfissional } from '../../../hooks/useBoasVindasProfissional'
import Toast from '../../../components/Toast'
import CardBoasVindas from './components/CardBoasVindas'
import ModalPacienteEncontrado from './components/ModalPacienteEncontrado'

export default function BoasVindas() {
  const tela = useBoasVindasProfissional()

  return (
    <main className="flex items-center justify-center min-h-svh py-8 px-4 bg-fundo-suave">
      <section className="w-full max-w-[440px] p-6 bg-branco border border-borda rounded-2xl shadow-[0_4px_12px_var(--color-sombra)]">
        <CardBoasVindas
          nome={tela.nome}
          escolha={tela.escolha}
          busca={tela.busca}
          resultados={tela.resultados}
          paciente={tela.paciente}
          erro={tela.erro}
          enviando={tela.enviando}
          travado={tela.travado}
          onEscolher={tela.escolher}
          onAlterarBusca={tela.alterarBusca}
          onSelecionarPaciente={tela.selecionarPaciente}
          onAcessar={tela.acessar}
        />
      </section>

      <ModalPacienteEncontrado
        aberto={tela.modalAberto}
        nome={tela.paciente?.nome_completo ?? ''}
        onFechar={tela.fecharModal}
        onEntendi={tela.confirmarModal}
      />

      <Toast aberto={tela.toast.aberto} tipo={tela.toast.tipo} mensagem={tela.toast.mensagem} onFechar={tela.fecharToast} />
    </main>
  )
}
