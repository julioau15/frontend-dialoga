// ============================================================
// components/SelectMultiplo
// Dropdown com seleção múltipla (várias opções marcadas ao mesmo tempo).
// Props:
//   opcoes       -> [{ id, texto }]
//   selecionados -> lista de ids marcados
//   onAlternar   -> função(id) chamada ao marcar/desmarcar uma opção
//   placeholder  -> texto quando nada está selecionado
//   icone        -> imagem (import) mostrada à esquerda (opcional)
//   erro         -> mensagem de erro (borda vermelha)
//   desabilitado -> bloqueia a abertura (ex.: enquanto carrega)
//   ariaLabelledby -> id do rótulo que descreve o campo
// Fecha ao clicar fora ou ao apertar Esc.
// ============================================================
import { useEffect, useRef, useState } from 'react'

export default function SelectMultiplo({
  opcoes = [],
  selecionados = [],
  onAlternar,
  placeholder = 'Selecione',
  icone,
  erro,
  desabilitado = false,
  ariaLabelledby,
}) {
  const [aberto, setAberto] = useState(false)
  const raiz = useRef(null)

  // Fecha ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!aberto) return
    function fora(e) {
      if (raiz.current && !raiz.current.contains(e.target)) setAberto(false)
    }
    function esc(e) {
      if (e.key === 'Escape') setAberto(false)
    }
    document.addEventListener('mousedown', fora)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fora)
      document.removeEventListener('keydown', esc)
    }
  }, [aberto])

  const marcadas = opcoes.filter((o) => selecionados.includes(o.id))
  const resumo =
    marcadas.length === 0
      ? placeholder
      : marcadas.length === 1
        ? marcadas[0].texto
        : `${marcadas.length} especialidades selecionadas`

  return (
    <div className="flex flex-col gap-2" ref={raiz}>
      <div className="relative">
        <button
          type="button"
          disabled={desabilitado}
          aria-haspopup="listbox"
          aria-expanded={aberto}
          aria-labelledby={ariaLabelledby}
          aria-invalid={!!erro}
          className={`flex items-center gap-2 w-full h-10 px-3 bg-branco border rounded-lg text-left cursor-pointer transition-[border-color,box-shadow] duration-200 ease-[ease] focus-visible:outline-0 focus-visible:border-primaria focus-visible:shadow-[0_0_0_3px_var(--color-primaria-alfa-20)] disabled:opacity-60 disabled:cursor-not-allowed ${
            erro ? 'border-erro' : aberto ? 'border-primaria' : 'border-borda'
          }`}
          onClick={() => setAberto((a) => !a)}
        >
          {icone && <img className="w-4 h-4 object-contain" src={icone} alt="" />}
          <span
            className={`flex-1 min-w-0 truncate text-[12px] ${
              marcadas.length === 0 ? 'text-texto-alfa-50' : 'text-texto'
            }`}
          >
            {resumo}
          </span>
          <svg
            className={`w-4 h-4 shrink-0 text-secundaria transition-transform duration-200 ${aberto ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 7.5l5 5 5-5" />
          </svg>
        </button>

        {aberto && (
          <ul
            role="listbox"
            aria-multiselectable="true"
            className="absolute z-20 left-0 right-0 mt-1 max-h-60 overflow-y-auto p-1 bg-branco border border-borda rounded-lg shadow-[0_4px_12px_var(--color-sombra)]"
          >
            {opcoes.map(({ id, texto }) => {
              const marcada = selecionados.includes(id)
              return (
                <li key={id} role="option" aria-selected={marcada}>
                  <button
                    type="button"
                    className={`flex items-center gap-2 w-full px-2.5 py-2 rounded-md text-left text-[12px] cursor-pointer hover:bg-fundo-suave-2 focus-visible:outline-0 focus-visible:bg-fundo-suave-2 ${
                      marcada ? 'text-primaria font-semibold' : 'text-texto'
                    }`}
                    onClick={() => onAlternar?.(id)}
                  >
                    <span
                      className={`grid place-items-center w-4 h-4 shrink-0 rounded border text-[10px] leading-none ${
                        marcada ? 'bg-primaria border-primaria text-branco' : 'bg-branco border-borda-forte'
                      }`}
                      aria-hidden="true"
                    >
                      {marcada ? '✓' : ''}
                    </span>
                    <span className="flex-1">{texto}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Itens escolhidos, com botão para remover */}
      {marcadas.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {marcadas.map(({ id, texto }) => (
            <li
              key={id}
              className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-fundo-card border border-borda-forte rounded-full text-[11px] font-medium text-primaria"
            >
              {texto}
              <button
                type="button"
                aria-label={`Remover ${texto}`}
                className="grid place-items-center w-4 h-4 p-0 border-0 rounded-full bg-transparent text-primaria cursor-pointer hover:bg-primaria-alfa-20"
                onClick={() => onAlternar?.(id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
