// ============================================================
// ModalConsulta
// Pop-up "Nova consulta" e "Editar consulta" (mesmo formulário).
// Props:
//   modo      -> 'nova' | 'editar'
//   consulta  -> dados já preenchidos (só no modo 'editar')
//   pacientes -> pacientes vinculados e ativos [{ idVinculo, idPaciente, nome }]
//   buscarHorarios(idVinculo, signal) -> { especialidades, cadastrouDisponibilidade, dias: [{ data, horarios }] }
//   onFechar  -> fecha o pop-up (X, fundo escuro, Esc ou Cancelar)
//   onSalvar  -> async ({ titulo, idVinculo, especialidade, data, hora }, { continuar }) => true | false
//                (true = salvou; false = deu erro e a página já mostrou o aviso, então o formulário fica como está)
// Rodapé: 'nova' -> [Adicionar +] [Salvar] | 'editar' -> [Cancelar] [Salvar alterações]
// Obrigatórios: consulta, paciente, data e horário (marcados com *).
// Paciente: campo com busca (BuscaPaciente); só aceita um nome da lista.
// Ao escolher o paciente, carrega os dias e horários livres da SUA disponibilidade
// (o back só aceita esses). Especialidade, data e horário viram listas.
// Na edição, o horário atual da consulta também aparece, mesmo que não esteja livre.
// Nome do profissional vem do perfil logado e não pode ser editado.
// Anotações e lembrete não estão neste pop-up porque a tbl_consulta ainda não tem essas colunas.
// ============================================================
import { useEffect, useId, useRef, useState } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import Modal from '../../../../components/Modal'
import Button from '../../../../components/Button'
import TextField from '../../../../components/TextField'
import { IconeMais } from '../../../../components/IconesAgenda'
import { dataComDiaDaSemana, diasComHorarioAtual } from '../../../../utils/datasAgenda'
import BuscaPaciente from './BuscaPaciente'

const obrigatorio = (texto) => (
  <>
    {texto} <span className="text-erro-texto">*</span>
  </>
)

const SEM_HORARIOS = { carregando: false, erro: '', dados: null }

// lista suspensa no mesmo estilo dos campos de texto (igual ao pop-up do paciente)
function CampoSelect({ rotulo, erro, children, ...props }) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label className="text-[11px] font-bold text-texto" htmlFor={id}>{rotulo}</label>
      <select
        id={id}
        aria-invalid={!!erro}
        className={`h-10 w-full cursor-pointer rounded-lg border bg-superficie px-3 text-[12px] text-texto outline-0 focus:border-primaria focus:shadow-[0_0_0_3px_var(--color-primaria-alfa-20)] disabled:cursor-not-allowed disabled:opacity-60 ${erro ? 'border-erro' : 'border-borda'}`}
        {...props}
      >
        {children}
      </select>
      {erro && <span className="text-[11px] text-erro-texto">{erro}</span>}
    </div>
  )
}

