// ============================================================
// hooks/useNotificacoes.js
// Lógica da página de Notificações do paciente e do profissional
// (as telas só desenham). Tudo local, com dados fixos e sem API:
//   - separa as notificações em "Não lidas" e "Histórico" (só as lidas)
//   - conta as não lidas e as lidas (valores calculados)
//   - controla a aba ativa
//   - marca uma notificação ou todas como lidas
//   - controla um único aviso (toast) por vez, inclusive o
//     "Preferências salvas!" que chega da tela de configurações
// Uso: const notificacoes = useNotificacoes(NOTIFICACOES_PACIENTE)
// ============================================================
import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const TOAST_FECHADO = { aberto: false, mensagem: '' }

export function useNotificacoes(notificacoesIniciais) {
  const location = useLocation()
  const navigate = useNavigate()

  const [notificacoes, setNotificacoes] = useState(() => notificacoesIniciais)
  const [aba, setAba] = useState('nao-lidas')
  // Abre o aviso de preferências salvas quando a página é aberta logo depois de salvar
  const [toast, setToast] = useState(() =>
    location.state?.preferenciasSalvas ? { aberto: true, mensagem: 'Preferências salvas!' } : TOAST_FECHADO,
  )

  // Separa as notificações não lidas das lidas, mantendo a ordem da mais nova para a mais antiga
  const naoLidas = useMemo(() => notificacoes.filter((item) => !item.lida), [notificacoes])
  const lidas = useMemo(() => notificacoes.filter((item) => item.lida), [notificacoes])

  // Abas com a contagem calculada de cada uma
  const abas = [
    { id: 'nao-lidas', rotulo: 'Não lidas', contagem: naoLidas.length },
    { id: 'historico', rotulo: 'Histórico', contagem: lidas.length },
  ]

  // Marca uma notificação como lida (ela sai de "Não lidas" e vai para o "Histórico")
  function marcarComoLida(id) {
    setNotificacoes((lista) => lista.map((item) => (item.id === id ? { ...item, lida: true } : item)))
  }

  // Marca todas como lidas e exibe o aviso
  function marcarTodas() {
    setNotificacoes((lista) => lista.map((item) => (item.lida ? item : { ...item, lida: true })))
    setToast({ aberto: true, mensagem: 'Todas marcadas como lidas.' })
  }

  // Exibe um aviso, substituindo o que estiver aberto
  function mostrarToast(mensagem) {
    setToast({ aberto: true, mensagem })
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
    marcarComoLida,
    marcarTodas,
    mostrarToast,
    toast,
    fecharToast,
  }
}
