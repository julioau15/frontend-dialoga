// ============================================================
// ModalNovaTarefa
// Pop-up "Nova tarefa" (frame "1 - Adicionar tarefa - Paciente").
// Campos: Título (obrigatório), Data de entrega (obrigatória, DD/MM/AAAA)
// e Arquivo (opcional, enviado junto com a tarefa).
// Props: aberto, onFechar(), onCriar({ titulo, prazo: 'DD/MM/AAAA', arquivo: File | null })
//   onCriar pode ser assíncrona: enquanto espera, o botão fica bloqueado;
//   se lançar erro, a mensagem aparece no pop-up e o formulário é mantido.
// ============================================================
import { useRef, useState } from 'react'
import Button from '../../../../components/Button'
import Modal from '../../../../components/Modal'
import TextField from '../../../../components/TextField'
import { IconeCalendario } from './iconesTarefas'

const Obrigatorio = ({ children }) => (
  <>
    {children} <span className="text-erro" aria-hidden="true">*</span>
  </>
)

// "13112026" -> "13/11/2026"
function mascaraData(texto) {
  const n = texto.replace(/\D/g, '').slice(0, 8)
  if (n.length <= 2) return n
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`
}

// confere se é uma data que existe (ex.: 31/02/2026 não existe)
function dataValida(texto) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto)
  if (!m) return false
  const [dia, mes, ano] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const data = new Date(ano, mes - 1, dia)
  return data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia
}

// confere se a data (DD/MM/AAAA, já válida) é anterior a hoje (hoje às 00:00 é permitido)
function dataNoPassado(texto) {
  const [dia, mes, ano] = texto.split('/').map(Number)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return new Date(ano, mes - 1, dia) < hoje
}

export default function ModalNovaTarefa({ aberto, onFechar, onCriar }) {
  const [titulo, setTitulo] = useState('')
  const [prazo, setPrazo] = useState('')
  const [arquivo, setArquivo] = useState(null)
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [erroApi, setErroApi] = useState('')
  const inputArquivo = useRef(null)

  function limpar() {
    setTitulo('')
    setPrazo('')
    setArquivo(null)
    setErros({})
    setErroApi('')
    if (inputArquivo.current) inputArquivo.current.value = ''
  }

  function fechar() {
    if (!aberto) return // o <dialog> também avisa ao fechar sozinho; evita chamar duas vezes
    limpar()
    onFechar()
  }

  async function criar() {
    const novos = {}
    if (!titulo.trim()) novos.titulo = 'Informe o título da tarefa.'
    if (!prazo) novos.prazo = 'Informe a data de entrega.'
    else if (!dataValida(prazo)) novos.prazo = 'Use uma data válida no formato DD/MM/AAAA.'
    else if (dataNoPassado(prazo)) novos.prazo = 'A data de entrega não pode ser anterior a hoje.'
    setErros(novos)
    if (Object.keys(novos).length > 0) return

    setEnviando(true)
    setErroApi('')
    try {
      await onCriar({ titulo: titulo.trim(), prazo, arquivo })
      limpar()
    } catch (e) {
      setErroApi(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal
      aberto={aberto}
      titulo="Nova tarefa"
      onFechar={fechar}
      comDivisores
      largura="max-w-[384px]"
      rodape={
        <>
          <Button type="button" variante="suave" larguraAuto className="px-4 rounded-xl! text-[14px]!" disabled={enviando} onClick={fechar}>Cancelar</Button>
          <Button type="button" larguraAuto className="px-4 rounded-xl! text-[14px]!" carregando={enviando} onClick={criar}>{enviando ? 'Criando...' : 'Criar'}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <TextField
          label={<Obrigatorio>Título</Obrigatorio>}
          placeholder="Ex: Leitura indicada pelo profissional"
          value={titulo}
          maxLength={100}
          erro={erros.titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <TextField
          label={<Obrigatorio>Data de entrega</Obrigatorio>}
          placeholder="DD/MM/AAAA"
          inputMode="numeric"
          autoComplete="off"
          value={prazo}
          erro={erros.prazo}
          onChange={(e) => setPrazo(mascaraData(e.target.value))}
          acao={<IconeCalendario tamanho={14} className="text-secundaria" />}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-texto">
            Arquivo <span className="font-normal text-secundaria">(opcional)</span>
          </span>
          <input
            ref={inputArquivo}
            type="file"
            className="sr-only"
            tabIndex={-1}
            aria-label="Anexar arquivo"
            onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => inputArquivo.current?.click()}
            className="flex h-10 w-full cursor-pointer items-center justify-center rounded-lg border border-borda bg-branco px-3 text-[12px] text-secundaria hover:bg-fundo-suave-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
          >
            <span className="truncate">{arquivo ? arquivo.name : '+ Anexar arquivo'}</span>
          </button>
        </div>

        {erroApi && <p role="alert" className="text-[12px] text-erro">{erroApi}</p>}
      </div>
    </Modal>
  )
}
