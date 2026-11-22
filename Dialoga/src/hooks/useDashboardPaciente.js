// ============================================================
// hooks/useDashboardPaciente.js
// Entrega os dados da tela "Dashboard do paciente" (mesmo padrão do useDashboardProfissional).
//   const { dados, carregando, erro, recarregar } = useDashboardPaciente()
//   dados -> { indicadores, sono, tratamentos, consultas, tarefas, totalProfissionais } ou null
// Os dados vêm de services/dashboardPacienteService.js.
// ============================================================
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { buscarDashboardPaciente } from '../services/dashboardPacienteService'

export function useDashboardPaciente() {
  const { auth } = useAuth()
  const token = auth?.token

  const [dados, setDados] = useState(null)
  const [carga, setCarga] = useState(null) // { tentativa, erro }
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const minhaTentativa = tentativa

    buscarDashboardPaciente(token, signal)
      .then((resultado) => {
        setDados(resultado)
        setCarga({ tentativa: minhaTentativa, erro: '' })
      })
      .catch((e) => {
        if (signal.aborted) return
        setCarga({ tentativa: minhaTentativa, erro: e.message })
      })

    return () => controller.abort()
  }, [token, tentativa])

  const recarregar = useCallback(() => setTentativa((n) => n + 1), [])

  const cargaAtual = carga?.tentativa === tentativa ? carga : null
  const carregando = !cargaAtual
  const erro = cargaAtual?.erro ?? ''

  return { dados: carregando || erro ? null : dados, carregando, erro, recarregar }
}
