// ============================================================
// ModalConsulta
// Pop-up "Nova consulta" e "Editar consulta" (mesmo formulário).
// Props:
//   modo     -> 'nova' | 'editar'
//   consulta -> dados já preenchidos (só no modo 'editar')
//   onFechar -> fecha o pop-up (X, fundo escuro, Esc ou Cancelar)
//   onSalvar -> recebe { paciente, data, hora, anotacoes, lembrete }
// Obrigatórios: paciente, data e horário (marcados com *).
// ============================================================
import { useState } from 'react'
import Modal from '../../../../components/Modal'
import Button from '../../../../components/Button'
import TextField from '../../../../components/TextField'
import TextAreaField from '../../../../components/TextAreaField'
import IconeBusca from '../../../../components/IconeBusca'
import Interruptor from '../../../../components/Interruptor'
import { IconeSino } from '../../../../components/IconesAgenda'

const obrigatorio = (texto) => (
  <>
    {texto} <span className="text-erro">*</span>
  </>
)

export default function ModalConsulta({ modo = 'nova', consulta, onFechar, onSalvar }) {
  const editando = modo === 'editar'
  const [paciente, setPaciente] = useState(consulta?.paciente ?? '')
  const [data, setData] = useState(consulta?.data ?? '')
  const [hora, setHora] = useState(consulta?.hora ?? '')
  const [anotacoes, setAnotacoes] = useState(consulta?.anotacoes ?? '')
  const [lembrete, setLembrete] = useState(consulta?.lembrete ?? true)
  const [erros, setErros] = useState({})

  function salvar() {
    const encontrados = {}
    if (!paciente.trim()) encontrados.paciente = 'Informe o paciente.'
    if (!data) encontrados.data = 'Informe a data.'
    if (!hora) encontrados.hora = 'Informe o horário.'
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) return
    onSalvar({ paciente: paciente.trim(), data, hora, anotacoes: anotacoes.trim(), lembrete })
  }

  return (
    <Modal
      aberto
      comDivisores
      largura="max-w-[432px]"
      titulo={editando ? 'Editar consulta' : 'Nova consulta'}
      onFechar={onFechar}
      rodape={
        <>
          <Button type="button" variante="suave" larguraAuto onClick={onFechar}>Cancelar</Button>
          <Button type="button" larguraAuto onClick={salvar}>{editando ? 'Salvar alterações' : 'Salvar'}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          label={obrigatorio('Paciente')}
          icone={<IconeBusca />}
          placeholder="Nome do paciente"
          value={paciente}
          onChange={(e) => setPaciente(e.target.value)}
          erro={erros.paciente}
        />

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
