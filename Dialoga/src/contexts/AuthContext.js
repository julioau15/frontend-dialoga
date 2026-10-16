import { createContext } from 'react'

/**
 * @typedef {Object} AuthContextValue
 * @property {import('../types').Usuario | null} usuario
 * @property {boolean} carregando true enquanto a sessão salva é restaurada
 * @property {(email: string, senha: string) => Promise<import('../types').Usuario>} login
 * @property {() => Promise<void>} logout
 * @property {(usuario: import('../types').Usuario) => void} atualizarUsuario
 */

/** @type {import('react').Context<AuthContextValue | null>} */
export const AuthContext = createContext(null)
