// ============================================================
// components/GoogleButton
// Botão "Continuar com Google" (visual do Dialoga).
// Usa o Google Identity Services: o botão oficial do Google fica
// invisível POR CIMA do nosso botão, então o clique abre o popup de
// login do Google e devolve um ID token (credential).
// Props:
//   onCredential(credential) -> chamado com o ID token quando o Google autentica
//   onErro(mensagem)         -> chamado se o Google não carregar (ex.: bloqueador de anúncios)
//   disabled                 -> bloqueia o clique (ex.: enquanto o login está carregando)
// ============================================================
import { useEffect, useRef, useState } from 'react'
import Button from '../Button'
import iconeGoogle from '../../assets/auth/Google.png'
import { GOOGLE_CLIENT_ID } from '../../config/google'

const SCRIPT_GOOGLE = 'https://accounts.google.com/gsi/client'
const LARGURA_MAX = 400 // limite do botão do Google

// Carrega o script do Google uma única vez e devolve a Promise do objeto "google"
let promessaScript = null
function carregarScriptGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google)
  if (!promessaScript) {
    promessaScript = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = SCRIPT_GOOGLE
      script.async = true
      script.defer = true
      script.onload = () => resolve(window.google)
      script.onerror = () => {
        promessaScript = null // permite tentar de novo
        reject(new Error('Falha ao carregar o Google'))
      }
      document.head.appendChild(script)
    })
  }
  return promessaScript
}

export default function GoogleButton({ onCredential, onErro, disabled }) {
  const caixaRef = useRef(null)
  const googleRef = useRef(null)

  // Mantém os callbacks mais recentes sem precisar reiniciar o Google a cada render
  const callbacks = useRef({ onCredential, onErro })
  useEffect(() => {
    callbacks.current = { onCredential, onErro }
  })

  const [largura, setLargura] = useState(0)

  // Acompanha a largura do nosso botão para o do Google cobrir exatamente a mesma área
  useEffect(() => {
    const caixa = caixaRef.current
    if (!caixa) return
    const medir = () => setLargura(Math.min(Math.floor(caixa.getBoundingClientRect().width), LARGURA_MAX))
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(caixa)
    return () => observador.disconnect()
  }, [])

  // Inicializa o Google e desenha o botão invisível por cima do nosso
  useEffect(() => {
    let cancelado = false
    const destino = googleRef.current
    if (!destino || !largura) return

    carregarScriptGoogle()
      .then((google) => {
        if (cancelado) return
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resposta) => {
            if (resposta?.credential) callbacks.current.onCredential?.(resposta.credential)
          },
        })
        destino.innerHTML = ''
        google.accounts.id.renderButton(destino, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          locale: 'pt-BR',
          width: largura,
        })
      })
      .catch(() => {
        if (!cancelado) callbacks.current.onErro?.('Não foi possível carregar o login do Google. Verifique sua conexão ou desative bloqueadores.')
      })

    return () => {
      cancelado = true
    }
  }, [largura])

  return (
    <div ref={caixaRef} className="relative">
      {/* Nosso botão (só visual: o clique de verdade acontece no botão do Google por cima) */}
      <Button type="button" variante="contorno" disabled={disabled} tabIndex={-1} aria-hidden="true">
        <img src={iconeGoogle} alt="" width="34" height="50" className="w-[34px] h-[50px] max-w-none object-contain" />
        Continuar com Google
      </Button>

      {/* Botão oficial do Google, transparente, cobrindo o nosso */}
      <div
        ref={googleRef}
        role="button"
        aria-label="Continuar com Google"
        className={`absolute inset-0 flex items-center justify-center overflow-hidden opacity-0 ${disabled ? 'pointer-events-none' : ''}`}
      />
    </div>
  )
}
