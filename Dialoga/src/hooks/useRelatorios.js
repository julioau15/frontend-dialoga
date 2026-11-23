// ============================================================
// hooks/useRelatorios.js
// Dados da tela Relatórios do paciente (a página só desenha).
//   const rel = useRelatorios()
//   rel.registros     -> registros de humor (todos; a tela filtra pelo período)
//   rel.solicitacoes  -> solicitações de acesso dos profissionais
//   rel.tarefas       -> tarefas do paciente
//   rel.carregando / rel.erro / rel.recarregar()
//   rel.responderSolicitacao(solicitacao, acao, indicadores?) -> grava na API e atualiza a lista
//     acao: 'aprovado' | 'recusado' (pendente), 'editado' (muda as permissões) ou 'removido'
//     (retira o acesso; sai da lista). Lança Error com .message pronta para a tela.
// ============================================================
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  alterarPermissoesAcesso,
  aprovarSolicitacaoAcesso,
  buscarRegistrosHumor,
  buscarSolicitacoesAcesso,
  buscarTarefasDoPaciente,
  recusarSolicitacaoAcesso,
  removerAcesso,
} from '../services/relatoriosService'

const VAZIO = { registros: [], solicitacoes: [], tarefas: [] }

export function useRelatorios() {
  const { auth } = useAuth()
  const token = auth?.token

  const [dados, setDados] = useState(VAZIO)
  const [carga, setCarga] = useState(null) // { tentativa, erro }
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const minhaTentativa = tentativa

    Promise.all([buscarRegistrosHumor(token, signal), buscarSolicitacoesAcesso(token, signal), buscarTarefasDoPaciente(token, signal)])
      .then(([registros, solicitacoes, tarefas]) => {
        setDados({ registros, solicitacoes, tarefas })
        setCarga({ tentativa: minhaTentativa, erro: '' })
      })
      .catch((e) => {
        if (signal.aborted) return
        setCarga({ tentativa: minhaTentativa, erro: e.message })
      })

    return () => controller.abort()
  }, [token, tentativa])

  const recarregar = useCallback(() => setTentativa((n) => n + 1), [])

  async function responderSolicitacao(solicitacao, acao, indicadores) {
    if (acao === 'removido') {
      await removerAcesso(token, solicitacao.id)
      setDados((atual) => ({ ...atual, solicitacoes: atual.solicitacoes.filter((s) => s.id !== solicitacao.id) }))
      return
    }

    if (acao === 'aprovado') await aprovarSolicitacaoAcesso(token, solicitacao.id, indicadores)
    else if (acao === 'editado') await alterarPermissoesAcesso(token, solicitacao.id, indicadores)
    else await recusarSolicitacaoAcesso(token, solicitacao.id)

    // 'editado' continua aprovado, só com outras permissões
    const status = acao === 'recusado' ? 'recusado' : 'aprovado'
    setDados((atual) => ({
      ...atual,
      solicitacoes: atual.solicitacoes.map((s) =>
        s.id === solicitacao.id ? { ...s, status, indicadores: status === 'aprovado' ? indicadores : [] } : s,
      ),
    }))
  }

  const cargaAtual = carga?.tentativa === tentativa ? carga : null

  return {
    ...dados,
    carregando: !cargaAtual,
    erro: cargaAtual?.erro ?? '',
    recarregar,
    responderSolicitacao,
  }
}
