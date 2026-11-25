// ============================================================
// SeletorTipo
// Botão "pílula" com o tipo de resposta da pergunta (emoji + nome + setinha)
// que abre a lista de tipos (frame "Nova tarefa dropdown - Profissional").
// Teclado: Enter/Espaço abre; ↑/↓ percorrem; Enter escolhe; Esc fecha.
// Props:
//   valor   -> id do tipo atual ('multipla' | 'unica' | 'paragrafo' | 'emocoes' | 'escala')
//   onMudar -> recebe o id do tipo escolhido
//   rotulo  -> nome do campo para leitores de tela (ex.: "Tipo de resposta da pergunta 1")
// ============================================================
import { useEffect, useRef, useState } from 'react'
import { IconeChevronBaixo } from './iconesNovaTarefa'
import { TIPOS_PERGUNTA } from './perguntas'

export default function SeletorTipo({ valor, onMudar, rotulo }) {
  const [aberto, setAberto] = useState(false)
  const raiz = useRef(null)
  const botao = useRef(null)
  const lista = useRef(null)
  const atual = TIPOS_PERGUNTA.find((t) => t.id === valor) ?? TIPOS_PERGUNTA[0]

  // fecha ao clicar fora da lista
  useEffect(() => {
    if (!aberto) return
    function cliqueFora(e) {
      if (!raiz.current?.contains(e.target)) setAberto(false)
    }
    document.addEventListener('mousedown', cliqueFora)
    return () => document.removeEventListener('mousedown', cliqueFora)
  }, [aberto])

  // ao abrir, o foco vai para o tipo marcado
  useEffect(() => {
    if (aberto) lista.current?.querySelector('[aria-selected="true"]')?.focus()
  }, [aberto])

  function escolher(id) {
    onMudar(id)
    setAberto(false)
    botao.current?.focus()
  }

  // setas movem o foco entre as opções; Esc e Tab fecham a lista
  function teclaNaLista(e) {
    const opcoes = [...lista.current.querySelectorAll('[role="option"]')]
    const i = opcoes.indexOf(document.activeElement)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const proximo = e.key === 'ArrowDown' ? Math.min(i + 1, opcoes.length - 1) : Math.max(i - 1, 0)
      opcoes[proximo]?.focus()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setAberto(false)
      botao.current?.focus()
    }
    if (e.key === 'Tab') setAberto(false)
  }

  return (
    <div ref={raiz} className="relative min-w-0">
      <button
        ref={botao}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-label={`${rotulo}: ${atual.rotulo}`}
        onClick={() => setAberto((a) => !a)}
        className="flex h-[30px] max-w-full cursor-pointer items-center gap-1 rounded-lg border border-borda bg-superficie px-2.5 text-[11.5px] sm:gap-1.5 sm:px-3 font-bold text-secundaria-escura transition-colors duration-200 hover:bg-fundo-suave-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
      >
        <span aria-hidden="true">{atual.emoji}</span>
        <span className="truncate">{atual.rotulo}</span>
        <IconeChevronBaixo tamanho={12} className="ml-0.5 text-secundaria sm:ml-1" />
      </button>

      {aberto && (
        <ul
          ref={lista}
          role="listbox"
          aria-label={rotulo}
          onKeyDown={teclaNaLista}
          className="absolute left-0 top-[calc(100%+4px)] z-20 w-[218px] overflow-hidden rounded-xl border border-borda bg-superficie py-0.5 shadow-[0_8px_24px_var(--color-sombra)]"
        >
          {TIPOS_PERGUNTA.map((tipo) => {
            const marcado = tipo.id === valor
            return (
              <li
                key={tipo.id}
                role="option"
                aria-selected={marcado}
                tabIndex={-1}
                onClick={() => escolher(tipo.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    escolher(tipo.id)
                  }
                }}
                className={`flex h-10 cursor-pointer items-center gap-2.5 px-4 text-[13px] outline-0 transition-colors duration-150 hover:bg-fundo-suave-2 focus:bg-fundo-suave-2 ${
                  marcado ? 'bg-fundo-card! text-primaria-texto' : 'text-texto'
                }`}
              >
                <span aria-hidden="true">{tipo.emoji}</span>
                {tipo.rotulo}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
