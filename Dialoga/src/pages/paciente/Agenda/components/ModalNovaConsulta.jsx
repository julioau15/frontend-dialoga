// ============================================================
// ModalNovaConsulta (paciente)
// Pop-up "Nova consulta", ligado à API:
//   1. busca o profissional pelo nome (só quem tem vínculo ativo);
//   2. ao escolher, carrega os dias e horários livres dele (o back só aceita esses);
//   3. escolhe especialidade (quando ele tem mais de uma), data e horário.
// Botões: "Adicionar outra" (salva e limpa o formulário para cadastrar mais uma) e "Salvar" (salva e fecha).
// Obrigatórios (*): consulta, profissional, data e horário.
// Se a API recusar (horário ocupado, vínculo inativo...), a mensagem aparece no pop-up.
// Props:
//   profissionais -> [{ idVinculo, nome, especialidade }]
//   buscarHorarios(idVinculo, signal) -> { especialidades, cadastrouDisponibilidade, dias: [{ data, horarios }] }
//   onFechar, onSalvar(dados, { continuar }) (async; lança Error se a API recusar)
// ============================================================
import { useEffect, useId, useRef, useState } from 'react'
import Modal from '../../../../components/Modal'
import Button from '../../../../components/Button'
import TextField from '../../../../components/TextField'
import { dataCurta } from '../../../../utils/datasAgenda'
import BuscaProfissional from './BuscaProfissional'

const obrigatorio = (texto) => (
  <>
    {texto} <span className="text-erro">*</span>
  </>
)

const VAZIO = { titulo: '', busca: '', profissional: null, especialidade: '', data: '', hora: '' }
const SEM_HORARIOS = { carregando: false, erro: '', dados: null }

// lista suspensa no mesmo estilo dos campos de texto
function CampoSelect({ rotulo, erro, children, ...props }) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label className="text-[11px] font-bold text-texto" htmlFor={id}>{rotulo}</label>
      <select
        id={id}
        aria-invalid={!!erro}
        className={`h-10 w-full cursor-pointer rounded-lg border bg-branco px-3 text-[12px] text-texto outline-0 focus:border-primaria focus:shadow-[0_0_0_3px_var(--color-primaria-alfa-20)] disabled:cursor-not-allowed disabled:opacity-60 ${erro ? 'border-erro' : 'border-borda'}`}
        {...props}
      >
        {children}
      </select>
      {erro && <span className="text-[11px] text-erro">{erro}</span>}
    </div>
  )
}

