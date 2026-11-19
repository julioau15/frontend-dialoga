// ============================================================
// hooks/useLembreteDoses.js
// Avisa o paciente, em qualquer página, quando chega um lembrete de dose:
//   - consulta GET /notificacoes a cada minuto e quando a aba volta a ficar visível;
//   - lembrete de dose = notificação não lida com referencia_evento 'dose:<id>';
//   - na primeira consulta, só avisa os lembretes criados nos últimos minutos
//     (os antigos já foram vistos na tela de Notificações);
//   - cada lembrete gera o aviso uma única vez enquanto a sessão estiver aberta;
//   - na própria tela de Notificações não avisa (a lista já mostra o lembrete).
// Uso: const { toast, fecharToast } = useLembreteDoses()
// ============================================================
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { listarNotificacoesRequest } from '../services/notificacoesService'

const TOAST_FECHADO = { aberto: false, tipo: 'sucesso', mensagem: '' }

// intervalo entre as consultas de lembretes
const INTERVALO_MS = 60 * 1000

// na primeira consulta, lembretes mais novos que isso ainda geram o aviso
const JANELA_PRIMEIRA_CARGA_MS = 5 * 60 * 1000

const ROTA_NOTIFICACOES = '/paciente/notificacoes'

// Diz se a notificação é um lembrete de dose ainda não lido.
function ehLembreteDose(notificacao) {
  const lida = Number(notificacao?.lida) === 1 || notificacao?.lida === true
  return !lida && String(notificacao?.referencia_evento ?? '').startsWith('dose:')
}

// Diz se a notificação foi criada há menos de JANELA_PRIMEIRA_CARGA_MS.
function ehRecente(notificacao) {
  const criacao = new Date(notificacao?.data_criacao).getTime()
  return !Number.isNaN(criacao) && Date.now() - criacao <= JANELA_PRIMEIRA_CARGA_MS
}

// Monta o texto do aviso: o próprio lembrete quando é um só, a contagem quando são vários.
function textoDoAviso(novos) {
  if (novos.length === 1) return novos[0].titulo_mensagem || 'Hora de tomar a sua dose.'
  return `Você tem ${novos.length} lembretes de dose.`
}

// Consulta os lembretes de dose e devolve o estado do aviso para o layout do paciente.
export function useLembreteDoses() {
  const { auth } = useAuth()
  const token = auth?.token
  const { pathname } = useLocation()
  const [toast, setToast] = useState(TOAST_FECHADO)

  // rota atual lida dentro do intervalo sem reiniciar a consulta a cada navegação
  const rotaRef = useRef(pathname)
  useEffect(() => {
    rotaRef.current = pathname
  }, [pathname])

  useEffect(() => {
    if (!token) return undefined
    const controle = new AbortController()
    // ids já avisados (ou já existentes) nesta sessão
    const vistos = new Set()
    let primeiraConsulta = true
    let consultando = false

    // Busca as notificações e avisa os lembretes de dose que ainda não foram mostrados.
    async function verificar() {
      if (consultando || document.visibilityState !== 'visible') return
      consultando = true
      try {
        const { notificacoes } = await listarNotificacoesRequest(token, controle.signal)
        if (controle.signal.aborted) return

        const lembretes = notificacoes.filter(ehLembreteDose)
        const novos = lembretes.filter((item) =>
          !vistos.has(item.id) && (!primeiraConsulta || ehRecente(item)))

        lembretes.forEach((item) => vistos.add(item.id))
        primeiraConsulta = false

        if (novos.length > 0 && rotaRef.current !== ROTA_NOTIFICACOES) {
          setToast({ aberto: true, tipo: 'sucesso', mensagem: textoDoAviso(novos) })
        }
      } catch {
        // falha silenciosa: tenta de novo na próxima consulta
      } finally {
        consultando = false
      }
    }

    verificar()
    const intervalo = setInterval(verificar, INTERVALO_MS)
    document.addEventListener('visibilitychange', verificar)

    return () => {
      controle.abort()
      clearInterval(intervalo)
      document.removeEventListener('visibilitychange', verificar)
    }
  }, [token])

  // O Toast usa esta função dentro de um useEffect; o useCallback evita reiniciar o tempo do aviso.
  const fecharToast = useCallback(() => setToast((atual) => ({ ...atual, aberto: false })), [])

  return { toast, fecharToast }
}
