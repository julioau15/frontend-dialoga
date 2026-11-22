// ============================================================
// pages/paciente/Dashboard
// Tela inicial do paciente (rota /paciente/dashboard).
// Os dados vêm da API pelo hook useDashboardPaciente; cada bloco da tela
// é um componente dentro de ./components.
// Estados: carregando (esqueleto), erro (com "Tentar novamente") e dados.
// ============================================================
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import { useAuth } from '../../../contexts/AuthContext'
import { useDashboardPaciente } from '../../../hooks/useDashboardPaciente'
import HeaderBoasVindas from './components/HeaderBoasVindas'
import IndicadoresHoje from './components/IndicadoresHoje'
import SonoSemana from './components/SonoSemana'
import ResumoCards from './components/ResumoCards'
import TratamentosHoje from './components/TratamentosHoje'
import ProximasConsultas from './components/ProximasConsultas'
import TarefasRecentes from './components/TarefasRecentes'

// Esqueleto cinza enquanto os dados carregam (mesmo padrão do dashboard do profissional)
function Carregando() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-label="Carregando dashboard">
      <div className="h-40 animate-pulse rounded-xl bg-branco" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className="h-24 animate-pulse rounded-xl bg-branco" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-48 animate-pulse rounded-xl bg-branco" />
        <div className="h-48 animate-pulse rounded-xl bg-branco" />
      </div>
    </div>
  )
}

function Erro({ mensagem, onTentarNovamente }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-erro-borda bg-erro-fundo p-4">
      <p className="text-[13px] text-erro">{mensagem}</p>
      <div className="w-full max-w-xs">
        <Button variante="contorno" onClick={onTentarNovamente}>
          Tentar novamente
        </Button>
      </div>
    </div>
  )
}

function Dashboard() {
  const { perfil } = useAuth()
  const { dados, carregando, erro, recarregar } = useDashboardPaciente()

  const primeiroNome = perfil?.nome?.trim().split(/\s+/)[0] ?? ''

  const resumo = dados
    ? [
        { rotulo: 'Tratamentos ativos', valor: dados.tratamentos.length, icone: 'remedio', cor: 'bg-fundo-card text-primaria' },
        { rotulo: 'Próximas consultas', valor: dados.consultas.length, icone: 'calendario', cor: 'bg-info-fundo text-info' },
        {
          rotulo: 'Tarefas pendentes',
          valor: dados.tarefas.filter((t) => t.status !== 'concluida').length,
          icone: 'tarefa',
          cor: 'bg-sucesso-fundo text-sucesso',
        },
        { rotulo: 'Profissionais', valor: dados.totalProfissionais, icone: 'pessoas', cor: 'bg-alerta-fundo text-alerta' },
      ]
    : []

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <HeaderBoasVindas nome={primeiroNome} />

      {carregando && <Carregando />}
      {erro && <Erro mensagem={erro} onTentarNovamente={recarregar} />}

      {dados && (
        <>
          {/* TODO: abrir o fluxo de registro de humor quando a tela/modal existir */}
          <IndicadoresHoje indicadores={dados.indicadores} onRegistrarHumor={() => {}} />

          {dados.sono.dias.length > 0 ? (
            <SonoSemana dias={dados.sono.dias} ideal={dados.sono.ideal} />
          ) : (
            <Card className="p-5">
              <h2 className="text-sm font-bold text-texto">
                <span aria-hidden="true">🌙 </span>Sono da semana
              </h2>
              <p className="mt-1 text-xs text-secundaria">Nenhum registro de sono nos últimos 7 dias.</p>
            </Card>
          )}

          <ResumoCards itens={resumo} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TratamentosHoje tratamentos={dados.tratamentos} />
            <ProximasConsultas consultas={dados.consultas} />
          </div>

          <TarefasRecentes tarefas={dados.tarefas} />
        </>
      )}
    </div>
  )
}

export default Dashboard