export default function ModalNovaConsulta({ profissionais, buscarHorarios, onFechar, onSalvar }) {
  const [campos, setCampos] = useState(VAZIO)
  const [erros, setErros] = useState({})
  const [horarios, setHorarios] = useState(SEM_HORARIOS)
  const [salvando, setSalvando] = useState(false)
  const [erroGeral, setErroGeral] = useState('')
  const controle = useRef(null) // cancela a busca de horários anterior

  // ao fechar o pop-up, cancela a busca que ainda estiver em andamento
  useEffect(() => () => controle.current?.abort(), [])

  const alterar = (campo) => (e) => {
    setCampos((c) => ({ ...c, [campo]: e.target.value }))
    setErros((er) => ({ ...er, [campo]: undefined }))
    setErroGeral('')
  }

  // digitou no campo: a escolha anterior deixa de valer
  function digitarProfissional(texto) {
    controle.current?.abort()
    setCampos((c) => ({ ...c, busca: texto, profissional: null, especialidade: '', data: '', hora: '' }))
    setErros((er) => ({ ...er, profissional: undefined }))
    setHorarios(SEM_HORARIOS)
  }

  // escolheu da lista: busca os dias e horários livres dele
  async function escolherProfissional(profissional) {
    controle.current?.abort()
    const controller = new AbortController()
    controle.current = controller

    setCampos((c) => ({ ...c, busca: profissional.nome, profissional, especialidade: '', data: '', hora: '' }))
    setErros((er) => ({ ...er, profissional: undefined }))
    setErroGeral('')
    setHorarios({ carregando: true, erro: '', dados: null })

    try {
      const dados = await buscarHorarios(profissional.idVinculo, controller.signal)
      setHorarios({ carregando: false, erro: '', dados })
    } catch (e) {
      if (controller.signal.aborted) return
      setHorarios({ carregando: false, erro: e.message, dados: null })
    }
  }

  const dados = horarios.dados
  const horariosDoDia = dados?.dias.find((d) => d.data === campos.data)?.horarios ?? []

  async function enviar(continuar) {
    const encontrados = {}
    if (!campos.titulo.trim()) encontrados.titulo = 'Informe a consulta.'
    if (!campos.profissional) encontrados.profissional = 'Escolha um profissional da lista.'
    if (!campos.data) encontrados.data = 'Escolha a data.'
    if (!campos.hora) encontrados.hora = 'Escolha o horário.'
    setErros(encontrados)
    if (Object.keys(encontrados).length > 0) return

    setSalvando(true)
    setErroGeral('')
    try {
      await onSalvar(
        {
          titulo: campos.titulo.trim(),
          idVinculo: campos.profissional.idVinculo,
          especialidade: campos.especialidade,
          data: campos.data,
          hora: campos.hora,
        },
        { continuar },
      )
      if (continuar) {
        // "Adicionar outra": limpa tudo (o horário que acabou de ser usado não está mais livre)
        controle.current?.abort()
        setCampos(VAZIO)
        setHorarios(SEM_HORARIOS)
      }
    } catch (e) {
      setErroGeral(e.message)
    } finally {
      setSalvando(false)
    }
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
          <Button type="button" variante="suave" larguraAuto disabled={salvando} onClick={() => enviar(true)}>Adicionar outra</Button>
          <Button type="button" larguraAuto disabled={salvando} onClick={() => enviar(false)}>{salvando ? 'Salvando...' : 'Salvar'}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          label={obrigatorio('Consulta')}
          placeholder="Ex.: Sessão de terapia"
          maxLength={150}
          value={campos.titulo}
          onChange={alterar('titulo')}
          erro={erros.titulo}
        />

        <BuscaProfissional
          value={campos.busca}
          profissionais={profissionais}
          onChange={digitarProfissional}
          onEscolher={escolherProfissional}
          erro={erros.profissional}
        />

        {horarios.carregando && <p role="status" className="text-[11px] text-secundaria">Carregando horários disponíveis...</p>}
        {horarios.erro && <p role="alert" className="text-[11px] text-erro">{horarios.erro}</p>}
        {dados && !dados.cadastrouDisponibilidade && (
          <p role="status" className="rounded-lg bg-fundo-suave-2 px-3 py-2 text-[11px] text-secundaria">
            Este profissional ainda não cadastrou horários de atendimento.
          </p>
        )}
        {dados && dados.cadastrouDisponibilidade && dados.dias.length === 0 && (
          <p role="status" className="rounded-lg bg-fundo-suave-2 px-3 py-2 text-[11px] text-secundaria">
            Não há horários livres nos próximos dias. Fale com o profissional.
          </p>
        )}

        {dados && dados.especialidades.length > 1 && (
          <CampoSelect rotulo="Especialidade" value={campos.especialidade} onChange={alterar('especialidade')}>
            <option value="">Selecione (opcional)</option>
            {dados.especialidades.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </CampoSelect>
        )}

        <div className="grid grid-cols-2 gap-3">
          <CampoSelect
            rotulo={obrigatorio('Data')}
            value={campos.data}
            disabled={!dados || dados.dias.length === 0}
            erro={erros.data}
            onChange={(e) => {
              setCampos((c) => ({ ...c, data: e.target.value, hora: '' }))
              setErros((er) => ({ ...er, data: undefined }))
              setErroGeral('')
            }}
          >
            <option value="">{dados ? 'Escolha o dia' : 'Escolha o profissional'}</option>
            {dados?.dias.map((d) => (
              <option key={d.data} value={d.data}>{dataCurta(d.data)}</option>
            ))}
          </CampoSelect>
          <CampoSelect
            rotulo={obrigatorio('Horário')}
            value={campos.hora}
            disabled={!campos.data}
            erro={erros.hora}
            onChange={alterar('hora')}
          >
            <option value="">{campos.data ? 'Escolha a hora' : 'Escolha o dia'}</option>
            {horariosDoDia.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </CampoSelect>
        </div>

        {erroGeral && <p role="alert" className="text-[11px] text-erro">{erroGeral}</p>}
      </div>
    </Modal>
  )
}
