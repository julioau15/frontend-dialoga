// ============================================================
// hooks/useAcompanhamentoTarefas.js
// Dados das telas de Acompanhamento de respostas e de Resposta da tarefa (profissional).
//
//   useAcompanhamentoTarefas(token)
//     -> { itens, carregando, erro, recarregar }
//     itens: um por envio (tbl_tarefa_destinatario) das tarefas já enviadas:
//            { id, tarefa: { id, titulo, descricao }, paciente, status, ultimaModificacao }
//
//   useRespostaTarefa(token, idDestinatario)
//     -> { item, carregando, erro, naoEncontrado, recarregar }
//     item: o mesmo formato + respostas: [{ pergunta, tipo, resposta }]
//
// O id do item é o do destinatário: é ele que a rota /profissional/tarefas/acompanhamento/:id usa.
// ============================================================
import { useCallback, useEffect, useState } from 'react'
import {
  buscarDestinatario,
  buscarTarefa,
  listarDestinatarios,
  listarPacientesVinculados,
  listarRespostas,
  listarTarefas,
} from '../services/tarefaProfissionalService'
import {
  destinatarioParaItem,
  montarRespostas,
  pacienteParaAcompanhamento,
  paraBooleano,
  statusAcompanhamentoDe,
  ultimaRespostaEm,
} from '../utils/tarefasProfissional'

// A lista de pacientes só enfeita (e-mail, telefone): se falhar, o nome do envio basta
const pacientesOuVazio = (token, signal) =>
  listarPacientesVinculados(token, signal).catch((e) => {
    if (signal?.aborted) throw e
    return []
  })

export function useAcompanhamentoTarefas(token) {
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function carregar() {
      try {
        const [tarefas, pacientes] = await Promise.all([listarTarefas(token, signal), pacientesOuVazio(token, signal)])
        const porId = new Map(pacientes.map((p) => [p.id, p]))
        const enviadas = tarefas.filter((t) => !paraBooleano(t.is_rascunho))

        const grupos = await Promise.all(
          enviadas.map(async (tarefa) => {
            const destinatarios = await listarDestinatarios(token, tarefa.id, signal)
            return Promise.all(
              destinatarios.map(async (d) => {
                // quem está respondendo: a data da última resposta salva é a "última modificação"
                const ultima =
                  statusAcompanhamentoDe(d.status) === 'em_andamento'
                    ? ultimaRespostaEm(await listarRespostas(token, d.id, signal).catch(() => []))
                    : null
                const paciente = pacienteParaAcompanhamento(porId.get(d.id_paciente) ?? { id: d.id_paciente }, d.nome_paciente)
                return destinatarioParaItem(d, tarefa, paciente, ultima)
              }),
            )
          }),
        )

        // mais recentes primeiro ('AAAA-MM-DD' ordena como texto; empate: envio mais novo)
        setItens(grupos.flat().sort((a, b) => b.ultimaModificacao.localeCompare(a.ultimaModificacao) || b.id - a.id))
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

  return { itens, carregando, erro, recarregar }
}

export function useRespostaTarefa(token, idDestinatario) {
  const [item, setItem] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [naoEncontrado, setNaoEncontrado] = useState(false)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function carregar() {
      try {
        const destinatario = await buscarDestinatario(token, idDestinatario, signal)
        if (!destinatario) {
          setNaoEncontrado(true)
          return
        }

        const [tarefa, linhas, pacientes, envios] = await Promise.all([
          buscarTarefa(token, destinatario.id_tarefa, signal),
          listarRespostas(token, destinatario.id, signal),
          pacientesOuVazio(token, signal),
          listarDestinatarios(token, destinatario.id_tarefa, signal).catch(() => []),
        ])
        if (!tarefa) {
          setNaoEncontrado(true)
          return
        }

        const nomeDoEnvio = envios.find((e) => e.id === destinatario.id)?.nome_paciente
        const paciente = pacienteParaAcompanhamento(
          pacientes.find((p) => p.id === destinatario.id_paciente) ?? { id: destinatario.id_paciente },
          nomeDoEnvio,
        )
        const base = destinatarioParaItem(destinatario, tarefa, paciente, ultimaRespostaEm(linhas))

        setItem({ ...base, respostas: montarRespostas(destinatario.perguntas ?? tarefa.perguntas, linhas) })
        setNaoEncontrado(false)
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
  }, [token, idDestinatario, tentativa])

  const recarregar = useCallback(() => {
    setCarregando(true)
    setTentativa((n) => n + 1)
  }, [])

  return { item, carregando, erro, naoEncontrado, recarregar }
}
