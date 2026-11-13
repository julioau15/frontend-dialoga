// ============================================================
// ModalNovaTarefa
// Pop-up "Nova tarefa" (frame "1 - Adicionar tarefa - Paciente").
// Campos: Título (obrigatório), Data de entrega (obrigatória, DD/MM/AAAA)
// e Arquivo (opcional). Só guarda o nome do arquivo (sem upload por enquanto).
// Props: aberto, onFechar(), onCriar({ titulo, prazo, arquivo })
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

export default function ModalNovaTarefa({ aberto, onFechar, onCriar }) {
  const [titulo, setTitulo] = useState('')
  const [prazo, setPrazo] = useState('')
  const [arquivo, setArquivo] = useState(null)
  const [erros, setErros] = useState({})
  const inputArquivo = useRef(null)

  function limpar() {
    setTitulo('')
    setPrazo('')
    setArquivo(null)
    setErros({})
    if (inputArquivo.current) inputArquivo.current.value = ''
  }

  function fechar() {
    if (!aberto) return // o <dialog> também avisa ao fechar sozinho; evita chamar duas vezes
    limpar()
    onFechar()
  }

  function criar() {
    const novos = {}
    if (!titulo.trim()) novos.titulo = 'Informe o título da tarefa.'
    if (!prazo) novos.prazo = 'Informe a data de entrega.'
    else if (!dataValida(prazo)) novos.prazo = 'Use uma data válida no formato DD/MM/AAAA.'
    setErros(novos)
    if (Object.keys(novos).length > 0) return

    onCriar({ titulo: titulo.trim(), prazo, arquivo: arquivo?.name ?? null })
    limpar()
  }

  return (
    <Modal
      aberto={aberto}
      titulo="Nova tarefa"
      onFechar={fechar}
      comDivisores
      largura="max-w-[400px]"
      rodape={
        <>
          <Button type="button" variante="suave" larguraAuto className="px-4" onClick={fechar}>Cancelar</Button>
          <Button type="button" larguraAuto className="px-4" onClick={criar}>Criar</Button>
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
      </div>
    </Modal>
  )
}
