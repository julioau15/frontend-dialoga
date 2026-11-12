// ============================================================
// components/AbasNotificacoes
// Abas "Não lidas" e "Histórico" da página de Notificações, de largura
// igual, com a contagem de cada aba e o painel com o conteúdo da aba ativa.
// Acessível: role="tablist"/"tab"/"tabpanel", aria-selected e troca de aba
// pelas setas do teclado (e Home/End).
// Props:
//   abas                -> [{ id, rotulo, contagem }]
//   ativa               -> id da aba ativa
//   onMudar             -> chamado com o id da nova aba
//   parentesesNoDesktop -> true mostra a contagem em parênteses a partir de 768px
//                          (paciente); abaixo disso, e quando false, num selo redondo
//   children            -> conteúdo da aba ativa
// ============================================================
import { useId, useRef } from 'react'
import Selo from '../Selo'

// Exibe as abas e o painel da aba ativa
export default function AbasNotificacoes({ abas, ativa, onMudar, parentesesNoDesktop = false, children }) {
  const idBase = useId()
  const idPainel = `${idBase}-painel`
  // Botões das abas, para mover o foco pelas setas do teclado
  const botoes = useRef({})

  // Troca de aba pelas setas do teclado, levando o foco para a nova aba
  function aoTeclar(evento, indice) {
    const teclas = {
      ArrowRight: (indice + 1) % abas.length,
      ArrowLeft: (indice - 1 + abas.length) % abas.length,
      Home: 0,
      End: abas.length - 1,
    }
    if (!(evento.key in teclas)) return
    evento.preventDefault()
    const proxima = abas[teclas[evento.key]]
    onMudar(proxima.id)
    botoes.current[proxima.id]?.focus()
  }

  return (
    <>
      <div role="tablist" aria-label="Notificações" className="flex gap-1 rounded-xl bg-borda p-0.5">
        {abas.map((aba, indice) => {
          const selecionada = aba.id === ativa
          return (
            <button
              key={aba.id}
              ref={(elemento) => {
                botoes.current[aba.id] = elemento
              }}
              id={`${idBase}-${aba.id}`}
              type="button"
              role="tab"
              aria-selected={selecionada}
              aria-controls={idPainel}
              tabIndex={selecionada ? 0 : -1}
              onClick={() => onMudar(aba.id)}
              onKeyDown={(evento) => aoTeclar(evento, indice)}
              className={`flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[10px] border text-[11px] font-semibold cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
                selecionada ? 'border-borda bg-branco text-primaria shadow-sm' : 'border-transparent text-secundaria hover:text-texto'
              }`}
            >
              {aba.rotulo}
              {/* Contagem em selo redondo */}
              <span className={parentesesNoDesktop ? 'md:hidden' : ''}>
                <Selo tom={selecionada ? 'primaria' : 'neutro'}>{aba.contagem}</Selo>
              </span>
              {/* Contagem em parênteses (paciente, a partir de 768px) */}
              {parentesesNoDesktop && <span className="hidden md:inline">({aba.contagem})</span>}
            </button>
          )
        })}
      </div>

      {/* Conteúdo da aba ativa */}
      <div role="tabpanel" id={idPainel} aria-labelledby={`${idBase}-${ativa}`} className="mt-4">
        {children}
      </div>
    </>
  )
}
