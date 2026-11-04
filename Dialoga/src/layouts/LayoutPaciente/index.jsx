import LayoutComSidebar from '../LayoutComSidebar/index'

const itens = [
  { rotulo: 'Dashboard', caminho: '/paciente/dashboard', icone: 'dashboard' },
  { rotulo: 'Agenda', caminho: '/paciente/agenda', icone: 'agenda' },
  { rotulo: 'Tarefas', caminho: '/paciente/tarefas', icone: 'tarefas' },
  { rotulo: 'Tratamentos', caminho: '/paciente/tratamentos', icone: 'tratamentos' },
  { rotulo: 'Profissionais', caminho: '/paciente/profissionais', icone: 'profissionais' },
  { rotulo: 'Relatórios', caminho: '/paciente/relatorios', icone: 'relatorios' },
  { rotulo: 'Notificações', caminho: '/paciente/notificacoes', icone: 'notificacoes' },
  { rotulo: 'Perfil', caminho: '/paciente/perfil', icone: 'perfil' },
]

export default function LayoutPaciente() {
  return <LayoutComSidebar titulo="Dialoga" itens={itens} />
}