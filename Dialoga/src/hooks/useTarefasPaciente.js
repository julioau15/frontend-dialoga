// ============================================================
// hooks/useTarefasPaciente.js
// Estado e ações da tela "Tarefas" do paciente, ligados à API.
// Uso:  const { tarefas, carregando, erro, recarregar, criar, ... } = useTarefasPaciente()
//
//   tarefas            -> lista no formato da tela (ver tarefasUtils.js)
//   carregando / erro  -> estado da primeira carga
//   recarregar()       -> busca tudo de novo
//   criar(dados)       -> cria autotarefa { titulo, prazo: 'DD/MM/AAAA', arquivo }
//   concluirAutotarefa(tarefa)
//   carregarRespostas(tarefa)        -> respostas já salvas (formato da tela)
//   salvarRascunho(tarefa, respostas)
//   enviar(tarefa, respostas)
// As ações lançam Error (com .message pronta para o Toast) quando a API falha.
// ============================================================
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  atualizarStatusDestinatario,
  criarAutotarefa,
  gravarRespostas,
  listarMinhasTarefas,
  listarProfissionais,
  listarRespostas,
} from '../services/tarefaPacienteService'
import {
  calcularProgresso,
  dataBrParaIso,
  respostasApiParaTela,
  respostasTelaParaApi,
  tarefaApiParaTela,
} from '../pages/paciente/Tarefas/components/tarefasUtils'

export function useTarefasPaciente() {
  const { auth } = useAuth()
  const token = auth?.token
  const [tarefas, setTarefas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [versao, setVersao] = useState(0) // muda a cada recarregar()

  useEffect(() => {
    const controle = new AbortController()

    async function carregar() {
      setCarregando(true)
      setErro('')
      try {
        const [lista, profissionais] = await Promise.all([
          listarMinhasTarefas(token, controle.signal),
          listarProfissionais(token, controle.signal),
        ])
        const tarefasTela = lista.map((t) => tarefaApiParaTela(t, profissionais))

        // O progresso do rascunho sai das respostas já salvas (o back não guarda a porcentagem).
        const comProgresso = await Promise.all(
          tarefasTela.map(async (t) => {
            if (t.status === 'concluida' || !t.idDestinatario) return t
            try {
              const linhas = await listarRespostas(token, t.idDestinatario, controle.signal)
              const progresso = calcularProgresso(t.perguntas, respostasApiParaTela(t.perguntas, linhas))
              // pendente que já tem resposta aparece como "Em andamento"
              const status = t.status === 'pendente' && progresso > 0 ? 'andamento' : t.status
              return { ...t, progresso, status }
            } catch (e) {
              if (controle.signal.aborted) throw e
              return t // sem o progresso, mas a tarefa continua na lista
            }
          }),
        )
        setTarefas(comProgresso)
      } catch (e) {
        if (controle.signal.aborted) return
        setErro(e.message)
      } finally {
        if (!controle.signal.aborted) setCarregando(false)
      }
    }

    carregar()
    return () => controle.abort()
  }, [token, versao])

  const recarregar = useCallback(() => setVersao((v) => v + 1), [])

  const atualizarLocal = (id, mudancas) =>
    setTarefas((lista) => lista.map((t) => (t.id === id ? { ...t, ...mudancas } : t)))

  // Cria a autotarefa e recarrega a lista (o back devolve só o id, sem o destinatário).
  async function criar({ titulo, prazo, arquivo }) {
    await criarAutotarefa(token, { titulo, prazo: dataBrParaIso(prazo), arquivo })
    recarregar()
  }

  async function concluirAutotarefa(tarefa) {
    await atualizarStatusDestinatario(token, tarefa.idDestinatario, 'concluida')
    atualizarLocal(tarefa.id, { status: 'concluida', statusApi: 'concluida', progresso: 100 })
  }

  async function carregarRespostas(tarefa) {
    const linhas = await listarRespostas(token, tarefa.idDestinatario)
    return respostasApiParaTela(tarefa.perguntas, linhas)
  }

  async function salvarRascunho(tarefa, respostas) {
    await gravarRespostas(token, tarefa.idDestinatario, respostasTelaParaApi(tarefa.perguntas, respostas), false)
    const progresso = calcularProgresso(tarefa.perguntas, respostas)

    // pendente que ganhou resposta vira "andamento" também no banco; atrasada continua atrasada na tela
    let statusApi = tarefa.statusApi
    if (statusApi !== 'andamento' && statusApi !== 'concluida' && progresso > 0) {
      await atualizarStatusDestinatario(token, tarefa.idDestinatario, 'andamento')
      statusApi = 'andamento'
    }
    const status = tarefa.status === 'pendente' && progresso > 0 ? 'andamento' : tarefa.status
    atualizarLocal(tarefa.id, { progresso, status, statusApi })
  }

  async function enviar(tarefa, respostas) {
    // enviar_definitivamente: o back marca a tarefa como concluída e notifica o profissional
    await gravarRespostas(token, tarefa.idDestinatario, respostasTelaParaApi(tarefa.perguntas, respostas), true)
    atualizarLocal(tarefa.id, { status: 'concluida', statusApi: 'concluida', progresso: 100 })
  }

  return { tarefas, carregando, erro, recarregar, criar, concluirAutotarefa, carregarRespostas, salvarRascunho, enviar }
}
