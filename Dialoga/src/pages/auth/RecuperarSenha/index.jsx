// ============================================================
// pages/auth/RecuperarSenha
// Recuperação de senha em 3 etapas, ligada ao hook useRedefinirSenha:
//   1) InformarEmail  -> e-mail para receber o código
//   2) CodigoEnviado  -> código de 4 dígitos
//   3) DefinirSenha   -> nova senha (reaproveita o componente do Cadastro)
// ============================================================
import Logo from '../../../components/Logo'
import InformarEmail from './components/InformarEmail'
import CodigoEnviado from './components/CodigoEnviado'
import DefinirSenha from '../Cadastro/components/DefinirSenha'
import Button from '../../../components/Button'
import { useRedefinirSenha } from '../../../hooks/useRedefinirSenha'

export default function RecuperarSenha() {
  const {
    etapa,
    valores,
    errosCampos,
    erroGeral,
    mensagem,
    carregando = false,
    mostrarSenha,
    alterarCampo,
    alternarSenha,
    enviar,
    reenviarCodigo,
    voltar,
    irParaLogin,
  } = useRedefinirSenha()

  return (
    <main className="flex flex-col items-center justify-center gap-2 min-h-svh py-8 px-4 bg-fundo-suave bg-pagina">
      <Logo />

      {/* As etapas email e codigo têm o card mais estreito; a de senha usa a largura do Cadastro */}
      <section
        className={`w-full p-6 bg-superficie border border-borda rounded-2xl shadow-[0_4px_12px_var(--color-sombra)] ${
          etapa === 'senha' ? 'max-w-[440px]' : 'max-w-[384px]'
        }`}
      >
        {etapa === 'email' && (
          <InformarEmail
            valor={valores.email}
            erro={errosCampos.email}
            erroGeral={erroGeral}
            carregando={carregando}
            onAlterar={(v) => alterarCampo('email', v)}
            onSubmit={enviar}
          />
        )}

        {etapa === 'codigo' && (
          <CodigoEnviado
            valor={valores.codigo}
            erro={errosCampos.codigo}
            erroGeral={erroGeral}
            mensagem={mensagem}
            carregando={carregando}
            onAlterar={(v) => alterarCampo('codigo', v)}
            onSubmit={enviar}
            onReenviar={reenviarCodigo}
            onVoltar={voltar}
          />
        )}

        {etapa === 'senha' && (
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
          />
        )}

        {etapa === 'sucesso' && (
          <div className="flex flex-col items-center text-center">
            <h1 className="text-[20px] font-extrabold text-texto">Senha alterada!</h1>
            <p className="mt-2 max-w-[280px] text-[12px] text-secundaria">
              Você já pode entrar com a nova senha.
            </p>
            <div className="w-full mt-6">
              <Button type="button" onClick={irParaLogin}>
                Ir para o login
              </Button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}