// ============================================================
// pages/profissional/Agenda
// Agenda do profissional (só visual, dados fixos e estado local).
// Frames: Agenda - Profissional | Nova consulta | Detalhes da consulta |
//         Editar consulta | Excluir consulta | Consulta excluída.
// Ainda sem frame: aba "Disponibilidade" (fica desabilitada) e as telas
// Tablet/Mobile (a página só empilha as colunas em telas menores).
// Rota: /profissional/agenda
// ============================================================
import { useCallback, useMemo, useState } from 'react'
import Button from '../../../components/Button'
import Toast from '../../../components/Toast'
import TextField from '../../../components/TextField'
import IconeBusca from '../../../components/IconeBusca'
import AbasSegmentadas from '../../../components/AbasSegmentadas'
import CalendarioMes from '../../../components/CalendarioMes'
import CartaoConsulta from '../../../components/CartaoConsulta'
import { IconeCalendarioPequeno, IconeMais, IconeRelogioPequeno } from '../../../components/IconesAgenda'
import { dataPorExtenso, normalizar } from '../../../utils/datasAgenda'
import { CONSULTAS_MOCK, HOJE } from './components/consultasMock'
import ModalConsulta from './components/ModalConsulta'
import ModalDetalhes from './components/ModalDetalhes'
import ModalExcluir from './components/ModalExcluir'

const ABAS = [
  { id: 'eventos', rotulo: 'Eventos', icone: <IconeCalendarioPequeno tamanho={12} /> },
  // Sem frame no Figma: aba só aparece, ainda sem conteúdo
  { id: 'disponibilidade', rotulo: 'Disponibilidade', icone: <IconeRelogioPequeno tamanho={12} />, desabilitada: true },
]

const RotuloSecao = ({ children }) => (
  <h2 className="text-[10px] font-semibold uppercase tracking-[0.06em] text-secundaria">{children}</h2>
)

const ordenar = (lista) => [...lista].sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`))

function Agenda() {
  const [consultas, setConsultas] = useState(CONSULTAS_MOCK)
  const [aba, setAba] = useState('eventos')
  const [busca, setBusca] = useState('')
  const [mesVisivel, setMesVisivel] = useState({ ano: 2026, mes: 8 }) // mes de 0 a 11 (8 = setembro)
  const [selecionado, setSelecionado] = useState(HOJE)
  // modal aberto: null | { tipo: 'nova' | 'detalhes' | 'editar' | 'excluir', consulta? }
  const [modal, setModal] = useState(null)
  const [toastAberto, setToastAberto] = useState(false)
  const fecharToast = useCallback(() => setToastAberto(false), [])
  const fecharModal = () => setModal(null)

  const filtradas = useMemo(
    () => ordenar(consultas.filter((c) => normalizar(c.paciente).includes(normalizar(busca.trim())))),
    [consultas, busca],
  )
  const doDia = filtradas.filter((c) => c.data === selecionado)
  const proximas = filtradas.filter((c) => c.data >= HOJE)
  const diasComConsulta = useMemo(() => new Set(consultas.map((c) => c.data)), [consultas])

  function mudarMes(delta) {
    setMesVisivel(({ ano, mes }) => {
      const novo = new Date(Date.UTC(ano, mes + delta, 1))
      return { ano: novo.getUTCFullYear(), mes: novo.getUTCMonth() }
    })
  }

  // Salvar (nova ou editada): só altera a lista na tela, sem API
  function salvar(dados) {
    if (modal.tipo === 'editar') {
      setConsultas((lista) => lista.map((c) => (c.id === modal.consulta.id ? { ...c, ...dados } : c)))
    } else {
      setConsultas((lista) => [...lista, { id: Date.now(), especialidade: 'Psicologia Clínica', ...dados }])
    }
    fecharModal()
  }

  function excluir() {
    setConsultas((lista) => lista.filter((c) => c.id !== modal.consulta.id))
    fecharModal()
    setToastAberto(true)
  }

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave">
      <div className="flex flex-col gap-5 px-4 py-8 sm:px-8">
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

        <div className="self-start">
          <AbasSegmentadas abas={ABAS} ativa={aba} onMudar={setAba} />
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[256px_1fr]">
          <div className="md:max-w-sm lg:max-w-none">
            <CalendarioMes
              ano={mesVisivel.ano}
              mes={mesVisivel.mes}
              selecionado={selecionado}
              diasComConsulta={diasComConsulta}
              onSelecionar={setSelecionado}
              onMudarMes={mudarMes}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-4">
            {/* só o campo, sem rótulo visível (o nome fica para leitores de tela) */}
            <div className="[&>div>label]:sr-only">
              <TextField
                label="Buscar paciente"
                aria-label="Buscar paciente"
                icone={<IconeBusca />}
                placeholder="Buscar paciente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <section className="flex flex-col gap-2">
              <RotuloSecao>{dataPorExtenso(selecionado)}</RotuloSecao>
              {doDia.length > 0 ? (
                doDia.map((c) => (
                  <CartaoConsulta key={c.id} consulta={c} onAbrir={() => setModal({ tipo: 'detalhes', consulta: c })} />
                ))
              ) : (
                <p className="rounded-xl bg-branco px-4 py-6 text-center text-[12px] text-secundaria">
                  Não há consultas registradas
                </p>
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

      <Toast aberto={toastAberto} tipo="erro" mensagem="Consulta removida." onFechar={fecharToast} />
    </div>
  )
}

export default Agenda
