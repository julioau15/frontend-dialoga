import LayoutComSidebar from '../LayoutComSidebar/index'

const itens = [
  { rotulo: 'Dashboard', caminho: '/profissional/dashboard', icone: 'dashboard' },
  { rotulo: 'Agenda', caminho: '/profissional/agenda', icone: 'agenda' },
  { rotulo: 'Pacientes', caminho: '/profissional/pacientes', icone: 'pacientes' },
  { rotulo: 'Tarefas', caminho: '/profissional/tarefas', icone: 'tarefas' },
  { rotulo: 'Notificações', caminho: '/profissional/notificacoes', icone: 'notificacoes' },
  { rotulo: 'Perfil', caminho: '/profissional/perfil', icone: 'perfil' },
]

function LayoutProfissional() {
  return <LayoutComSidebar titulo="Dialoga" itens={itens} />
}

export default LayoutProfissional