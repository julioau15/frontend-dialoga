// ============================================================
// PreVisualizacao
// Tela "Pré-visualização" da Nova tarefa (frame "Visualizar tarefa - Profissional",
// RF285, RNF075): mostra a tarefa como o paciente vai ver. Dá para clicar nas
// respostas para testar, mas nada é salvo.
// Tarefa só com arquivo (sem perguntas): mostra o arquivo no lugar das perguntas (RF289).
// Props: dados ({ titulo, instrucoes, arquivo }), perguntas,
//        onEditar() (volta à edição), onVoltarLista() ("Voltar às tarefas")
// ============================================================
import { useId, useState } from 'react'
import Card from '../../../../components/Card'
import BotaoVoltar from './BotaoVoltar'
import { BOTAO_CLARO } from './estilos'
import { IconeArquivo } from './iconesNovaTarefa'
import { EMOCOES, NUMEROS_ESCALA } from './perguntas'

// cartão do arquivo anexado (no lugar das perguntas, ou acima delas)
function CartaoArquivo({ nome, sozinho }) {
  return (
    <Card as="section" aria-label="Arquivo da tarefa" className="flex items-center gap-3 p-5 sm:px-[21px]">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-fundo-card text-primaria">
        <IconeArquivo tamanho={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-texto">{nome}</p>
        <p className="text-[11px] text-secundaria">{sozinho ? 'Abra o arquivo para realizar a tarefa.' : 'Arquivo de apoio'}</p>
      </div>
    </Card>
  )
}

// uma pergunta como o paciente vê
function PerguntaPrevia({ numero, pergunta }) {
  const idTitulo = useId()
  const { tipo, enunciado, obrigatoria, imagem } = pergunta
  const opcoes = pergunta.opcoes.filter((o) => o.trim())
  const [valor, setValor] = useState(tipo === 'multipla' ? [] : tipo === 'paragrafo' ? '' : null)

  return (
    <Card as="section" aria-labelledby={idTitulo} className="p-5 sm:px-[21px] sm:pb-7">
      <h2 id={idTitulo} className="mb-4 text-[14px] font-semibold text-texto">
        <span className="mr-2 font-normal text-secundaria">{numero}.</span>
        {enunciado.trim() || '(sem enunciado)'}
        {obrigatoria && <span className="text-erro" aria-hidden="true"> *</span>}
        {obrigatoria && <span className="sr-only"> (obrigatória)</span>}
      </h2>

      {imagem && <img src={imagem.url} alt="" className="mb-4 max-h-56 w-auto max-w-full rounded-lg border border-borda object-contain" />}

      {tipo === 'paragrafo' && (
        <textarea
          aria-labelledby={idTitulo}
          value={valor}
          placeholder="Resposta longa..."
          onChange={(e) => setValor(e.target.value)}
          className="h-[86px] w-full resize-none rounded-xl border border-borda bg-cinza-50 px-4 py-3 text-[12px] text-texto outline-0 placeholder:text-secundaria-alfa-50 focus:border-primaria focus:shadow-[0_0_0_3px_var(--color-primaria-alfa-20)]"
        />
      )}

      {tipo === 'emocoes' && (
        <div role="radiogroup" aria-labelledby={idTitulo} className="grid grid-cols-3 gap-2">
          {EMOCOES.map((op) => (
            <button
              key={op.valor}
              type="button"
              role="radio"
              aria-checked={valor === op.valor}
              onClick={() => setValor(op.valor)}
              className={`flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl text-[13px] font-bold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
                valor === op.valor ? 'bg-primaria text-branco' : 'bg-fundo-card text-primaria hover:bg-borda'
              }`}
            >
              <span aria-hidden="true">{op.emoji}</span>
              {op.rotulo}
            </button>
          ))}
        </div>
      )}

      {(tipo === 'multipla' || tipo === 'unica') && (
        <div role={tipo === 'unica' ? 'radiogroup' : 'group'} aria-labelledby={idTitulo} className="flex flex-col gap-3">
          {opcoes.map((op, i) => (
            <label key={i} className="flex cursor-pointer items-center gap-2.5 text-[13px] text-texto">
              <input
                type={tipo === 'unica' ? 'radio' : 'checkbox'}
                name={idTitulo}
                className="h-4 w-4 accent-primaria"
                checked={tipo === 'unica' ? valor === op : valor.includes(op)}
                onChange={() => {
                  if (tipo === 'unica') setValor(op)
                  else setValor(valor.includes(op) ? valor.filter((v) => v !== op) : [...valor, op])
                }}
              />
              {op}
            </label>
          ))}
          {opcoes.length === 0 && <p className="text-[12px] text-secundaria">(sem opções)</p>}
        </div>
      )}

      {tipo === 'escala' && (
        <div role="radiogroup" aria-labelledby={idTitulo} className="flex flex-wrap gap-1">
          {NUMEROS_ESCALA.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={valor === n}
              onClick={() => setValor(n)}
              className={`grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[11px] font-bold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria ${
                valor === n ? 'bg-primaria text-branco' : 'bg-fundo-card text-primaria hover:bg-borda'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </Card>
  )
}

export default function PreVisualizacao({ dados, perguntas, onEditar, onVoltarLista }) {
  const soArquivo = perguntas.length === 0 && Boolean(dados.arquivo)

  return (
    <>
      <BotaoVoltar onClick={onVoltarLista}>Voltar às tarefas</BotaoVoltar>

      <header className="flex items-center justify-between gap-3">
        <h1 className="text-[24px] font-extrabold leading-tight text-texto">Pré-visualização</h1>
        <button type="button" className={`${BOTAO_CLARO} h-10 px-4`} onClick={onEditar}>
          <span aria-hidden="true">✏️</span>
          Editar
        </button>
      </header>

      <Card as="section" aria-label="Tarefa" className="px-5 py-6 sm:px-[21px]">
        <h2 className="text-[18px] font-extrabold leading-snug text-texto">{dados.titulo.trim() || 'Sem título'}</h2>
        {dados.instrucoes.trim() && <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-secundaria">{dados.instrucoes}</p>}
      </Card>

      {dados.arquivo && <CartaoArquivo nome={dados.arquivo} sozinho={soArquivo} />}

      {perguntas.map((pergunta, i) => (
        <PerguntaPrevia key={pergunta.id} numero={i + 1} pergunta={pergunta} />
      ))}

      {perguntas.length === 0 && !dados.arquivo && (
        <Card as="p" className="px-4 py-8 text-center text-[13px] text-secundaria">Nenhuma pergunta ou arquivo adicionado.</Card>
      )}
    </>
  )
}
