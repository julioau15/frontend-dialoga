// ============================================================
// hooks/useFormularioTarefa.js
// Dados das telas Nova tarefa e Editar tarefa do profissional.
//
//   usePacientesParaTarefa(token)
//     -> { pacientes, carregando, erro }   pacientes que podem receber tarefa: [{ id, nome, origem }]
//
//   useTarefaParaEdicao(token, idTarefa)   (para buscar de novo, monte a tela com outra "key")
//     -> { inicial, carregando, erro, naoEncontrada }
//     inicial: { dados, perguntas, original }, o formato que a tela NovaTarefa espera em "inicial":
//       dados     -> { titulo, instrucoes, arquivo (nome), arquivoFile, anexoUrl, pacientes: [{ id, nome, comPrazo, prazo }] }
//       perguntas -> perguntas do formulário (cada uma com idApi, o id no banco)
//       original  -> o que veio da API (a tarefa, os ids das perguntas e os destinatários), usado para calcular o que mudou ao salvar
// ============================================================
import { useEffect, useState } from 'react'
import { buscarTarefa, listarDestinatarios, listarPacientesParaTarefa, listarTarefas } from '../services/tarefaProfissionalService'
import { nomeDoArquivo, perguntaApiParaForm, prazoParaIso } from '../utils/tarefasProfissional'

export function usePacientesParaTarefa(token) {
  const [estado, setEstado] = useState({ pacientes: [], carregando: true, erro: '' })

  useEffect(() => {
    const controller = new AbortController()
    listarPacientesParaTarefa(token, controller.signal)
      .then((pacientes) => setEstado({ pacientes, carregando: false, erro: '' }))
      .catch((e) => {
        if (controller.signal.aborted) return
        setEstado({ pacientes: [], carregando: false, erro: e.message })
      })
    return () => controller.abort()
  }, [token])

  return estado
}

export function useTarefaParaEdicao(token, idTarefa) {
  const [estado, setEstado] = useState({ inicial: null, carregando: true, erro: '', naoEncontrada: false })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function carregar() {
      try {
        // GET /tarefas devolve só as tarefas deste profissional: serve para não abrir a de outra pessoa pela URL
        const [minhas, tarefa, destinatarios] = await Promise.all([
          listarTarefas(token, signal),
          buscarTarefa(token, idTarefa, signal),
          listarDestinatarios(token, idTarefa, signal),
        ])
        if (!tarefa || !minhas.some((t) => t.id === tarefa.id)) {
          setEstado({ inicial: null, carregando: false, erro: '', naoEncontrada: true })
          return
        }

        const perguntasApi = [...(tarefa.perguntas ?? [])].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
        const inicial = {
          dados: {
            titulo: tarefa.titulo ?? '',
            instrucoes: tarefa.instrucoes ?? '',
            arquivo: tarefa.anexo_arquivo ? nomeDoArquivo(tarefa.anexo_arquivo) : null,
            arquivoFile: null,
            anexoUrl: tarefa.anexo_arquivo ?? null,
            pacientes: destinatarios.map((d) => {
              const prazo = prazoParaIso(d.prazo) ?? ''
              return { id: d.id_paciente, nome: d.nome_paciente, origem: 'plataforma', comPrazo: Boolean(prazo), prazo }
            }),
          },
          perguntas: perguntasApi.map(perguntaApiParaForm),
          original: { tarefa, perguntasIds: perguntasApi.map((p) => p.id), destinatarios },
        }
        setEstado({ inicial, carregando: false, erro: '', naoEncontrada: false })
      } catch (e) {
        if (signal.aborted) return
        setEstado({ inicial: null, carregando: false, erro: e.message, naoEncontrada: false })
      }
    }

    carregar()
    return () => controller.abort()
  }, [token, idTarefa])

  return estado
}
