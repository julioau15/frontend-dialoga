import { Outlet } from 'react-router-dom'
import { BarraLateral, RodapeUsuario } from '../../components'
import '../layout.css'

const NAV_ITEMS = [
  { to: '/admin', label: 'Aprovações', end: true },
  { to: '/admin/administradores', label: 'Administradores' },
  { to: '/admin/perfil', label: 'Perfil' },
]

function LayoutAdmin() {
  return (
    <div className="app-layout">
      <BarraLateral items={NAV_ITEMS} footer={<RodapeUsuario />} />
      <main className="app-layout__main">
        <Outlet />
      </main>
    </div>
  )
}

export default LayoutAdmin
