// ============================================================
// pages/profissional/Agenda
// Agenda do profissional, integrada à API (consultas, pacientes e disponibilidade).
// Frames: Agenda - Profissional | Nova consulta | Detalhes da consulta |
//         Editar consulta | Excluir consulta | Consulta excluída |
//         Disponibilidade - Profissional | Adicionar disponibilidade |
//         Disponibilidade adicionada | Remover disponibilidade.
// Desktop, Tablet e Mobile (403px): a página empilha as colunas em telas menores.
// Rota: /profissional/agenda
// ============================================================
import { useCallback, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { useAgendaProfissional } from '../../../hooks/useAgendaProfissional'
import Button from '../../../components/Button'
import Toast from '../../../components/Toast'
import TextField from '../../../components/TextField'
import Card from '../../../components/Card'
import IconeBusca from '../../../components/IconeBusca'
import AbasSegmentadas from '../../../components/AbasSegmentadas'
import CalendarioMes from '../../../components/CalendarioMes'
import CartaoConsulta from '../../../components/CartaoConsulta'
import { IconeCalendarioPequeno, IconeMais, IconeRelogioPequeno } from '../../../components/IconesAgenda'
import { dataPorExtenso, hojeNoBrasil, normalizar } from '../../../utils/datasAgenda'
import { anoEMes, semanaDe } from '../../../utils/datasAgendaPaciente'
import FiltroPeriodo from './components/FiltroPeriodo'
import {
  acharConflito,
  diaDaSemana,
  diasComDisponibilidade,
  ordenarDisponibilidades,
  siglaDoDia,
  faixaDeHorario,
} from '../../../utils/disponibilidade'
import ModalConsulta from './components/ModalConsulta'
import ModalDetalhes from './components/ModalDetalhes'
import ModalExcluir from './components/ModalExcluir'
import ModalDisponibilidade from './components/ModalDisponibilidade'
import ModalRemoverDisponibilidade from './components/ModalRemoverDisponibilidade'
import PainelDisponibilidade from './components/PainelDisponibilidade'

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
  const { auth } = useAuth()
  const agenda = useAgendaProfissional(auth?.token)
  const { consultas, pacientes, disponibilidades } = agenda
  const [hoje] = useState(hojeNoBrasil) // 'AAAA-MM-DD' de hoje (fuso de São Paulo, igual ao back)
  // vindo do Dashboard (clique num atendimento): abre no dia daquele atendimento
  const { state } = useLocation()
  const diaInicial = /^\d{4}-\d{2}-\d{2}$/.test(state?.data ?? '') ? state.data : null
  const [aba, setAba] = useState('eventos')
  const [busca, setBusca] = useState('')
  const [periodo, setPeriodo] = useState('hoje') // 'todos' | 'hoje' | 'semana'
  // em "Todos" ou "Semana", clicar num dia do calendário faz a lista mostrar só aquele dia
  // (o filtro continua o mesmo); trocar o filtro volta a lista ao normal
  const [diaClicado, setDiaClicado] = useState(false)
  const [mesVisivel, setMesVisivel] = useState(() => anoEMes(diaInicial ?? hojeNoBrasil())) // mes de 0 a 11
  const [selecionado, setSelecionado] = useState(diaInicial ?? hoje)
  // modal aberto: null | { tipo: 'nova' | 'detalhes' | 'editar' | 'excluir', consulta? }
  const [modal, setModal] = useState(null)
  // pop-up de disponibilidade: false (fechado) | { item: null } (adicionar) | { item } (editar)
  const [modalDisponibilidade, setModalDisponibilidade] = useState(false)
  const [erroDisponibilidade, setErroDisponibilidade] = useState('')
  // disponibilidade aguardando confirmação no pop-up "Remover disponibilidade" (null = fechado)
  const [disponibilidadeRemover, setDisponibilidadeRemover] = useState(null)
  const [toast, setToast] = useState({ aberto: false, tipo: 'sucesso', mensagem: '' })
  const fecharToast = useCallback(() => setToast((t) => ({ ...t, aberto: false })), [])
  const mostrarToast = (tipo, mensagem) => setToast({ aberto: true, tipo, mensagem })
  const fecharModal = () => setModal(null)

  const filtradas = useMemo(
    () => ordenar(consultas.filter((c) => normalizar(c.paciente).includes(normalizar(busca.trim())))),
    [consultas, busca],
  )
  // Consultas do período escolhido no filtro Todos | Hoje | Semana
  // (Hoje = dia selecionado no calendário; Semana = semana desse dia).
  // Com um dia clicado no calendário, a lista mostra só o dia selecionado.
  const mostrandoDia = periodo === 'hoje' || diaClicado
  const doPeriodo = useMemo(() => {
    if (mostrandoDia) return filtradas.filter((c) => c.data === selecionado)
    if (periodo === 'todos') return filtradas
    const dias = new Set(semanaDe(selecionado))
    return filtradas.filter((c) => dias.has(c.data))
  }, [filtradas, periodo, selecionado, mostrandoDia])
  const tituloPeriodo = mostrandoDia
    ? dataPorExtenso(selecionado)
    : periodo === 'todos' ? 'Todas as consultas' : 'Consultas da semana'
  const varianteCartao = mostrandoDia ? 'dia' : { todos: 'proxima', semana: 'semana' }[periodo]
  // Próximos atendimentos: só o que ainda não aparece na lista do período acima
  const idsNoPeriodo = useMemo(() => new Set(doPeriodo.map((c) => c.id)), [doPeriodo])
  const proximas = filtradas.filter((c) => c.data >= hoje && !idsNoPeriodo.has(c.id))
  const diasComConsulta = useMemo(() => new Set(consultas.map((c) => c.data)), [consultas])
  const listaDisponibilidade = useMemo(() => ordenarDisponibilidades(disponibilidades), [disponibilidades])
  const diasDisponiveis = useMemo(
    () => diasComDisponibilidade(disponibilidades, mesVisivel.ano, mesVisivel.mes),
    [disponibilidades, mesVisivel],
  )
  const naAbaDisponibilidade = aba === 'disponibilidade'

  // clique num dia do calendário: em "Todos" ou "Semana" a lista passa a mostrar só aquele dia
  function escolherDia(dia) {
    setSelecionado(dia)
    if (periodo !== 'hoje') setDiaClicado(true)
  }

  // trocar o filtro volta a lista ao período escolhido
  function mudarPeriodo(novo) {
    setPeriodo(novo)
    setDiaClicado(false)
  }

  function mudarMes(delta) {
    setMesVisivel(({ ano, mes }) => {
      const novo = new Date(Date.UTC(ano, mes + delta, 1))
      return { ano: novo.getUTCFullYear(), mes: novo.getUTCMonth() }
    })
  }

  // Salvar (nova ou editada) na API. Devolve true/false para o pop-up saber se limpa o formulário.
  // continuar = true ("Adicionar +"): mantém o pop-up aberto para cadastrar outra
  async function salvar(dados, { continuar } = {}) {
    const editando = modal.tipo === 'editar'
    try {
      await agenda.salvarConsulta(dados, editando ? modal.consulta.id : undefined)
    } catch (erro) {
      mostrarToast('erro', erro.message)
      return false
    }
    mostrarToast('sucesso', editando ? 'Consulta atualizada!' : 'Consulta agendada!')
    if (!continuar) fecharModal()
    return true
  }

  async function excluir() {
    try {
      await agenda.excluirConsulta(modal.consulta.id)
    } catch (erro) {
      mostrarToast('erro', erro.message)
      return
    }
    fecharModal()
    mostrarToast('erro', 'Consulta excluída!')
  }

  function fecharModalDisponibilidade() {
    setModalDisponibilidade(false)
    setErroDisponibilidade('')
  }

  // Salvar: semanal cria um item por dia escolhido; "Repetir semanalmente" desligado vira
  // "Única vez" na data escolhida. Editando, o item editado não conta como conflito.
  async function salvarDisponibilidade({ dias, inicio, fim, repetir, data }) {
    const editando = modalDisponibilidade?.item ?? null
    // confere conflito na tela antes de chamar a API (o back não confere sobreposição)
    const novas = repetir
      ? dias.map((dia) => ({
          dia,
          inicio,
          fim,
          tipo: editando?.tipo === 'periodo' ? 'periodo' : 'semanal',
          data: editando?.data,
          dataFinal: editando?.dataFinal,
        }))
      : [{ dia: diaDaSemana(data), inicio, fim, tipo: 'unica', data }]
    const existentes = editando ? disponibilidades.filter((d) => d.id !== editando.id) : disponibilidades
    const conflito = acharConflito(novas, existentes)
    if (conflito) {
      setErroDisponibilidade(
        `Já existe disponibilidade na ${siglaDoDia(conflito.dia)} em ${faixaDeHorario(conflito)}. Ajuste o horário.`,
      )
      return
    }

    try {
      if (editando) await agenda.editarDisponibilidade(editando, { dias, inicio, fim, repetir, data })
      else await agenda.adicionarDisponibilidade({ dias, inicio, fim, repetir, data, hoje })
    } catch (erro) {
      setErroDisponibilidade(erro.message)
      return
    }
    fecharModalDisponibilidade()
    mostrarToast('sucesso', editando ? 'Disponibilidade atualizada!' : 'Disponibilidade adicionada!')
  }

  // Só remove depois da confirmação no pop-up (RF37, RF40)
  async function removerDisponibilidade() {
    try {
      await agenda.removerDisponibilidade(disponibilidadeRemover)
    } catch (erro) {
      mostrarToast('erro', erro.message)
      return
    }
    setDisponibilidadeRemover(null)
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

        {agenda.carregando && (
          <Card as="p" role="status" className="px-4 py-6 text-center text-[12px] text-secundaria">
            Carregando sua agenda...
          </Card>
        )}

        {!agenda.carregando && agenda.erro && (
          <Card role="alert" className="flex flex-col items-center gap-3 px-4 py-6 text-center">
            <p className="text-[12px] text-erro">{agenda.erro}</p>
            <Button type="button" larguraAuto variante="suave" onClick={agenda.recarregar}>Tentar novamente</Button>
          </Card>
        )}

        {/* Mobile: busca/filtro, calendário, lista. Tablet/desktop: calendário à esquerda, busca e lista à direita */}
        <div className={`grid items-start gap-x-5 gap-y-4 md:grid-cols-[256px_1fr] md:grid-rows-[auto_1fr] lg:grid-cols-[280px_1fr] ${agenda.carregando || agenda.erro ? 'hidden' : ''}`}>
          <div className="md:col-start-1 md:row-span-2 md:row-start-1">
            <CalendarioMes
              ano={mesVisivel.ano}
              mes={mesVisivel.mes}
              selecionado={selecionado}
              diasComConsulta={naAbaDisponibilidade ? SEM_CONSULTAS : diasComConsulta}
              diasComDisponibilidade={naAbaDisponibilidade ? diasDisponiveis : undefined}
              legenda={naAbaDisponibilidade ? 'Dias com disponibilidade' : undefined}
              onSelecionar={escolherDia}
              onMudarMes={mudarMes}
            />
          </div>

          {naAbaDisponibilidade ? (
            <div className="min-w-0 md:col-start-2 md:row-span-2 md:row-start-1">
              <PainelDisponibilidade
                itens={listaDisponibilidade}
                onAdicionar={() => setModalDisponibilidade({ item: null })}
                onEditar={(item) => setModalDisponibilidade({ item })}
                onRemover={setDisponibilidadeRemover}
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
                <FiltroPeriodo periodo={periodo} onMudar={mudarPeriodo} />
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
                      {mostrandoDia ? 'Não há consultas neste dia' : 'Não há consultas registradas'}
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

      {modal?.tipo === 'nova' && <ModalConsulta pacientes={pacientes} buscarHorarios={agenda.horarios} onFechar={fecharModal} onSalvar={salvar} />}
      {modal?.tipo === 'editar' && (
        <ModalConsulta modo="editar" consulta={modal.consulta} pacientes={pacientes} buscarHorarios={agenda.horarios} onFechar={fecharModal} onSalvar={salvar} />
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
          key={modalDisponibilidade.item?.id ?? 'nova'}
          inicial={modalDisponibilidade.item}
          hoje={hoje}
          onFechar={fecharModalDisponibilidade}
          onSalvar={salvarDisponibilidade}
          erroGeral={erroDisponibilidade}
        />
      )}

      {disponibilidadeRemover && (
        <ModalRemoverDisponibilidade
          item={disponibilidadeRemover}
          onFechar={() => setDisponibilidadeRemover(null)}
          onConfirmar={removerDisponibilidade}
        />
      )}

      <Toast {...toast} onFechar={fecharToast} />
    </div>
  )
}

export default Agenda
