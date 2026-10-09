import { Outlet } from 'react-router-dom'

function LayoutProfissional() {
  return (
    <div>
      <aside>{/* sidebar */}</aside>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default LayoutProfissional

