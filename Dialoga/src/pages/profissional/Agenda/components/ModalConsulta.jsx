// ============================================================
// ModalConsulta
// Pop-up "Nova consulta" e "Editar consulta" (mesmo formulário).
// Props:
//   modo     -> 'nova' | 'editar'
//   consulta -> dados já preenchidos (só no modo 'editar')
//   onFechar -> fecha o pop-up (X, fundo escuro, Esc ou Cancelar)
//   onSalvar -> recebe ({ titulo, paciente, profissional, especialidade, data, hora, anotacoes, lembrete }, { continuar })
// Rodapé: 'nova' -> [Adicionar +] [Salvar] | 'editar' -> [Cancelar] [Salvar alterações]
// Obrigatórios: consulta, paciente, data e horário (marcados com *).
// Nome do profissional vem do perfil logado e não pode ser editado.
// ============================================================
import { useState } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import Modal from '../../../../components/Modal'
import Button from '../../../../components/Button'
import TextField from '../../../../components/TextField'
import TextAreaField from '../../../../components/TextAreaField'
import IconeBusca from '../../../../components/IconeBusca'
import Interruptor from '../../../../components/Interruptor'
import { IconeMais, IconeSino } from '../../../../components/IconesAgenda'

const ESPECIALIDADE_PADRAO = 'Psicologia Clínica'

const obrigatorio = (texto) => (
  <>
    {texto} <span className="text-erro">*</span>
  </>
)

export default function ModalConsulta({ modo = 'nova', consulta, onFechar, onSalvar }) {
  const editando = modo === 'editar'
  const { perfil } = useAuth()
  const profissional = perfil?.nome ?? ''
  const [titulo, setTitulo] = useState(consulta?.titulo ?? '')
  const [especialidade, setEspecialidade] = useState(consulta?.especialidade ?? ESPECIALIDADE_PADRAO)
  const [paciente, setPaciente] = useState(consulta?.paciente ?? '')
  const [data, setData] = useState(consulta?.data ?? '')
  const [hora, setHora] = useState(consulta?.hora ?? '')
  const [anotacoes, setAnotacoes] = useState(consulta?.anotacoes ?? '')
  const [lembrete, setLembrete] = useState(consulta?.lembrete ?? true)
  const [erros, setErros] = useState({})

  // continuar = true ("Adicionar +"): salva, limpa o formulário e mantém o pop-up aberto
  function salvar(continuar = false) {
    const encontrados = {}
    if (!titulo.trim()) encontrados.titulo = 'Informe a consulta.'
    if (!paciente.trim()) encontrados.paciente = 'Informe o paciente.'
    if (!data) encontrados.data = 'Informe a data.'
    if (!hora) encontrados.hora = 'Informe o horário.'
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) return
    onSalvar(
      {
        titulo: titulo.trim(),
        paciente: paciente.trim(),
        profissional,
        especialidade: especialidade.trim() || ESPECIALIDADE_PADRAO,
        data,
        hora,
        anotacoes: anotacoes.trim(),
        lembrete,
      },
      { continuar },
    )
    if (continuar) {
      setTitulo('')
      setEspecialidade(ESPECIALIDADE_PADRAO)
      setPaciente('')
      setData('')
      setHora('')
      setAnotacoes('')
      setLembrete(true)
    }
  }

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
            <Button type="button" variante="suave" larguraAuto onClick={onFechar}>Cancelar</Button>
            <Button type="button" larguraAuto onClick={() => salvar()}>Salvar alterações</Button>
          </>
        ) : (
          <>
            <Button type="button" variante="suave" larguraAuto onClick={() => salvar(true)}>
              Adicionar
              <IconeMais tamanho={14} />
            </Button>
            <Button type="button" larguraAuto onClick={() => salvar()}>Salvar</Button>
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

        <TextField
          label={obrigatorio('Paciente')}
          icone={<IconeBusca />}
          placeholder="Nome do paciente"
          value={paciente}
          onChange={(e) => setPaciente(e.target.value)}
          erro={erros.paciente}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* preenchido com o perfil logado, sem edição */}
          <div className="[&_input]:cursor-not-allowed [&_input]:text-secundaria">
            <TextField label="Nome do profissional" value={profissional} placeholder="Profissional" disabled readOnly />
          </div>
          <TextField label="Especialidade" value={especialidade} onChange={(e) => setEspecialidade(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField label={obrigatorio('Data')} type="date" value={data} onChange={(e) => setData(e.target.value)} erro={erros.data} />
          <TextField label={obrigatorio('Horário')} type="time" value={hora} onChange={(e) => setHora(e.target.value)} erro={erros.hora} />
        </div>

        <TextAreaField
          label={<>Anotações <span className="font-normal text-secundaria">(opcional)</span></>}
          placeholder="Observações sobre a consulta..."
          value={anotacoes}
          onChange={(e) => setAnotacoes(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <Interruptor ligado={lembrete} onAlternar={setLembrete} rotulo="Lembrete" />
          <IconeSino tamanho={12} className="text-secundaria" />
          <span className="text-[11px] font-bold text-texto">Lembrete</span>
        </div>
      </div>
    </Modal>
  )
}
