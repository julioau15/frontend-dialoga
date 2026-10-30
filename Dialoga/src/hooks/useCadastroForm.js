// ============================================================
// hooks/useCadastroForm.js
// Lógica do cadastro em 2 passos (a tela só cuida do visual):
//   passo 1 -> tipo de conta, nome, e-mail, celular
//              (profissional: + CPF, registro profissional e especialidades)
//   passo 2 -> senha e confirmação (e envio para a API)
// Depois de criar a conta:
//   paciente     -> já faz o login e vai para a área dele
//   profissional -> NÃO faz login: o cadastro fica em análise pela equipe,
//                   então vai para a tela "Perfil em análise" (/perfil-em-analise)
// ============================================================
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { cadastrarRequest, listarEspecialidadesRequest, verificarCadastroRequest } from '../services/cadastroService'
import { rotaInicialPorNivel } from '../utils/rotasPorNivel'
import {
  validarCadastroDados,
  validarCadastroSenha,
  mascararCelular,
  mascararCpf,
  limparCpf,
} from '../utils/validators'

const VALORES_INICIAIS = {
  tipo: 'paciente',
  nome: '',
  email: '',
  celular: '',
  cpf: '',
  crp: '',
  especialidades: [], // ids das especialidades marcadas (só profissional)
  senha: '',
  confirmarSenha: '',
}

// Campos que ficam no passo 1 (se a API reclamar de um deles, voltamos para lá)
const CAMPOS_PASSO_1 = ['nome', 'email', 'celular', 'cpf', 'crp', 'especialidades']

export function useCadastroForm() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [passo, setPasso] = useState(1)
  const [valores, setValores] = useState(VALORES_INICIAIS)
  const [errosCampos, setErrosCampos] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  // Lista de especialidades para o profissional escolher.
  // Guardamos o resultado da busca junto com o número da tentativa; "carregando" e "erro"
  // são calculados a partir dele (carregando = ainda não chegou o resultado desta tentativa).
  const [tentativaEspecialidades, setTentativaEspecialidades] = useState(0) // +1 = tentar de novo
  const [resultadoEspecialidades, setResultadoEspecialidades] = useState(null) // { tentativa, lista, erro }

  const ehProfissional = valores.tipo === 'profissional'

  const resultadoAtual = resultadoEspecialidades?.tentativa === tentativaEspecialidades ? resultadoEspecialidades : null
  const especialidades = resultadoEspecialidades?.lista ?? [] // [{ id, especialidade }]
  const carregandoEspecialidades = ehProfissional && !resultadoAtual
  const erroEspecialidades = resultadoAtual?.erro ?? ''

  // Busca as especialidades na API quando o usuário escolhe "Profissional"
  useEffect(() => {
    if (!ehProfissional) return
    let cancelado = false
    const tentativa = tentativaEspecialidades

    listarEspecialidadesRequest()
      .then((lista) => {
        // a API devolve do id mais novo para o mais antigo; mostramos em ordem alfabética
        const ordenada = [...lista].sort((a, b) => a.especialidade.localeCompare(b.especialidade, 'pt-BR'))
        if (!cancelado) setResultadoEspecialidades({ tentativa, lista: ordenada, erro: '' })
      })
      .catch((erro) => { if (!cancelado) setResultadoEspecialidades({ tentativa, lista: [], erro: erro.message }) })

    return () => { cancelado = true }
  }, [ehProfissional, tentativaEspecialidades])

  // Atualiza um campo (aplicando máscara quando existir) e limpa o erro dele
  function alterarCampo(campo, valor) {
    if (campo === 'celular') valor = mascararCelular(valor)
    if (campo === 'cpf') valor = mascararCpf(valor)
    setValores((v) => ({ ...v, [campo]: valor }))
    setErrosCampos((e) => ({ ...e, [campo]: undefined }))
    setErroGeral('')
  }

  // Marca / desmarca uma especialidade
  function alternarEspecialidade(id) {
    setValores((v) => ({
      ...v,
      especialidades: v.especialidades.includes(id)
        ? v.especialidades.filter((item) => item !== id)
        : [...v.especialidades, id],
    }))
    setErrosCampos((e) => ({ ...e, especialidades: undefined }))
    setErroGeral('')
  }

  // Passo 1 -> passo 2
  async function continuar(evento) {
    evento.preventDefault()
    const erros = validarCadastroDados(valores)
    setErrosCampos(erros)
    if (Object.keys(erros).length > 0) return

    // Confere na API se e-mail (e CPF/CRP) já existem, antes de pedir a senha
    setCarregando(true)
    try {
      await verificarCadastroRequest({
        email: valores.email.trim(),
        celular: valores.celular,
        cpf: ehProfissional ? limparCpf(valores.cpf) : undefined,
        crp: ehProfissional ? valores.crp.trim() : undefined,
      })
      setPasso(2)
    } catch (erro) {
      setErrosCampos({ [erro.campo ?? 'email']: erro.message })
    } finally {
      setCarregando(false)
    }
  }

  function voltar() {
    setErrosCampos({})
    setErroGeral('')
    setPasso(1)
  }

  // Passo 2: cria a conta
  async function enviar(evento) {
    evento.preventDefault()
    const erros = validarCadastroSenha(valores)
    setErrosCampos(erros)
    if (Object.keys(erros).length > 0) return

    setCarregando(true)
    setErroGeral('')
    try {
      const dados = {
        nome_completo: valores.nome.trim(),
        email: valores.email.trim(),
        celular: valores.celular,
        senha: valores.senha,
      }
      if (ehProfissional) {
        dados.cpf = limparCpf(valores.cpf)
        dados.crp = valores.crp.trim()
        dados.id_especialidade = valores.especialidades
      }

      await cadastrarRequest(valores.tipo, dados)

      // Profissional: NÃO faz login, a conta só é liberada depois da análise da equipe
      if (ehProfissional) {
        navigate('/perfil-em-analise', { replace: true })
        return
      }

      // Paciente: conta criada, entra direto
      const { nivel } = await login(dados.email, dados.senha)
      navigate(rotaInicialPorNivel(nivel) ?? '/login', { replace: true })
    } catch (erro) {
      // Profissional com cadastro em análise: vai para a tela de análise
      if (erro.codigo === 'PROFISSIONAL_EM_ANALISE') {
        navigate('/perfil-em-analise', { replace: true })
        return
      }

      // A API apontou um campo (ex.: e-mail já cadastrado): volta ao passo 1 e mostra embaixo dele
      if (CAMPOS_PASSO_1.includes(erro.campo)) {
        setErrosCampos({ [erro.campo]: erro.message })
        setPasso(1)
      } else {
        setErroGeral(erro.message)
      }
    } finally {
      setCarregando(false)
    }
  }

  return {
    passo,
    valores,
    errosCampos,
    erroGeral,
    carregando,
    mostrarSenha,
    especialidades,
    carregandoEspecialidades,
    erroEspecialidades,
    alterarCampo,
    alternarEspecialidade,
    recarregarEspecialidades: () => setTentativaEspecialidades((n) => n + 1),
    alternarSenha: () => setMostrarSenha((m) => !m),
    continuar,
    voltar,
    enviar,
  }
}
