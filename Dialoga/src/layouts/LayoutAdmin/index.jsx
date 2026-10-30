import LayoutComSidebar from '../LayoutComSidebar/index'

const itens = [{ rotulo: 'Dashboard', caminho: '/admin/dashboard' }]

function LayoutAdmin() {
  return <LayoutComSidebar titulo="Dialoga Admin" itens={itens} />
}

export default LayoutAdmin