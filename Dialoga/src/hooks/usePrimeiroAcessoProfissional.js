// ============================================================
// hooks/usePrimeiroAcessoProfissional.js
// Toda a lógica do primeiro acesso do profissional (a página só desenha):
//   "Você deseja informar um paciente agora?"
//     - Sim, quero vincular -> busca o paciente e cria o vínculo ao clicar nele
//     - Fazer depois        -> só um aviso; o vínculo pode ser feito no menu Pacientes
//
// Fluxo com a API:
//   - ao abrir:                 GET  /profissionais/me (se já concluiu, vai direto ao painel)
//   - clicar no paciente:       POST /profissionais/me/pacientes/:id
//                               -> abre o modal "Paciente encontrado!"
//   - "Acessar o Dialoga":      POST /profissionais/me/primeiro-acesso
//                               -> marca o primeiro acesso como concluído e entra no painel
//
// O vínculo é criado no clique (e não no "Acessar") porque o modal avisa que o
// paciente JÁ recebeu a notificação. O paciente ainda precisa aceitar.
// ============================================================
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { buscarMeuProfissional, vincularPaciente, concluirPrimeiroAcesso as concluirNaApi } from '../services/profissionalService'
import { useBuscaPaciente } from './useBuscaPaciente'
import { concluirPrimeiroAcesso } from '../utils/primeiroAcesso'

const ROTA_PAINEL = '/profissional/dashboard'
const MAX_BUSCA = 100

export function usePrimeiroAcessoProfissional() {
  const navigate = useNavigate()
  const { auth, perfil, marcarPrimeiroAcessoConcluido } = useAuth()
  const token = auth?.token

  const [escolha, setEscolha] = useState(null) // null | 'vincular' | 'depois'
  const [busca, setBusca] = useState('')
  const [vinculados, setVinculados] = useState([]) // pacientes já vinculados nesta tela: [{ id, nome_completo }]
  const [vinculandoId, setVinculandoId] = useState(null) // id do paciente que está sendo enviado
  const [modalAberto, setModalAberto] = useState(false)
  const [erroVinculo, setErroVinculo] = useState('')
  const [acessando, setAcessando] = useState(false)
  const [erroAcesso, setErroAcesso] = useState('')

  // A busca só roda quando o profissional responde "Sim, quero vincular"
  const resultadoBusca = useBuscaPaciente(escolha === 'vincular' ? busca : '', token)

  // Grava que o primeiro acesso terminou (sessão + navegador) e entra no painel
  function entrarNoPainel() {
    marcarPrimeiroAcessoConcluido()
    // O RequireAuth ainda consulta o navegador para sessões antigas
    concluirPrimeiroAcesso(auth.id)
    navigate(ROTA_PAINEL, { replace: true })
  }

  // Ao abrir: se o back diz que o profissional já concluiu (ex.: sessão antiga
  // que não tinha essa informação), não mostra a tela de novo.
  // Se a consulta falhar, deixa a tela aparecer normalmente.
  useEffect(() => {
    if (!token) return

    const controller = new AbortController()

    buscarMeuProfissional(token, controller.signal)
      .then((profissional) => {
        if (Number(profissional.primeiro_acesso_concluido) === 1) entrarNoPainel()
      })
      .catch(() => {}) // erro ou cancelamento: segue com a tela

    return () => controller.abort()
    // entrarNoPainel só usa valores estáveis desta sessão; refazer a consulta a cada render não faz sentido
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // "Sim, quero vincular" / "Fazer depois": trocar a escolha recomeça a busca
  function escolher(opcao) {
    setEscolha(opcao)
    setBusca('')
    setErroVinculo('')
  }

  function alterarBusca(texto) {
    setBusca(texto.slice(0, MAX_BUSCA))
    setErroVinculo('')
  }

  // Clique em um paciente da lista: cria o vínculo e avisa no modal
  async function selecionarPaciente(paciente) {
    // Já vinculado nesta tela (ou enviando agora): não cria de novo
    if (vinculandoId !== null || vinculados.some((v) => v.id === paciente.id)) return

    setVinculandoId(paciente.id)
    setErroVinculo('')
    try {
      await vincularPaciente(token, paciente.id)
      setVinculados((lista) => [...lista, { id: paciente.id, nome_completo: paciente.nome_completo }])
      setModalAberto(true)
    } catch (erro) {
      setErroVinculo(erro.message)
    } finally {
      setVinculandoId(null)
    }
  }

  // "Acessar o Dialoga": conclui o primeiro acesso na API e entra no painel
  async function acessar() {
    setAcessando(true)
    setErroAcesso('')
    try {
      await concluirNaApi(token)
      entrarNoPainel()
    } catch (erro) {
      setErroAcesso(erro.message)
      setAcessando(false) // só desliga no erro; no sucesso a tela é trocada
    }
  }

  return {
    nome: perfil?.nome?.trim().split(/\s+/)[0] ?? '', // primeiro nome, para a saudação
    escolha,
    busca,
    resultadoBusca,
    vinculados,
    vinculandoId,
    erroVinculo,
    modalAberto,
    nomeUltimoVinculado: vinculados.at(-1)?.nome_completo ?? '',
    acessando,
    erroAcesso,
    escolher,
    alterarBusca,
    selecionarPaciente,
    fecharModal: () => setModalAberto(false),
    acessar,
  }
}
