// ============================================================
// pages/paciente/Agenda
// Agenda do paciente, ligada à API (hook useAgendaPaciente): consultas, busca de
// profissional (vínculo ativo), horários livres, agendar e excluir.
// Estados: carregando e erro (com "Tentar novamente").
// Frames: Agenda inicial mês / semana / dia | Nova consulta |
//         Agendamento realizado | Verificando dia agendado |
//         Excluir consulta | Consulta excluída.
// Rota: /paciente/agenda
// ============================================================
import { useCallback, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Button from '../../../components/Button'
import Toast from '../../../components/Toast'
import { IconeMais } from '../../../components/IconesAgenda'
import { useAgendaPaciente } from '../../../hooks/useAgendaPaciente'
import { hojeNoBrasil, tituloDoMes } from '../../../utils/datasAgenda'
import {
  anoEMes, dataCompacta, intervaloDaSemana, primeiroDiaDoMes, semanaDe, somarDias,
} from '../../../utils/datasAgendaPaciente'
import CalendarioAgenda from './components/CalendarioAgenda'
import PainelDia from './components/PainelDia'
import ProximasConsultas from './components/ProximasConsultas'
import ModalNovaConsulta from './components/ModalNovaConsulta'
import ModalExcluirConsulta from './components/ModalExcluirConsulta'

const ordenar = (lista) => [...lista].sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`))

function Agenda() {
  const agenda = useAgendaPaciente()
  const { consultas } = agenda
  const HOJE = useMemo(() => hojeNoBrasil(), []) // hoje no fuso do Brasil, o mesmo que o back usa
  // vindo do Dashboard (clique numa consulta): abre na visão do dia daquela consulta
  const { state } = useLocation()
  const diaInicial = /^\d{4}-\d{2}-\d{2}$/.test(state?.data ?? '') ? state.data : null
  const [visao, setVisao] = useState(diaInicial ? 'dia' : 'mes') // 'mes' | 'semana' | 'dia'
  const [selecionado, setSelecionado] = useState(diaInicial ?? HOJE) // dia escolhido
  const [ancora, setAncora] = useState(diaInicial ?? HOJE) // qualquer dia do período mostrado (mês, semana ou dia)
  const [novaAberta, setNovaAberta] = useState(false)
  const [consultaParaExcluir, setConsultaParaExcluir] = useState(null)
  const [toast, setToast] = useState({ aberto: false, tipo: 'sucesso', mensagem: '' })
  const fecharToast = useCallback(() => setToast((t) => ({ ...t, aberto: false })), [])

  const { ano, mes } = anoEMes(ancora)
  const diasSemana = semanaDe(ancora)
  const diasComConsulta = useMemo(() => new Set(consultas.map((c) => c.data)), [consultas])
  const proximas = useMemo(() => ordenar(consultas.filter((c) => c.data >= HOJE)), [consultas, HOJE])
  const doDia = ordenar(consultas.filter((c) => c.data === selecionado))

  const titulo = visao === 'mes' ? tituloDoMes(ano, mes) : visao === 'semana' ? intervaloDaSemana(diasSemana) : dataCompacta(ancora)

  function mudarVisao(nova) {
    setVisao(nova)
    setAncora(selecionado)
  }

  function navegar(sentido) {
    if (visao === 'mes') {
      const primeiroDia = primeiroDiaDoMes(ancora, sentido)
      setAncora(primeiroDia)
      setSelecionado(primeiroDia)
      return
    }
    const novo = somarDias(ancora, visao === 'semana' ? 7 * sentido : sentido)
    setAncora(novo)
    setSelecionado(novo)
  }

  // Salvar / Adicionar outra: grava na API; se ela recusar, o erro volta para o pop-up (que continua aberto)
  async function salvar(dados, { continuar }) {
    await agenda.agendar(dados)
    setToast({ aberto: true, tipo: 'sucesso', mensagem: 'Consulta agendada!' })
    if (!continuar) setNovaAberta(false)
  }

  async function excluir() {
    const consulta = consultaParaExcluir
    try {
      await agenda.excluir(consulta)
      setToast({ aberto: true, tipo: 'erro', mensagem: 'Consulta excluída!' })
    } catch (e) {
      setToast({ aberto: true, tipo: 'erro', mensagem: e.message })
    } finally {
      setConsultaParaExcluir(null)
    }
  }

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave">
      {/* conteúdo limitado a ~976px e centralizado no desktop (como no Figma) */}
      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-5 px-4 py-8 sm:px-8">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-extrabold text-texto">Agenda</h1>
            <p className="text-[12px] text-secundaria">Suas consultas e atendimentos</p>
          </div>
          <Button type="button" larguraAuto onClick={() => setNovaAberta(true)} disabled={agenda.carregando || Boolean(agenda.erro)}>
            <IconeMais tamanho={14} />
            Nova consulta
          </Button>
        </header>

        {agenda.carregando ? (
          <p role="status" className="py-16 text-center text-[13px] text-secundaria">Carregando agenda...</p>
        ) : agenda.erro ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-[13px] text-erro">{agenda.erro}</p>
            <Button type="button" variante="suave" larguraAuto onClick={agenda.recarregar}>Tentar novamente</Button>
          </div>
        ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_312px]">
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
        )}
      </div>

      {novaAberta && (
        <ModalNovaConsulta
          profissionais={agenda.profissionais}
          buscarHorarios={agenda.horarios}
          onFechar={() => setNovaAberta(false)}
          onSalvar={salvar}
        />
      )}
      {consultaParaExcluir && (
        <ModalExcluirConsulta consulta={consultaParaExcluir} onFechar={() => setConsultaParaExcluir(null)} onConfirmar={excluir} />
      )}

      <Toast {...toast} onFechar={fecharToast} />
    </div>
  )
}

export default Agenda
