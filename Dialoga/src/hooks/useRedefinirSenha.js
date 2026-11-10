// ============================================================
// hooks/useRedefinirSenha.js
// controla o fluxo de redefinição de senha em 3 etapas:
//   'email'  -> informa o e-mail e recebe o código
//   'codigo' -> confirma o código recebido
//   'senha'  -> define a nova senha
//   'sucesso'-> senha alterada
// ============================================================
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  solicitarCodigoRequest,
  confirmarCodigoRequest,
  redefinirSenhaRequest,
} from '../services/redefinirSenha'

const TAMANHO_CODIGO = 4   
const TAMANHO_MIN_SENHA = 6
const TAMANHO_MAX_SENHA = 30 // mesmo limite do back (controller_auth.js)

// Validações de cada etapa (retornam { campo: 'mensagem' })
function validarEmail({ email }) {
  const erros = {}
  if (!email.trim()) erros.email = 'Informe o e-mail.'
  else if (!/^\S+@\S+\.\S+$/.test(email.trim())) erros.email = 'E-mail inválido.'
  return erros
}

function validarCodigo({ codigo }) {
  const erros = {}
  if (!codigo.trim()) erros.codigo = 'Informe o código.'
  else if (codigo.trim().length !== TAMANHO_CODIGO)
    erros.codigo = `O código tem ${TAMANHO_CODIGO} dígitos.`
  return erros
}

function validarNovaSenha({ senha, confirmarSenha }) {
  const erros = {}
  if (!senha) erros.senha = 'Informe a nova senha.'
  else if (/\s/.test(senha)) erros.senha = 'A senha não pode conter espaços.'
  else if (senha.length < TAMANHO_MIN_SENHA)
    erros.senha = `A senha deve ter pelo menos ${TAMANHO_MIN_SENHA} caracteres.`
  else if (senha.length > TAMANHO_MAX_SENHA)
    erros.senha = `A senha deve ter no máximo ${TAMANHO_MAX_SENHA} caracteres.`

  if (!confirmarSenha) erros.confirmarSenha = 'Confirme a nova senha.'
  else if (senha !== confirmarSenha) erros.confirmarSenha = 'As senhas não coincidem.'
  return erros
}

export function useRedefinirSenha() {
  const navigate = useNavigate()

  const [etapa, setEtapa] = useState('email')
  const [valores, setValores] = useState({
    email: '',
    codigo: '',
    senha: '',
    confirmarSenha: '',
  })
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [errosCampos, setErrosCampos] = useState({}) // erro de cada campo
  const [erroGeral, setErroGeral] = useState('')     // erro vindo da API
  const [mensagem, setMensagem] = useState('')       // aviso de sucesso (ex.: código reenviado)
  const [carregando, setCarregando] = useState(false)

  // Atualiza um campo e limpa os erros enquanto o usuário digita
  function alterarCampo(campo, valor) {
    setValores((v) => ({ ...v, [campo]: valor }))
    setErrosCampos((e) => ({ ...e, [campo]: undefined }))
    setErroGeral('')
    setMensagem('')
  }

  // Executa uma chamada de API cuidando de loading e erro
  async function executar(acao) {
    setCarregando(true)
    setErroGeral('')
    setMensagem('')
    try {
      await acao()
      return true
    } catch (erro) {
      setErroGeral(erro.message)
      return false
    } finally {
      setCarregando(false)
    }
  }

  // Etapa 1: envia o código por e-mail
  async function solicitarCodigo() {
    const erros = validarEmail(valores)
    setErrosCampos(erros)
    if (Object.keys(erros).length > 0) return

    const ok = await executar(() => solicitarCodigoRequest(valores.email.trim()))
    if (ok) setEtapa('codigo')
  }

  // Etapa 2: confirma o código
  async function confirmarCodigo() {
    const erros = validarCodigo(valores)
    setErrosCampos(erros)
    if (Object.keys(erros).length > 0) return

    const ok = await executar(() =>
      confirmarCodigoRequest(valores.email.trim(), valores.codigo.trim())
    )
    console.log(ok)
    if (ok) setEtapa('senha')
  }

  // Etapa 3: define a nova senha
  async function redefinirSenha() {
    const erros = validarNovaSenha(valores)
    setErrosCampos(erros)
    if (Object.keys(erros).length > 0) return

    const ok = await executar(() =>
      redefinirSenhaRequest(valores.email.trim(), valores.codigo.trim(), valores.senha)
    )
    if (ok) setEtapa('sucesso')
  }

  // Reenvia o código sem sair da etapa atual
  async function reenviarCodigo() {
    const ok = await executar(() => solicitarCodigoRequest(valores.email.trim()))
    if (ok) {
      setValores((v) => ({ ...v, codigo: '' })) // o código anterior deixa de valer (RN29)
      setMensagem('Enviamos um novo código para o seu e-mail.')
    }
  }

  // Chamado no onSubmit do formulário: decide o que fazer conforme a etapa
  async function enviar(evento) {
    evento.preventDefault() // evita recarregar a página

    if (etapa === 'email') return solicitarCodigo()
    if (etapa === 'codigo') return confirmarCodigo()
    if (etapa === 'senha') return redefinirSenha()
  }

  // Volta uma etapa (útil para corrigir o e-mail, por exemplo)
  function voltar() {
    setErrosCampos({})
    setErroGeral('')
    setMensagem('')
    if (etapa === 'codigo') {
      setValores((v) => ({ ...v, codigo: '' })) // o código pertence à solicitação anterior (RN29)
      setEtapa('email')
    }
    else if (etapa === 'senha') setEtapa('codigo')
  }

  function irParaLogin() {
    navigate('/login', { replace: true })
  }

  return {
    etapa,
    valores,
    errosCampos,
    erroGeral,
    mensagem,
    carregando,
    mostrarSenha,
    alterarCampo,
    alternarSenha: () => setMostrarSenha((m) => !m),
    enviar,
    reenviarCodigo,
    voltar,
    irParaLogin,
  }
}