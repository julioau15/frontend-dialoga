// ============================================================
// components/Toast
// Aviso rápido no canto inferior direito (some sozinho depois de 4 s).
// A largura acompanha o texto, em qualquer tela; frases longas quebram a linha.
// Props:
//   aberto   -> mostra ou esconde
//   tipo     -> 'sucesso' (verde, ✓) | 'erro' (vermelho, !)
//   mensagem -> texto do aviso
//   onFechar -> chamado quando o tempo acaba
// ============================================================
import { useEffect } from 'react'
import { IconeAlerta, IconeCheck } from '../Icones'

const TEMPO_MS = 4000

const TIPOS = {
  // verde mais escuro: texto branco de 12px precisa de 4,5:1 (com bg-sucesso dava 3,8:1)
  sucesso: { classes: 'bg-sucesso-escura', Icone: IconeCheck },
  erro: { classes: 'bg-erro', Icone: IconeAlerta },
}

export default function Toast({ aberto, tipo = 'sucesso', mensagem, onFechar }) {
  useEffect(() => {
    if (!aberto) return
    const timer = setTimeout(onFechar, TEMPO_MS)
    return () => clearTimeout(timer)
  }, [aberto, mensagem, onFechar])

  if (!aberto) return null
  const { classes, Icone } = TIPOS[tipo]

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 max-w-[calc(100%-3rem)] flex items-center gap-3 px-4 py-3 rounded-lg text-[12px] font-semibold text-branco shadow-[0_4px_12px_var(--color-sombra-media)] ${classes}`}
    >
      <Icone tamanho={14} className="shrink-0" />
      <span>{mensagem}</span>
    </div>
  )
}
