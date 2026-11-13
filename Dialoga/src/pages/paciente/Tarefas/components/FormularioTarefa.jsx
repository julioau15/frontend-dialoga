// ============================================================
// FormularioTarefa
// Tela de uma tarefa com perguntas. Dois modos:
//   - preencher (frame "Preencher tarefa"): "Salvar rascunho" e "Enviar resposta".
//     Ao enviar, valida os campos obrigatórios e abre o modal "Confirmar envio".
//   - somenteLeitura (frame "Ver Resposta"): campos travados com as respostas.
// Props: tarefa, respostasIniciais, somenteLeitura,
//        onVoltar(), onSalvarRascunho(respostas), onEnviar(respostas)
// ============================================================
import { useId, useState } from 'react'
import Button from '../../../../components/Button'
import Card from '../../../../components/Card'
import Selo from '../../../../components/Selo'
import OpcaoSelecionavel from '../../../../components/OpcaoSelecionavel'
import ModalConfirmarEnvio from './ModalConfirmarEnvio'
import { STATUS } from './CartaoTarefa'
import { IconeEnviar, IconeRelogio, IconeSalvar, IconeSetaEsquerda } from './iconesTarefas'
import { PERGUNTAS, respondida } from './perguntasMock'

const MSG_OBRIGATORIA = 'Responda esta pergunta para enviar.'

