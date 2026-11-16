// ============================================================
// components/ListaNotificacoes
// Paginação local para limitar a quantidade de cartões no DOM.
// Os contadores e "Marcar todas" continuam usando a lista completa.
// Não substitui paginação de rede no backend.
// ============================================================
import { useState } from 'react'
import Button from '../Button'
import CartaoNotificacao from '../CartaoNotificacao'

const TAMANHO_PAGINA = 20

// Compartilha a exibição das notificações dos dois perfis.
export default function ListaNotificacoes({
  itens,
  prefixoRota,
  onMarcarLida,
  salvando = false,
}) {
  const [paginaSolicitada, setPaginaSolicitada] = useState(1)
  const totalPaginas = Math.max(
    1,
    Math.ceil(itens.length / TAMANHO_PAGINA),
  )
  const pagina = Math.min(paginaSolicitada, totalPaginas)
  const inicio = (pagina - 1) * TAMANHO_PAGINA
  const visiveis = itens.slice(inicio, inicio + TAMANHO_PAGINA)

  // Usa a página efetiva para lidar com a remoção do último item.
  function mudarPagina(deslocamento) {
    setPaginaSolicitada(
      Math.max(1, Math.min(totalPaginas, pagina + deslocamento)),
    )
  }

  return (
    <div className="flex flex-col gap-3" aria-busy={salvando}>
      {visiveis.map((item) => (
        <CartaoNotificacao
          key={item.id}
          notificacao={item}
          prefixoRota={prefixoRota}
          acao="ver-ou-marcar"
          onMarcarLida={onMarcarLida}
          desabilitado={salvando}
        />
      ))}

      {totalPaginas > 1 && (
        <nav
          aria-label="Paginação de notificações"
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <Button
            type="button"
            variante="suave"
            larguraAuto
            disabled={pagina === 1 || salvando}
            onClick={() => mudarPagina(-1)}
          >
            Anterior
          </Button>

          <span role="status" className="text-[12px] text-secundaria">
            Página {pagina} de {totalPaginas}
          </span>

          <Button
            type="button"
            variante="suave"
            larguraAuto
            disabled={pagina === totalPaginas || salvando}
            onClick={() => mudarPagina(1)}
          >
            Próxima
          </Button>
        </nav>
      )}
    </div>
  )
}
