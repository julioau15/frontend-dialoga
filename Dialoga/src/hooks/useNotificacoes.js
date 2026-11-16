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
// Uso: const notificacoes = useNotificacoes('paciente')
//   perfil -> 'paciente' | 'profissional' (escolhe o destino do "Ver →" do vínculo)
// ============================================================
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  listarNotificacoesRequest,
  marcarNotificacaoLidaRequest,
  marcarTodasLidasRequest,
} from '../services/notificacoesService'
import { converterNotificacoes } from '../utils/notificacoesRecebidas'

const TOAST_FECHADO = { aberto: false, tipo: 'sucesso', mensagem: '' }
const REMOTO_INICIAL = { carregado: false, erro: '' }

export function useNotificacoes(perfil) {
  const location = useLocation()
  const navigate = useNavigate()
  const { auth } = useAuth()
  const token = auth?.token

  const [notificacoes, setNotificacoes] = useState([])
  // Situação da busca na API (carregado / mensagem de erro)
  const [remoto, setRemoto] = useState(REMOTO_INICIAL)
  // Muda para buscar de novo ("Tentar novamente")
  const [tentativa, setTentativa] = useState(0)
  const [aba, setAba] = useState('nao-lidas')
  // Abre o aviso de preferências salvas quando a página é aberta logo depois de salvar
  const [toast, setToast] = useState(() =>
    location.state?.preferenciasSalvas
      ? { aberto: true, tipo: 'sucesso', mensagem: 'Preferências salvas!' }
      : TOAST_FECHADO,
  )

  // Busca as notificações do usuário logado
  useEffect(() => {
    const controle = new AbortController()

    listarNotificacoesRequest(token, controle.signal)
      .then(({ notificacoes: linhas, categorias }) => {
        setNotificacoes(converterNotificacoes(linhas, categorias, perfil))
        setRemoto({ carregado: true, erro: '' })
      })
      .catch((erro) => {
        if (controle.signal.aborted) return // saiu da tela antes da resposta
        setRemoto({ carregado: false, erro: erro.message })
      })

    // cancela se a pessoa sair da tela antes da resposta chegar
    return () => controle.abort()
  }, [token, perfil, tentativa])

  // Tenta buscar as notificações de novo depois de uma falha
  const recarregar = useCallback(() => {
    setRemoto(REMOTO_INICIAL)
    setTentativa((valor) => valor + 1)
  }, [])

  // Separa as notificações não lidas das lidas, mantendo a ordem da mais nova para a mais antiga
  const naoLidas = useMemo(() => notificacoes.filter((item) => !item.lida), [notificacoes])
  const lidas = useMemo(() => notificacoes.filter((item) => item.lida), [notificacoes])

  // Abas com a contagem calculada de cada uma
  const abas = [
    { id: 'nao-lidas', rotulo: 'Não lidas', contagem: naoLidas.length },
    { id: 'historico', rotulo: 'Histórico', contagem: lidas.length },
  ]

  // Muda o "lida" das notificações com os ids informados
  function definirLida(ids, lida) {
    setNotificacoes((lista) => lista.map((item) => (ids.includes(item.id) ? { ...item, lida } : item)))
  }

  // Exibe um aviso, substituindo o que estiver aberto
  function mostrarToast(mensagem, tipo = 'sucesso') {
    setToast({ aberto: true, tipo, mensagem })
  }

  // Marca uma notificação como lida (ela sai de "Não lidas" e vai para o "Histórico")
  async function marcarComoLida(id) {
    definirLida([id], true)
    try {
      await marcarNotificacaoLidaRequest(token, id)
    } catch (erro) {
      definirLida([id], false)
      mostrarToast(erro.message, 'erro')
    }
  }

  // Marca todas como lidas e exibe o aviso
  async function marcarTodas() {
    const ids = naoLidas.map((item) => item.id)
    if (ids.length === 0) return
    definirLida(ids, true)
    try {
      await marcarTodasLidasRequest(token)
      mostrarToast('Todas marcadas como lidas.')
    } catch (erro) {
      definirLida(ids, false)
      mostrarToast(erro.message, 'erro')
    }
  }

  // Fecha o aviso e limpa o estado da navegação, para o aviso não voltar ao recarregar a página;
  // estável para o tempo do Toast não reiniciar a cada render
  const temEstadoNavegacao = location.state != null
  const { pathname } = location
  const fecharToast = useCallback(() => {
    setToast(TOAST_FECHADO)
    if (temEstadoNavegacao) navigate(pathname, { replace: true, state: null })
  }, [temEstadoNavegacao, pathname, navigate])

  return {
    abas,
    aba,
    mudarAba: setAba,
    itens: aba === 'nao-lidas' ? naoLidas : lidas,
    totalNaoLidas: naoLidas.length,
    carregando: !remoto.carregado && !remoto.erro,
    erroCarregar: remoto.erro,
    recarregar,
    marcarComoLida,
    marcarTodas,
    mostrarToast,
    toast,
    fecharToast,
  }
}
