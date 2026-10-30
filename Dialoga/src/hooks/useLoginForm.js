// ============================================================
// hooks/useLoginForm.js
// Toda a lógica do formulário de login (o componente LoginForm
// só cuida do visual). Controla: valores digitados, erros,
// "carregando", mostrar/ocultar senha e o envio.
// ============================================================
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { validarLogin } from '../utils/validators'
import { rotaInicialPorNivel, rotaAposLogin } from '../utils/rotasPorNivel'

export function useLoginForm() {
  const { login, logout } = useAuth()
  const navigate = useNavigate()

  const [valores, setValores] = useState({ email: '', senha: '' })
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [errosCampos, setErrosCampos] = useState({}) // erro de cada campo
  const [erroGeral, setErroGeral] = useState('')     // erro vindo da API
  const [carregando, setCarregando] = useState(false)

  // Atualiza um campo e limpa os erros enquanto o usuário digita
  function alterarCampo(campo, valor) {
    setValores((v) => ({ ...v, [campo]: valor }))
    setErrosCampos((e) => ({ ...e, [campo]: undefined }))
    setErroGeral('')
  }

  // Chamado ao clicar em "Entrar"
  async function enviar(evento) {
    evento.preventDefault() // evita recarregar a página

    // 1) valida os campos antes de chamar a API
    const erros = validarLogin(valores)
    setErrosCampos(erros)
    if (Object.keys(erros).length > 0) return

    // 2) chama a API
    setCarregando(true)
    setErroGeral('')
    try {
      const dados = await login(valores.email.trim(), valores.senha)
      const rota = rotaInicialPorNivel(dados.nivel) && rotaAposLogin(dados)

      // nível sem tela no front (ex.: admin): desloga e avisa
      if (!rota) {
        logout()
        setErroGeral('Este tipo de conta não tem acesso ao painel web.')
        return
      }

      // 3) tudo certo: vai para a área do usuário
      navigate(rota, { replace: true })
    } catch (erro) {
      // Profissional com cadastro ainda em análise: mostra a tela explicando
      if (erro.codigo === 'PROFISSIONAL_EM_ANALISE') {
        navigate('/perfil-em-analise', { replace: true })
        return
      }
      setErroGeral(erro.message) // inclui o aviso de cadastro recusado
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
