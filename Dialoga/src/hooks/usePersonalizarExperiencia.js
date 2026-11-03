// ============================================================
// hooks/usePersonalizarExperiencia.js
// Toda a lógica do primeiro acesso do paciente (a página só desenha):
//
//   Etapa 1 "Pessoal"      -> apelido e data de nascimento (opcionais)
//   Etapa 2 "Profissional" -> tem ou não equipe; busca e vínculo com o profissional
//   Etapa 3 "Humor"        -> registro de humor do dia
//
// Fluxo com a API:
//   - ao abrir:                GET  /pacientes/me (preenche nome, apelido e data)
//   - Continuar na etapa 2:    POST /pacientes/me/profissionais/:id (se escolheu um)
//   - Salvar na etapa 3:       POST /pacientes/me/registros-humor
//   - ao terminar (ou pular):  POST /pacientes/me/primeiro-acesso (apelido + data)
//                              -> marca o primeiro acesso como concluído
// ============================================================
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  buscarMeuPaciente,
  vincularProfissional,
  salvarRegistroHumor,
  salvarPrimeiroAcesso,
} from '../services/pacienteService'
import { useBuscaProfissional } from './useBuscaProfissional'
import { concluirPrimeiroAcesso } from '../utils/primeiroAcesso'
import {
  LIMITES_PERSONALIZACAO,
  mascararData,
  mascararHorasSono,
  dataBRparaISO,
  validarDadosPessoais,
  validarHumor,
} from '../utils/validators'

export const PASSOS = ['Pessoal', 'Profissional', 'Humor']

const DADOS_PESSOAIS_VAZIOS = { apelido: '', dataNascimento: '' }

const EQUIPE_INICIAL = {
  tem: null, // null = nada escolhido | 'sim' | 'nao'
  busca: '', // texto digitado no campo de busca
  profissional: null, // profissional escolhido na lista: { id, nome_completo, especialidades }
}

const HUMOR_INICIAL = {
  sentimento: '', // UM valor só (no banco é VARCHAR(30), não uma lista)
  energia: '',
  humorDia: '',
  horasSono: '',
  relato: '',
  pensamento: '',
}

// Converte a data da API (AAAA-MM-DD ou ISO) para o campo de texto (DD/MM/AAAA).
// Apenas formata o valor; não verifica se a data é válida.
function formatarDataParaCampo(data) {
    if (!data) return ''

    const resultado = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(data))

    // Se o formato não for reconhecido, mantém o campo vazio.
    if (!resultado) return ''

    const [, ano, mes, dia] = resultado
    return `${dia}/${mes}/${ano}`
}

// Converte os dados que vieram da API para o formato do formulário
function dadosDoPaciente(paciente) {
  return {
    apelido: paciente?.apelido ?? '',
    dataNascimento: formatarDataParaCampo(paciente?.data_nascimento), // "2000-05-10" -> "10/05/2000"
  }
}

// Monta o corpo do POST /registros-humor com os nomes que o back espera
function montarRegistroHumor(humor) {
  return {
    sentimento: humor.sentimento,
    energia: humor.energia,
    humor: humor.humorDia,
    padrao_pensamentos: humor.pensamento,
    horas_sono: Number(humor.horasSono), // DECIMAL(4,2) -> número (ex.: 7.5)
    relato: humor.relato.trim() || null, // opcional: vazio vira null
  }
}

