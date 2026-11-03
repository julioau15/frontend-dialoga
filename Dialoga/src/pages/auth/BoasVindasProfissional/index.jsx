// ============================================================
// pages/auth/BoasVindasProfissional
// Boas-vindas do profissional depois do primeiro acesso (só o layout):
// pergunta se ele quer vincular um paciente agora ou depois.
// Rota: /boas-vindas-profissional
// ============================================================
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BoasVindas from './components/BoasVindas'
import { useAuth } from '../../../contexts/AuthContext'

export default function BoasVindasProfissional() {
  const navigate = useNavigate()
  const { perfil } = useAuth()
  const primeiroNome = perfil?.nome_completo?.trim().split(/\s+/)[0] ?? ''
  const [escolha, setEscolha] = useState(null) // 'vincular' | 'depois'

  return (
    <main className="flex items-center justify-center min-h-svh py-8 px-4 bg-fundo-suave">
      <section className="w-full max-w-[440px] p-6 bg-branco border border-borda rounded-2xl shadow-[0_4px_12px_var(--color-sombra)]">
        <BoasVindas
          nome={primeiroNome || ""}
          escolha={escolha}
          onEscolher={setEscolha}
          onAcessar={() => navigate('/profissional/dashboard')} // TODO: se escolha === 'vincular', ir para a busca de paciente
        />
      </section>
    </main>
  )
}
