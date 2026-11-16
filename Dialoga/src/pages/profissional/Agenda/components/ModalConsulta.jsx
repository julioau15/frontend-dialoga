// ============================================================
// ModalConsulta
// Pop-up "Nova consulta" e "Editar consulta" (mesmo formulário).
// Props:
//   modo      -> 'nova' | 'editar'
//   consulta  -> dados já preenchidos (só no modo 'editar')
//   pacientes -> pacientes vinculados e ativos [{ idVinculo, idPaciente, nome }]
//   onFechar  -> fecha o pop-up (X, fundo escuro, Esc ou Cancelar)
//   onSalvar  -> async ({ titulo, idVinculo, especialidade, data, hora }, { continuar }) => true | false
//                (true = salvou; false = deu erro e a página já mostrou o aviso, então o formulário fica como está)
// Rodapé: 'nova' -> [Adicionar +] [Salvar] | 'editar' -> [Cancelar] [Salvar alterações]
// Obrigatórios: consulta, paciente, data e horário (marcados com *).
// Paciente: campo com busca (BuscaPaciente); só aceita um nome da lista.
// Nome do profissional vem do perfil logado e não pode ser editado.
// Especialidade é opcional: vazia, o back usa a única especialidade do profissional.
// Anotações e lembrete não estão neste pop-up porque a tbl_consulta ainda não tem essas colunas.
// ============================================================
import { useState } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import Modal from '../../../../components/Modal'
import Button from '../../../../components/Button'
import TextField from '../../../../components/TextField'
import { IconeMais } from '../../../../components/IconesAgenda'
import BuscaPaciente from './BuscaPaciente'

const obrigatorio = (texto) => (
  <>
    {texto} <span className="text-erro">*</span>
  </>
)

export default function ModalConsulta({ modo = 'nova', consulta, pacientes, hoje, onFechar, onSalvar }) {
  const editando = modo === 'editar'
  const { perfil } = useAuth()
  const profissional = perfil?.nome ?? ''
  const inicial = consulta ? pacientes.find((p) => p.idVinculo === consulta.idVinculo) ?? null : null
  const [titulo, setTitulo] = useState(consulta?.titulo ?? '')
  const [especialidade, setEspecialidade] = useState(consulta?.especialidade ?? '')
  const [textoPaciente, setTextoPaciente] = useState(consulta?.paciente ?? '')
  const [paciente, setPaciente] = useState(inicial) // paciente escolhido na lista (null = nenhum)
  const [data, setData] = useState(consulta?.data ?? '')
  const [hora, setHora] = useState(consulta?.hora ?? '')
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)

  // continuar = true ("Adicionar +"): salva, limpa o formulário e mantém o pop-up aberto
  async function salvar(continuar = false) {
    const encontrados = {}
    if (!titulo.trim()) encontrados.titulo = 'Informe a consulta.'
    if (!textoPaciente.trim()) encontrados.paciente = 'Informe o paciente.'
    else if (!paciente) encontrados.paciente = 'Selecione um paciente da lista.'
    if (!data) encontrados.data = 'Informe a data.'
    else if (data < hoje) encontrados.data = 'A data não pode ser anterior a hoje.'
    if (!hora) encontrados.hora = 'Informe o horário.'
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) return

    setSalvando(true)
    const salvou = await onSalvar(
      { titulo: titulo.trim(), idVinculo: paciente.idVinculo, especialidade: especialidade.trim(), data, hora },
      { continuar },
    )
    setSalvando(false)

    if (salvou && continuar) {
      setTitulo('')
      setEspecialidade('')
      setTextoPaciente('')
      setPaciente(null)
      setData('')
      setHora('')
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
            <Button type="button" variante="suave" larguraAuto onClick={onFechar} disabled={salvando}>Cancelar</Button>
            <Button type="button" larguraAuto onClick={() => salvar()} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variante="suave" larguraAuto onClick={() => salvar(true)} disabled={salvando}>
              Adicionar
              <IconeMais tamanho={14} />
            </Button>
            <Button type="button" larguraAuto onClick={() => salvar()} disabled={salvando}>
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
            setTextoPaciente(texto)
            setPaciente(null)
          }}
          onEscolher={(p) => {
            setTextoPaciente(p.nome)
            setPaciente(p)
          }}
          erro={erros.paciente}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* preenchido com o perfil logado, sem edição */}
          <div className="[&_input]:cursor-not-allowed [&_input]:text-secundaria">
            <TextField label="Nome do profissional" value={profissional} placeholder="Profissional" disabled readOnly />
          </div>
          <TextField
            label="Especialidade"
            placeholder="Opcional"
            value={especialidade}
            onChange={(e) => setEspecialidade(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TextField label={obrigatorio('Data')} type="date" min={hoje} value={data} onChange={(e) => setData(e.target.value)} erro={erros.data} />
          <TextField label={obrigatorio('Horário')} type="time" value={hora} onChange={(e) => setHora(e.target.value)} erro={erros.hora} />
        </div>
      </div>
    </Modal>
  )
}
