import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../../hooks/useAuth'
import { ROTA_INICIAL_POR_PERFIL } from '../../../routes/paths'
import './Login.css'

// Contas de teste (senha 123456) — remover quando houver back-end
const CONTAS_MOCK = [
  { perfil: 'Paciente', email: 'mariana@dialoga.com' },
  { perfil: 'Profissional', email: 'ana@dialoga.com' },
  { perfil: 'Admin', email: 'admin@dialoga.com' },
]

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErro('')
    setEnviando(true)

    try {
      const usuario = await login(email, senha)
      // volta para a página pedida antes do login; se for de outro perfil, RotaProtegida redireciona
      const destino = location.state?.from ?? ROTA_INICIAL_POR_PERFIL[usuario.perfil]
      navigate(destino, { replace: true })
    } catch (e) {
      setErro(e.message)
      setEnviando(false)
    }
  }

  return (
    <main className="login">
      <form className="login__card" onSubmit={handleSubmit}>
        <h1 className="login__title">Entrar no Dialoga</h1>

        <label className="login__field">
          <span>E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="login__field">
          <span>Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {erro && (
          <p className="login__erro" role="alert">
            {erro}
          </p>
        )}

        <button type="submit" className="login__submit" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="login__links">
          <Link to="/cadastro">Criar conta</Link>
          <Link to="/primeiro-acesso">Primeiro acesso</Link>
        </p>

        <div className="login__mock">
          <strong>Contas de teste</strong> (senha <code>123456</code>)
          <ul>
            {CONTAS_MOCK.map((conta) => (
              <li key={conta.email}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(conta.email)
                    setSenha('123456')
                  }}
                >
                  {conta.perfil}: {conta.email}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </main>
  )
}

export default Login
