// ============================================================
// pages/profissional/BoasVindas
// Primeiro acesso do profissional: pergunta se ele quer vincular um paciente
// agora (busca + modal de aviso) ou depois, e conclui o primeiro acesso.
// Toda a lógica (estado, busca, API e navegação) está no hook
// usePrimeiroAcessoProfissional; esta página só desenha.
// Rota: /boas-vindas-profissional (só profissional logado; o RequireAuth manda
// quem já concluiu direto para o painel)
// ============================================================
import { usePrimeiroAcessoProfissional } from '../../../hooks/usePrimeiroAcessoProfissional'
import CardBoasVindas from './components/CardBoasVindas'
import ModalPacienteEncontrado from './components/ModalPacienteEncontrado'

export default function BoasVindas() {
  const pa = usePrimeiroAcessoProfissional()

  return (
    <main className="flex items-center justify-center min-h-svh py-8 px-4 bg-fundo-suave">
      <section
        aria-busy={pa.vinculandoId !== null || pa.acessando}
        className="w-full max-w-[440px] p-6 bg-branco border border-borda rounded-2xl shadow-[0_4px_12px_var(--color-sombra)]"
      >
        <CardBoasVindas
          nome={pa.nome}
          escolha={pa.escolha}
          busca={pa.busca}
          resultadoBusca={pa.resultadoBusca}
          vinculados={pa.vinculados}
          vinculandoId={pa.vinculandoId}
          erroVinculo={pa.erroVinculo}
          acessando={pa.acessando}
          erroAcesso={pa.erroAcesso}
          onEscolher={pa.escolher}
          onAlterarBusca={pa.alterarBusca}
          onSelecionarPaciente={pa.selecionarPaciente}
          onAcessar={pa.acessar}
        />
      </section>

      {/* Nome do PACIENTE vinculado (não do profissional) */}
      <ModalPacienteEncontrado
        aberto={pa.modalAberto}
        nome={pa.nomeUltimoVinculado}
        onFechar={pa.fecharModal}
        onEntendi={pa.fecharModal}
      />
    </main>
  )
}
