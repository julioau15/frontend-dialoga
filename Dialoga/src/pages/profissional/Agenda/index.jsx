// ============================================================
// pages/profissional/Agenda
// Agenda do profissional (só visual, dados fixos e estado local).
// Frames: Agenda - Profissional | Nova consulta | Detalhes da consulta |
//         Editar consulta | Excluir consulta | Consulta excluída |
//         Disponibilidade - Profissional | Adicionar disponibilidade |
//         Disponibilidade adicionada | Remover disponibilidade.
// Ainda sem frame: as telas Tablet/Mobile (a página só empilha as colunas em telas menores).
// Rota: /profissional/agenda
// ============================================================
import { useCallback, useMemo, useState } from 'react'
import Button from '../../../components/Button'
import Toast from '../../../components/Toast'
import TextField from '../../../components/TextField'
import Card from '../../../components/Card'
import IconeBusca from '../../../components/IconeBusca'
import AbasSegmentadas from '../../../components/AbasSegmentadas'
import CalendarioMes from '../../../components/CalendarioMes'
import CartaoConsulta from '../../../components/CartaoConsulta'
import { IconeCalendarioPequeno, IconeMais, IconeRelogioPequeno } from '../../../components/IconesAgenda'
import { dataPorExtenso, normalizar } from '../../../utils/datasAgenda'
import { semanaDe } from '../../../utils/datasAgendaPaciente'
import FiltroPeriodo from './components/FiltroPeriodo'
import {
  acharConflito,
  diasComDisponibilidade,
  ordenarDisponibilidades,
  proximaData,
  siglaDoDia,
  faixaDeHorario,
} from '../../../utils/disponibilidade'
import { CONSULTAS_MOCK, HOJE } from './components/consultasMock'
import ModalConsulta from './components/ModalConsulta'
import ModalDetalhes from './components/ModalDetalhes'
import ModalExcluir from './components/ModalExcluir'
import ModalDisponibilidade from './components/ModalDisponibilidade'
import PainelDisponibilidade from './components/PainelDisponibilidade'
import { DISPONIBILIDADES_MOCK } from './components/disponibilidadesMock'

const ABAS = [
  { id: 'eventos', rotulo: 'Eventos', icone: <IconeCalendarioPequeno tamanho={12} /> },
  { id: 'disponibilidade', rotulo: 'Disponibilidade', icone: <IconeRelogioPequeno tamanho={12} /> },
]

const RotuloSecao = ({ children }) => (
  <h2 className="text-[10px] font-semibold uppercase tracking-[0.06em] text-secundaria">{children}</h2>
)

const SEM_CONSULTAS = new Set() // na aba Disponibilidade o calendário não mostra o pontinho de consulta

