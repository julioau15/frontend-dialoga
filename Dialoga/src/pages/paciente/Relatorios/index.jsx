// ============================================================
// pages/paciente/Relatorios
// Relatórios do paciente. Rota: /paciente/relatorios
// Dados da API pelo hook useRelatorios (registros de humor, solicitações de acesso e tarefas).
// Frames: "Relatorio - Paciente" (desktop) e "Relatorios - Mobile" (403px).
//   - título "Relatórios" e subtítulo "Seu histórico de saúde emocional" (RF189);
//   - "SELECIONAR PERÍODO": calendário com navegação por mês, seleção de intervalo, ponto nos
//     dias com registro, período selecionado e orientação (RF190–RF193, RNF057);
//   - gráfico Energia · Sentimento · Humor · Pensamentos (RF194–RF198, RNF058);
//   - horas de sono com resumo (média, mínimo, máximo) e alerta (RF199–RF201, RN75);
//   - solicitações de acesso dos profissionais, com o pop-up de aprovar/recusar e os avisos;
//   - anotações do período;
//   - tarefas deste período com prazo, status, progresso e "Ver todas" (RF208–RF210);
//     só no desktop (os frames de Mobile terminam nas Anotações);
//   - botão "Exportar Relatório" (RF211) ao lado do título: "📄 Exportar Relatório" no desktop
//     e "📄 PDF" no mobile e no tablet. Gera e baixa o PDF do período (utils/exportarRelatorio).
// Desktop (a partir de 1280px): calendário à esquerda (297px) e gráficos à direita (528px);
// em 1440px as posições são as do frame. Tablet e Mobile: tudo em uma coluna, na ordem do Figma.
// ============================================================
import { useMemo, useState } from 'react'
import Button from '../../../components/Button'
import { useAuth } from '../../../contexts/AuthContext'
import { useRelatorios } from '../../../hooks/useRelatorios'
import { hojeNoBrasil } from '../../../utils/datasAgenda'
import { exportarRelatorioPdf } from '../../../utils/exportarRelatorio'
import { periodoInicial, registrosDoPeriodo } from '../../../utils/relatorios'
import CalendarioPeriodo from './components/CalendarioPeriodo'
import CartaoAnotacoesPeriodo from './components/CartaoAnotacoesPeriodo'
import CartaoIndicadores from './components/CartaoIndicadores'
import CartaoSolicitacoesAcesso from './components/CartaoSolicitacoesAcesso'
import CartaoSonoPeriodo from './components/CartaoSonoPeriodo'
import CartaoTarefasPeriodo from './components/CartaoTarefasPeriodo'

// Botão "Exportar Relatório" (RF211), como no Figma: branco com borda lilás.
// Desktop: "📄 Exportar Relatório" (42px de altura); mobile e tablet: "📄 PDF" (32px).
// Gera o PDF do período escolhido (desabilitado enquanto os dados carregam ou o arquivo é gerado).
function BotaoExportar({ onExportar, desabilitado = false, gerando = false }) {
  return (
    <button
      type="button"
      aria-label="Exportar relatório"
      onClick={onExportar}
      disabled={desabilitado || gerando}
      aria-busy={gerando}
      className="disabled:cursor-not-allowed disabled:opacity-60 inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-borda bg-superficie px-3 text-[13px] font-semibold text-texto shadow-sm hover:bg-fundo-suave-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria xl:h-[42px] xl:rounded-xl xl:px-4 xl:text-[14px]"
    >
      <span aria-hidden="true" className="text-[12px] leading-none">
        📄
      </span>
      <span className="xl:hidden">{gerando ? 'Gerando...' : 'PDF'}</span>
      <span className="max-xl:hidden">{gerando ? 'Gerando PDF...' : 'Exportar Relatório'}</span>
    </button>
  )
}

// o calendário abre no mês em que termina o período inicial (últimos 7 dias)
function estadoInicial() {
  const periodo = periodoInicial(hojeNoBrasil())
  const [ano, mes] = periodo.fim.split('-').map(Number)
  return { periodo, mesVisivel: { ano, mes: mes - 1 } }
}

