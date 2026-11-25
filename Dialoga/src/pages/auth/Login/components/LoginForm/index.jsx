// ============================================================
// LoginForm (painel direito do login)
// Só a parte visual: logo, campos, botões e links.
// A lógica (validação, chamada da API) está em hooks/useLoginForm.js
// ============================================================
import { Link } from 'react-router-dom'
import Logo from '../../../../../components/Logo'
import TextField from '../../../../../components/TextField'
import Button from '../../../../../components/Button'
import Divider from '../../../../../components/Divider'
import GoogleButton from '../../../../../components/GoogleButton'
import { useLoginForm } from '../../../../../hooks/useLoginForm'
import iconeEmail from '../../../../../assets/auth/icon_email.png'
import iconeCadeado from '../../../../../assets/auth/icon_cadeado.png'
import iconeOlho from '../../../../../assets/auth/icon_olho.png'

export default function LoginForm() {
  const {
    valores, errosCampos, erroGeral, carregando, mostrarSenha,
    alterarCampo, alternarSenha, enviar, entrarComGoogle, erroGoogle,
  } = useLoginForm()

  return (
    <section className="flex flex-col items-center justify-between py-8 px-6 bg-fundo-login bg-pagina">
      <div className="flex-1 flex flex-col justify-center gap-[18px] w-full max-w-[360px]">
        <Logo className="mx-auto" />

        {/* Títulos */}
        <header className="text-center">
          <h2 className="text-[24px] font-extrabold text-texto">Bem-vindo de volta</h2>
          <p className="mt-1 text-[14px] text-secundaria">Entre na sua conta para continuar</p>
        </header>

        {/* Formulário (noValidate: a validação é feita por nós, não pelo navegador) */}
        <form className="flex flex-col gap-3.5" onSubmit={enviar} noValidate>
          <TextField
            label="E-mail"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="seu@email.com"
            icone={iconeEmail}
            value={valores.email}
            onChange={(e) => alterarCampo('email', e.target.value)}
            erro={errosCampos.email}
          />

          <TextField
            label="Senha"
            type={mostrarSenha ? 'text' : 'password'} /* alterna entre ocultar e mostrar */
            name="senha"
            autoComplete="current-password"
            placeholder="••••••••"
            icone={iconeCadeado}
            value={valores.senha}
            onChange={(e) => alterarCampo('senha', e.target.value)}
            erro={errosCampos.senha}
            acao={
              <button
                type="button"
                className="flex p-0 border-0 bg-transparent cursor-pointer"
                onClick={alternarSenha}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {/* Olho mais "apagado" quando a senha está oculta */}
                <img className="w-4 h-4" src={iconeOlho} alt="" style={{ opacity: mostrarSenha ? 1 : 0.6 }} />
              </button>
            }
          />

          <Link className="text-[11px] text-primaria-texto no-underline hover:underline self-start" to="/recuperar-senha">
            Esqueceu sua senha?
          </Link>

          {/* Erro vindo da API (ex.: senha incorreta, servidor fora do ar) */}
          {erroGeral && <p className="px-3 py-2.5 border border-erro-borda rounded-lg bg-erro-fundo text-[12px] text-erro-texto" role="alert">{erroGeral}</p>}

          <Button type="submit" carregando={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <Divider texto="ou continue com" />
        <GoogleButton onCredential={entrarComGoogle} onErro={erroGoogle} disabled={carregando} />

        <p className="text-center text-[11px] text-secundaria">
          Não tem conta? <Link className="text-[11px] text-primaria-texto no-underline hover:underline font-bold" to="/cadastro">Cadastre-se</Link>
        </p>
      </div>

      {/* Rodapé fixo na parte de baixo do painel */}
      <footer className="flex gap-2.5 text-[10px] text-secundaria">
        <Link className="no-underline hover:underline" to="/termos-de-uso">Termos de Uso</Link>
        <span aria-hidden="true">|</span>
        <Link className="no-underline hover:underline" to="/politica-de-privacidade">Política de Privacidade</Link>
      </footer>
    </section>
  )
}
