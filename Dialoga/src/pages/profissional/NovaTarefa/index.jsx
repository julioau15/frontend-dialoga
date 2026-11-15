// ============================================================
// pages/profissional/NovaTarefa
// Criação de tarefa (questionário) pelo profissional e pré-visualização.
// Só visual: dados fixos (mock) e estado local, sem API. Rota: /profissional/tarefas/nova
// Frames: "Nova tarefa", "Nova tarefa dropdown", "Selecionar paciente para tarefa",
//         "Nova tarefa paciente selecionado", "Excluir pergunta", "Enviar ao paciente",
//         "Visualizar tarefa" (desktop) e "Tarefas profissional - mobile".
// A página troca entre duas telas sem mudar a URL:
//   edicao -> "Voltar às tarefas", "Nova tarefa" + "Visualizar" (RF285), Dados gerais (RF276–RF279),
//             cartões de pergunta (RF280–RF284), "+ Adicionar pergunta",
//             "Salvar rascunho" e "Enviar ao paciente" (RF286, RF287)
//   previa -> "Pré-visualização" com "✏️ Editar" (RF285, RNF075); só arquivo mostra o arquivo (RF289)
// Pop-ups: "Excluir pergunta" (a lixeira da pergunta pede confirmação, RF287)
//          e "Confirmar envio".
// Ao excluir uma pergunta, mostra o aviso (toast) "Pergunta excluída.".
// Ao salvar ou enviar, volta para a lista com o aviso (toast) de sucesso.
// Também é usada pela tela Editar tarefa (frame "Editar tarefa - Profissional"):
// com editando = true o título vira "Editar tarefa", os campos já vêm preenchidos
// e ficam só o botão "Enviar ao paciente" (sem "Visualizar" e sem "Salvar rascunho").
// Props (opcionais): editando (true/false), inicial ({ dados, perguntas } já preenchidos)
// Desktop, Tablet e Mobile (403px).
// ============================================================
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toast from '../../../components/Toast'
import { IconeMais } from '../../../components/IconesAgenda'
import BlocoPergunta from './components/BlocoPergunta'
import BotaoVoltar from './components/BotaoVoltar'
import DadosGerais from './components/DadosGerais'
import ModalConfirmarEnvio from './components/ModalConfirmarEnvio'
import ModalExcluirPergunta from './components/ModalExcluirPergunta'
import PreVisualizacao from './components/PreVisualizacao'
import { BOTAO_CLARO, BOTAO_PRIMARIO } from './components/estilos'
import { IconeEnviar, IconeSalvar } from './components/iconesNovaTarefa'
import { criarPergunta, duplicarPergunta, erroDaPergunta } from './components/perguntas'

const ROTA_LISTA = '/profissional/tarefas'
const DADOS_INICIAIS = { titulo: '', instrucoes: '', arquivo: null, pacientes: [] }

// confere tudo o que o envio exige e devolve os erros encontrados ({} = pode enviar)
function validarEnvio(dados, perguntas) {
  const erros = {}
  if (!dados.titulo.trim()) erros.titulo = 'Informe o nome da tarefa.'
  if (dados.pacientes.length === 0) erros.pacientes = 'Selecione ao menos um paciente.'

  const errosPerguntas = {}
  perguntas.forEach((p) => {
    const msg = erroDaPergunta(p)
    if (msg) errosPerguntas[p.id] = msg
  })
  if (Object.keys(errosPerguntas).length) erros.perguntas = errosPerguntas

  if (perguntas.length === 0 && !dados.arquivo) erros.conteudo = 'Adicione uma pergunta ou anexe um arquivo.'
  return erros
}

