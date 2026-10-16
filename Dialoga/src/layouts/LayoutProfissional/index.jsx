import { Outlet } from 'react-router-dom'
import { BarraLateral, RodapeUsuario } from '../../components'
import '../layout.css'

const NAV_ITEMS = [
  { to: '/profissional', label: 'Dashboard', end: true },
  { to: '/profissional/agenda', label: 'Agenda' },
  { to: '/profissional/pacientes', label: 'Pacientes' },
  { to: '/profissional/tarefas', label: 'Tarefas' },
  { to: '/profissional/notificacoes', label: 'Notificações' },
  { to: '/profissional/perfil', label: 'Perfil' },
]

function LayoutProfissional() {
  return (
    <div className="app-layout">
      <BarraLateral items={NAV_ITEMS} footer={<RodapeUsuario />} />
      <main className="app-layout__main">
        <Outlet />
      </main>
    </div>
  )
}

export default LayoutProfissional
