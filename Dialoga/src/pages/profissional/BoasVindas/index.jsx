// ============================================================
// pages/profissional/BoasVindas
// Primeiro acesso do profissional (só o layout, sem API ainda):
// pergunta se ele quer vincular um paciente agora (busca + modal de aviso) ou depois.
// Rota: /boas-vindas-profissional
// ============================================================
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CardBoasVindas from './components/CardBoasVindas'
import ModalPacienteEncontrado from './components/ModalPacienteEncontrado'

const NOME_PROFISSIONAL = 'Carlos' // TODO: vir do cadastro do profissional
const PACIENTE_EXEMPLO = { nome: 'Ana Beatriz Ferreira', email: 'ana.ferreira@email.com' } // TODO: vir da busca na API

export default function BoasVindas() {
  const navigate = useNavigate()
  const [escolha, setEscolha] = useState(null) // 'vincular' | 'depois'
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)

  // Trocar a escolha ou mudar a busca desfaz o paciente já selecionado
  const escolher = (opcao) => {
    setEscolha(opcao)
    setSelecionado(false)
  }
  const alterarBusca = (texto) => {
    setBusca(texto)
    setSelecionado(false)
  }

  return (
    <main className="flex items-center justify-center min-h-svh py-8 px-4 bg-fundo-suave">
      <section className="w-full max-w-[440px] p-6 bg-branco border border-borda rounded-2xl shadow-[0_4px_12px_var(--color-sombra)]">
        <CardBoasVindas
          nome={NOME_PROFISSIONAL}
          escolha={escolha}
          busca={busca}
          paciente={PACIENTE_EXEMPLO}
          selecionado={selecionado}
          onEscolher={escolher}
          onAlterarBusca={alterarBusca}
          onAbrirModal={() => setModalAberto(true)}
          onAcessar={() => navigate('/profissional/dashboard')} // TODO: salvar o vínculo na API antes de entrar
        />
      </section>

      <ModalPacienteEncontrado
        aberto={modalAberto}
        nome={PACIENTE_EXEMPLO.nome}
        onFechar={() => setModalAberto(false)}
        onEntendi={() => {
          setModalAberto(false)
          setSelecionado(true)
        }}
      />
    </main>
  )
}
