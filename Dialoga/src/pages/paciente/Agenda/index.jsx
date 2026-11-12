// ============================================================
// pages/paciente/Agenda
// Agenda do paciente (só visual, dados fixos e estado local, sem API).
// Frames: Agenda inicial mês / semana / dia | Nova consulta |
//         Agendamento realizado | Verificando dia agendado |
//         Excluir consulta | Consulta excluída.
// Rota: /paciente/agenda
// ============================================================
import { useCallback, useMemo, useState } from 'react'
import Button from '../../../components/Button'
import Toast from '../../../components/Toast'
import { IconeMais } from '../../../components/IconesAgenda'
import { tituloDoMes } from '../../../utils/datasAgenda'
import {
  anoEMes, dataCompacta, intervaloDaSemana, primeiroDiaDoMes, semanaDe, somarDias,
} from '../../../utils/datasAgendaPaciente'
import CalendarioAgenda from './components/CalendarioAgenda'
import PainelDia from './components/PainelDia'
import ProximasConsultas from './components/ProximasConsultas'
import ModalNovaConsulta from './components/ModalNovaConsulta'
import ModalExcluirConsulta from './components/ModalExcluirConsulta'
import { CONSULTAS_MOCK, HOJE } from './components/consultasMock'

const ordenar = (lista) => [...lista].sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`))

function Agenda() {
  const [consultas, setConsultas] = useState(CONSULTAS_MOCK)
  const [visao, setVisao] = useState('mes') // 'mes' | 'semana' | 'dia'
  const [selecionado, setSelecionado] = useState(HOJE) // dia escolhido
  const [ancora, setAncora] = useState(HOJE) // qualquer dia do período mostrado (mês, semana ou dia)
  const [novaAberta, setNovaAberta] = useState(false)
  const [consultaParaExcluir, setConsultaParaExcluir] = useState(null)
  const [toast, setToast] = useState({ aberto: false, tipo: 'sucesso', mensagem: '' })
  const fecharToast = useCallback(() => setToast((t) => ({ ...t, aberto: false })), [])

  const { ano, mes } = anoEMes(ancora)
  const diasSemana = semanaDe(ancora)
  const diasComConsulta = useMemo(() => new Set(consultas.map((c) => c.data)), [consultas])
  const proximas = useMemo(() => ordenar(consultas.filter((c) => c.data >= HOJE)), [consultas])
  const doDia = ordenar(consultas.filter((c) => c.data === selecionado))

  const titulo = visao === 'mes' ? tituloDoMes(ano, mes) : visao === 'semana' ? intervaloDaSemana(diasSemana) : dataCompacta(ancora)

  function mudarVisao(nova) {
    setVisao(nova)
    setAncora(selecionado)
  }

  function navegar(sentido) {
    if (visao === 'mes') {
      setAncora(primeiroDiaDoMes(ancora, sentido))
      return
    }
    const novo = somarDias(ancora, visao === 'semana' ? 7 * sentido : sentido)
    setAncora(novo)
    setSelecionado(novo)
  }

  // Salvar / Adicionar outra: só acrescenta na lista da tela, sem API
  function salvar(dados, { continuar }) {
    setConsultas((lista) => [...lista, { id: Date.now(), ...dados }])
    setToast({ aberto: true, tipo: 'sucesso', mensagem: 'Consulta agendada!' })
    if (!continuar) setNovaAberta(false)
  }

  function excluir() {
    setConsultas((lista) => lista.filter((c) => c.id !== consultaParaExcluir.id))
    setConsultaParaExcluir(null)
    setToast({ aberto: true, tipo: 'erro', mensagem: 'Consulta excluída!' })
  }

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave">
      <div className="flex flex-col gap-5 px-4 py-8 sm:px-8">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-extrabold text-texto">Agenda</h1>
            <p className="text-[12px] text-secundaria">Suas consultas e atendimentos</p>
          </div>
          <Button type="button" larguraAuto onClick={() => setNovaAberta(true)}>
            <IconeMais tamanho={14} />
            Nova consulta
          </Button>
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
          <CalendarioAgenda
            visao={visao}
            onMudarVisao={mudarVisao}
            titulo={titulo}
            onNavegar={navegar}
            ano={ano}
            mes={mes}
            dias={visao === 'semana' ? diasSemana : [ancora]}
            selecionado={selecionado}
            hoje={HOJE}
            diasComConsulta={diasComConsulta}
            consultas={consultas}
            onSelecionar={setSelecionado}
          />

          <div className="flex flex-col gap-4">
            {visao === 'mes' && <PainelDia data={selecionado} consultas={doDia} />}
            <ProximasConsultas consultas={proximas} onExcluir={setConsultaParaExcluir} />
          </div>
        </div>
      </div>

      {novaAberta && <ModalNovaConsulta onFechar={() => setNovaAberta(false)} onSalvar={salvar} />}
      {consultaParaExcluir && (
        <ModalExcluirConsulta onFechar={() => setConsultaParaExcluir(null)} onConfirmar={excluir} />
      )}

      <Toast {...toast} onFechar={fecharToast} />
    </div>
  )
}

export default Agenda
