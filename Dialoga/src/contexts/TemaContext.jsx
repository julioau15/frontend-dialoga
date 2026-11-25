// ============================================================
// contexts/TemaContext.jsx
// Guarda se o site está no tema claro ou escuro e deixa isso disponível para todo o app.
// Uso em qualquer componente:  const { escuro, alternarTema, definirTema } = useTema()
//   escuro       -> true quando o tema escuro está ligado
//   alternarTema -> troca claro <-> escuro (e salva a escolha)
//   definirTema  -> define direto: definirTema('dark') ou definirTema('light')
// ============================================================
import { useCallback, useEffect, useMemo, useState } from 'react'
import { TemaContext } from './temaCanal'
import { TEMA, aplicarTema, lerTemaSalvo, salvarTema, temaInicial, temaDoSistema } from '../utils/tema'

export function TemaProvider({ children }) {
  const [tema, setTema] = useState(temaInicial)

  // sempre que o tema mudar, reflete na tag <html>
  useEffect(() => {
    aplicarTema(tema)
  }, [tema])

  // quem nunca escolheu acompanha o tema do sistema (ex.: o celular escurece à noite)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const aoMudar = () => {
      if (!lerTemaSalvo()) setTema(temaDoSistema())
    }
    mq.addEventListener('change', aoMudar)
    return () => mq.removeEventListener('change', aoMudar)
  }, [])

  // mantém várias abas abertas do site no mesmo tema
  useEffect(() => {
    const aoMudarStorage = (e) => {
      if (e.key === 'dialoga-tema' && (e.newValue === TEMA.CLARO || e.newValue === TEMA.ESCURO)) {
        setTema(e.newValue)
      }
    }
    window.addEventListener('storage', aoMudarStorage)
    return () => window.removeEventListener('storage', aoMudarStorage)
  }, [])

  const definirTema = useCallback((novo) => {
    salvarTema(novo)
    setTema(novo)
  }, [])

  const alternarTema = useCallback(() => {
    definirTema(tema === TEMA.ESCURO ? TEMA.CLARO : TEMA.ESCURO)
  }, [tema, definirTema])

  const valor = useMemo(
    () => ({ tema, escuro: tema === TEMA.ESCURO, alternarTema, definirTema }),
    [tema, alternarTema, definirTema],
  )

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>
}
