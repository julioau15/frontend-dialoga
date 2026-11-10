// ============================================================
// pages/auth/PrimeiroAcesso
// Primeiro acesso do administrador: troca da senha provisória recebida por e-mail.
// Reaproveita o DefinirSenha do Cadastro, com o campo "Senha atual".
// Rota: /primeiro-acesso (protegida: administrador logado com senha_provisoria = 1).
// A lógica fica no hook usePrimeiroAcessoAdmin.
// ============================================================
import Logo from '../../../components/Logo'
import DefinirSenha from '../Cadastro/components/DefinirSenha'
import { usePrimeiroAcessoAdmin } from '../../../hooks/usePrimeiroAcessoAdmin'

function PrimeiroAcesso() {
  const {
    valores,
    errosCampos,
    erroGeral,
    carregando,
    mostrarSenha,
    alterarCampo,
    alternarSenha,
    enviar,
  } = usePrimeiroAcessoAdmin()

  return (
    <main className="flex flex-col items-center justify-center gap-2 min-h-svh py-8 px-4 bg-fundo-suave">
      <Logo />

      {/* Mesmo card da etapa de senha da Recuperação de senha */}
      <section className="w-full max-w-[440px] p-6 bg-branco border border-borda rounded-2xl shadow-[0_4px_12px_var(--color-sombra)]">
        <DefinirSenha
          valores={valores}
          errosCampos={errosCampos}
          erroGeral={erroGeral}
          carregando={carregando}
          mostrarSenha={mostrarSenha}
          onAlterarCampo={alterarCampo}
          onAlternarSenha={alternarSenha}
          onSubmit={enviar}
          textoBotao="Salvar"
          textoCarregando="Salvando..."
          comSenhaAtual
        />
      </section>
    </main>
  )
}

export default PrimeiroAcesso