const ordenar = (lista) => [...lista].sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`))

function Agenda() {
  const [consultas, setConsultas] = useState(CONSULTAS_MOCK)
  const [aba, setAba] = useState('eventos')
  const [busca, setBusca] = useState('')
  const [periodo, setPeriodo] = useState('hoje') // 'todos' | 'hoje' | 'semana'
  const [mesVisivel, setMesVisivel] = useState({ ano: 2026, mes: 8 }) // mes de 0 a 11 (8 = setembro)
  const [selecionado, setSelecionado] = useState(HOJE)
  // modal aberto: null | { tipo: 'nova' | 'detalhes' | 'editar' | 'excluir', consulta? }
  const [modal, setModal] = useState(null)
  const [disponibilidades, setDisponibilidades] = useState(DISPONIBILIDADES_MOCK)
  const [modalDisponibilidade, setModalDisponibilidade] = useState(false)
  const [erroDisponibilidade, setErroDisponibilidade] = useState('')
  const [toast, setToast] = useState({ aberto: false, tipo: 'sucesso', mensagem: '' })
  const fecharToast = useCallback(() => setToast((t) => ({ ...t, aberto: false })), [])
  const mostrarToast = (tipo, mensagem) => setToast({ aberto: true, tipo, mensagem })
  const fecharModal = () => setModal(null)

  const filtradas = useMemo(
    () => ordenar(consultas.filter((c) => normalizar(c.paciente).includes(normalizar(busca.trim())))),
    [consultas, busca],
  )
  // Consultas do período escolhido no filtro Todos | Hoje | Semana
  // (Hoje = dia selecionado no calendário; Semana = semana desse dia)
  const doPeriodo = useMemo(() => {
    if (periodo === 'todos') return filtradas
    if (periodo === 'semana') {
      const dias = new Set(semanaDe(selecionado))
      return filtradas.filter((c) => dias.has(c.data))
    }
    return filtradas.filter((c) => c.data === selecionado)
  }, [filtradas, periodo, selecionado])
  const tituloPeriodo =
    periodo === 'todos' ? 'Todas as consultas' : periodo === 'semana' ? 'Consultas da semana' : dataPorExtenso(selecionado)
  const varianteCartao = { todos: 'proxima', hoje: 'dia', semana: 'semana' }[periodo]
  const proximas = filtradas.filter((c) => c.data >= HOJE)
  const diasComConsulta = useMemo(() => new Set(consultas.map((c) => c.data)), [consultas])
  const listaDisponibilidade = useMemo(() => ordenarDisponibilidades(disponibilidades), [disponibilidades])
  const diasDisponiveis = useMemo(
    () => diasComDisponibilidade(disponibilidades, mesVisivel.ano, mesVisivel.mes),
    [disponibilidades, mesVisivel],
  )
  const naAbaDisponibilidade = aba === 'disponibilidade'

  function mudarMes(delta) {
    setMesVisivel(({ ano, mes }) => {
      const novo = new Date(Date.UTC(ano, mes + delta, 1))
      return { ano: novo.getUTCFullYear(), mes: novo.getUTCMonth() }
    })
  }

  // Salvar (nova ou editada): só altera a lista na tela, sem API
  // continuar = true ("Adicionar +"): mantém o pop-up aberto para cadastrar outra
  function salvar(dados, { continuar } = {}) {
    if (modal.tipo === 'editar') {
      setConsultas((lista) => lista.map((c) => (c.id === modal.consulta.id ? { ...c, ...dados } : c)))
      mostrarToast('sucesso', 'Consulta atualizada!')
    } else {
      setConsultas((lista) => [...lista, { id: Date.now(), especialidade: 'Psicologia Clínica', ...dados }])
      mostrarToast('sucesso', 'Consulta agendada!')
    }
    if (!continuar) fecharModal()
  }

  function excluir() {
    setConsultas((lista) => lista.filter((c) => c.id !== modal.consulta.id))
    fecharModal()
    mostrarToast('erro', 'Consulta excluída!')
  }

  function fecharModalDisponibilidade() {
    setModalDisponibilidade(false)
    setErroDisponibilidade('')
  }

  // Salvar: cria um item por dia escolhido. "Repetir semanalmente" desligado vira
  // "Única vez" na próxima data (hoje inclusive) que cai naquele dia da semana.
  function salvarDisponibilidade({ dias, inicio, fim, repetir }) {
    const base = Date.now()
    const novas = dias.map((dia, i) => ({
      id: base + i,
      dia,
      inicio,
      fim,
      tipo: repetir ? 'semanal' : 'unica',
      ...(repetir ? {} : { data: proximaData(dia, HOJE) }),
    }))

    const conflito = acharConflito(novas, disponibilidades)
    if (conflito) {
      setErroDisponibilidade(
        `Já existe disponibilidade na ${siglaDoDia(conflito.dia)} em ${faixaDeHorario(conflito)}. Ajuste o horário.`,
      )
      return
    }

    setDisponibilidades((lista) => [...lista, ...novas])
    fecharModalDisponibilidade()
    mostrarToast('sucesso', 'Disponibilidade adicionada!')
  }

  function removerDisponibilidade(item) {
    setDisponibilidades((lista) => lista.filter((d) => d.id !== item.id))
    mostrarToast('sucesso', 'Disponibilidade removida.')
  }

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave">
      {/* conteúdo limitado a ~976px e centralizado no desktop (como no Figma) */}
      <div className="mx-auto flex w-full max-w-[1040px] flex-col gap-5 px-4 py-8 sm:px-8">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-extrabold text-texto">Agenda</h1>
            <p className="text-[12px] text-secundaria">Gerencie seus atendimentos</p>
          </div>
          <Button type="button" larguraAuto onClick={() => setModal({ tipo: 'nova' })}>
            <IconeMais tamanho={14} />
            Nova consulta
          </Button>
        </header>

        <AbasSegmentadas abas={ABAS} ativa={aba} onMudar={setAba} />

        {/* Mobile: busca/filtro, calendário, lista. Tablet/desktop: calendário à esquerda, busca e lista à direita */}
        <div className="grid items-start gap-x-5 gap-y-4 md:grid-cols-[256px_1fr] md:grid-rows-[auto_1fr] lg:grid-cols-[280px_1fr]">
          <div className="md:col-start-1 md:row-span-2 md:row-start-1">
            <CalendarioMes
              ano={mesVisivel.ano}
              mes={mesVisivel.mes}
              selecionado={selecionado}
              diasComConsulta={naAbaDisponibilidade ? SEM_CONSULTAS : diasComConsulta}
              diasComDisponibilidade={naAbaDisponibilidade ? diasDisponiveis : undefined}
              legenda={naAbaDisponibilidade ? 'Dias com disponibilidade' : undefined}
              onSelecionar={setSelecionado}
              onMudarMes={mudarMes}
            />
          </div>

          {naAbaDisponibilidade ? (
            <div className="min-w-0 md:col-start-2 md:row-span-2 md:row-start-1">
              <PainelDisponibilidade
                itens={listaDisponibilidade}
                onAdicionar={() => setModalDisponibilidade(true)}
                onRemover={removerDisponibilidade}
              />
            </div>
          ) : (
            <>
              <div className="order-first flex min-w-0 items-center gap-2 md:order-none md:col-start-2 md:row-start-1">
                {/* só o campo, sem rótulo visível (o nome fica para leitores de tela) */}
                <div className="min-w-0 flex-1 [&>div>label]:sr-only">
                  <TextField
                    label="Buscar paciente"
                    aria-label="Buscar paciente"
                    icone={<IconeBusca />}
                    placeholder="Buscar paciente..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>
                <FiltroPeriodo periodo={periodo} onMudar={setPeriodo} />
              </div>

              <div className="flex min-w-0 flex-col gap-4 md:col-start-2 md:row-start-2">
                <section className="flex flex-col gap-2">
                  <RotuloSecao>{tituloPeriodo}</RotuloSecao>
                  {doPeriodo.length > 0 ? (
                    doPeriodo.map((c) => (
                      <CartaoConsulta
                        key={c.id}
                        variante={varianteCartao}
                        consulta={c}
                        onAbrir={() => setModal({ tipo: 'detalhes', consulta: c })}
                      />
                    ))
                  ) : (
                    <Card as="p" className="px-4 py-6 text-center text-[12px] text-secundaria">
                      Não há consultas registradas
                    </Card>
                  )}
                </section>
  
                {proximas.length > 0 && (
                  <section className="flex flex-col gap-2">
                    <RotuloSecao>Próximos atendimentos</RotuloSecao>
                    {proximas.map((c) => (
                      <CartaoConsulta
                        key={c.id}
                        variante="proxima"
                        consulta={c}
                        onAbrir={() => setModal({ tipo: 'detalhes', consulta: c })}
                      />
                    ))}
                  </section>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {modal?.tipo === 'nova' && <ModalConsulta onFechar={fecharModal} onSalvar={salvar} />}
      {modal?.tipo === 'editar' && (
        <ModalConsulta modo="editar" consulta={modal.consulta} onFechar={fecharModal} onSalvar={salvar} />
      )}
      {modal?.tipo === 'detalhes' && (
        <ModalDetalhes
          consulta={modal.consulta}
          onFechar={fecharModal}
          onEditar={() => setModal({ tipo: 'editar', consulta: modal.consulta })}
          onExcluir={() => setModal({ tipo: 'excluir', consulta: modal.consulta })}
        />
      )}
      {modal?.tipo === 'excluir' && <ModalExcluir consulta={modal.consulta} onFechar={fecharModal} onConfirmar={excluir} />}

      {modalDisponibilidade && (
        <ModalDisponibilidade
          onFechar={fecharModalDisponibilidade}
          onSalvar={salvarDisponibilidade}
          erroGeral={erroDisponibilidade}
        />
      )}

      <Toast {...toast} onFechar={fecharToast} />
    </div>
  )
}

export default Agenda
