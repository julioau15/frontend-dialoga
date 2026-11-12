// ============================================================
// components/CartaoNotificacao
// Cartão de uma notificação: ícone da categoria, título, chip da categoria,
// descrição, data e a ação do rodapé. Não lida tem borda mais forte,
// título escuro e ponto roxo; lida tem borda clara e título acinzentado.
// O cartão em si não é clicável, só a ação do rodapé.
// Props:
//   notificacao   -> { id, categoria, titulo, descricao, data, lida }
//   prefixoRota   -> início da rota do "Ver →" (ex.: '/profissional')
//   acao          -> 'ver': chip e "Ver →" em todas as larguras
//                    'ver-ou-marcar': abaixo de 768px chip e "Ver →"; a partir
//                    de 768px sem chip e com "Marcar como lida" (só se não lida)
//   onMarcarLida  -> chamado com o id ao clicar em "Marcar como lida"
// ============================================================
import { Link } from 'react-router-dom'
import Card from '../Card'
import { CATEGORIAS_NOTIFICACAO } from '../../services/notificacoesRecebidasExemplo'

// Exibe uma notificação recebida
export default function CartaoNotificacao({ notificacao, prefixoRota, acao = 'ver', onMarcarLida }) {
  const categoria = CATEGORIAS_NOTIFICACAO[notificacao.categoria]
  const soMobile = acao === 'ver-ou-marcar' ? 'md:hidden' : ''

  return (
    <Card as="article" className={`relative flex gap-3 p-4 ${notificacao.lida ? '' : 'border-borda-forte!'}`}>
      {/* Ponto roxo que indica notificação não lida */}
      {!notificacao.lida && (
        <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primaria">
          <span className="sr-only">Não lida</span>
        </span>
      )}

      {/* Ícone da categoria */}
      <span
        aria-hidden="true"
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-[10px] text-[18px] leading-none ${categoria.fundo}`}
      >
        {categoria.emoji}
      </span>

      <div className="min-w-0 flex-1 pr-4">
        <h3 className={`text-[13px] font-bold ${notificacao.lida ? 'text-secundaria-escura' : 'text-texto'}`}>
          {notificacao.titulo}
        </h3>

        {/* Chip da categoria (no paciente, só abaixo de 768px) */}
        <span
          className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium text-secundaria ${categoria.fundo} ${soMobile}`}
        >
          {categoria.rotulo}
        </span>

        <p className="mt-1.5 text-[12px] text-secundaria">{notificacao.descricao}</p>

        {/* Rodapé com a data e a ação */}
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-[11px] text-secundaria">{notificacao.data}</p>

          {/* Leva à tela da categoria */}
          <Link
            to={`${prefixoRota}/${categoria.rota}`}
            aria-label={`Ver ${notificacao.titulo}`}
            className={`shrink-0 rounded text-[11px] font-semibold text-primaria hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${soMobile}`}
          >
            Ver <span aria-hidden="true">→</span>
          </Link>

          {/* Marca só esta notificação como lida (paciente, a partir de 768px) */}
          {acao === 'ver-ou-marcar' && !notificacao.lida && (
            <button
              type="button"
              onClick={() => onMarcarLida(notificacao.id)}
              className="hidden shrink-0 cursor-pointer rounded text-[11px] font-semibold text-primaria hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria md:inline"
            >
              Marcar como lida
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}
