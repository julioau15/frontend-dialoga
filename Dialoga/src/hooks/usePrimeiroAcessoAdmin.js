// ============================================================
// hooks/usePrimeiroAcessoAdmin.js
// Lógica da tela de primeiro acesso do administrador (a página só desenha):
//   - valores digitados: senha atual (recebida por e-mail), nova senha e confirmação
//   - validação antes de chamar a API (mesmas regras do cadastro: 6 a 30 caracteres)
//   - envio para PUT /administradores/me/senha
//   - ao concluir: marca a senha como definida na sessão e vai para /admin/dashboard
// Uso: const form = usePrimeiroAcessoAdmin()
// ============================================================
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { definirSenhaAdministrador } from '../services/administradorService'
import { validarCadastroSenha } from '../utils/validators'
import { NIVEL, rotaInicialPorNivel } from '../utils/rotasPorNivel'

const VALORES_INICIAIS = { senhaAtual: '', senha: '', confirmarSenha: '' }

// Campo do back-end -> campo do formulário onde o erro é exibido
const CAMPOS_API = { '[SENHA_ATUAL]': 'senhaAtual', '[NOVA_SENHA]': 'senha' }

function validar({ senhaAtual, senha, confirmarSenha }) {
  const erros = validarCadastroSenha({ senha, confirmarSenha })

  if (!senhaAtual) erros.senhaAtual = 'Informe a senha atual.'
  else if (!erros.senha && senha === senhaAtual) erros.senha = 'A nova senha deve ser diferente da senha atual.'

  return erros
}

export function usePrimeiroAcessoAdmin() {
  const { auth, marcarSenhaDefinida } = useAuth()
  const navigate = useNavigate()

  const [valores, setValores] = useState(VALORES_INICIAIS)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [errosCampos, setErrosCampos] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [carregando, setCarregando] = useState(false)

  // Atualiza um campo e limpa os erros enquanto o usuário digita
  function alterarCampo(campo, valor) {
    setValores((v) => ({ ...v, [campo]: valor }))
    setErrosCampos((e) => ({ ...e, [campo]: undefined }))
    setErroGeral('')
  }

  async function enviar(evento) {
    evento.preventDefault()

    const erros = validar(valores)
    setErrosCampos(erros)
    if (Object.keys(erros).length > 0) return

    setCarregando(true)
    setErroGeral('')
    try {
      await definirSenhaAdministrador(auth?.token, { senhaAtual: valores.senhaAtual, novaSenha: valores.senha })
      marcarSenhaDefinida()
      navigate(rotaInicialPorNivel(NIVEL.ADMIN), { replace: true })
    } catch (erro) {
      // Erro de um campo (ex.: senha atual incorreta) aparece embaixo dele; o resto, embaixo do formulário
      const campo = Object.entries(CAMPOS_API).find(([prefixo]) => String(erro.field ?? '').startsWith(prefixo))?.[1]
      if (campo) setErrosCampos({ [campo]: erro.message })
      else setErroGeral(erro.message)
    } finally {
      setCarregando(false)
    }
  }

  return {
    valores,
    errosCampos,
    erroGeral,
    carregando,
    mostrarSenha,
    alterarCampo,
    alternarSenha: () => setMostrarSenha((m) => !m),
    enviar,
  }
}