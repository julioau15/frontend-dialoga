// ============================================================
// pages/auth/PersonalizarExperiencia
// Primeiro acesso do paciente em 3 etapas (só o layout, sem API ainda):
//   1) DadosPessoais  -> como quer ser chamado e data de nascimento (opcionais)
//   2) EquipeSaude    -> tem ou não profissional; busca e vínculo (modal de aviso)
//   3) HumorDia       -> "Como você está hoje?" (sentimento, energia, sono...)
// A página guarda a etapa atual e os valores; cada etapa só desenha a tela.
// Ao terminar (ou pular), marca o primeiro acesso como concluído e vai para o painel.
// Rota: /personalizar-experiencia
// ============================================================
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { concluirPrimeiroAcesso } from '../../../utils/primeiroAcesso'
import Stepper from '../../../components/Stepper'
import PontosProgresso from '../../../components/PontosProgresso'
import DadosPessoais from './components/DadosPessoais'
import EquipeSaude from './components/EquipeSaude'
import HumorDia from './components/HumorDia'
import ModalProfissionalEncontrado from './components/ModalProfissionalEncontrado'

const PASSOS = ['Pessoal', 'Profissional', 'Humor']
const NOME_COMPLETO = 'Ana Beatriz Ferreira' // TODO: vir do cadastro do paciente
const PROFISSIONAL_EXEMPLO = { nome: 'Carlos Eduardo Mendes', especialidade: 'Psicologia Clínica' } // TODO: vir da busca na API

// Cria a função (campo, valor) que atualiza um dos objetos de valores
const alterar = (setValores) => (campo, valor) => setValores((v) => ({ ...v, [campo]: valor }))

export default function PersonalizarExperiencia() {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const [etapa, setEtapa] = useState(1)
  const [modalAberto, setModalAberto] = useState(false)

  const [valores, setValores] = useState({ apelido: '', dataNascimento: '' })
  const [equipe, setEquipe] = useState({ tem: null, busca: '', selecionado: false })
  const [humor, setHumor] = useState({
    sentimentos: [], energia: '', humorDia: '', horasSono: '', relato: '', pensamento: '',
  })

  // Vai para outra etapa
  const irParaEtapa = (proxima) => (e) => {
    e.preventDefault()
    setEtapa(proxima)
  }

  // Trocar a escolha ou mudar a busca desfaz o profissional já selecionado
  const alterarEquipe = (campo, valor) =>
    setEquipe((v) => ({ ...v, [campo]: valor, ...(campo !== 'selecionado' && { selecionado: false }) }))

  const podeContinuarEquipe = equipe.tem === 'nao' || (equipe.tem === 'sim' && equipe.selecionado)

  // Termina o primeiro acesso e segue para o painel do paciente
  // TODO: salvar as respostas na API antes de sair
  function concluir() {
    concluirPrimeiroAcesso(auth.id)
    navigate('/paciente/dashboard', { replace: true })
  }

  return (
    <main className="flex flex-col items-center justify-center gap-6 min-h-svh py-8 px-4 bg-fundo-suave">
      <Stepper passos={PASSOS} atual={etapa} />

      <section className="w-full max-w-[440px] p-6 bg-branco border border-borda rounded-2xl shadow-[0_4px_12px_var(--color-sombra)]">
        {etapa === 1 && (
          <DadosPessoais
            valores={valores}
            nomeCompleto={NOME_COMPLETO}
            onAlterarCampo={alterar(setValores)}
            onContinuar={irParaEtapa(2)} // TODO: salvar na API antes de avançar
            onPular={irParaEtapa(2)}
          />
        )}

        {etapa === 2 && (
          <EquipeSaude
            valores={equipe}
            profissional={PROFISSIONAL_EXEMPLO}
            podeContinuar={podeContinuarEquipe}
            onAlterarCampo={alterarEquipe}
            onAbrirModal={() => setModalAberto(true)}
            onContinuar={irParaEtapa(3)} // TODO: salvar o vínculo na API antes de avançar
            onPular={irParaEtapa(3)}
            onVoltar={irParaEtapa(1)}
          />
        )}

        {etapa === 3 && (
          <HumorDia
            valores={humor}
            onAlterarCampo={alterar(setHumor)}
            onSalvar={(e) => {
              e.preventDefault()
              concluir() // TODO: salvar o humor na API
            }}
            onAgoraNao={concluir}
            onVoltar={irParaEtapa(2)}
          />
        )}
      </section>

      <PontosProgresso className="mt-4" total={PASSOS.length} atual={etapa} />

      <ModalProfissionalEncontrado
        aberto={modalAberto}
        nome={PROFISSIONAL_EXEMPLO.nome}
        onFechar={() => setModalAberto(false)}
        onEntendi={() => {
          setModalAberto(false)
          setEquipe((v) => ({ ...v, selecionado: true }))
        }}
      />
    </main>
  )
}
