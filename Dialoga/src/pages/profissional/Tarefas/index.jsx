// ============================================================
// pages/profissional/Tarefas
// Lista de tarefas (questionários) enviadas pelo profissional aos pacientes.
// Só visual: dados fixos (mock), sem API. Rota: /profissional/tarefas
// Cabeçalho: "Tarefas" + "Acompanhamento" e "+ Nova tarefa" (RF274, RF275).
// Abas com contagem: "Enviadas" e "Rascunhos" (RF274).
// Cada item: nome, perguntas, prazo, selo de status e editar (RF290).
// Desktop, Tablet e Mobile (403px): no mobile os botões descem para baixo do título.
// ============================================================
import { useMemo, useState } from 'react'
import Button from '../../../components/Button'
import AbasComContagem from '../../../components/AbasComContagem'
import { Atividade } from '../../../components/Icones'
import { IconeMais } from '../../../components/IconesAgenda'
import ItemTarefa from './components/ItemTarefa'
import { TAREFAS_MOCK } from './components/tarefasMock'

const ABAS = [
  { id: 'enviadas', rotulo: 'Enviadas' },
  { id: 'rascunhos', rotulo: 'Rascunhos' },
]
const ID_PAINEL = 'lista-tarefas-profissional'

// texto mostrado quando a aba não tem tarefas (TODO: confirmar texto no Figma)
const TEXTO_VAZIO = {
  enviadas: 'Nenhuma tarefa enviada.',
  rascunhos: 'Nenhum rascunho salvo.',
}

// botões do cabeçalho: largura total no mobile (lado a lado) e largura do conteúdo a partir de sm
const BOTAO_CABECALHO = 'whitespace-nowrap rounded-xl! text-[14px]! shadow-sm sm:w-auto'

function Tarefas() {
  const [tarefas] = useState(TAREFAS_MOCK)
  const [abaAtiva, setAbaAtiva] = useState('enviadas')

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

  // TODO: ligar às telas de Acompanhamento, Nova tarefa e Editar tarefa (tasks próprias)
  function abrirAcompanhamento() {}
  function novaTarefa() {}
  function editarTarefa() {}

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave">
      <div className="mx-auto flex w-full max-w-[768px] flex-col gap-4 px-5 pt-6 pb-8 sm:gap-6 sm:px-6 sm:pt-14 sm:pb-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-[24px] font-extrabold text-texto">Tarefas</h1>
            <p className="mt-0.5 text-[13px] leading-snug text-secundaria sm:text-[14px]">Questionários enviados aos pacientes</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
            <Button type="button" variante="contorno" className={BOTAO_CABECALHO} onClick={abrirAcompanhamento}>
              <Atividade className="h-3.5 w-3.5" />
              Acompanhamento
            </Button>
            <Button type="button" className={BOTAO_CABECALHO} onClick={novaTarefa}>
              <IconeMais tamanho={14} />
              Nova tarefa
            </Button>
          </div>
        </header>

        <AbasComContagem
          abas={abas}
          ativa={abaAtiva}
          onMudar={setAbaAtiva}
          painel={ID_PAINEL}
          rotulo="Tipo de tarefa"
          className="-mx-5 px-5 sm:mx-0 sm:px-0"
        />

        <div id={ID_PAINEL} role="tabpanel" aria-labelledby={`aba-${abaAtiva}`} className="flex flex-col gap-3">
          {visiveis.length > 0 ? (
            visiveis.map((tarefa) => <ItemTarefa key={tarefa.id} tarefa={tarefa} onEditar={editarTarefa} />)
          ) : (
            <p className="rounded-xl bg-branco px-4 py-8 text-center text-[13px] text-secundaria">{TEXTO_VAZIO[abaAtiva]}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Tarefas
