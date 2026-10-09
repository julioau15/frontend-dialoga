import { Outlet } from 'react-router-dom'

function LayoutPaciente() {
  return (
    <div>
      <aside>{/* sidebar */}</aside>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default LayoutPaciente

