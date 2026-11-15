// ============================================================
// pages/profissional/Tarefas
// Lista de tarefas (questionários) enviadas pelo profissional aos pacientes.
// Só visual: dados fixos (mock), sem API. Rota: /profissional/tarefas
// Frames: "Tarefas - Profissional", "Tarefas rascunho", "Tarefas enviado ao paciente"
//         e "Tarefas profissional - mobile".
// Cabeçalho: "Tarefas" + "Acompanhamento" e "+ Nova tarefa" (RF274, RF275).
// Abas "Enviadas (n)" e "Rascunhos (n)" (RF274); aba sem tarefas mostra o estado vazio.
// Cada item: nome, perguntas, prazo, selo de status e editar (RF290).
// "+ Nova tarefa" abre /profissional/tarefas/nova; ao voltar de lá com um aviso
// (ex.: "Questionário enviado ao(s) paciente(s)!"), a lista mostra o toast.
// "Acompanhamento" abre /profissional/tarefas/acompanhamento.
// O ícone de atividade do item abre direto a tela de resposta daquela tarefa
// (o envio mais recente); tarefa sem envios abre o acompanhamento já buscando por ela.
// O lápis do item abre /profissional/tarefas/:id/editar (tela Editar tarefa).
// Desktop, Tablet e Mobile (403px): no mobile os botões descem para baixo do título.
// ============================================================
import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../../../components/Button'
import Toast from '../../../components/Toast'
import { Usuarios } from '../../../components/Icones'
import { IconeMais } from '../../../components/IconesAgenda'
import { respostaMaisRecente } from '../AcompanhamentoTarefas/components/acompanhamentoMock'
import AbasTarefas from './components/AbasTarefas'
import ItemTarefa from './components/ItemTarefa'
import { TAREFAS_MOCK } from './components/tarefasMock'

const ABAS = [
  { id: 'enviadas', rotulo: 'Enviadas' },
  { id: 'rascunhos', rotulo: 'Rascunhos' },
]
const ID_PAINEL = 'lista-tarefas-profissional'

// estado vazio de cada aba (o de "Rascunhos" é o do Figma)
const VAZIO = {
  enviadas: { titulo: 'Nenhuma tarefa enviada', texto: 'Crie uma nova tarefa para enviar aos seus pacientes.' },
  rascunhos: { titulo: 'Nenhum rascunho', texto: 'Salve tarefas como rascunho para enviar depois.' },
}

// botões do cabeçalho (cantos 12px, texto 14px em negrito, como no Figma)
const BOTAO_BASE = 'h-[42px]! rounded-xl! px-4! text-[14px]! font-bold! sm:px-[18px]!'
const BOTAO_CLARO = `${BOTAO_BASE} border-2! border-borda! bg-fundo-suave-2!`

function Tarefas() {
  const [tarefas] = useState(TAREFAS_MOCK)
  const [abaAtiva, setAbaAtiva] = useState('enviadas')
  const navigate = useNavigate()
  const location = useLocation()
  // aviso enviado pela tela Nova tarefa ao salvar o rascunho ou enviar a tarefa
  const [aviso, setAviso] = useState(() => ({ aberto: Boolean(location.state?.aviso), mensagem: location.state?.aviso ?? '' }))

  // fecha o toast e limpa o aviso da navegação (para não voltar ao recarregar a página)
  const fecharAviso = useCallback(() => {
    setAviso((a) => ({ ...a, aberto: false }))
    navigate(location.pathname, { replace: true, state: null })
  }, [navigate, location.pathname])

  // separa as tarefas pela coluna is_rascunho (1 = rascunho)
  const grupos = useMemo(
    () => ({
      enviadas: tarefas.filter((t) => !t.is_rascunho),
      rascunhos: tarefas.filter((t) => t.is_rascunho),
    }),
    [tarefas],
  )

  // número ao lado de cada aba
  const abas = ABAS.map((aba) => ({ ...aba, contagem: grupos[aba.id].length }))
  const visiveis = grupos[abaAtiva]

  // lápis do cartão: abre a tela Editar tarefa
  function editarTarefa(tarefa) {
    navigate(`/profissional/tarefas/${tarefa.id}/editar`)
  }

  // botão "Acompanhamento" do cabeçalho: abre o acompanhamento de respostas
  function abrirAcompanhamento() {
    navigate('/profissional/tarefas/acompanhamento')
  }

  // ícone de atividade de uma tarefa: abre direto a tela de resposta dela;
  // sem envios, abre o acompanhamento já buscando pela tarefa
  function verRespostas(tarefa) {
    const envio = respostaMaisRecente(tarefa.id)
    if (envio) navigate(`/profissional/tarefas/acompanhamento/${envio.id}`)
    else navigate('/profissional/tarefas/acompanhamento', { state: { busca: tarefa.titulo } })
  }

  // abre a tela de criação de tarefa
  function novaTarefa() {
    navigate('/profissional/tarefas/nova')
  }

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave">
      <div className="mx-auto flex w-full max-w-[768px] flex-col px-5 pt-6 pb-8 sm:px-6 sm:pt-14 sm:pb-12">
        <header className="flex flex-col gap-3.5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[22px] font-extrabold leading-tight text-texto">Tarefas</h1>
            <p className="mt-1 text-[13px] leading-snug text-secundaria">Questionários enviados aos pacientes</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:shrink-0 sm:gap-[18px]">
            <Button type="button" variante="suave" larguraAuto className={BOTAO_CLARO} onClick={abrirAcompanhamento}>
              <Usuarios className="h-4 w-4 text-primaria" />
              Acompanhamento
            </Button>
            <Button type="button" larguraAuto className={`${BOTAO_BASE} shadow-sm`} onClick={novaTarefa}>
              <IconeMais tamanho={14} />
              Nova tarefa
            </Button>
          </div>
        </header>

        <div className="mt-5 sm:mt-6">
          <AbasTarefas abas={abas} ativa={abaAtiva} onMudar={setAbaAtiva} painel={ID_PAINEL} />
        </div>

        <div id={ID_PAINEL} role="tabpanel" aria-labelledby={`aba-${abaAtiva}`} className="mt-5 flex flex-col gap-3.5">
          {visiveis.length > 0 ? (
            visiveis.map((tarefa) => (
              <ItemTarefa key={tarefa.id} tarefa={tarefa} onEditar={editarTarefa} onVerRespostas={verRespostas} />
            ))
          ) : (
            // estado vazio (frame "Tarefas rascunho")
            <div className="flex flex-col items-center pt-16 text-center">
              <span
                aria-hidden="true"
                className="grid h-16 w-16 place-items-center rounded-2xl border border-borda bg-fundo-suave-2 text-[26px] shadow-[0_2px_6px_var(--color-sombra)]"
              >
                📝
              </span>
              <p className="mt-5 text-[15px] font-bold text-texto">{VAZIO[abaAtiva].titulo}</p>
              <p className="mt-2 text-[13px] text-secundaria">{VAZIO[abaAtiva].texto}</p>
            </div>
          )}
        </div>
      </div>

      <Toast aberto={aviso.aberto} mensagem={aviso.mensagem} onFechar={fecharAviso} />
    </div>
  )
}

export default Tarefas
