// ============================================================
// contexts/AuthContext.jsx
// Guarda quem está logado e deixa isso disponível para todo o app.
// Uso em qualquer componente:  const { auth, perfil, login, logout } = useAuth()
//   auth   -> { token, nivel, id, email } ou null (deslogado)
//   perfil -> { nome, fotoUrl } do usuário logado ou null
//   login  -> faz o login na API e salva a sessão
//   logout -> apaga a sessão
// ============================================================
import { createContext, useContext, useEffect, useState } from 'react'
import { loginRequest } from '../services/authService'
import { API_URL } from '../config/api'

const AuthContext = createContext(null)

// nivel -> rota onde ficam os dados daquele tipo de usuário.
// AJUSTE: confira qual número é cada nível e o nome real das rotas.
const ROTA_POR_NIVEL = {
  0: 'administradores',
  1: 'profissionais',
  2: 'pacientes',
}

const NIVEL = {
  0: 'administrador',
  1: 'profissional',
  2: 'paciente',
}

// Deixa o perfil sempre no mesmo formato, independente da tabela de origem.
// AJUSTE: troque pelos nomes reais dos campos que sua API devolve.
function normalizarPerfil(dados) {
  if (!dados) return null
  // se a API devolver uma lista ou um objeto embrulhado, pega o registro
  const registro = dados[0]
  console.log(registro)
  if (!registro) return null

  return {
    nome: registro.nome_completo ?? '',
    fotoUrl: registro.foto_avatar ?? null
  }
}

// Lê o "exp" (em segundos) de um JWT. Devolve null se não for um JWT válido.
function lerExpiracao(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(payload))
    return typeof exp === 'number' ? exp : null
  } catch {
    return null
  }
}

function tokenExpirado(token) {
  const exp = lerExpiracao(token)
  return exp !== null && exp * 1000 <= Date.now()
}

// Recupera a sessão salva; descarta se estiver corrompida, incompleta ou expirada.
function lerSessaoSalva() {
  try {
    const salvo = JSON.parse(localStorage.getItem('auth'))
    if (!salvo || !salvo.token || typeof salvo.nivel !== 'number') throw new Error()
    if (tokenExpirado(salvo.token)) throw new Error()
    return salvo
  } catch {
    localStorage.removeItem('auth')
    return null
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(lerSessaoSalva)
  const [perfil, setPerfil] = useState(null)

  async function login(email, senha) {
    const dados = await loginRequest(email, senha)
    localStorage.setItem('auth', JSON.stringify(dados)) // mantém logado ao recarregar
    setAuth(dados)
    return dados
  }

  function logout() {
    localStorage.removeItem('auth')
    setAuth(null)
    setPerfil(null)
  }

  // Desloga automaticamente quando o token expira (mesmo com a aba aberta)
  useEffect(() => {
    if (!auth) return
    const exp = lerExpiracao(auth.token)
    if (exp === null) return
    // se já venceu, o timeout de 0 ms desloga logo em seguida
    const restante = Math.max(exp * 1000 - Date.now(), 0)
    const timer = setTimeout(logout, restante)
    return () => clearTimeout(timer)
  }, [auth])

  // Busca nome e foto na rota do nível do usuário (administrador, profissional ou paciente)
  useEffect(() => {
    if (!auth) {
      setPerfil(null)
      return
    }

    const rota = ROTA_POR_NIVEL[auth.nivel]
    const nivel = NIVEL[auth.nivel]
    if (!rota) {
      setPerfil(null)
      return
    }

    let cancelado = false

    fetch(`${API_URL}/${rota}/${auth.id}`, {
      headers: { 'x-access-token': auth.token },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((dados) => {
        if (!cancelado) setPerfil(normalizarPerfil(dados.response[nivel]))
      })
      .catch(() => {
        if (!cancelado) setPerfil(null)
      })

    // evita atualizar o estado se o usuário deslogar antes da resposta chegar
    return () => {
      cancelado = true
    }
  }, [auth])

  return (
    <AuthContext.Provider value={{ auth, perfil, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)