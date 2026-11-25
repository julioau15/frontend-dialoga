// ============================================================
// pages/paciente/Tarefas
// Tarefas do paciente, ligadas à API (hook useTarefasPaciente). Rota: /paciente/tarefas
// A página troca entre três telas sem mudar a URL:
//   lista     -> frames "Tarefas todas / pendentes / em andamento / concluídas / em atraso"
//   preencher -> "Abrir tarefa" / "Continuar" (frame "Preencher tarefa") + modal "Confirmar envio"
//   ver       -> "Ver respostas" (frame "Ver Resposta")
// "Adicionar tarefa" abre o pop-up "Nova tarefa" e cria uma autotarefa (POST /tarefas).
// Os avisos (toasts) são "Atividade enviada com sucesso!" e "Tarefa criada com sucesso!".
// ============================================================
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../../../components/Button'
import AbasComContagem from '../../../components/AbasComContagem'
import Toast from '../../../components/Toast'
import CartaoTarefa from './components/CartaoTarefa'
import FormularioTarefa from './components/FormularioTarefa'
import ModalNovaTarefa from './components/ModalNovaTarefa'
import { IconeMais } from './components/iconesTarefas'
import { useTarefasPaciente } from '../../../hooks/useTarefasPaciente'

const ABAS = [
  { id: 'todas', rotulo: 'Todas' },
  { id: 'pendente', rotulo: 'Pendentes' },
  { id: 'andamento', rotulo: 'Em andamento' },
  { id: 'concluida', rotulo: 'Concluídas' },
  { id: 'atrasada', rotulo: 'Em atraso' },
]
const ID_PAINEL = 'lista-tarefas'

