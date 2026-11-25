// Acesso ao tema claro/escuro em qualquer componente.
// const { escuro, alternarTema, definirTema } = useTema()
import { useContext } from 'react'
import { TemaContext } from '../contexts/temaCanal'

export function useTema() {
  const ctx = useContext(TemaContext)
  if (!ctx) throw new Error('useTema precisa estar dentro do <TemaProvider>')
  return ctx
}
