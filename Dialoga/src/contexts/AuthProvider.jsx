import { useCallback, useEffect, useMemo, useState } from 'react'
import { authService } from '../services'
import { AuthContext } from './AuthContext'

function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  // Restaura a sessão salva ao abrir o app
  useEffect(() => {
    let ativo = true

    authService
      .obterUsuarioAtual()
      .then((u) => ativo && setUsuario(u))
      .finally(() => ativo && setCarregando(false))

    return () => {
      ativo = false
    }
  }, [])

  const login = useCallback(async (email, senha) => {
    const u = await authService.login(email, senha)
    setUsuario(u)
    return u
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUsuario(null)
  }, [])

  const value = useMemo(
    () => ({ usuario, carregando, login, logout, atualizarUsuario: setUsuario }),
    [usuario, carregando, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
