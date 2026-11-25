// ============================================================
// InformarEmail (passo 1 da recuperação de senha)
// Link "Voltar", título, campo de e-mail e botão.
// Props:
//   valor      -> texto do campo de e-mail
//   erro       -> mensagem de erro do campo (opcional)
//   erroGeral  -> erro vindo da API (opcional)
//   carregando -> true enquanto a API responde
//   onAlterar  -> (texto) => void
//   onSubmit   -> chamado ao enviar o formulário
// ============================================================
import { Link } from 'react-router-dom'
import TextField from '../../../../../components/TextField'
import Button from '../../../../../components/Button'
import iconeEmail from '../../../../../assets/auth/icon_email.png'

// Seta do link "Voltar" (herda a cor do texto)
const SetaVoltar = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

export default function InformarEmail({
  valor,
  erro,
  erroGeral,
  carregando = false,
  onAlterar,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <Link className="inline-flex items-center gap-1 text-[11px] text-secundaria no-underline hover:underline" to="/login">
        {SetaVoltar}
        Voltar
      </Link>

      <h1 className="mt-5 text-[20px] font-extrabold text-texto">Redefinir senha</h1>
      <p className="mt-1 text-[13px] text-secundaria">
        Informe seu e-mail e enviaremos um código para redefinir sua senha.
      </p>

      <div className="flex flex-col gap-4 mt-5">
        <TextField
          label="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="seu@email.com"
          icone={iconeEmail}
          value={valor}
          onChange={(e) => onAlterar(e.target.value)}
          erro={erro}
          disabled={carregando}
        />

        {/* erro vindo da API (ex.: e-mail não cadastrado) */}
        {erroGeral && (
          <p className="text-[12px] text-erro-texto" role="alert">
            {erroGeral}
          </p>
        )}

        <Button type="submit" disabled={carregando}>
          {carregando ? 'Enviando...' : 'Enviar código'}
        </Button>
      </div>
    </form>
  )
}