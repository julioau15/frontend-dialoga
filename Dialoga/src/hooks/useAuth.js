import { useContext } from 'react'
import { AuthContext } from '../contexts'

/** @returns {import('../contexts/AuthContext').AuthContextValue} */
function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return context
}

export default useAuth
