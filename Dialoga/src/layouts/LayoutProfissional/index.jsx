import LayoutComSidebar from '../LayoutComSidebar/index'

const itens = [
  { rotulo: 'Dashboard', caminho: '/profissional/dashboard' },
  { rotulo: 'Agenda', caminho: '/profissional/agenda' },
  { rotulo: 'Pacientes', caminho: '/profissional/pacientes' },
  { rotulo: 'Tarefas', caminho: '/profissional/tarefas' },
  { rotulo: 'Notificações', caminho: '/profissional/notificacoes' },
  { rotulo: 'Perfil', caminho: '/profissional/perfil' },
]

function LayoutProfissional() {
  return <LayoutComSidebar titulo="Dialoga" itens={itens} />
}

export default LayoutProfissional