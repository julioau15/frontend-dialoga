// ============================================================
// hooks/useNotificacoes.js
// Lógica da página de Notificações do paciente e do profissional
// (as telas só desenham), integrada à API:
//   - carrega as notificações do usuário logado (GET /notificacoes)
//   - separa as notificações em "Não lidas" e "Histórico" (só as lidas)
//   - conta as não lidas e as lidas (valores calculados)
//   - controla a aba ativa
//   - marca uma notificação ou todas como lidas na API; a tela muda na hora
//     e volta ao que era se a API recusar
//   - controla um único aviso (toast) por vez, inclusive o
//     "Preferências salvas!" que chega da tela de configurações
//   - atualiza a lista em segundo plano a cada minuto e quando a aba volta a ficar visível
//     (lembretes como "hora da dose" aparecem sem recarregar a página)
// Uso: const notificacoes = useNotificacoes('paciente')
//   perfil -> 'paciente' | 'profissional' (escolhe o destino do "Ver →" do vínculo)
// ============================================================
// ============================================================
// hooks/useNotificacoes.js
// Carrega notificações e controla abas, contadores e leitura.
// Serializa as alterações para evitar rollback conflitante.
// Respostas de uma sessão encerrada não atualizam a sessão atual.
// ============================================================
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  listarNotificacoesRequest,
  marcarNotificacaoLidaRequest,
  marcarTodasLidasRequest,
} from '../services/notificacoesService'
import { converterNotificacoes } from '../utils/notificacoesRecebidas'

const TOAST_FECHADO = { aberto: false, tipo: 'sucesso', mensagem: '' }

// intervalo da atualização em segundo plano das notificações
const INTERVALO_ATUALIZACAO_MS = 60 * 1000

