// ============================================================
// pages/paciente/Relatorios
// Relatórios do paciente. Só visual: dados fixos (mock), sem API. Rota: /paciente/relatorios
// Frames: "Relatorio - Paciente" (desktop) e "Relatorios - Mobile" (403px).
//   - título "Relatórios" e subtítulo "Seu histórico de saúde emocional" (RF189);
//   - "SELECIONAR PERÍODO": calendário com navegação por mês, seleção de intervalo, ponto nos
//     dias com registro, período selecionado e orientação (RF190–RF193, RNF057);
//   - gráfico Energia · Sentimento · Humor · Pensamentos (RF194–RF198, RNF058);
//   - horas de sono com resumo (média, mínimo, máximo) e alerta (RF199–RF201, RN75);
//   - solicitações de acesso dos profissionais, com o pop-up de aprovar/recusar e os avisos;
//   - anotações do período;
//   - tarefas deste período com prazo, status, progresso e "Ver todas" (RF208–RF210).
// O botão "Exportar Relatório" fica para a Task 3.
// Desktop (a partir de 1280px): calendário à esquerda (297px) e gráficos à direita (528px);
// em 1440px as posições são as do frame. Tablet e Mobile: tudo em uma coluna, na ordem do Figma.
// ============================================================
import { useMemo, useState } from 'react'
import CalendarioPeriodo from './components/CalendarioPeriodo'
import CartaoAnotacoesPeriodo from './components/CartaoAnotacoesPeriodo'
import CartaoIndicadores from './components/CartaoIndicadores'
import CartaoSolicitacoesAcesso from './components/CartaoSolicitacoesAcesso'
import CartaoSonoPeriodo from './components/CartaoSonoPeriodo'
import CartaoTarefasPeriodo from './components/CartaoTarefasPeriodo'
import { PERIODO_INICIAL, REGISTROS_MOCK, registrosDoPeriodo } from './components/relatoriosMock'

// mês que o calendário abre (o do período inicial)
const [ANO_INICIAL, MES_INICIAL] = PERIODO_INICIAL.inicio.split('-').map(Number)

// dias com registro (ponto no calendário)
const DIAS_COM_REGISTRO = new Set(REGISTROS_MOCK.map((r) => r.data))

function Relatorios() {
  const [periodo, setPeriodo] = useState(PERIODO_INICIAL)
  const [mesVisivel, setMesVisivel] = useState({ ano: ANO_INICIAL, mes: MES_INICIAL - 1 })

  // registros do período escolhido (enquanto falta o dia final, vale só o dia inicial)
  const registros = useMemo(() => registrosDoPeriodo(REGISTROS_MOCK, periodo), [periodo])

  // avança ou volta um mês no calendário (vira o ano quando passa de dezembro/janeiro)
  function mudarMes(delta) {
    setMesVisivel(({ ano, mes }) => {
      const data = new Date(Date.UTC(ano, mes + delta, 1))
      return { ano: data.getUTCFullYear(), mes: data.getUTCMonth() }
    })
  }

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave">
      {/* em 1440px: 874px de conteúdo a 141px do menu, como no frame */}
      <div className="mx-auto w-full max-w-[770px] px-[21px] pt-[17px] pb-12 sm:px-6 xl:max-w-[922px] xl:pt-[78px] min-[1440px]:max-w-[1184px]! min-[1440px]:pr-[169px]! min-[1440px]:pl-[141px]!">
        {/* RF189 */}
        <header className="xl:pl-[27px]">
          <h1 className="text-[20px] font-extrabold leading-7 text-texto xl:text-[24px] xl:leading-[30px]">Relatórios</h1>
          <p className="mt-0.5 text-[14px] leading-5 text-secundaria xl:mt-[5px]">Seu histórico de saúde emocional</p>
        </header>

        {/* desktop: calendário | gráfico na 1ª linha; solicitações | sono na 2ª
            (mobile e tablet: calendário, gráfico, sono e solicitações, como no Figma) */}
        <div className="mt-[18px] flex flex-col gap-[18px] xl:mt-[11px] xl:grid xl:grid-cols-[297px_528px] xl:gap-x-4 xl:gap-y-[15px] xl:pl-[33px]">
          <CalendarioPeriodo
            ano={mesVisivel.ano}
            mes={mesVisivel.mes}
            periodo={periodo}
            diasComRegistro={DIAS_COM_REGISTRO}
            onMudarPeriodo={setPeriodo}
            onMudarMes={mudarMes}
          />
          <div className="min-w-0 xl:pt-[3px]">
            <CartaoIndicadores registros={registros} periodo={periodo} />
          </div>
          <div className="min-w-0 xl:col-start-2">
            <CartaoSonoPeriodo registros={registros} />
          </div>
          {/* no Figma este cartão é 5px mais largo que o calendário, para a esquerda */}
          <div className="min-w-0 xl:col-start-1 xl:row-start-2 xl:-ml-[5px] xl:self-start">
            <CartaoSolicitacoesAcesso />
          </div>
        </div>

        <div className="mt-[18px] flex flex-col gap-[18px] xl:mt-4 xl:gap-[22px]">
          <CartaoAnotacoesPeriodo registros={registros} />
          <CartaoTarefasPeriodo periodo={periodo} />
        </div>
      </div>
    </div>
  )
}

export default Relatorios