function Tarefas() {
  const { tarefas, carregando, erro, recarregar, criar, concluirAutotarefa, carregarRespostas, salvarRascunho, enviar } = useTarefasPaciente()
  const [abaAtiva, setAbaAtiva] = useState('todas')
  const [tela, setTela] = useState({ tipo: 'lista' }) // { tipo: 'lista' | 'preencher' | 'ver', id, respostas }
  const [abrindo, setAbrindo] = useState(false) // buscando as respostas salvas da tarefa
  const [salvando, setSalvando] = useState(false) // rascunho ou envio em andamento
  const [modalNova, setModalNova] = useState(false)
  const [aviso, setAviso] = useState({ aberto: false, mensagem: '', tipo: 'sucesso' })
  const fecharAviso = useCallback(() => setAviso((a) => ({ ...a, aberto: false })), [])

  // autotarefa: abre só para visualizar (não tem perguntas nem respostas para buscar)
  const verAutotarefa = (tarefa) => setTela({ tipo: 'ver', id: tarefa.id, respostas: {} })

  // vindo do Dashboard (clique numa tarefa): abre aquela tarefa assim que a lista carregar
  const location = useLocation()
  const navigate = useNavigate()
  const idParaAbrir = location.state?.abrirTarefa ?? null
  const jaAbriuRef = useRef(false)
  const montadoRef = useRef(true) // a resposta só abre a tarefa se a tela ainda estiver aberta
  useEffect(() => {
    montadoRef.current = true
    return () => {
      montadoRef.current = false
    }
  }, [])

  // ao trocar de tela, volta ao topo da página
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [tela])

  const avisar = (mensagem, tipo = 'sucesso') => setAviso({ aberto: true, mensagem, tipo })
  const voltarLista = () => setTela({ tipo: 'lista' })

  // botão do cartão: cada status leva para uma tela
  async function aoAcionar(tarefa) {
    if (abrindo) return
    if (tarefa.autotarefa && tarefa.status !== 'concluida') {
      setAbrindo(true)
      try {
        await concluirAutotarefa(tarefa)
        avisar('Tarefa concluída com sucesso!')
      } catch (e) {
        avisar(e.message, 'erro')
      } finally {
        setAbrindo(false)
      }
      return
    }
    // concluída -> "ver"; as demais -> "preencher". Em ambos buscamos as respostas já salvas.
    setAbrindo(true)
    try {
      const respostas = await carregarRespostas(tarefa)
      setTela({ tipo: tarefa.status === 'concluida' ? 'ver' : 'preencher', id: tarefa.id, respostas })
    } catch (e) {
      avisar(e.message, 'erro')
    } finally {
      setAbrindo(false)
    }
  }

  useEffect(() => {
    if (!idParaAbrir || jaAbriuRef.current || carregando) return
    jaAbriuRef.current = true
    // limpa o pedido da navegação, para não reabrir ao voltar ou recarregar
    navigate(location.pathname, { replace: true, state: null })
    const tarefa = tarefas.find((t) => String(t.id) === String(idParaAbrir))
    if (!tarefa) return
    // autotarefa abre direto na visualização (fora do corpo do efeito, como o .then abaixo)
    if (tarefa.autotarefa) {
      Promise.resolve().then(() => {
        if (montadoRef.current) verAutotarefa(tarefa)
      })
      return
    }

    // busca as respostas salvas e abre a tarefa ("ver" se concluída, senão "preencher").
    // Sem cancelamento no cleanup: limpar o state da navegação faz este efeito rodar de novo.
    carregarRespostas(tarefa)
      .then((respostas) => {
        if (montadoRef.current) setTela({ tipo: tarefa.status === 'concluida' ? 'ver' : 'preencher', id: tarefa.id, respostas })
      })
      .catch((e) => {
        if (montadoRef.current) setAviso({ aberto: true, mensagem: e.message, tipo: 'erro' })
      })
    // o efeito só precisa rodar quando a lista chega
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idParaAbrir, carregando, tarefas])

  async function criarTarefa(dados) {
    await criar(dados) // se falhar, o erro aparece dentro do pop-up
    setModalNova(false)
    avisar('Tarefa criada com sucesso!')
  }

  async function aoSalvarRascunho(tarefa, respostas) {
    setSalvando(true)
    try {
      await salvarRascunho(tarefa, respostas)
      avisar('Rascunho salvo com sucesso!')
    } catch (e) {
      avisar(e.message, 'erro')
    } finally {
      setSalvando(false)
    }
  }

  async function aoEnviar(tarefa, respostas) {
    setSalvando(true)
    try {
      await enviar(tarefa, respostas)
      voltarLista()
      avisar('Atividade enviada com sucesso!')
    } catch (e) {
      avisar(e.message, 'erro')
    } finally {
      setSalvando(false)
    }
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
    <div className="-m-6 min-h-svh bg-fundo-suave bg-pagina">
      <div className="mx-auto flex w-full max-w-[768px] flex-col gap-4 px-5 pt-6 pb-8 sm:gap-6 sm:px-6 sm:pt-14 sm:pb-12">
        {tarefaAberta ? (
          <FormularioTarefa
            key={`${tela.tipo}-${tarefaAberta.id}`}
            tarefa={tarefaAberta}
            somenteLeitura={tela.tipo === 'ver'}
            respostasIniciais={tela.respostas}
            salvando={salvando || abrindo}
            onVoltar={voltarLista}
            onSalvarRascunho={(respostas) => aoSalvarRascunho(tarefaAberta, respostas)}
            onEnviar={(respostas) => aoEnviar(tarefaAberta, respostas)}
            onConcluir={() => aoAcionar(tarefaAberta)}
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
          {carregando ? (
            <p role="status" className="rounded-xl bg-superficie px-4 py-8 text-center text-[13px] text-secundaria">Carregando tarefas...</p>
          ) : erro ? (
            <div role="alert" className="flex flex-col items-center gap-3 rounded-xl bg-superficie px-4 py-8 text-center">
              <p className="text-[13px] text-erro-texto">{erro}</p>
              <Button type="button" variante="suave" larguraAuto className="px-4 rounded-xl! text-[14px]!" onClick={recarregar}>Tentar novamente</Button>
            </div>
          ) : visiveis.length > 0 ? (
            visiveis.map((tarefa) => <CartaoTarefa key={tarefa.id} tarefa={tarefa} onAcao={aoAcionar} onVer={verAutotarefa} />)
          ) : (
            <p className="rounded-xl bg-superficie px-4 py-8 text-center text-[13px] text-secundaria">Nenhuma tarefa nesta aba.</p>
          )}
        </div>
        </>
        )}
      </div>

      <ModalNovaTarefa aberto={modalNova} onFechar={() => setModalNova(false)} onCriar={criarTarefa} />
      <Toast aberto={aviso.aberto} tipo={aviso.tipo} mensagem={aviso.mensagem} onFechar={fecharAviso} />
    </div>
  )
}

export default Tarefas
