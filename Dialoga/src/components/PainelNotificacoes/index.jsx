// ============================================================
// components/PainelNotificacoes
// Conteúdo comum das configurações de notificação: caixa "Desligar todas"
// e a lista de categorias expansíveis. Usado pelo modal do paciente e
// pelas telas do paciente (mobile) e do profissional.
// Props:
//   config            -> retorno do hook useConfiguracoesNotificacao
//                        (usa também carregando, erroCarregar, recarregar e erroSalvar)
//   descricaoDesligar -> texto abaixo de "Desligar todas"
//   mostrarContagem   -> true exibe "(X/Y ativas)" em cada categoria
//   compacto          -> true usa o visual do modal (caixa lilás, textos menores)
// Enquanto carrega mostra "Carregando preferências..."; se a busca falhar, mostra o erro e "Tentar novamente".
// ============================================================
import Button from '../Button'
import Card from '../Card'
import CategoriaNotificacao from '../CategoriaNotificacao'
import Icone from '../Icone'
import Interruptor from '../Interruptor'

// Exibe "Desligar todas" e as categorias de notificação
export default function PainelNotificacoes({
  config,
  descricaoDesligar = 'Suspende todos os alertas e lembretes',
  mostrarContagem = false,
  compacto = false,
}) {
  // Enquanto as preferências salvas chegam da API
  if (config.carregando) {
    return (
      <p role="status" className="py-6 text-center text-[13px] text-secundaria">
        Carregando preferências...
      </p>
    )
  }

  // Falha ao buscar as preferências: mostra o erro e permite tentar de novo
  if (config.erroCarregar) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-erro-borda bg-erro-fundo p-5">
        <p className="text-[14px] text-erro">{config.erroCarregar}</p>
        <Button type="button" variante="suave" larguraAuto className="h-10" onClick={config.recarregar}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex flex-col ${compacto ? 'gap-4' : 'gap-3'}`}>
      {/* Liga ou desliga todas as notificações (RF364, RF369) */}
      <Card
        as="div"
        className={`flex items-center gap-4 ${compacto ? 'bg-fundo-suave-2 px-3 py-3 shadow-none' : 'mb-2 px-5 py-4'}`}
      >
        <div className="min-w-0 flex-1">
          <p className={`flex items-center gap-2 font-bold text-texto ${compacto ? 'text-[13px]' : 'text-[15px]'}`}>
            <Icone nome="sino" tamanho={compacto ? 13 : 15} className="text-erro" />
            Desligar todas
          </p>
          <p className="mt-1 text-[11px] text-secundaria">{descricaoDesligar}</p>
        </div>
        <Interruptor
          ligado={config.desligarTodas}
          onAlternar={config.alternarDesligarTodas}
          rotulo="Desligar todas"
        />
      </Card>

      {/* Categorias de notificação (RF366, RF371) */}
      {config.categorias.map((categoria) => (
        <CategoriaNotificacao
          key={categoria.id}
          categoria={categoria}
          aberta={config.estaAberta(categoria.id)}
          onAlternar={() => config.alternarCategoria(categoria.id)}
          ativos={config.ativos}
          onAlternarTipo={config.alternarTipo}
          desabilitado={config.desligarTodas}
          mostrarContagem={mostrarContagem}
        />
      ))}

      {/* Erro ao salvar as preferências na API */}
      {config.erroSalvar && (
        <p role="alert" className="text-[12px] text-erro">
          {config.erroSalvar}
        </p>
      )}
    </div>
  )
}
