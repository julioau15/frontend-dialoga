// ============================================================
// pages/auth/PersonalizarExperiencia
// Primeiro acesso do paciente em 3 etapas:
//   1) DadosPessoais  -> como quer ser chamado e data de nascimento (opcionais)
//   2) EquipeSaude    -> tem ou não profissional; busca e vínculo (modal de aviso)
//   3) HumorDia       -> "Como você está hoje?" (sentimento, energia, sono...)
// Toda a lógica (estado, validação, API e navegação) está no hook
// usePersonalizarExperiencia; esta página só escolhe o que desenhar.
// Rota: /personalizar-experiencia
// ============================================================
import Stepper from '../../../components/Stepper'
import PontosProgresso from '../../../components/PontosProgresso'
import { usePersonalizarExperiencia, PASSOS } from '../../../hooks/usePersonalizarExperiencia'
import DadosPessoais from './components/DadosPessoais'
import EquipeSaude from './components/EquipeSaude'
import HumorDia from './components/HumorDia'
import ModalProfissionalEncontrado from './components/ModalProfissionalEncontrado'

export default function PersonalizarExperiencia() {
  const pe = usePersonalizarExperiencia()

  // Conteúdo do cartão: carregando -> erro -> etapa atual
  let conteudo
  if (pe.carregando) {
    conteudo = (
      <p role="status" className="text-center text-[13px] text-secundaria">
        Carregando seus dados...
      </p>
    )
  } else if (pe.erroCarregamento) {
    // Sem os dados do paciente não mostramos o formulário: o "Pular" enviaria
    // apelido/data vazios e apagaria o que ele já tivesse salvo.
    conteudo = (
      <div className="flex flex-col items-center gap-4">
        <p role="alert" className="text-center text-[13px] text-erro">{pe.erroCarregamento}</p>
        <button type="button" onClick={pe.tentarCarregarNovamente} className="text-[12px] text-primaria underline cursor-pointer">
          Tentar novamente
        </button>
      </div>
    )
  } else if (pe.etapa === 1) {
    conteudo = (
      <DadosPessoais
        valores={pe.dadosPessoais}
        erros={pe.errosDados}
        nomeCompleto={pe.paciente?.nome_completo ?? ''}
        onAlterarCampo={pe.alterarDadoPessoal}
        onContinuar={pe.continuarDadosPessoais}
        onPular={pe.pularDadosPessoais}
      />
    )
  } else if (pe.etapa === 2) {
    conteudo = (
      <EquipeSaude
        valores={pe.equipe}
        busca={pe.busca}
        erro={pe.erroEquipe}
        vinculando={pe.vinculando}
        podeContinuar={pe.podeContinuarEquipe}
        onEscolherTem={pe.escolherTemEquipe}
        onAlterarBusca={pe.alterarBusca}
        onSelecionarProfissional={pe.selecionarProfissional}
        onContinuar={pe.continuarEquipe}
        onPular={pe.pularEquipe}
        onVoltar={() => pe.voltarPara(1)}
      />
    )
  } else {
    conteudo = (
      <HumorDia
        valores={pe.humor}
        erros={pe.errosHumor}
        erroGeral={pe.erroGeral}
        enviando={pe.enviando}
        onAlterarCampo={pe.alterarHumor}
        onSalvar={pe.salvarHumorEConcluir}
        onAgoraNao={pe.concluirSemHumor}
        onVoltar={() => pe.voltarPara(2)}
      />
    )
  }

  return (
    <main className="flex flex-col items-center justify-center gap-6 min-h-svh py-8 px-4 bg-fundo-suave">
      <Stepper passos={PASSOS} atual={pe.etapa} />

      <section
        aria-busy={pe.carregando || pe.vinculando || pe.enviando}
        className="w-full max-w-[440px] p-6 bg-branco border border-borda rounded-2xl shadow-[0_4px_12px_var(--color-sombra)]"
      >
        {conteudo}
      </section>

      <PontosProgresso className="mt-4" total={PASSOS.length} atual={pe.etapa} />

      {/* Nome do PROFISSIONAL escolhido (não do paciente) */}
      <ModalProfissionalEncontrado
        aberto={pe.modalAberto}
        nome={pe.equipe.profissional?.nome_completo ?? ''}
        onFechar={pe.fecharModal}
        onEntendi={pe.confirmarModal}
      />
    </main>
  )
}