export default function ModalConsulta({ modo = 'nova', consulta, pacientes, buscarHorarios, onFechar, onSalvar }) {
  const editando = modo === 'editar'
  const { perfil } = useAuth()
  const profissional = perfil?.nome ?? ''
  const inicial = consulta ? pacientes.find((p) => p.idVinculo === consulta.idVinculo) ?? null : null
  // horário que a consulta já tem (só na edição): continua valendo mesmo se não estiver livre
  const horarioAtual = editando && consulta ? { data: consulta.data, hora: consulta.hora } : null

  const [titulo, setTitulo] = useState(consulta?.titulo ?? '')
  const [especialidade, setEspecialidade] = useState(consulta?.especialidade ?? '')
  const [textoPaciente, setTextoPaciente] = useState(consulta?.paciente ?? '')
  const [paciente, setPaciente] = useState(inicial) // paciente escolhido na lista (null = nenhum)
  const [data, setData] = useState(consulta?.data ?? '')
  const [hora, setHora] = useState(consulta?.hora ?? '')
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  // na edição o paciente já vem escolhido, então os horários começam carregando
  const [horarios, setHorarios] = useState(inicial ? { carregando: true, erro: '', dados: null } : SEM_HORARIOS)
  const controle = useRef(null) // cancela a busca de horários anterior

  // busca os dias e horários livres do vínculo e guarda o resultado
  function carregarHorarios(idVinculo) {
    controle.current?.abort()
    const controller = new AbortController()
    controle.current = controller

    buscarHorarios(idVinculo, controller.signal)
      .then((dados) => {
        // com uma única especialidade, ela já vem escolhida
        if (dados.especialidades.length === 1) setEspecialidade((atual) => atual || dados.especialidades[0])
        setHorarios({ carregando: false, erro: '', dados })
      })
      .catch((e) => {
        if (controller.signal.aborted) return
        setHorarios({ carregando: false, erro: e.message, dados: null })
      })
  }

  // edição: carrega os horários do paciente que já vem escolhido; ao fechar, cancela a busca
  useEffect(() => {
    if (inicial) carregarHorarios(inicial.idVinculo)
    return () => controle.current?.abort()
    // só ao abrir o pop-up
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dados = horarios.dados
  const dias = dados ? diasComHorarioAtual(dados.dias, paciente?.idVinculo === inicial?.idVinculo ? horarioAtual : null) : []
  const horariosDoDia = dias.find((d) => d.data === data)?.horarios ?? []
  const especialidades = dados?.especialidades ?? []
  const semDisponibilidade = dados && !dados.cadastrouDisponibilidade

  function limparAgenda() {
    setEspecialidade('')
    setData('')
    setHora('')
  }

  // continuar = true ("Adicionar +"): salva, limpa o formulário e mantém o pop-up aberto
  async function salvar(continuar = false) {
    const encontrados = {}
    if (!titulo.trim()) encontrados.titulo = 'Informe a consulta.'
    if (!textoPaciente.trim()) encontrados.paciente = 'Informe o paciente.'
    else if (!paciente) encontrados.paciente = 'Selecione um paciente da lista.'
    if (!data) encontrados.data = 'Escolha a data.'
    if (!hora) encontrados.hora = 'Escolha o horário.'
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0 || semDisponibilidade) return

    setSalvando(true)
    const salvou = await onSalvar(
      { titulo: titulo.trim(), idVinculo: paciente.idVinculo, especialidade: especialidade.trim(), data, hora },
      { continuar },
    )
    setSalvando(false)

    if (salvou && continuar) {
      // o horário que acabou de ser usado não está mais livre: limpa tudo
      controle.current?.abort()
      setTitulo('')
      setTextoPaciente('')
      setPaciente(null)
      limparAgenda()
      setHorarios(SEM_HORARIOS)
    }
  }

  const bloqueado = salvando || semDisponibilidade

  return (
    <Modal
      aberto
      comDivisores
      largura="max-w-[432px]"
      titulo={editando ? 'Editar consulta' : 'Nova consulta'}
      onFechar={onFechar}
      rodape={
        editando ? (
          <>
            <Button type="button" variante="suave" larguraAuto onClick={onFechar} disabled={salvando}>Cancelar</Button>
            <Button type="button" larguraAuto onClick={() => salvar()} disabled={bloqueado}>
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variante="suave" larguraAuto onClick={() => salvar(true)} disabled={bloqueado}>
              Adicionar
              <IconeMais tamanho={14} />
            </Button>
            <Button type="button" larguraAuto onClick={() => salvar()} disabled={bloqueado}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </Button>
          </>
        )
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          label={obrigatorio('Consulta')}
          placeholder="Ex.: Sessão de terapia"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          erro={erros.titulo}
        />

        <BuscaPaciente
          label={obrigatorio('Paciente')}
          value={textoPaciente}
          pacientes={pacientes}
          onChange={(texto) => {
            // digitou: a escolha anterior (e os horários dela) deixa de valer
            controle.current?.abort()
            setTextoPaciente(texto)
            setPaciente(null)
            limparAgenda()
            setHorarios(SEM_HORARIOS)
          }}
          onEscolher={(p) => {
            setTextoPaciente(p.nome)
            setPaciente(p)
            limparAgenda()
            setErros((er) => ({ ...er, paciente: undefined }))
            setHorarios({ carregando: true, erro: '', dados: null })
            carregarHorarios(p.idVinculo)
          }}
          erro={erros.paciente}
        />

        {horarios.carregando && <p role="status" className="text-[11px] text-secundaria">Carregando horários disponíveis...</p>}
        {horarios.erro && <p role="alert" className="text-[11px] text-erro-texto">{horarios.erro}</p>}
        {semDisponibilidade && (
          <p role="alert" className="rounded-lg bg-fundo-suave-2 px-3 py-2 text-[11px] text-secundaria">
            Cadastre sua disponibilidade na aba Disponibilidade para agendar.
          </p>
        )}
        {dados && !semDisponibilidade && dias.length === 0 && (
          <p role="status" className="rounded-lg bg-fundo-suave-2 px-3 py-2 text-[11px] text-secundaria">
            Não há horários livres na sua disponibilidade nos próximos dias.
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* preenchido com o perfil logado, sem edição */}
          <div className="[&_input]:cursor-not-allowed [&_input]:text-secundaria">
            <TextField label="Nome do profissional" value={profissional} placeholder="Profissional" disabled readOnly />
          </div>
          <CampoSelect
            rotulo="Especialidade"
            value={especialidade}
            disabled={!dados || especialidades.length === 0}
            onChange={(e) => setEspecialidade(e.target.value)}
          >
            <option value="">{dados ? 'Selecione (opcional)' : 'Escolha o paciente'}</option>
            {especialidades.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
            {/* edição: mantém a especialidade gravada mesmo que não esteja mais no perfil */}
            {especialidade && !especialidades.includes(especialidade) && (
              <option value={especialidade}>{especialidade}</option>
            )}
          </CampoSelect>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <CampoSelect
            rotulo={obrigatorio('Data')}
            value={data}
            disabled={!dados || dias.length === 0}
            erro={erros.data}
            onChange={(e) => {
              setData(e.target.value)
              setHora('')
              setErros((er) => ({ ...er, data: undefined }))
            }}
          >
            <option value="">{dados ? 'Escolha o dia' : 'Escolha o paciente'}</option>
            {dias.map((d) => (
              <option key={d.data} value={d.data}>{dataComDiaDaSemana(d.data)}</option>
            ))}
          </CampoSelect>
          <CampoSelect
            rotulo={obrigatorio('Horário')}
            value={hora}
            disabled={!data || horariosDoDia.length === 0}
            erro={erros.hora}
            onChange={(e) => {
              setHora(e.target.value)
              setErros((er) => ({ ...er, hora: undefined }))
            }}
          >
            <option value="">{data ? 'Escolha a hora' : 'Escolha o dia'}</option>
            {horariosDoDia.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </CampoSelect>
        </div>
      </div>
    </Modal>
  )
}
