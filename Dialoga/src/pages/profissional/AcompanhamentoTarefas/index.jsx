// ============================================================
// pages/profissional/AcompanhamentoTarefas
// Acompanhamento de respostas das tarefas enviadas aos pacientes (RF293, RF294).
// Só visual: dados fixos (mock), sem API. Rota: /profissional/tarefas/acompanhamento
// Frames: "Acompanhamento de tarefa", "... dia", "... mês", "... ano", "Tarefa em andamento",
//         "Tarefa finalizada", "Tarefa não preenchida" (desktop) e "Acompanhamento de tarefas
//         todos / em andamento / finalizado / não encontrado" + "Tarefas profissional - mobile".
//   - "Voltar às tarefas", título "Acompanhamento de respostas" e subtítulo;
//   - busca por nome da tarefa ou do paciente (sem diferenciar maiúsculas/acentos);
//   - "FILTRAR POR PERÍODO": Todos | Dia (calendário) | Mês (mm/aaaa) | Ano (lista);
//   - "STATUS DA TAREFA": Todos | Em andamento | Finalizado (respondidas) | Não preenchido;
//   - "N resultado(s)" e a lista com avatar, tarefa, paciente, última modificação e status;
//   - cartão "Nenhum resultado encontrado" quando a busca e os filtros não acham nada.
// Busca e filtros valem juntos. Desktop: os dois filtros lado a lado; mobile: um embaixo do outro.
// Pode abrir com a busca preenchida (location.state.busca), vindo do ícone de respostas
// de uma tarefa sem envios na lista de Tarefas.
// Desktop, Tablet e Mobile (403px).
// ============================================================
import { useId, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Card from '../../../components/Card'
import TextField from '../../../components/TextField'
import { textoParaBusca } from '../../../utils/formatadores'
import BotaoVoltar from '../NovaTarefa/components/BotaoVoltar'
import FiltroChips from './components/FiltroChips'
import FiltroPeriodo from './components/FiltroPeriodo'
import ItemAcompanhamento from './components/ItemAcompanhamento'
import { ACOMPANHAMENTO_MOCK } from './components/acompanhamentoMock'
import { PERIODO_INICIAL, noPeriodo } from './components/filtros'
import { FILTROS_STATUS } from './components/statusAcompanhamento'

// dias que têm tarefa (pontinhos do calendário do filtro "Dia")
const DIAS_COM_TAREFA = new Set(ACOMPANHAMENTO_MOCK.map((item) => item.ultimaModificacao))

// o calendário abre no mês da modificação mais recente ('AAAA-MM-DD' ordena como texto)
const MAIS_RECENTE = [...DIAS_COM_TAREFA].sort().at(-1)
const MES_INICIAL = { ano: Number(MAIS_RECENTE.slice(0, 4)), mes: Number(MAIS_RECENTE.slice(5, 7)) - 1 }

// anos da lista do filtro "Ano": o ano atual e os três anteriores
const ANO_ATUAL = new Date().getFullYear()
const ANOS = Array.from({ length: 4 }, (_, i) => String(ANO_ATUAL - i))

// deixa a caixa do TextField no tamanho do Figma (46px, cantos de 12px) sem alterar o componente;
// no mobile o texto fica centralizado, como no Figma
const CAMPO_BUSCA =
  '[&>div>div]:h-[46px] [&>div>div]:rounded-xl [&>div>div]:px-4 sm:[&>div>div]:pl-[41px] [&_input]:text-center [&_input]:text-[13px] [&_input]:placeholder:text-secundaria sm:[&_input]:text-left'

function AcompanhamentoTarefas() {
  const navigate = useNavigate()
  const location = useLocation()
  const idContagem = useId()
  const idStatus = useId()
  const [busca, setBusca] = useState(() => location.state?.busca ?? '')
  const [periodo, setPeriodo] = useState(PERIODO_INICIAL)
  const [status, setStatus] = useState('todos')

  // busca (tarefa ou paciente) + período + status, todos juntos
  const resultados = useMemo(() => {
    const termo = textoParaBusca(busca.trim())
    return ACOMPANHAMENTO_MOCK.filter(
      (item) =>
        (!termo || textoParaBusca(`${item.tarefa.titulo} ${item.paciente.nome}`).includes(termo)) &&
        noPeriodo(item.ultimaModificacao, periodo) &&
        (status === 'todos' || item.status === status),
    )
  }, [busca, periodo, status])

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave">
      <div className="mx-auto flex w-full max-w-[768px] flex-col gap-5 px-6 pt-6 pb-10 sm:pb-12">
        <BotaoVoltar onClick={() => navigate('/profissional/tarefas')}>Voltar às tarefas</BotaoVoltar>

        <header className="mt-1">
          <h1 className="text-[24px] font-extrabold leading-tight text-texto">Acompanhamento de respostas</h1>
          <p className="mt-1 text-[13px] text-secundaria">Acompanhe o preenchimento das tarefas por paciente</p>
        </header>

        <div role="search" className={CAMPO_BUSCA}>
          <TextField
            label={<span className="sr-only">Buscar por nome da tarefa ou do paciente</span>}
            placeholder="Buscar por nome da tarefa ou do paciente..."
            value={busca}
            aria-describedby={idContagem}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* desktop: período e status lado a lado; mobile: um embaixo do outro */}
        <div className="-mt-0.5 flex flex-col gap-3.5 sm:flex-row sm:items-start sm:gap-3">
          <FiltroPeriodo periodo={periodo} onMudar={setPeriodo} diasComTarefa={DIAS_COM_TAREFA} mesInicial={MES_INICIAL} anos={ANOS} />
          <FiltroChips id={idStatus} rotulo="Status da tarefa" opcoes={FILTROS_STATUS} valor={status} onMudar={setStatus} />
        </div>

        {/* contagem lida pelos leitores de tela a cada busca ou filtro */}
        <p id={idContagem} aria-live="polite" className="mt-1 text-[12px] text-secundaria">
          {resultados.length} resultado(s)
        </p>

        {resultados.length > 0 ? (
          <ul aria-label="Tarefas enviadas" className="-mt-2 flex flex-col gap-3">
            {resultados.map((item) => (
              <ItemAcompanhamento key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          // estado sem resultados (frame "Tarefa não preenchida - Profissional-1" / "não encontrado - mobile")
          <Card as="section" aria-label="Nenhum resultado" className="-mt-2 flex flex-col items-center px-5 py-10 text-center">
            <span aria-hidden="true" className="text-[34px] leading-none">🔍</span>
            <p className="mt-4 text-[14px] font-bold text-texto">Nenhum resultado encontrado</p>
            <p className="mt-1 text-[12.5px] text-secundaria">Tente ajustar os filtros de busca.</p>
          </Card>
        )}
      </div>
    </div>
  )
}

export default AcompanhamentoTarefas