// Compartilha a lógica de notificações dos dois perfis.
export function useNotificacoes(perfil) {
  const location = useLocation()
  const navigate = useNavigate()
  const { auth } = useAuth()
  const token = auth?.token

  // Identifica o conjunto de dados sem expor a credencial na interface.
  const chave = `${perfil}:${token ?? ''}`

  const [remoto, setRemoto] = useState({
    chave: null,
    tentativa: -1,
    lista: [],
    carregado: false,
    erro: '',
    salvando: false,
  })
  const [tentativa, setTentativa] = useState(0)
  const [aba, setAba] = useState('nao-lidas')
  const [toast, setToast] = useState(() =>
    location.state?.preferenciasSalvas
      ? {
          aberto: true,
          tipo: 'sucesso',
          mensagem: 'Preferências salvas!',
        }
      : TOAST_FECHADO,
  )

  // A referência bloqueia cliques repetidos antes do próximo render.
  const escopoRef = useRef(null)

  useEffect(() => {
    const controle = new AbortController()
    const escopo = {
      chave,
      tentativa,
      ativo: true,
      ocupado: false,
      carregado: false,
    }
    escopoRef.current = escopo

    // Carrega somente dados da sessão associada a este efeito.
    async function carregar() {
      try {
        const { notificacoes, categorias } =
          await listarNotificacoesRequest(token, controle.signal)

        if (!escopo.ativo) return

        const lista = converterNotificacoes(
          notificacoes,
          categorias,
          perfil,
        )

        escopo.carregado = true
        setRemoto({
          chave,
          tentativa,
          lista,
          carregado: true,
          erro: '',
          salvando: false,
        })
      } catch (erro) {
        if (!escopo.ativo || controle.signal.aborted) return

        setRemoto({
          chave,
          tentativa,
          lista: [],
          carregado: false,
          erro: erro.message || 'Não foi possível carregar suas notificações.',
          salvando: false,
        })
      }
    }

    carregar()

    // Também invalida respostas de PUT que terminem após sair da tela.
    return () => {
      escopo.ativo = false
      controle.abort()
    }
  }, [token, perfil, chave, tentativa])

  // Atualiza a lista em segundo plano a cada minuto e quando a aba volta a ficar visível.
  // Não mostra "carregando" e descarta a resposta se uma marcação de leitura começou nesse meio-tempo.
  useEffect(() => {
    if (!token) return undefined
    const controle = new AbortController()

    // Relê as notificações só com a aba visível e sem marcação de leitura em andamento.
    async function atualizarEmSegundoPlano() {
      const escopo = escopoRef.current
      if (
        document.visibilityState !== 'visible' ||
        !escopo?.ativo ||
        !escopo.carregado ||
        escopo.ocupado
      ) {
        return
      }

      const versao = escopo.versao ?? 0

      try {
        const { notificacoes, categorias } =
          await listarNotificacoesRequest(token, controle.signal)

        if (
          controle.signal.aborted ||
          escopoRef.current !== escopo ||
          !escopo.ativo ||
          escopo.ocupado ||
          (escopo.versao ?? 0) !== versao
        ) {
          return
        }

        const lista = converterNotificacoes(notificacoes, categorias, perfil)

        setRemoto((atual) =>
          atual.chave === escopo.chave && atual.tentativa === escopo.tentativa
            ? { ...atual, lista }
            : atual,
        )
      } catch {
        // falha silenciosa: mantém a lista que já está na tela
      }
    }

    const intervalo = setInterval(atualizarEmSegundoPlano, INTERVALO_ATUALIZACAO_MS)
    document.addEventListener('visibilitychange', atualizarEmSegundoPlano)

    return () => {
      controle.abort()
      clearInterval(intervalo)
      document.removeEventListener('visibilitychange', atualizarEmSegundoPlano)
    }
  }, [token, perfil])

  const dadosAtuais =
    remoto.chave === chave && remoto.tentativa === tentativa

  const notificacoes = useMemo(
    () => (dadosAtuais ? remoto.lista : []),
    [dadosAtuais, remoto.lista],
  )

  const naoLidas = useMemo(
    () => notificacoes.filter((item) => !item.lida),
    [notificacoes],
  )
  const lidas = useMemo(
    () => notificacoes.filter((item) => item.lida),
    [notificacoes],
  )

  const salvando = dadosAtuais && remoto.salvando
  const erroCarregar = dadosAtuais ? remoto.erro : ''
  const carregando = !dadosAtuais || (!remoto.carregado && !remoto.erro)

  // Exibe apenas um aviso por vez.
  function mostrarToast(mensagem, tipo = 'sucesso') {
    setToast({ aberto: true, tipo, mensagem })
  }

  // Atualiza apenas o estado ainda associado à operação original.
  function atualizarEscopo(escopo, atualizar) {
    if (!escopo.ativo || escopoRef.current !== escopo) return

    setRemoto((atual) => {
      if (
        atual.chave !== escopo.chave ||
        atual.tentativa !== escopo.tentativa
      ) {
        return atual
      }

      return atualizar(atual)
    })
  }

  // Executa uma alteração por vez e desfaz somente os IDs envolvidos.
  async function executarMarcacao(ids, enviar, mensagemSucesso) {
    const escopo = escopoRef.current
    if (
      !token ||
      !escopo?.ativo ||
      escopo.chave !== chave ||
      escopo.tentativa !== tentativa ||
      !escopo.carregado ||
      escopo.ocupado ||
      ids.length === 0
    ) {
      return
    }

    escopo.ocupado = true
    // invalida uma atualização em segundo plano que esteja em andamento
    escopo.versao = (escopo.versao ?? 0) + 1
    const idsAlterados = new Set(ids)

    atualizarEscopo(escopo, (atual) => ({
      ...atual,
      salvando: true,
      lista: atual.lista.map((item) =>
        idsAlterados.has(item.id) ? { ...item, lida: true } : item,
      ),
    }))

    try {
      await enviar()

      if (!escopo.ativo || escopoRef.current !== escopo) return
      mostrarToast(mensagemSucesso)
    } catch (erro) {
      if (!escopo.ativo || escopoRef.current !== escopo) return

      atualizarEscopo(escopo, (atual) => ({
        ...atual,
        lista: atual.lista.map((item) =>
          idsAlterados.has(item.id) ? { ...item, lida: false } : item,
        ),
      }))

      mostrarToast(
        erro.message || 'Não foi possível atualizar a leitura.',
        'erro',
      )
    } finally {
      escopo.ocupado = false
      atualizarEscopo(escopo, (atual) => ({
        ...atual,
        salvando: false,
      }))
    }
  }

  // Aceita somente uma notificação não lida da listagem autenticada.
  function marcarComoLida(id) {
    const item = naoLidas.find((notificacao) => notificacao.id === id)
    if (!item) return

    return executarMarcacao(
      [item.id],
      () => marcarNotificacaoLidaRequest(token, item.id),
      'Notificação marcada como lida.',
    )
  }

  // Marca toda a lista carregada, inclusive itens de outras páginas locais.
  function marcarTodas() {
    return executarMarcacao(
      naoLidas.map((item) => item.id),
      () => marcarTodasLidasRequest(token),
      'Todas marcadas como lidas.',
    )
  }

  // Não permite iniciar uma nova busca durante uma alteração de leitura.
  const recarregar = useCallback(() => {
    if (escopoRef.current?.ocupado) return
    setTentativa((valor) => valor + 1)
  }, [])

  // Trocar de aba também fecha mensagens ligadas à interação anterior.
  function mudarAba(proximaAba) {
    setAba(proximaAba)
    setToast(TOAST_FECHADO)
  }

  const temEstadoNavegacao = location.state != null
  const { pathname } = location

  // Limpa o aviso de preferências para ele não reaparecer ao atualizar.
  const fecharToast = useCallback(() => {
    setToast(TOAST_FECHADO)
    if (temEstadoNavegacao) {
      navigate(pathname, { replace: true, state: null })
    }
  }, [temEstadoNavegacao, pathname, navigate])

  return {
    abas: [
      { id: 'nao-lidas', rotulo: 'Não lidas', contagem: naoLidas.length },
      { id: 'historico', rotulo: 'Histórico', contagem: lidas.length },
    ],
    aba,
    mudarAba,
    itens: aba === 'nao-lidas' ? naoLidas : lidas,
    totalNaoLidas: naoLidas.length,
    carregando,
    erroCarregar,
    salvando,
    recarregar,
    marcarComoLida,
    marcarTodas,
    mostrarToast,
    toast,
    fecharToast,
  }
}
