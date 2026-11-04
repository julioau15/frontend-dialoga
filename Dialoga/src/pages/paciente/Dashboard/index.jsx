// ============================================================
// pages/paciente/Dashboard
// Tela inicial do paciente (rota /paciente/dashboard).
// Os dados vêm do hook useDashboardPaciente; cada bloco da tela
// é um componente dentro de ./components.
// ============================================================
import { useAuth } from '../../../contexts/AuthContext'
import { useDashboardPaciente } from '../../../hooks/useDashboardPaciente'
import HeaderBoasVindas from './components/HeaderBoasVindas'
import IndicadoresHoje from './components/IndicadoresHoje'
import SonoSemana from './components/SonoSemana'
import ResumoCards from './components/ResumoCards'
import TratamentosHoje from './components/TratamentosHoje'
import ProximasConsultas from './components/ProximasConsultas'
import TarefasRecentes from './components/TarefasRecentes'

function Dashboard() {
  const { perfil } = useAuth()
  const { indicadores, sono, tratamentos, consultas, tarefas, totalProfissionais } = useDashboardPaciente()

  const primeiroNome = perfil?.nome?.trim().split(/\s+/)[0] ?? ''

  const resumo = [
    { rotulo: 'Tratamentos ativos', valor: tratamentos.length, icone: 'remedio', cor: 'bg-fundo-card text-primaria' },
    { rotulo: 'Próximas consultas', valor: consultas.length, icone: 'calendario', cor: 'bg-info-fundo text-info' },
    {
      rotulo: 'Tarefas pendentes',
      valor: tarefas.filter((t) => t.status !== 'concluida').length,
      icone: 'tarefa',
      cor: 'bg-sucesso-fundo text-sucesso',
    },
    { rotulo: 'Profissionais', valor: totalProfissionais, icone: 'pessoas', cor: 'bg-alerta-fundo text-alerta' },
  ]

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <HeaderBoasVindas nome={primeiroNome} />

      {/* TODO: abrir o fluxo de registro de humor quando a tela/modal existir */}
      <IndicadoresHoje indicadores={indicadores} onRegistrarHumor={() => {}} />

      <SonoSemana dias={sono.dias} ideal={sono.ideal} />

      <ResumoCards itens={resumo} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TratamentosHoje tratamentos={tratamentos} />
        <ProximasConsultas consultas={consultas} />
      </div>

      <TarefasRecentes tarefas={tarefas} />
    </div>
  )
}

export default Dashboard
