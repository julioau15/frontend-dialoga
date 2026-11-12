// ============================================================
// ModalNovaConsulta (paciente)
// Pop-up "Nova consulta": profissional, especialidade, data, horário,
// observações e lembrete. Botões: "Adicionar outra" (salva e limpa o
// formulário para cadastrar mais uma) e "Salvar" (salva e fecha).
// Obrigatórios (*): profissional, data e horário.
// Props: onFechar, onSalvar(dados, { continuar })
// ============================================================
import { useState } from 'react'
import Modal from '../../../../components/Modal'
import Button from '../../../../components/Button'
import TextField from '../../../../components/TextField'
import TextAreaField from '../../../../components/TextAreaField'
import Interruptor from '../../../../components/Interruptor'
import { IconeSino } from '../../../../components/IconesAgenda'

const obrigatorio = (texto) => (
  <>
    {texto} <span className="text-erro">*</span>
  </>
)

const VAZIO = { profissional: '', especialidade: '', data: '', hora: '', observacoes: '', lembrete: true }

export default function ModalNovaConsulta({ onFechar, onSalvar }) {
  const [campos, setCampos] = useState(VAZIO)
  const [erros, setErros] = useState({})

  const alterar = (campo) => (e) => {
    setCampos((c) => ({ ...c, [campo]: e.target.value }))
    setErros((er) => ({ ...er, [campo]: undefined }))
  }

  function enviar(continuar) {
    const encontrados = {}
    if (!campos.profissional.trim()) encontrados.profissional = 'Informe o profissional.'
    if (!campos.data) encontrados.data = 'Informe a data.'
    if (!campos.hora) encontrados.hora = 'Informe o horário.'
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) return

    onSalvar(
      { ...campos, profissional: campos.profissional.trim(), especialidade: campos.especialidade.trim(), observacoes: campos.observacoes.trim() },
      { continuar },
    )
    if (continuar) setCampos(VAZIO) // "Adicionar outra": limpa para a próxima consulta
  }

  return (
    <Modal
      aberto
      comDivisores
      largura="max-w-[420px]"
      titulo="Nova consulta"
      onFechar={onFechar}
      rodape={
        <>
          <Button type="button" variante="suave" larguraAuto onClick={() => enviar(true)}>Adicionar outra</Button>
          <Button type="button" larguraAuto onClick={() => enviar(false)}>Salvar</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          label={obrigatorio('Profissional')}
          placeholder="Nome do profissional"
          value={campos.profissional}
          onChange={alterar('profissional')}
          erro={erros.profissional}
        />
        <TextField
          label="Especialidade"
          placeholder="Ex: Psicologia Clínica"
          value={campos.especialidade}
          onChange={alterar('especialidade')}
        />

        <div className="grid grid-cols-2 gap-3">
          <TextField label={obrigatorio('Data')} type="date" value={campos.data} onChange={alterar('data')} erro={erros.data} />
          <TextField label={obrigatorio('Horário')} type="time" value={campos.hora} onChange={alterar('hora')} erro={erros.hora} />
        </div>

        <TextAreaField
          label={<>Observações <span className="font-normal text-secundaria">(opcional)</span></>}
          placeholder="Anotações sobre a consulta..."
          value={campos.observacoes}
          onChange={alterar('observacoes')}
        />

        <div className="flex items-center gap-2">
          <Interruptor ligado={campos.lembrete} onAlternar={(v) => setCampos((c) => ({ ...c, lembrete: v }))} rotulo="Lembrete" />
          <IconeSino tamanho={12} className="text-secundaria" />
          <span className="text-[11px] font-bold text-texto">Lembrete</span>
        </div>
      </div>
    </Modal>
  )
}