export function usePersonalizarExperiencia() {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const token = auth?.token

  const [etapa, setEtapa] = useState(1)

  // ---------- Carregamento do paciente ----------
  // Mesmo padrão do useBuscaProfissional: "carregando" é calculado,
  // para não chamar setState direto dentro do useEffect.
  const [tentativaPaciente, setTentativaPaciente] = useState(0)
  const [resultadoPaciente, setResultadoPaciente] = useState(null) // { tentativa, paciente, erro }

  // ---------- Etapa 1 ----------
  const [dadosPessoais, setDadosPessoais] = useState(DADOS_PESSOAIS_VAZIOS)
  const [errosDados, setErrosDados] = useState({})

  // ---------- Etapa 2 ----------
  const [equipe, setEquipe] = useState(EQUIPE_INICIAL)
  const [erroEquipe, setErroEquipe] = useState('')
  const [vinculando, setVinculando] = useState(false)
  const [idVinculado, setIdVinculado] = useState(null) // evita criar o mesmo vínculo duas vezes
  const [modalAberto, setModalAberto] = useState(false)

  // A busca só roda quando o paciente responde "Sim, tenho"
  const busca = useBuscaProfissional(equipe.tem === 'sim' ? equipe.busca : '', token)

  // ---------- Etapa 3 / final ----------
  const [humor, setHumor] = useState(HUMOR_INICIAL)
  const [errosHumor, setErrosHumor] = useState({})
  const [humorSalvo, setHumorSalvo] = useState(false) // evita salvar o humor duas vezes se o final falhar
  const [enviando, setEnviando] = useState(false)
  const [erroGeral, setErroGeral] = useState('')

  // Busca os dados do paciente ao abrir a tela (e ao clicar em "Tentar novamente")
  useEffect(() => {
    const controller = new AbortController()
    const tentativa = tentativaPaciente

    buscarMeuPaciente(token, controller.signal)
      .then((paciente) => {
        setResultadoPaciente({ tentativa, paciente, erro: '' })
        setDadosPessoais(dadosDoPaciente(paciente)) // já preenche o que o paciente tiver salvo
      })
      .catch((erro) => {
        if (controller.signal.aborted) return // saiu da tela: ignora
        setResultadoPaciente({ tentativa, paciente: null, erro: erro.message })
      })

    return () => controller.abort()
  }, [token, tentativaPaciente])

  const pacienteAtual = resultadoPaciente?.tentativa === tentativaPaciente ? resultadoPaciente : null
  const paciente = pacienteAtual?.paciente ?? null
  const carregando = !pacienteAtual
  const erroCarregamento = pacienteAtual?.erro ?? ''


  // ETAPA 1 — Dados pessoais


  // Atualiza um campo (com máscara/limite) e apaga o erro dele
  function alterarDadoPessoal(campo, valor) {
    if (campo === 'dataNascimento') valor = mascararData(valor)
    if (campo === 'apelido') valor = valor.slice(0, LIMITES_PERSONALIZACAO.APELIDO)

    setDadosPessoais((v) => ({ ...v, [campo]: valor }))
    setErrosDados((e) => ({ ...e, [campo]: undefined }))
  }

  // "Continuar": valida e vai para a etapa 2 (os dados são enviados só no final)
  function continuarDadosPessoais(evento) {
    evento.preventDefault()

    const erros = validarDadosPessoais(dadosPessoais)
    setErrosDados(erros)
    if (Object.keys(erros).length > 0) return

    setEtapa(2)
  }

  // "Pular por enquanto": desfaz o que foi digitado (volta ao que estava salvo)
  // para não enviar um valor inválido, e segue para a etapa 2
  function pularDadosPessoais() {
    setDadosPessoais(dadosDoPaciente(paciente))
    setErrosDados({})
    setEtapa(2)
  }


  // ETAPA 2 — Equipe de saúde e busca do profissional
  

  // "Sim, tenho" / "Não por enquanto": recomeça a busca do zero
  function escolherTemEquipe(valor) {
    setEquipe({ ...EQUIPE_INICIAL, tem: valor })
    setErroEquipe('')
  }

  // Digitar outra coisa desfaz a escolha anterior
  function alterarBusca(texto) {
    setEquipe((v) => ({ ...v, busca: texto.slice(0, 100), profissional: null }))
    setErroEquipe('')
  }

  // Clique em um cartão da lista: só marca (o vínculo é criado no "Continuar")
  function selecionarProfissional(profissional) {
    setEquipe((v) => ({ ...v, profissional }))
    setErroEquipe('')
  }

  const podeContinuarEquipe =
    !vinculando && (equipe.tem === 'nao' || (equipe.tem === 'sim' && equipe.profissional !== null))

  // "Continuar" da etapa 2
  async function continuarEquipe(evento) {
    evento.preventDefault()
    if (!podeContinuarEquipe) return

    // "Não por enquanto": nada para salvar
    if (equipe.tem === 'nao') {
      setEtapa(3)
      return
    }

    // Já vinculou este mesmo profissional (ex.: voltou da etapa 3): só avança
    if (equipe.profissional.id === idVinculado) {
      setEtapa(3)
      return
    }

    setVinculando(true)
    setErroEquipe('')
    try {
      await vincularProfissional(token, equipe.profissional.id)
      setIdVinculado(equipe.profissional.id)
      setModalAberto(true) // "Profissional encontrado... recebeu uma notificação"
    } catch (erro) {
      setErroEquipe(erro.message)
    } finally {
      setVinculando(false)
    }
  }

  // Modal: "Entendi" fecha e avança; o X/Esc só fecha (o Continuar leva para a etapa 3)
  function fecharModal() {
    setModalAberto(false)
  }

  function confirmarModal() {
    setModalAberto(false)
    setEtapa(3)
  }

  function pularEquipe() {
    setErroEquipe('')
    setEtapa(3)
  }

  // ETAPA 3 — Humor do dia e conclusão

  function alterarHumor(campo, valor) {
    if (campo === 'horasSono') valor = mascararHorasSono(valor)
    if (campo === 'relato') valor = valor.slice(0, LIMITES_PERSONALIZACAO.RELATO)

    setHumor((v) => ({ ...v, [campo]: valor }))
    setErrosHumor((e) => ({ ...e, [campo]: undefined }))
    setErroGeral('')
  }

  // Envia apelido + data (marca o primeiro acesso como concluído) e vai para o painel
  async function finalizarPrimeiroAcesso() {
    await salvarPrimeiroAcesso(token, {
      apelido: dadosPessoais.apelido.trim() || null,
      data_nascimento: dataBRparaISO(dadosPessoais.dataNascimento), // null se vazio
    })

    // O RequireAuth ainda consulta o navegador para saber se o primeiro acesso terminou
    concluirPrimeiroAcesso(auth.id)
    navigate('/paciente/dashboard', { replace: true })
  }

  // "Salvar e acessar o Dialoga"
  async function salvarHumorEConcluir(evento) {
    evento.preventDefault()

    const erros = validarHumor(humor)
    setErrosHumor(erros)
    if (Object.keys(erros).length > 0) {
      setErroGeral('Preencha os campos destacados para salvar.')
      return
    }

    setEnviando(true)
    setErroGeral('')
    try {
      if (!humorSalvo) {
        await salvarRegistroHumor(token, montarRegistroHumor(humor))
        setHumorSalvo(true)
      }
      await finalizarPrimeiroAcesso()
    } catch (erro) {
      setErroGeral(erro.message)
      setEnviando(false) // só desliga no erro; no sucesso a tela é trocada
    }
  }

  // "Agora não — ir para o início": conclui sem registrar o humor
  async function concluirSemHumor() {
    setEnviando(true)
    setErroGeral('')
    try {
      await finalizarPrimeiroAcesso()
    } catch (erro) {
      setErroGeral(erro.message)
      setEnviando(false)
    }
  }

  // "Voltar" de qualquer etapa
  function voltarPara(etapaAnterior) {
    setErroGeral('')
    setErroEquipe('')
    setEtapa(etapaAnterior)
  }

  return {
    etapa,
    // carregamento
    paciente,
    carregando,
    erroCarregamento,
    tentarCarregarNovamente: () => setTentativaPaciente((n) => n + 1),
    // etapa 1
    dadosPessoais,
    errosDados,
    alterarDadoPessoal,
    continuarDadosPessoais,
    pularDadosPessoais,
    // etapa 2
    equipe,
    busca,
    erroEquipe,
    vinculando,
    podeContinuarEquipe,
    modalAberto,
    escolherTemEquipe,
    alterarBusca,
    selecionarProfissional,
    continuarEquipe,
    pularEquipe,
    fecharModal,
    confirmarModal,
    // etapa 3
    humor,
    errosHumor,
    enviando,
    erroGeral,
    alterarHumor,
    salvarHumorEConcluir,
    concluirSemHumor,
    voltarPara,
  }
}
