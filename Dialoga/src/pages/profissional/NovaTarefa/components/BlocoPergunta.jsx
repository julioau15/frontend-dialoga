// ============================================================
// BlocoPergunta
// Cartão de edição de uma pergunta (RF280–RF284), como no Figma:
//   linha de cima: alça de arrastar (⋮⋮), número, tipo de resposta, duplicar e excluir;
//   "🖼️ Adicionar imagem à pergunta", enunciado, área da resposta conforme o tipo
//   e o interruptor "Resposta obrigatória".
// Área da resposta por tipo:
//   multipla/unica -> opções editáveis (quadradinho/bolinha, campo e lixeira) + "+ Adicionar opção"
//   paragrafo      -> caixa cinza "Resposta longa do paciente..."
//   emocoes        -> três pílulas lilás (😔 Mal, 😐 Neutro, 😊 Bem)
//   escala         -> quadradinhos de 0 a 10
// Arrastar: segure a alça e solte sobre outra pergunta. Teclado: foco na alça e setas ↑/↓.
// Props:
//   pergunta, numero, total, erro (mensagem ou '')
//   onMudar(mudancas), onDuplicar(), onExcluir(), onMover(delta: -1 | 1)
//   arraste -> { arrastando, alvo, onIniciar(), onEntrar(), onSoltar(), onTerminar() }
// ============================================================
import { useId, useRef } from 'react'
import Card from '../../../../components/Card'
import Interruptor from '../../../../components/Interruptor'
import { IconeLixeira, IconeX } from '../../../../components/Icones'
import { IconeMais } from '../../../../components/IconesAgenda'
import BotaoIcone from './BotaoIcone'
import { CAIXA } from './estilos'
import { IconeArrastar, IconeCopiar } from './iconesNovaTarefa'
import { EMOCOES, NUMEROS_ESCALA, temOpcoes } from './perguntas'
import SeletorTipo from './SeletorTipo'