function Pergunta({ numero, pergunta, valor, erro, somenteLeitura, onChange }) {
  const idTitulo = useId()
  const { tipo, titulo, obrigatoria } = pergunta

  return (
    <Card as="section" aria-labelledby={idTitulo} data-pergunta={pergunta.id} className="p-5">
      <h2 id={idTitulo} className="mb-3 text-[13px] font-semibold text-texto">
        {numero}. {titulo}
        {obrigatoria && <span className="text-erro" aria-hidden="true"> *</span>}
        {obrigatoria && <span className="sr-only"> (obrigatória)</span>}
      </h2>

      {tipo === 'escolha' && (
        <div role="radiogroup" aria-labelledby={idTitulo} className="grid grid-cols-3 gap-3">
          {pergunta.opcoes.map((op) => (
            <OpcaoSelecionavel
              key={op.valor}
              selecionado={valor === op.valor}
              disabled={somenteLeitura}
              onClick={() => onChange(op.valor)}
            >
              <span className="flex flex-col items-center gap-0.5">
                <span aria-hidden="true" className="text-[14px] leading-none">{op.emoji}</span>
                <span>{op.rotulo}</span>
              </span>
            </OpcaoSelecionavel>
          ))}
        </div>
      )}

      {tipo === 'multipla' && (
        <div role="group" aria-labelledby={idTitulo} className="flex flex-col gap-3">
          {pergunta.opcoes.map((op) => {
            const marcado = valor.includes(op)
            return (
              <label key={op} className={`flex items-center gap-2 text-[12px] text-texto ${somenteLeitura ? '' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primaria"
                  checked={marcado}
                  disabled={somenteLeitura}
                  onChange={() => onChange(marcado ? valor.filter((v) => v !== op) : [...valor, op])}
                />
                {op}
              </label>
            )
          })}
        </div>
      )}

      {tipo === 'texto' && (
        <textarea
          aria-labelledby={idTitulo}
          aria-invalid={!!erro}
          rows={4}
          value={valor}
          readOnly={somenteLeitura}
          placeholder={somenteLeitura ? '' : pergunta.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`min-h-[88px] w-full max-w-[520px] resize-none rounded-lg border bg-branco px-3 py-2.5 text-[12px] leading-normal text-texto outline-0 placeholder:text-texto-alfa-50 focus:border-primaria focus:shadow-[0_0_0_3px_var(--color-primaria-alfa-20)] ${erro ? 'border-erro' : 'border-borda'}`}
        />
      )}

      {tipo === 'escala' && (
        <div>
          <div role="radiogroup" aria-labelledby={idTitulo} className="flex flex-wrap gap-2">
            {Array.from({ length: pergunta.max - pergunta.min + 1 }, (_, i) => pergunta.min + i).map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={valor === n}
                disabled={somenteLeitura}
                onClick={() => onChange(n)}
                className={`grid h-7 w-7 place-items-center rounded-md border text-[11px] font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
                  somenteLeitura ? 'cursor-default' : 'cursor-pointer hover:bg-fundo-suave-2'
                } ${valor === n ? 'border-primaria bg-primaria text-branco hover:bg-primaria!' : 'border-borda bg-branco text-texto'}`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-secundaria">
            <span>{pergunta.rotuloMin}</span>
            <span>{pergunta.rotuloMax}</span>
          </div>
        </div>
      )}

      {erro && <p role="alert" className="mt-2 text-[11px] text-erro">{MSG_OBRIGATORIA}</p>}
    </Card>
  )
}

export default function FormularioTarefa({ tarefa, respostasIniciais, somenteLeitura = false, onVoltar, onSalvarRascunho, onEnviar }) {
  const [respostas, setRespostas] = useState(respostasIniciais)
  const [erros, setErros] = useState({})
  const [confirmando, setConfirmando] = useState(false)
  const config = STATUS[tarefa.status]

  function alterar(id, valor) {
    setRespostas((atual) => ({ ...atual, [id]: valor }))
    setErros((atual) => (atual[id] ? { ...atual, [id]: false } : atual))
  }

  // valida os obrigatórios; se faltar algum, mostra o erro e leva a tela até o primeiro
  function aoEnviar() {
    const faltando = PERGUNTAS.filter((p) => p.obrigatoria && !respondida(p, respostas))
    if (faltando.length > 0) {
      setErros(Object.fromEntries(faltando.map((p) => [p.id, true])))
      document.querySelector(`[data-pergunta="${faltando[0].id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setConfirmando(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={onVoltar}
        className="-mb-1 flex w-fit cursor-pointer items-center gap-1.5 text-[11px] text-secundaria hover:text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
      >
        <IconeSetaEsquerda tamanho={12} />
        Voltar às tarefas
      </button>

      <Card as="header" className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <h1 className="text-[17px] font-extrabold leading-snug text-texto">{tarefa.titulo}</h1>
          <p className="text-[11px] text-secundaria">Enviado por: {tarefa.autotarefa ? 'Você (autotarefa)' : tarefa.profissional}</p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-secundaria">
            <IconeRelogio tamanho={11} />
            Prazo: {tarefa.prazo}
          </p>
        </div>
        <Selo tom={config.tom}>{config.rotulo}</Selo>
      </Card>

      {PERGUNTAS.map((pergunta, i) => (
        <Pergunta
          key={pergunta.id}
          numero={i + 1}
          pergunta={pergunta}
          valor={respostas[pergunta.id]}
          erro={erros[pergunta.id]}
          somenteLeitura={somenteLeitura}
          onChange={(valor) => alterar(pergunta.id, valor)}
        />
      ))}

      {somenteLeitura ? (
        // no frame "Ver Resposta" o botão aparece apagado: a tarefa já foi enviada
        <div>
          <Button type="button" larguraAuto disabled className="px-4">
            <IconeEnviar tamanho={13} />
            Enviar atividade
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <Button type="button" variante="suave" larguraAuto className="px-4" onClick={() => onSalvarRascunho(respostas)}>
            <IconeSalvar tamanho={13} />
            Salvar rascunho
          </Button>
          <Button type="button" larguraAuto className="px-4" onClick={aoEnviar}>
            <IconeEnviar tamanho={13} />
            Enviar resposta
          </Button>
        </div>
      )}

      <ModalConfirmarEnvio
        aberto={confirmando}
        onCancelar={() => setConfirmando(false)}
        onConfirmar={() => {
          setConfirmando(false)
          onEnviar(respostas)
        }}
      />
    </>
  )
}
