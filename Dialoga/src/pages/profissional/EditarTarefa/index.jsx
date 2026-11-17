// ============================================================
// pages/profissional/EditarTarefa
// Edição de uma tarefa (RF290), frame "Editar tarefa - Profissional".
// Ligada à API (hook useTarefaParaEdicao). Rota: /profissional/tarefas/:id/editar
// Reaproveita a tela Nova tarefa no modo edição: título "Editar tarefa", campos e perguntas
// já preenchidos e o botão "Enviar ao paciente" (rascunho também ganha "Salvar rascunho").
// Estados: carregando, erro (com "Tentar novamente") e tarefa inexistente
// (ou de outro profissional), que mostra o aviso "Tarefa não encontrada".
// Desktop, Tablet e Mobile (403px).
// ============================================================
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/Button'
import Card from '../../../components/Card'
import { useAuth } from '../../../contexts/AuthContext'
import { useTarefaParaEdicao } from '../../../hooks/useFormularioTarefa'
import NovaTarefa from '../NovaTarefa'
import BotaoVoltar from '../NovaTarefa/components/BotaoVoltar'

const ROTA_LISTA = '/profissional/tarefas'

// moldura comum dos avisos (carregando, erro e não encontrada)
function Aviso({ children }) {
  const navigate = useNavigate()
  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave">
      <div className="mx-auto flex w-full max-w-[768px] flex-col gap-5 px-6 pt-6 pb-10">
        <BotaoVoltar onClick={() => navigate(ROTA_LISTA)}>Voltar às tarefas</BotaoVoltar>
        {children}
      </div>
    </div>
  )
}

// busca a tarefa e mostra o formulário; "Tentar novamente" monta esta parte de novo (onTentarDeNovo)
function EditarCarregada({ id, onTentarDeNovo }) {
  const { auth } = useAuth()
  const { inicial, carregando, erro, naoEncontrada } = useTarefaParaEdicao(auth?.token, id)

  if (carregando) {
    return (
      <Aviso>
        <p role="status" className="py-10 text-center text-[13px] text-secundaria">Carregando tarefa...</p>
      </Aviso>
    )
  }

  if (erro) {
    return (
      <Aviso>
        <Card as="section" role="alert" className="flex flex-col items-center gap-3 px-5 py-10 text-center">
          <p className="text-[13px] text-erro">{erro}</p>
          <Button type="button" variante="suave" larguraAuto className="h-[42px]! rounded-xl! px-4! text-[14px]! font-bold!" onClick={onTentarDeNovo}>
            Tentar novamente
          </Button>
        </Card>
      </Aviso>
    )
  }

  if (naoEncontrada || !inicial) {
    return (
      <Aviso>
        <Card as="section" className="px-5 py-10 text-center">
          <h1 className="text-[16px] font-bold text-texto">Tarefa não encontrada</h1>
          <p className="mt-2 text-[13px] text-secundaria">Essa tarefa não existe ou foi removida.</p>
        </Card>
      </Aviso>
    )
  }

  return <NovaTarefa editando inicial={inicial} />
}

function EditarTarefa() {
  const { id } = useParams()
  const [tentativa, setTentativa] = useState(0) // +1 = buscar a tarefa de novo
  // key: ao trocar de tarefa (ou tentar de novo) tudo recomeça, inclusive o formulário
  return <EditarCarregada key={`${id}-${tentativa}`} id={id} onTentarDeNovo={() => setTentativa((n) => n + 1)} />
}

export default EditarTarefa
