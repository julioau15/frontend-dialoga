import LayoutComSidebar from '../LayoutComSidebar/index'

const itens = [
  { rotulo: 'Dashboard', caminho: '/paciente/dashboard' },
  { rotulo: 'Agenda', caminho: '/paciente/agenda' },
  { rotulo: 'Tarefas', caminho: '/paciente/tarefas' },
  { rotulo: 'Tratamentos', caminho: '/paciente/tratamentos' },
  { rotulo: 'Profissionais', caminho: '/paciente/profissionais' },
  { rotulo: 'Relatórios', caminho: '/paciente/relatorios' },
  { rotulo: 'Notificações', caminho: '/paciente/notificacoes' },
  { rotulo: 'Perfil', caminho: '/paciente/perfil' },
]

export default function LayoutPaciente() {
  return <LayoutComSidebar titulo="Dialoga" itens={itens} />
}