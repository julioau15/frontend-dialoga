// ============================================================
// pages/auth/PerfilEmAnalise
// Página que exibe o card "Seu perfil foi enviado para análise".
// O usuário chega aqui em 2 situações:
//   1) logo depois de cadastrar um profissional (hooks/useCadastroForm.js)
//   2) ao tentar entrar com um cadastro profissional ainda não aprovado (hooks/useLoginForm.js)
// ============================================================
import { useNavigate } from 'react-router-dom'
import PerfilEmAnaliseCard from '../Cadastro/components/PerfilEmAnalise'

export default function PerfilEmAnalise() {
  const navigate = useNavigate()

  return (
    <main className="flex items-center justify-center min-h-svh py-8 px-4 bg-fundo-suave">
      <div className="w-full max-w-[440px] h-fit">
        <PerfilEmAnaliseCard onCiente={() => navigate('/login')} />
      </div>
    </main>
  )
}
