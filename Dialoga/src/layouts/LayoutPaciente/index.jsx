// ============================================================
// layouts/LayoutPaciente
// Menu lateral das páginas do paciente e o aviso de lembrete de dose,
// que aparece em qualquer página quando chega um lembrete novo.
// ============================================================
import LayoutComSidebar from '../LayoutComSidebar/index'
import Toast from '../../components/Toast'
import { useLembreteDoses } from '../../hooks/useLembreteDoses'

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

// aviso no canto superior direito, para não cobrir os toasts das páginas (canto inferior)
const POSICAO_LEMBRETE = '[&>div]:top-6 [&>div]:bottom-auto'

// Monta o layout do paciente com o aviso de lembrete de dose por cima das páginas.
export default function LayoutPaciente() {
  const { toast, fecharToast } = useLembreteDoses()

  return (
    <>
      <LayoutComSidebar titulo="Dialoga" itens={itens} />
      <div className={POSICAO_LEMBRETE}>
        <Toast aberto={toast.aberto} tipo={toast.tipo} mensagem={toast.mensagem} onFechar={fecharToast} />
      </div>
    </>
  )
}
