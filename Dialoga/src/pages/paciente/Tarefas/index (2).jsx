// ============================================================
// pages/paciente/Tarefas
// Lista de tarefas do paciente (só visual, dados fixos, sem API).
// Frames: Tarefas todas / pendentes / em andamento / concluídas / em atraso.
// Rota: /paciente/tarefas
// Ainda sem implementar (outras tarefas): "Adicionar tarefa" (pop-up Nova tarefa),
// "Abrir tarefa/Continuar" (Preencher tarefa) e "Ver respostas" (Ver resposta).
// ============================================================
import { useMemo, useState } from 'react'
import Button from '../../../components/Button'
import AbasComContagem from '../../../components/AbasComContagem'
import { IconeMais } from '../../../components/IconesAgenda'
import CartaoTarefa from './components/CartaoTarefa'
import { TAREFAS_MOCK } from './components/tarefasMock'

const ABAS = [
  { id: 'todas', rotulo: 'Todas' },
  { id: 'pendente', rotulo: 'Pendentes' },
  { id: 'andamento', rotulo: 'Em andamento' },
  { id: 'concluida', rotulo: 'Concluídas' },
  { id: 'atrasada', rotulo: 'Em atraso' },
]
const ID_PAINEL = 'lista-tarefas'

function Tarefas() {
  const [tarefas] = useState(TAREFAS_MOCK)
  const [abaAtiva, setAbaAtiva] = useState('todas')

  // número ao lado de cada aba: "Todas" conta tudo, as outras contam pelo status
  const abas = useMemo(
    () => ABAS.map((aba) => ({
      ...aba,
      contagem: aba.id === 'todas' ? tarefas.length : tarefas.filter((t) => t.status === aba.id).length,
    })),
    [tarefas],
  )
  const visiveis = abaAtiva === 'todas' ? tarefas : tarefas.filter((t) => t.status === abaAtiva)

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave">
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5 px-4 py-8 sm:px-6 sm:py-12">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-extrabold text-texto">Tarefas</h1>
            <p className="text-[14px] text-secundaria">Questionários e atividades do seu profissional</p>
          </div>
          <Button type="button" larguraAuto className="h-11 px-5">
            <IconeMais tamanho={14} />
            Adicionar tarefa
          </Button>
        </header>

        <AbasComContagem abas={abas} ativa={abaAtiva} onMudar={setAbaAtiva} painel={ID_PAINEL} />

        <div id={ID_PAINEL} role="tabpanel" className="flex flex-col gap-4">
          {visiveis.length > 0 ? (
            visiveis.map((tarefa) => <CartaoTarefa key={tarefa.id} tarefa={tarefa} />)
          ) : (
            <p className="rounded-xl bg-branco px-4 py-8 text-center text-[13px] text-secundaria">Nenhuma tarefa nesta aba.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Tarefas