// leva a tela até o primeiro campo com erro (depois que o React desenhar os erros)
function rolarAteErro() {
  requestAnimationFrame(() => {
    document.querySelector('[aria-invalid="true"], [data-erro="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

function NovaTarefa({ editando = false, inicial = null }) {
  const navigate = useNavigate()
  // na edição os campos começam com os dados da tarefa; na criação, em branco
  const [dados, setDados] = useState(() => inicial?.dados ?? DADOS_INICIAIS)
  const [perguntas, setPerguntas] = useState(() => inicial?.perguntas ?? [criarPergunta()])
  const [erros, setErros] = useState({})
  const [modo, setModo] = useState('edicao') // 'edicao' | 'previa'
  const [confirmando, setConfirmando] = useState(false)
  const [idExcluir, setIdExcluir] = useState(null) // pergunta aguardando o pop-up "Excluir pergunta" (null = fechado)
  const [arraste, setArraste] = useState({ origem: null, alvo: null }) // ids das perguntas no arrastar
  const [aviso, setAviso] = useState({ aberto: false, mensagem: '' })
  const fecharAviso = useCallback(() => setAviso((a) => ({ ...a, aberto: false })), [])

  // ao trocar entre edição e pré-visualização, volta ao topo
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [modo])

  // ---------- dados gerais ----------
  function mudarDado(campo, valor) {
    setDados((atual) => ({ ...atual, [campo]: valor }))
    // corrigiu o campo: some o erro dele (o de conteúdo depende do arquivo)
    const relacionado = { titulo: 'titulo', pacientes: 'pacientes', arquivo: 'conteudo' }[campo]
    if (relacionado) setErros((atual) => ({ ...atual, [relacionado]: undefined }))
  }

  // ---------- perguntas ----------
  function limparErroPergunta(id) {
    setErros((atual) => (atual.perguntas?.[id] ? { ...atual, perguntas: { ...atual.perguntas, [id]: undefined } } : atual))
  }

  function mudarPergunta(id, mudancas) {
    setPerguntas((lista) => lista.map((p) => (p.id === id ? { ...p, ...mudancas } : p)))
    limparErroPergunta(id)
  }

  function adicionarPergunta() {
    setPerguntas((lista) => [...lista, criarPergunta()])
    setErros((atual) => ({ ...atual, conteudo: undefined }))
  }

  // a cópia entra logo abaixo da original
  function duplicar(id) {
    setPerguntas((lista) => {
      const i = lista.findIndex((p) => p.id === id)
      return [...lista.slice(0, i + 1), duplicarPergunta(lista[i]), ...lista.slice(i + 1)]
    })
  }

  // lixeira da pergunta: só guarda qual pergunta é e abre o pop-up de confirmação
  function pedirExclusao(id) {
    setIdExcluir(id)
  }

  // "Excluir pergunta" no pop-up: remove a pergunta, fecha o pop-up e mostra o aviso
  function confirmarExclusao() {
    setPerguntas((lista) => lista.filter((p) => p.id !== idExcluir))
    limparErroPergunta(idExcluir)
    setIdExcluir(null)
    setAviso({ aberto: true, mensagem: 'Pergunta excluída.' })
  }

  // "Cancelar", X, Esc ou clique fora: fecha o pop-up sem excluir
  function cancelarExclusao() {
    setIdExcluir(null)
  }

  // tira a pergunta da posição "de" e coloca na posição "para"
  function reordenar(de, para) {
    setPerguntas((lista) => {
      if (de < 0 || para < 0 || de >= lista.length || para >= lista.length || de === para) return lista
      const nova = [...lista]
      const [item] = nova.splice(de, 1)
      nova.splice(para, 0, item)
      return nova
    })
  }

  // fim do arrastar: solta a pergunta de origem na posição da pergunta de destino
  function soltarSobre(idDestino) {
    reordenar(
      perguntas.findIndex((p) => p.id === arraste.origem),
      perguntas.findIndex((p) => p.id === idDestino),
    )
    setArraste({ origem: null, alvo: null })
  }

  // ---------- salvar e enviar ----------
  // rascunho só exige o nome da tarefa
  function salvarRascunho() {
    if (!dados.titulo.trim()) {
      setErros({ titulo: 'Informe o nome da tarefa para salvar o rascunho.' })
      rolarAteErro()
      return
    }
    navigate(ROTA_LISTA, { state: { aviso: 'Rascunho salvo com sucesso!' } })
  }

  function aoEnviar() {
    const novos = validarEnvio(dados, perguntas)
    setErros(novos)
    if (Object.keys(novos).length > 0) {
      rolarAteErro()
      return
    }
    setConfirmando(true)
  }

  function confirmarEnvio() {
    setConfirmando(false)
    navigate(ROTA_LISTA, { state: { aviso: 'Questionário enviado ao(s) paciente(s)!' } })
  }

  // número (1, 2, 3...) da pergunta que está no pop-up "Excluir pergunta" (null = fechado)
  const numeroExcluir = idExcluir === null ? null : perguntas.findIndex((p) => p.id === idExcluir) + 1

  return (
    // -m-6 anula o padding do LayoutComSidebar para o fundo lilás preencher a área toda
    <div className="-m-6 min-h-svh bg-fundo-suave">
      <div className="mx-auto flex w-full max-w-[768px] flex-col gap-5 px-6 pt-6 pb-10 sm:pb-12">
        {modo === 'previa' ? (
          <PreVisualizacao dados={dados} perguntas={perguntas} onEditar={() => setModo('edicao')} onVoltarLista={() => navigate(ROTA_LISTA)} />
        ) : (
          <>
            <BotaoVoltar onClick={() => navigate(ROTA_LISTA)}>Voltar às tarefas</BotaoVoltar>

            <header className="flex items-center justify-between gap-3">
              <h1 className="text-[24px] font-extrabold leading-tight text-texto">{editando ? 'Editar tarefa' : 'Nova tarefa'}</h1>
              {/* no Figma da edição não há "Visualizar" */}
              {!editando && (
                <button type="button" className={`${BOTAO_CLARO} h-10 px-[19px]`} onClick={() => setModo('previa')}>
                  Visualizar
                </button>
              )}
            </header>

            <DadosGerais dados={dados} erros={erros} onMudar={mudarDado} />

            <section aria-labelledby="titulo-perguntas" className="flex flex-col gap-5">
              <h2 id="titulo-perguntas" className="sr-only">Perguntas ({perguntas.length})</h2>

              {perguntas.map((pergunta, i) => (
                <BlocoPergunta
                  key={pergunta.id}
                  pergunta={pergunta}
                  numero={i + 1}
                  total={perguntas.length}
                  erro={erros.perguntas?.[pergunta.id] ?? ''}
                  onMudar={(mudancas) => mudarPergunta(pergunta.id, mudancas)}
                  onDuplicar={() => duplicar(pergunta.id)}
                  onExcluir={() => pedirExclusao(pergunta.id)}
                  onMover={(delta) => reordenar(i, i + delta)}
                  arraste={{
                    arrastando: arraste.origem === pergunta.id,
                    alvo: arraste.origem !== null && arraste.alvo === pergunta.id && arraste.origem !== pergunta.id,
                    onIniciar: () => setArraste({ origem: pergunta.id, alvo: null }),
                    onEntrar: () => setArraste((a) => (a.origem && a.alvo !== pergunta.id ? { ...a, alvo: pergunta.id } : a)),
                    onSoltar: () => soltarSobre(pergunta.id),
                    onTerminar: () => setArraste({ origem: null, alvo: null }),
                  }}
                />
              ))}

              {/* sem perguntas a tarefa pode ser só um arquivo (RF289); sem os dois, não dá para enviar */}
              {erros.conteudo && <p role="alert" data-erro="true" className="-mt-2 text-[11px] text-erro">{erros.conteudo}</p>}

              <button
                type="button"
                onClick={adicionarPergunta}
                className="flex h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-borda-forte text-[14px] font-bold text-primaria transition-colors duration-200 hover:bg-fundo-suave-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primaria"
              >
                <IconeMais tamanho={16} />
                Adicionar pergunta
              </button>
            </section>

            {/* mobile: botões ocupando a largura (lado a lado na criação); desktop: alinhados à esquerda.
                Na edição só existe "Enviar ao paciente", como no Figma. */}
            <div className={`grid gap-3 sm:flex ${editando ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {!editando && (
                <button type="button" className={`${BOTAO_CLARO} h-12 px-3 sm:h-11 sm:px-5`} onClick={salvarRascunho}>
                  <IconeSalvar tamanho={16} />
                  Salvar rascunho
                </button>
              )}
              <button type="button" className={`${BOTAO_PRIMARIO} h-12 px-3 sm:h-11 sm:px-5`} onClick={aoEnviar}>
                <IconeEnviar tamanho={16} />
                Enviar ao paciente
              </button>
            </div>
          </>
        )}
      </div>

      <ModalExcluirPergunta numero={numeroExcluir} onFechar={cancelarExclusao} onConfirmar={confirmarExclusao} />
      <ModalConfirmarEnvio
        aberto={confirmando}
        titulo={dados.titulo.trim()}
        destinatarios={dados.pacientes}
        onCancelar={() => setConfirmando(false)}
        onConfirmar={confirmarEnvio}
      />
      <Toast aberto={aviso.aberto} mensagem={aviso.mensagem} onFechar={fecharAviso} />
    </div>
  )
}

export default NovaTarefa
