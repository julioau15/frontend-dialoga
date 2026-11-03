// ============================================================
// pages/profissional/Dashboard
// Tela inicial do profissional: resumo do dia, pacientes e atividades.
// Os dados vêm de GET /profissionais/me/dashboard (hook useDashboardProfissional).
// ============================================================
import { useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useDashboardProfissional } from '../../../hooks/useDashboardProfissional'
import Button from '../../../components/Button'
import { Atividade, Calendario, CheckQuadrado, Usuarios } from '../../../components/Icones'
import { primeiroNome, textoAtendimentosHoje } from '../../../utils/formatadores'
import BannerBoasVindas from './components/BannerBoasVindas'
import CardIndicador from './components/CardIndicador'
import CardAtendimentosHoje from './components/CardAtendimentosHoje'
import CardPacientesRecentes from './components/CardPacientesRecentes'
import CardAtividadesEnviadas from './components/CardAtividadesEnviadas'

// Esqueleto cinza enquanto os dados carregam
function Carregando() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Carregando dashboard">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className="h-32 animate-pulse rounded-xl bg-branco" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-56 animate-pulse rounded-xl bg-branco" />
        <div className="h-56 animate-pulse rounded-xl bg-branco" />
      </div>
      <div className="h-56 animate-pulse rounded-xl bg-branco" />
    </div>
  )
}

function Erro({ mensagem, onTentarNovamente }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 rounded-xl border border-erro-borda bg-erro-fundo px-6 py-8 text-center">
      <p className="text-sm text-erro">{mensagem}</p>
      <div className="w-full max-w-xs">
        <Button variante="contorno" onClick={onTentarNovamente}>
          Tentar novamente
        </Button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { perfil } = useAuth()
  const { dados, erro, carregando, recarregar } = useDashboardProfissional()
  const [hoje] = useState(() => new Date())

  const mensagem = dados ? textoAtendimentosHoje(dados.resumo.atendimentos_hoje) : 'Carregando seus atendimentos…'

  return (
    // -m-6 anula o padding do <main> do layout para o fundo lilás ocupar a área toda
    <div className="-m-6 bg-fundo-suave p-6 md:min-h-screen md:p-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <BannerBoasVindas data={hoje} nome={primeiroNome(perfil?.nome)} mensagem={mensagem} />

        {carregando && <Carregando />}
        {erro && <Erro mensagem={erro} onTentarNovamente={recarregar} />}

        {dados && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <CardIndicador icone={Usuarios} tom="primaria" valor={dados.resumo.pacientes_ativos} rotulo="Pacientes ativos" />
              <CardIndicador icone={Calendario} tom="info" valor={dados.resumo.atendimentos_hoje} rotulo="Atendimentos hoje" />
              <CardIndicador icone={CheckQuadrado} tom="sucesso" valor={dados.resumo.tarefas_enviadas} rotulo="Tarefas enviadas" />
              <CardIndicador icone={Atividade} tom="alerta" valor={dados.resumo.pendentes_resposta} rotulo="Pendentes resp." />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <CardAtendimentosHoje atendimentos={dados.atendimentos_hoje} />
              <CardPacientesRecentes pacientes={dados.pacientes_recentes} />
            </div>

            <CardAtividadesEnviadas atividades={dados.atividades_enviadas} />
          </>
        )}
      </div>
    </div>
  )
}
