// ============================================================
// hooks/useDashboardProfissional.js
// Busca os dados do dashboard do profissional logado.
// Uso:  const { dados, carregando, erro, recarregar } = useDashboardProfissional()
//   dados      -> { resumo, atendimentos_hoje, pacientes_recentes, atividades_enviadas } ou null
//   carregando -> true até a primeira resposta chegar
//   erro       -> mensagem de erro (texto) ou null
//   recarregar -> tenta buscar de novo (botão "Tentar novamente")
// ============================================================
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { buscarDashboardProfissional } from '../services/dashboardService'
import { dataLocalISO } from '../utils/formatadores'

export function useDashboardProfissional() {
  const { auth } = useAuth()
  const token = auth?.token

  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState(null)
  const [tentativa, setTentativa] = useState(0) // muda a cada "tentar novamente"

  useEffect(() => {
    if (!token) return

    let cancelado = false

    buscarDashboardProfissional(token, dataLocalISO())
      .then((resposta) => {
        if (cancelado) return
        setDados(resposta)
        setErro(null)
      })
      .catch((e) => {
        if (!cancelado) setErro(e.message)
      })

    // evita atualizar o estado se a tela for fechada antes da resposta chegar
    return () => {
      cancelado = true
    }
  }, [token, tentativa])

  function recarregar() {
    setErro(null)
    setTentativa((n) => n + 1)
  }

  return { dados, erro, carregando: !dados && !erro, recarregar }
}
