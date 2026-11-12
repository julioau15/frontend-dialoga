// ============================================================
// components/CategoriaNotificacao
// Categoria expansível das configurações de notificação (RF366, RF371):
// título com emoji, contagem "X/Y ativas" (opcional), seta e a lista de
// interruptores de cada tipo de notificação.
// Props:
//   categoria       -> { id, titulo, emoji, tipos, ativas, total }
//   aberta          -> true mostra a lista de tipos
//   onAlternar      -> abre ou fecha a categoria
//   ativos          -> { idDoTipo: true | false }
//   onAlternarTipo  -> liga ou desliga um tipo (recebe o id)
//   desabilitado    -> true acinzenta e bloqueia os interruptores ("Desligar todas" ativo)
//   mostrarContagem -> true exibe "(X/Y ativas)" ao lado do título
// ============================================================
import { useId } from 'react'
import Card from '../Card'
import Icone from '../Icone'
import Interruptor from '../Interruptor'

// Exibe uma categoria de notificações que abre e fecha
export default function CategoriaNotificacao({
  categoria,
  aberta,
  onAlternar,
  ativos,
  onAlternarTipo,
  desabilitado = false,
  mostrarContagem = false,
}) {
  const idLista = `${useId()}-lista`

  return (
    <Card as="div" className="overflow-hidden">
      {/* Cabeçalho clicável; o botão nativo já responde a Enter e Espaço */}
      <h3>
        <button
          type="button"
          aria-expanded={aberta}
          aria-controls={idLista}
          onClick={onAlternar}
          className="flex w-full items-center gap-2 px-4 py-3.5 text-left cursor-pointer hover:bg-fundo-suave-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primaria"
        >
          <span aria-hidden="true" className="text-[14px] leading-none">{categoria.emoji}</span>
          <span className="text-[14px] font-bold text-texto">{categoria.titulo}</span>
          {mostrarContagem && (
            <span className="ml-1 text-[11px] text-secundaria">
              ({categoria.ativas}/{categoria.total} ativas)
            </span>
          )}
          <Icone
            nome="seta"
            tamanho={14}
            className={`ml-auto text-secundaria transition-transform duration-200 ${aberta ? '-rotate-90' : 'rotate-90'}`}
          />
        </button>
      </h3>

      {/* Lista de tipos de notificação da categoria */}
      <ul id={idLista} hidden={!aberta} className="border-t border-borda">
        {categoria.tipos.map((tipo) => (
          <li key={tipo.id} className="flex items-center gap-4 px-4 py-3 border-t border-borda first:border-t-0">
            <div className={`min-w-0 flex-1 ${desabilitado ? 'opacity-50' : ''}`}>
              <p className="text-[13px] text-texto">{tipo.nome}</p>
              <p className="mt-0.5 text-[11px] text-secundaria">{tipo.descricao}</p>
            </div>
                        {/* Acinzenta e bloqueia o interruptor enquanto "Desligar todas" estiver ativo (RF364, RF369) */}
            <Interruptor
              ligado={!!ativos[tipo.id]}
              onAlternar={() => onAlternarTipo(tipo.id)}
              rotulo={tipo.nome}
              desabilitado={desabilitado}
            />
          </li>
        ))}
      </ul>
    </Card>
  )
}
