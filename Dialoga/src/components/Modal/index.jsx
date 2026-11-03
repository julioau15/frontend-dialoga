// ============================================================
// components/Modal
// Janela por cima da tela (usa o <dialog> nativo do navegador, que já
// trava o foco dentro dela e fecha com a tecla Esc).
// Props:
//   aberto   -> true mostra o modal, false esconde
//   titulo   -> título (também é o nome do modal para leitores de tela)
//   onFechar -> chamado ao clicar no X, no fundo escuro ou apertar Esc
//   children -> conteúdo do modal
//   largura  -> classe de largura máxima (padrão 'max-w-[375px]')
//   rodape   -> botões do rodapé (opcional; aparece com uma linha divisória em cima)
//   comDivisores -> true coloca uma linha divisória embaixo do título (estilo do painel admin)
// ============================================================
import { useEffect, useId, useRef } from 'react'

export default function Modal({ aberto, titulo, onFechar, children, largura = 'max-w-[375px]', rodape, comDivisores = false }) {
  const ref = useRef(null)
  const idTitulo = useId()

  // Sincroniza o estado "aberto" do React com o <dialog> do navegador
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (aberto && !dialog.open) dialog.showModal()
    if (!aberto && dialog.open) dialog.close()
  }, [aberto])

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      className={`m-auto w-[calc(100%-2rem)] ${largura} p-0 bg-branco text-texto border border-borda rounded-2xl shadow-[0_8px_24px_var(--color-sombra-media)] backdrop:bg-overlay backdrop:backdrop-blur-[3px]`}
      onClose={onFechar}
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar() // clique no fundo escuro
      }}
    >
      <div className={comDivisores ? 'text-left' : 'p-6 text-left'}>
        <div className={`flex justify-between gap-3 ${comDivisores ? 'items-center px-6 py-4 border-b border-borda' : 'items-start'}`}>
          <h2 className="text-[14px] font-extrabold text-texto" id={idTitulo}>{titulo}</h2>
          <button
            className="grid place-items-center w-6 h-6 -mt-0.5 -mr-1 border-0 bg-transparent rounded-md text-secundaria cursor-pointer hover:bg-fundo-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
            type="button"
            aria-label="Fechar"
            onClick={onFechar}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {comDivisores ? <div className="p-6">{children}</div> : children}
        {rodape && <div className="flex justify-end gap-3 px-6 py-4 border-t border-borda">{rodape}</div>}
      </div>
    </dialog>
  )
}