function Relatorios() {
  const [inicial] = useState(estadoInicial)
  const [periodo, setPeriodo] = useState(inicial.periodo)
  const [mesVisivel, setMesVisivel] = useState(inicial.mesVisivel)
  const rel = useRelatorios()
  const { perfil } = useAuth()
  const [exportando, setExportando] = useState(false)
  const [erroExportar, setErroExportar] = useState('')

  // dias com registro (ponto no calendário)
  const diasComRegistro = useMemo(() => new Set(rel.registros.map((r) => r.data)), [rel.registros])

  // registros do período escolhido (enquanto falta o dia final, vale só o dia inicial)
  const registros = useMemo(() => registrosDoPeriodo(rel.registros, periodo), [rel.registros, periodo])

  // RF211: baixa o PDF do período selecionado no calendário
  async function exportar() {
    setExportando(true)
    setErroExportar('')
    try {
      await exportarRelatorioPdf({ nome: perfil?.nome, periodo, registros, tarefas: rel.tarefas })
    } catch {
      setErroExportar('Não foi possível gerar o PDF. Tente novamente.')
    } finally {
      setExportando(false)
    }
  }

  // avança ou volta um mês no calendário (vira o ano quando passa de dezembro/janeiro)
  function mudarMes(delta) {
    setMesVisivel(({ ano, mes }) => {
      const data = new Date(Date.UTC(ano, mes + delta, 1))
      return { ano: data.getUTCFullYear(), mes: data.getUTCMonth() }
    })
  }

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave bg-pagina">
      {/* em 1440px: 874px de conteúdo a 141px do menu, como no frame */}
      <div className="mx-auto w-full max-w-[770px] px-[21px] pt-[17px] pb-12 sm:px-6 xl:max-w-[922px] xl:pt-[78px] min-[1440px]:max-w-[1184px]! min-[1440px]:pr-[169px]! min-[1440px]:pl-[141px]!">
        {/* RF189 e RF211: título à esquerda e "Exportar Relatório" à direita */}
        {/* desktop: título, grade e cartões de baixo começam na mesma linha (a borda do calendário) */}
        <header className="flex items-start justify-between gap-3 xl:pl-[33px]">
          <div className="min-w-0">
            <h1 className="text-[20px] font-extrabold leading-7 text-texto xl:text-[24px] xl:leading-[30px]">Relatórios</h1>
            <p className="mt-0.5 text-[14px] leading-5 text-secundaria xl:mt-[5px]">Seu histórico de saúde emocional</p>
          </div>
          <BotaoExportar onExportar={exportar} desabilitado={rel.carregando} gerando={exportando} />
        </header>

        {erroExportar && (
          <p role="alert" className="mt-3 text-[13px] text-erro-texto xl:pl-[33px]">
            {erroExportar}
          </p>
        )}

        {rel.carregando && (
          <p role="status" className="mt-4 text-[13px] text-secundaria xl:pl-[33px]">Carregando seus relatórios...</p>
        )}
        {rel.erro && (
          <div role="alert" className="mt-4 flex flex-col items-start gap-3 rounded-xl border border-erro-borda bg-erro-fundo p-4 xl:ml-[33px]">
            <p className="text-[13px] text-erro-texto">{rel.erro}</p>
            <Button type="button" variante="suave" larguraAuto onClick={rel.recarregar}>
              Tentar novamente
            </Button>
          </div>
        )}

        {/* enquanto carrega, os cartões não aparecem (senão mostrariam "Nenhum registro" antes da hora) */}
        {!rel.carregando && (
        <>
        {/* desktop: calendário | gráfico na 1ª linha; solicitações | sono na 2ª
            (mobile e tablet: calendário, gráfico, sono e solicitações, como no Figma) */}
        <div className="mt-[18px] flex flex-col gap-[18px] xl:mt-[11px] xl:grid xl:grid-cols-[297px_528px] xl:gap-x-4 xl:gap-y-[15px] xl:pl-[33px]">
          <CalendarioPeriodo
            ano={mesVisivel.ano}
            mes={mesVisivel.mes}
            periodo={periodo}
            diasComRegistro={diasComRegistro}
            onMudarPeriodo={setPeriodo}
            onMudarMes={mudarMes}
          />
          {/* o gráfico estica até o fim da coluna do calendário (sem buraco antes de "Horas de sono") */}
          <div className="min-w-0 xl:h-full">
            <CartaoIndicadores registros={registros} periodo={periodo} />
          </div>
          <div className="min-w-0 xl:col-start-2">
            <CartaoSonoPeriodo registros={registros} />
          </div>
          {/* no Figma este cartão é 5px mais largo que o calendário, para a esquerda */}
          <div className="min-w-0 xl:col-start-1 xl:row-start-2 xl:self-start">
            <CartaoSolicitacoesAcesso
              solicitacoes={rel.solicitacoes}
              erro={rel.erroSolicitacoes}
              onTentarNovamente={rel.recarregar}
              onResponder={rel.responderSolicitacao}
            />
          </div>
        </div>

        <div className="mt-[18px] flex flex-col gap-[18px] xl:mt-4 xl:gap-[22px] xl:pl-[33px]">
          <CartaoAnotacoesPeriodo registros={registros} />
          {/* os frames de Mobile não têm "Tarefas deste período" (tablet segue o mobile) */}
          <div className="max-xl:hidden">
            <CartaoTarefasPeriodo periodo={periodo} tarefas={rel.tarefas} />
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  )
}

export default Relatorios
