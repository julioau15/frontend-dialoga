// ============================================================
// hooks/useTarefasProfissional.js
// Carrega a lista de Tarefas do profissional (tela /profissional/tarefas) na API.
//   const { tarefas, carregando, erro, recarregar } = useTarefasProfissional(token)
//   tarefas -> [{ id, titulo, total_perguntas, prazo, status, is_rascunho, idEnvio }] (ver tarefaApiParaLista)
//
// A API não resume o andamento da tarefa: para cada tarefa já enviada busca os destinatários
// (GET /tarefas-destinatarios?id_tarefa=) e calcula o status e o prazo da lista.
// Se só os destinatários de uma tarefa falharem, ela aparece como "Pendente" em vez de derrubar a lista.
// ============================================================
import { useCallback, useEffect, useState } from 'react'
import { listarDestinatarios, listarTarefas } from '../services/tarefaProfissionalService'
import { paraBooleano, tarefaApiParaLista } from '../utils/tarefasProfissional'

export function useTarefasProfissional(token) {
  const [tarefas, setTarefas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0) // +1 = buscar tudo de novo

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function carregar() {
      try {
        const lista = await listarTarefas(token, signal)
        const itens = await Promise.all(
          lista.map(async (tarefa) => {
            if (paraBooleano(tarefa.is_rascunho)) return tarefaApiParaLista(tarefa, [])
            const destinatarios = await listarDestinatarios(token, tarefa.id, signal).catch((e) => {
              if (signal.aborted) throw e
              return []
            })
            return tarefaApiParaLista(tarefa, destinatarios)
          }),
        )
        setTarefas(itens)
        setErro('')
      } catch (e) {
        if (signal.aborted) return
        setErro(e.message)
      } finally {
        if (!signal.aborted) setCarregando(false)
      }
    }

    carregar()
    return () => controller.abort()
  }, [token, tentativa])

  const recarregar = useCallback(() => {
    setCarregando(true)
    setTentativa((n) => n + 1)
  }, [])

  return { tarefas, carregando, erro, recarregar }
}
