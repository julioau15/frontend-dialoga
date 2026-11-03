// ============================================================
// hooks/useAprovacoes.js
// Guarda a lista de solicitações de profissionais e as ações de aprovar/recusar.
// A tela só chama este hook; quem fala com a API é services/aprovacoesService.js.
//
// Devolve:
//   solicitacoes -> lista no formato das telas (ver normalizarAprovacao)
//   carregando   -> true enquanto busca a lista
//   erro         -> mensagem de erro ao carregar (ou null)
//   aprovar(s)   -> aprova a solicitação s (lança erro se a API falhar)
//   recusar(s)   -> recusa a solicitação s (lança erro se a API falhar)
// ============================================================
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { aprovarProfissional, listarAprovacoes, recusarProfissional } from '../services/aprovacoesService'
import { SOLICITACOES_EXEMPLO } from '../services/aprovacoesExemplo'

// TODO (lógica): mude para false para usar as rotas reais do back-end.
// Com true, as telas rodam só com os dados de exemplo (nada é enviado à API).
const USAR_DADOS_DE_EXEMPLO = true

export default function useAprovacoes() {
  const { auth } = useAuth()
  const [solicitacoes, setSolicitacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const token = auth?.token

  useEffect(() => {
    let cancelado = false

    async function carregar() {
      try {
        const dados = USAR_DADOS_DE_EXEMPLO ? SOLICITACOES_EXEMPLO : await listarAprovacoes(token)
        if (!cancelado) setSolicitacoes(dados)
      } catch (e) {
        if (!cancelado) setErro(e.message)
      } finally {
        if (!cancelado) setCarregando(false)
      }
    }

    carregar()
    return () => { cancelado = true }
  }, [token])

  // Muda o status só na lista local (a tela atualiza contadores e abas sozinha)
  const marcarStatus = useCallback((id, status) => {
    setSolicitacoes((lista) => lista.map((s) => (s.id === id ? { ...s, status } : s)))
  }, [])

  async function aprovar(solicitacao) {
    // TODO (lógica): o back ainda não envia o e-mail de boas-vindas ao aprovar
    if (!USAR_DADOS_DE_EXEMPLO) await aprovarProfissional(solicitacao.idProfissional, token)
    marcarStatus(solicitacao.id, 'aprovado')
  }

  async function recusar(solicitacao) {
    // TODO (lógica): o back ainda não envia o e-mail de notificação ao recusar
    if (!USAR_DADOS_DE_EXEMPLO) await recusarProfissional(solicitacao.idProfissional, token)
    marcarStatus(solicitacao.id, 'recusado')
  }

  return { solicitacoes, carregando, erro, aprovar, recusar }
}
