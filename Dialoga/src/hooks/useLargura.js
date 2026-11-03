// ============================================================
// hooks/useLargura.js
// Mede a largura (em px) de um elemento e atualiza quando ela muda.
// Usado pelos gráficos em SVG para se desenhar no tamanho real da tela.
//   const [ref, largura] = useLargura()
//   <div ref={ref}> ... usa "largura" ... </div>
// ============================================================
import { useEffect, useRef, useState } from 'react'

export function useLargura() {
  const ref = useRef(null)
  const [largura, setLargura] = useState(0)

  useEffect(() => {
    const elemento = ref.current
    if (!elemento || typeof ResizeObserver === 'undefined') return

    // o ResizeObserver já avisa o tamanho assim que começa a observar
    const observador = new ResizeObserver(([entrada]) => setLargura(entrada.contentRect.width))
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  return [ref, largura]
}
