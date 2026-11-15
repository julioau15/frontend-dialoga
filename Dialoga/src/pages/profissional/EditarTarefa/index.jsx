// ============================================================
// pages/profissional/EditarTarefa
// Edição de uma tarefa enviada (RF290), frame "Editar tarefa - Profissional".
// Só visual: dados fixos (mock), sem API. Rota: /profissional/tarefas/:id/editar
// Reaproveita a tela Nova tarefa no modo edição: título "Editar tarefa", campos e perguntas
// já preenchidos e só o botão "Enviar ao paciente".
// id inexistente mostra o aviso "Tarefa não encontrada".
// Desktop, Tablet e Mobile (403px).
// ============================================================
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../../../components/Card'
import NovaTarefa from '../NovaTarefa'
import BotaoVoltar from '../NovaTarefa/components/BotaoVoltar'
import { tarefaParaEdicao } from './components/tarefasEdicaoMock'

function EditarTarefa() {
  const navigate = useNavigate()
  const { id } = useParams()
  // lê a tarefa uma vez só (os ids das perguntas não mudam a cada renderização)
  const [inicial] = useState(() => tarefaParaEdicao(id))

  if (!inicial) {
    return (
      // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
      <div className="-m-6 min-h-svh bg-fundo-suave">
        <div className="mx-auto flex w-full max-w-[768px] flex-col gap-5 px-6 pt-6 pb-10">
          <BotaoVoltar onClick={() => navigate('/profissional/tarefas')}>Voltar às tarefas</BotaoVoltar>
          <Card as="section" className="px-5 py-10 text-center">
            <h1 className="text-[16px] font-bold text-texto">Tarefa não encontrada</h1>
            <p className="mt-2 text-[13px] text-secundaria">Essa tarefa não existe ou foi removida.</p>
          </Card>
        </div>
      </div>
    )
  }

  return <NovaTarefa editando inicial={inicial} />
}

export default EditarTarefa