// editor das opções de resposta (múltipla escolha e escolha única)
function EditorOpcoes({ tipo, opcoes, numero, onMudar }) {
  const alterar = (i, texto) => onMudar(opcoes.map((o, j) => (j === i ? texto : o)))
  const remover = (i) => onMudar(opcoes.filter((_, j) => j !== i))

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="sr-only">Opções de resposta da pergunta {numero}</legend>
      {opcoes.map((opcao, i) => (
        <div key={i} className="flex items-center gap-2 sm:gap-2.5">
          {/* quadradinho (múltipla escolha) ou bolinha (escolha única), só ilustrativo */}
          <span aria-hidden="true" className={`h-4 w-4 shrink-0 border-[1.5px] border-borda-forte ${tipo === 'unica' ? 'rounded-full' : 'rounded'}`} />
          <input
            aria-label={`Opção ${i + 1}`}
            placeholder={`Opção ${i + 1}`}
            maxLength={200}
            value={opcao}
            onChange={(e) => alterar(i, e.target.value)}
            className={`${CAIXA} h-[38px] min-w-0 border-borda`}
          />
          {/* mínimo de duas opções */}
          <BotaoIcone rotulo={`Remover opção ${i + 1}`} perigo disabled={opcoes.length <= 2} onClick={() => remover(i)}>
            <IconeLixeira tamanho={14} />
          </BotaoIcone>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onMudar([...opcoes, ''])}
        className="mx-auto flex w-fit cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] font-bold text-primaria hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
      >
        <IconeMais tamanho={12} />
        Adicionar opção
      </button>
    </fieldset>
  )
}

// amostra (só visual) de como o paciente vai responder nos tipos sem opções
function AmostraResposta({ tipo }) {
  if (tipo === 'paragrafo') {
    return (
      <div className="flex h-12 items-center rounded-xl border border-borda bg-cinza-50 px-4 text-[13px] text-secundaria">
        Resposta longa do paciente...
      </div>
    )
  }
  if (tipo === 'emocoes') {
    return (
      <div aria-label="Amostra da escala de emoções" className="grid grid-cols-3 gap-2">
        {EMOCOES.map((e) => (
          <span key={e.valor} className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-fundo-card text-[13px] font-bold text-primaria">
            <span aria-hidden="true">{e.emoji}</span>
            {e.rotulo}
          </span>
        ))}
      </div>
    )
  }
  return (
    <div aria-label="Amostra da escala de 0 a 10" className="flex flex-wrap gap-1">
      {NUMEROS_ESCALA.map((n) => (
        <span key={n} className="grid h-8 w-8 place-items-center rounded-lg bg-fundo-card text-[11px] font-bold text-primaria">{n}</span>
      ))}
    </div>
  )
}

export default function BlocoPergunta({ pergunta, numero, total, erro, onMudar, onDuplicar, onExcluir, onMover, arraste }) {
  const idTitulo = useId()
  const inputImagem = useRef(null)
  const cartao = useRef(null) // usado como imagem do arraste
  const { tipo, enunciado, imagem, obrigatoria, opcoes } = pergunta

  // troca o tipo; nos tipos com opções, garante pelo menos duas opções em branco
  function mudarTipo(novoTipo) {
    const novasOpcoes = temOpcoes(novoTipo) ? (opcoes.length >= 2 ? opcoes : ['', '']) : opcoes
    onMudar({ tipo: novoTipo, opcoes: novasOpcoes })
  }

  // guarda o nome e um endereço temporário da imagem para mostrar a miniatura
  function escolherImagem(arquivo) {
    if (!arquivo) return
    onMudar({ imagem: { nome: arquivo.name, url: URL.createObjectURL(arquivo) } })
  }

  // tira a imagem só desta pergunta. O endereço temporário (blob:) não é liberado de propósito:
  // uma pergunta duplicada usa o mesmo endereço, e liberar quebraria a imagem da original.
  function removerImagem() {
    onMudar({ imagem: null })
    if (inputImagem.current) inputImagem.current.value = ''
  }

  // setas ↑/↓ na alça movem a pergunta (alternativa ao arrastar)
  function teclaNaAlca(e) {
    if (e.key === 'ArrowUp' && numero > 1) {
      e.preventDefault()
      onMover(-1)
    }
    if (e.key === 'ArrowDown' && numero < total) {
      e.preventDefault()
      onMover(1)
    }
  }

  const erroEnunciado = erro && !enunciado.trim() ? erro : ''

  return (
    <Card
      as="section"
      aria-labelledby={idTitulo}
      data-pergunta={pergunta.id}
      data-erro={erro ? 'true' : undefined}
      ref={cartao}
      onDragOver={(e) => {
        e.preventDefault() // permite soltar aqui
        arraste.onEntrar()
      }}
      onDrop={(e) => {
        e.preventDefault()
        arraste.onSoltar()
      }}
      className={`flex flex-col gap-3 p-5 transition-[opacity,box-shadow] duration-200 sm:px-[21px] ${arraste.arrastando ? 'opacity-50' : ''} ${
        arraste.alvo ? 'ring-2 ring-primaria' : erro ? 'ring-1 ring-erro' : ''
      }`}
    >
      <header className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          aria-label={`Mover pergunta ${numero} (arraste ou use as setas para cima e para baixo)`}
          title="Arrastar para reordenar"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', pergunta.id) // necessário no Firefox
            if (cartao.current) e.dataTransfer.setDragImage(cartao.current, 24, 24) // mostra o cartão todo
            arraste.onIniciar()
          }}
          onDragEnd={arraste.onTerminar}
          onKeyDown={teclaNaAlca}
          className="-ml-1 grid h-8 w-5 shrink-0 cursor-grab place-items-center rounded-md text-borda-forte hover:bg-fundo-suave-2 hover:text-secundaria active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
        >
          <IconeArrastar tamanho={14} />
        </button>
        <h3 id={idTitulo} className="w-5 shrink-0 text-[12px] font-bold text-secundaria sm:w-8">
          <span className="sr-only">Pergunta </span>
          {numero}
          <span aria-hidden="true">.</span>
        </h3>
        <SeletorTipo valor={tipo} onMudar={mudarTipo} rotulo={`Tipo de resposta da pergunta ${numero}`} />
        <div className="ml-auto flex shrink-0 items-center">
          <BotaoIcone rotulo={`Duplicar pergunta ${numero}`} onClick={onDuplicar}>
            <IconeCopiar tamanho={15} />
          </BotaoIcone>
          <BotaoIcone rotulo={`Excluir pergunta ${numero}`} perigo onClick={onExcluir}>
            <IconeLixeira tamanho={15} />
          </BotaoIcone>
        </div>
      </header>

      {/* imagem opcional da pergunta */}
      <div>
        <input
          ref={inputImagem}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-label={`Imagem da pergunta ${numero}`}
          onChange={(e) => escolherImagem(e.target.files?.[0])}
        />
        {imagem ? (
          <div className="flex items-center gap-3 rounded-lg border border-borda bg-fundo-suave-2 p-2">
            <img src={imagem.url} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" />
            <span className="min-w-0 flex-1 truncate text-[12px] text-texto">{imagem.nome}</span>
            <BotaoIcone rotulo="Remover imagem" perigo onClick={removerImagem}>
              <IconeX tamanho={14} />
            </BotaoIcone>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputImagem.current?.click()}
            className="flex h-[34px] w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-dashed border-borda bg-branco text-[11.5px] text-secundaria transition-colors duration-200 hover:bg-fundo-suave-2 hover:text-primaria focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
          >
            <span aria-hidden="true">🖼️</span>
            Adicionar imagem à pergunta
          </button>
        )}
      </div>

      <div className="mt-2 flex flex-col gap-1.5">
        <input
          aria-label={`Enunciado da pergunta ${numero}`}
          placeholder="Enunciado da pergunta"
          maxLength={500}
          value={enunciado}
          aria-invalid={!!erroEnunciado}
          onChange={(e) => onMudar({ enunciado: e.target.value })}
          className={`${CAIXA} h-[46px] ${erroEnunciado ? 'border-erro' : 'border-borda'}`}
        />
        {erroEnunciado && <span className="text-[11px] text-erro">{erroEnunciado}</span>}
      </div>

      {temOpcoes(tipo) ? (
        <EditorOpcoes tipo={tipo} opcoes={opcoes} numero={numero} onMudar={(lista) => onMudar({ opcoes: lista })} />
      ) : (
        <AmostraResposta tipo={tipo} />
      )}

      {/* erro das opções (o erro do enunciado já aparece abaixo do próprio campo) */}
      {erro && enunciado.trim() && <p role="alert" className="text-[11px] text-erro">{erro}</p>}

      <div className="flex items-center gap-2.5">
        <Interruptor ligado={obrigatoria} rotulo={`Resposta obrigatória na pergunta ${numero}`} onAlternar={(valor) => onMudar({ obrigatoria: valor })} />
        <span aria-hidden="true" className="text-[11.5px] text-secundaria-escura">Resposta obrigatória</span>
      </div>
    </Card>
  )
}
