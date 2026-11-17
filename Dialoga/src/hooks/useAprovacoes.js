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
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  aprovarProfissional,
  listarAprovacoes,
  recusarProfissional,
} from '../services/aprovacoesService'

// Compartilha o carregamento e as decisões do Dashboard Admin.
export default function useAprovacoes() {
  const { auth } = useAuth()
  const token = auth?.token
  const nivel = auth?.nivel

  const [tentativa, setTentativa] = useState(0)
  const [estado, setEstado] = useState({
    token: null,
    tentativa: -1,
    solicitacoes: [],
    erro: null,
    carregado: false,
    enviando: false,
  })
  const escopoRef = useRef(null)

  useEffect(() => {
    const controle = new AbortController()
    const escopo = {
      token,
      tentativa,
      ativo: true,
      ocupado: false,
      lista: [],
    }
    escopoRef.current = escopo

    // O cancelamento invalida a resposta sem alterar a próxima sessão.
    async function carregar() {
      try {
        if (nivel !== 0) {
          throw new Error('Acesso permitido somente a administradores.')
        }

        const lista = await listarAprovacoes(token, controle.signal)
        if (!escopo.ativo) return

        escopo.lista = lista
        setEstado({
          token,
          tentativa,
          solicitacoes: lista,
          erro: null,
          carregado: true,
          enviando: false,
        })
      } catch (erro) {
        if (!escopo.ativo || controle.signal.aborted) return

        setEstado({
          token,
          tentativa,
          solicitacoes: [],
          erro: erro.message || 'Não foi possível carregar as solicitações.',
          carregado: true,
          enviando: false,
        })
      }
    }

    carregar()

    return () => {
      escopo.ativo = false
      controle.abort()
    }
  }, [token, nivel, tentativa])

  const atual =
    estado.token === token &&
    estado.tentativa === tentativa

  // Só modifica o estado associado à requisição ainda ativa.
  function atualizar(escopo, transformar) {
    if (!escopo.ativo || escopoRef.current !== escopo) return

    setEstado((anterior) => {
      if (
        anterior.token !== escopo.token ||
        anterior.tentativa !== escopo.tentativa
      ) {
        return anterior
      }

      return transformar(anterior)
    })
  }

  // Serializa decisões e rejeita ações sobre itens já decididos.
  async function registrarDecisao(solicitacao, status, enviar) {
    const escopo = escopoRef.current

    if (
      !escopo?.ativo ||
      escopo.token !== token ||
      escopo.tentativa !== tentativa ||
      escopo.ocupado
    ) {
      return false
    }

    const item = escopo.lista.find(
      (registro) => registro.id === solicitacao?.id,
    )

    if (!item || item.status !== 'pendente') {
      throw new Error('Esta solicitação não está disponível para decisão.')
    }

    escopo.ocupado = true
    atualizar(escopo, (anterior) => ({ ...anterior, enviando: true }))

    try {
      await enviar(item.idProfissional, token)

      if (!escopo.ativo || escopoRef.current !== escopo) return false

      // O endpoint decide por profissional e pode afetar mais de uma linha.
      escopo.lista = escopo.lista.map((registro) =>
        registro.idProfissional === item.idProfissional
          ? { ...registro, status }
          : registro,
      )

      atualizar(escopo, (anterior) => ({
        ...anterior,
        solicitacoes: escopo.lista,
      }))

      return true
    } catch (erro) {
      if (!escopo.ativo || escopoRef.current !== escopo) return false
      throw erro
    } finally {
      escopo.ocupado = false
      atualizar(escopo, (anterior) => ({
        ...anterior,
        enviando: false,
      }))
    }
  }

  // TODO (lógica): o back ainda não envia o e-mail de boas-vindas ao aprovar
  // Em falha, o status permanece inalterado, sem precisar de rollback.
  function aprovar(solicitacao) {
    return registrarDecisao(solicitacao, 'aprovado', aprovarProfissional)
  }

  // TODO (lógica): o back ainda não envia o e-mail de notificação ao recusar
  // Mantém a mesma proteção usada na aprovação.
  function recusar(solicitacao) {
    return registrarDecisao(solicitacao, 'recusado', recusarProfissional)
  }

  // Permite nova tentativa sem atualizar a página inteira.
  const recarregar = useCallback(() => {
    if (escopoRef.current?.ocupado) return
    setTentativa((valor) => valor + 1)
  }, [])

  return {
    solicitacoes: atual ? estado.solicitacoes : [],
    carregando: !atual || !estado.carregado,
    erro: atual ? estado.erro : null,
    enviando: atual && estado.enviando,
    recarregar,
    aprovar,
    recusar,
  }
}
