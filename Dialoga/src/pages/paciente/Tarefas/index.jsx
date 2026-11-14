// ============================================================
// pages/paciente/Tarefas
// Tarefas do paciente (dados fixos, sem API). Rota: /paciente/tarefas
// A página troca entre três telas sem mudar a URL:
//   lista     -> frames "Tarefas todas / pendentes / em andamento / concluídas / em atraso"
//   preencher -> "Abrir tarefa" / "Continuar" (frame "Preencher tarefa") + modal "Confirmar envio"
//   ver       -> "Ver respostas" (frame "Ver Resposta")
// "Adicionar tarefa" abre o pop-up "Nova tarefa" e cria uma autotarefa.
// Os avisos (toasts) são "Atividade enviada com sucesso!" e "Tarefa criada com sucesso!".
// ============================================================
import { useCallback, useEffect, useMemo, useState } from 'react'
import Button from '../../../components/Button'
import AbasComContagem from '../../../components/AbasComContagem'
import Toast from '../../../components/Toast'
import CartaoTarefa from './components/CartaoTarefa'
import FormularioTarefa from './components/FormularioTarefa'
import ModalNovaTarefa from './components/ModalNovaTarefa'
import { IconeMais } from './components/iconesTarefas'
import { RESPOSTAS_EXEMPLO, RESPOSTAS_VAZIAS, calcularProgresso } from './components/perguntasMock'
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
  const [tarefas, setTarefas] = useState(TAREFAS_MOCK)
  const [abaAtiva, setAbaAtiva] = useState('todas')
  const [tela, setTela] = useState({ tipo: 'lista' }) // { tipo: 'lista' | 'preencher' | 'ver', id }
  const [modalNova, setModalNova] = useState(false)
  const [aviso, setAviso] = useState({ aberto: false, mensagem: '' })
  const fecharAviso = useCallback(() => setAviso((a) => ({ ...a, aberto: false })), [])

  // ao trocar de tela, volta ao topo da página
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [tela])

  const atualizar = (id, mudancas) => setTarefas((lista) => lista.map((t) => (t.id === id ? { ...t, ...mudancas } : t)))
  const avisar = (mensagem) => setAviso({ aberto: true, mensagem })
  const voltarLista = () => setTela({ tipo: 'lista' })

  // botão do cartão: cada status leva para uma tela
  function aoAcionar(tarefa) {
    if (tarefa.status === 'concluida') return setTela({ tipo: 'ver', id: tarefa.id })
    if (tarefa.autotarefa) {
      atualizar(tarefa.id, { status: 'concluida', progresso: 100 })
      return avisar('Tarefa concluída com sucesso!')
    }
    setTela({ tipo: 'preencher', id: tarefa.id })
  }

  function criarTarefa({ titulo, prazo, arquivo }) {
    const id = Math.max(0, ...tarefas.map((t) => t.id)) + 1
    setTarefas((lista) => [{ id, titulo, autotarefa: true, prazo, arquivo, status: 'pendente', progresso: 0 }, ...lista])
    setModalNova(false)
    avisar('Tarefa criada com sucesso!')
  }

  function salvarRascunho(id, respostas) {
    const tarefa = tarefas.find((t) => t.id === id)
    const progresso = calcularProgresso(respostas)
    // pendente que ganhou resposta passa a "Em andamento"; atrasada continua atrasada
    const status = tarefa.status === 'pendente' && progresso > 0 ? 'andamento' : tarefa.status
    atualizar(id, { respostas, progresso, status })
    avisar('Rascunho salvo com sucesso!')
  }

  function enviarRespostas(id, respostas) {
    atualizar(id, { respostas, status: 'concluida', progresso: 100 })
    voltarLista()
    avisar('Atividade enviada com sucesso!')
  }

  const tarefaAberta = tela.tipo === 'lista' ? null : tarefas.find((t) => t.id === tela.id)

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
      <div className="mx-auto flex w-full max-w-[768px] flex-col gap-4 px-5 pt-6 pb-8 sm:gap-6 sm:px-6 sm:pt-14 sm:pb-12">
        {tarefaAberta ? (
          <FormularioTarefa
            key={`${tela.tipo}-${tarefaAberta.id}`}
            tarefa={tarefaAberta}
            somenteLeitura={tela.tipo === 'ver'}
            respostasIniciais={tarefaAberta.respostas ?? (tela.tipo === 'ver' ? RESPOSTAS_EXEMPLO : RESPOSTAS_VAZIAS)}
            onVoltar={voltarLista}
            onSalvarRascunho={(respostas) => salvarRascunho(tarefaAberta.id, respostas)}
            onEnviar={(respostas) => enviarRespostas(tarefaAberta.id, respostas)}
          />
        ) : (
        <>
        {/* título e botão ficam lado a lado também no mobile (o subtítulo é que quebra a linha) */}
        <header className="flex items-center justify-between gap-3 sm:items-start">
          <div className="min-w-0">
            <h1 className="text-[24px] font-extrabold text-texto">Tarefas</h1>
            <p className="mt-0.5 text-[13px] leading-snug text-secundaria sm:text-[14px]">Questionários e atividades do seu profissional</p>
          </div>
          <Button type="button" larguraAuto className="h-10 shrink-0 whitespace-nowrap px-3.5 sm:px-4 rounded-xl! text-[14px]! shadow-sm" onClick={() => setModalNova(true)}>
            <IconeMais tamanho={14} />
            Adicionar tarefa
          </Button>
        </header>

        <AbasComContagem abas={abas} ativa={abaAtiva} onMudar={setAbaAtiva} painel={ID_PAINEL} className="-mx-5 px-5 sm:mx-0 sm:px-0" />

        <div id={ID_PAINEL} role="tabpanel" aria-labelledby={`aba-${abaAtiva}`} className="flex flex-col gap-3">
          {visiveis.length > 0 ? (
            visiveis.map((tarefa) => <CartaoTarefa key={tarefa.id} tarefa={tarefa} onAcao={aoAcionar} />)
          ) : (
            <p className="rounded-xl bg-branco px-4 py-8 text-center text-[13px] text-secundaria">Nenhuma tarefa nesta aba.</p>
          )}
        </div>
        </>
        )}
      </div>

      <ModalNovaTarefa aberto={modalNova} onFechar={() => setModalNova(false)} onCriar={criarTarefa} />
      <Toast aberto={aviso.aberto} mensagem={aviso.mensagem} onFechar={fecharAviso} />
    </div>
  )
}

export default Tarefas
