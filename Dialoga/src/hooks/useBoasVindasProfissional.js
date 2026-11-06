// ============================================================
// hooks/useBoasVindasProfissional.js
// Toda a lógica do primeiro acesso do profissional (a página só desenha).
// Tudo acontece numa única tela (SPA): as opções, a busca, o paciente
// escolhido e os avisos (modal e toast) aparecem sem trocar de rota.
//
//   Escolha -> 'vincular' (busca um paciente) | 'depois' | nada (vale como "depois")
//
// Fluxo com a API (só rotas que já existem, ver services/profissionalService.js):
//   - ao escolher "Sim, quero vincular": carrega os pacientes (GET /pacientes) e a busca filtra na tela
//   - "Acessar o Dialoga" com um paciente escolhido:
//                                 cria o vínculo (POST /profissionais/me/pacientes/:id) e
//                                 guarda a notificação no banco (POST /notificacoes)
//                                 -> abre o modal "Paciente encontrado!"
//   - "Entendi" (ou "Acessar" sem paciente):
//                                 marca o primeiro acesso como concluído e vai ao painel
// O back ainda NÃO guarda o primeiro acesso do profissional: a conclusão fica salva no navegador
// (utils/primeiroAcesso.js), então a tela aparece uma vez por navegador.
// ============================================================
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { vincularPaciente } from '../services/profissionalService'
import { useBuscaPaciente } from './useBuscaPaciente'
import { concluirPrimeiroAcesso } from '../utils/primeiroAcesso'
import { primeiroNome } from '../utils/formatadores'

const ROTA_DASHBOARD = '/profissional/dashboard'
const TOAST_FECHADO = { aberto: false, tipo: 'erro', mensagem: '' }

export function useBoasVindasProfissional() {
  const navigate = useNavigate()
  const { auth, perfil, marcarPrimeiroAcessoConcluido } = useAuth()
  const token = auth?.token

  const [escolha, setEscolha] = useState(null) // null | 'vincular' | 'depois'
  const [busca, setBusca] = useState('') // texto digitado
  const [paciente, setPaciente] = useState(null) // paciente escolhido: { id, nome_completo, email, ... }
  const [erro, setErro] = useState('') // aviso de validação, logo abaixo da busca
  const [enviando, setEnviando] = useState(false)
  const [vinculoEnviado, setVinculoEnviado] = useState(false) // evita criar o vínculo (e a notificação) duas vezes
  const [modalAberto, setModalAberto] = useState(false)
  const [toast, setToast] = useState(TOAST_FECHADO)

  // A busca só roda quando o profissional escolhe "Sim, quero vincular"
  const resultados = useBuscaPaciente(busca, token, escolha === 'vincular')

  // Depois que o paciente foi notificado, a escolha não pode mais mudar
  const travado = vinculoEnviado

  const fecharToast = useCallback(() => setToast(TOAST_FECHADO), [])

  // ---------- Escolha e busca ----------

  // Trocar a escolha recomeça a busca do zero
  function escolher(opcao) {
    if (travado) return
    setEscolha(opcao)
    setBusca('')
    setPaciente(null)
    setErro('')
  }

  // Digitar outra coisa desfaz o paciente já escolhido
  function alterarBusca(texto) {
    if (travado) return
    setBusca(texto.slice(0, 100)) // mesmo limite do back
    setPaciente(null)
    setErro('')
  }

  // Clique em um cartão da lista: só marca (o vínculo é criado no "Acessar")
  function selecionarPaciente(escolhido) {
    if (travado || escolhido.situacao_vinculo) return // quem já tem vínculo não pode ser escolhido de novo
    setPaciente(escolhido)
    setErro('')
  }

  // ---------- Conclusão ----------

  // Marca o primeiro acesso como concluído (sessão + navegador) e vai para o painel
  function concluir() {
    marcarPrimeiroAcessoConcluido()

    // O back não guarda isso para o profissional: é o navegador que lembra (o RequireAuth e o login consultam)
    concluirPrimeiroAcesso(auth.id)
    navigate(ROTA_DASHBOARD, { replace: true })
  }

  function avisarErro(mensagem) {
    setToast({ aberto: true, tipo: 'erro', mensagem })
  }

  // "Acessar o Dialoga →"
  async function acessar() {
    if (enviando) return

    // Escolheu vincular, mas ainda não clicou em ninguém da lista
    if (escolha === 'vincular' && !paciente) {
      setErro('Selecione um paciente da lista ou escolha "Fazer depois".')
      return
    }

    // Sem paciente (ou vínculo já enviado e modal fechado no X): só conclui
    if (escolha !== 'vincular' || vinculoEnviado) {
      concluir()
      return
    }

    // Vincula (uma única vez): cria o vínculo e guarda a notificação para o paciente
    setEnviando(true)
    setErro('')
    try {
      await vincularPaciente(token, paciente)
      setVinculoEnviado(true)
      setModalAberto(true) // "Paciente encontrado! ... recebeu uma notificação"
      setEnviando(false)
    } catch (e) {
      // 409: já existia solicitação/acompanhamento (a lista estava desatualizada) -> atualiza a lista
      if (e.status === 409) {
        setPaciente(null)
        resultados.tentarNovamente()
      }
      avisarErro(e.message)
      setEnviando(false)
    }
  }

  // Modal: o X / Esc / fundo escuro só fecham (clicar em "Acessar" de novo conclui)
  function fecharModal() {
    setModalAberto(false)
  }

  // Modal: "Entendi" fecha e conclui o primeiro acesso
  function confirmarModal() {
    setModalAberto(false)
    concluir()
  }

  return {
    nome: primeiroNome(perfil?.nome), // vazio enquanto o perfil não chegou
    escolha,
    busca,
    paciente,
    resultados,
    erro,
    enviando,
    travado,
    modalAberto,
    toast,
    escolher,
    alterarBusca,
    selecionarPaciente,
    acessar,
    fecharModal,
    confirmarModal,
    fecharToast,
  }
}
