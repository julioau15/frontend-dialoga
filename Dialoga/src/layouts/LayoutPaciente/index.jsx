import { Outlet } from 'react-router-dom'
import { BarraLateral, RodapeUsuario } from '../../components'
import '../layout.css'

const NAV_ITEMS = [
  { to: '/paciente', label: 'Dashboard', end: true },
  { to: '/paciente/agenda', label: 'Agenda' },
  { to: '/paciente/tratamentos', label: 'Tratamentos' },
  { to: '/paciente/tarefas', label: 'Tarefas' },
  { to: '/paciente/profissionais', label: 'Profissionais' },
  { to: '/paciente/relatorios', label: 'Relatórios' },
  { to: '/paciente/notificacoes', label: 'Notificações' },
  { to: '/paciente/perfil', label: 'Perfil' },
]

function LayoutPaciente() {
  return (
    <div className="app-layout">
      <BarraLateral items={NAV_ITEMS} footer={<RodapeUsuario />} />
      <main className="app-layout__main">
        <Outlet />
      </main>
    </div>
  )
}

export default LayoutPaciente
