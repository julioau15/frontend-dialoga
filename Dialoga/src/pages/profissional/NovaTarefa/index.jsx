// ============================================================
// pages/profissional/NovaTarefa
// Criação de tarefa (questionário) pelo profissional e pré-visualização.
// Ligada à API (services/tarefaProfissionalService). Rota: /profissional/tarefas/nova
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
// Ao salvar ou enviar, grava na API e volta para a lista com o aviso (toast) de sucesso;
// se a API recusar, o erro aparece num toast vermelho e a tela continua como estava.
// Rascunho guarda o nome, as instruções, o arquivo e as perguntas; os pacientes são escolhidos no envio
// (o back avisa o paciente assim que a tarefa é criada com destinatários, e rascunho não deve avisar ninguém).
// Também é usada pela tela Editar tarefa (frame "Editar tarefa - Profissional"):
// com editando = true o título vira "Editar tarefa", os campos já vêm preenchidos
// e ficam só o botão "Enviar ao paciente" (sem "Visualizar" e sem "Salvar rascunho").
// Props (opcionais): editando (true/false), inicial ({ dados, perguntas, original } já preenchidos, ver
// useTarefaParaEdicao). Editando um rascunho, o botão "Salvar rascunho" também aparece.
// Desktop, Tablet e Mobile (403px).
// ============================================================
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Toast from '../../../components/Toast'
import { IconeMais } from '../../../components/IconesAgenda'
import { useAuth } from '../../../contexts/AuthContext'
import { usePacientesParaTarefa } from '../../../hooks/useFormularioTarefa'
import { criarTarefa, editarTarefa } from '../../../services/tarefaProfissionalService'
import { paraBooleano } from '../../../utils/tarefasProfissional'
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
// arquivo = nome mostrado na tela | arquivoFile = File novo para enviar | anexoUrl = anexo que já existe (edição)
const DADOS_INICIAIS = { titulo: '', instrucoes: '', arquivo: null, arquivoFile: null, anexoUrl: null, pacientes: [] }
const BOTAO_DESATIVADO = 'disabled:cursor-not-allowed disabled:opacity-60'

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
  const { auth } = useAuth()
  const token = auth?.token
  const lista = usePacientesParaTarefa(token)
  // só o rascunho pode ser salvo de novo como rascunho; tarefa já enviada só pode ser reenviada
  const permiteRascunho = !editando || paraBooleano(inicial?.original?.tarefa?.is_rascunho)
  // na edição os campos começam com os dados da tarefa; na criação, em branco
  const [dados, setDados] = useState(() => inicial?.dados ?? DADOS_INICIAIS)
  const [perguntas, setPerguntas] = useState(() => inicial?.perguntas ?? [criarPergunta()])
  const [erros, setErros] = useState({})
  const [modo, setModo] = useState('edicao') // 'edicao' | 'previa'
  const [confirmando, setConfirmando] = useState(false)
  const [idExcluir, setIdExcluir] = useState(null) // pergunta aguardando o pop-up "Excluir pergunta" (null = fechado)
  const [arraste, setArraste] = useState({ origem: null, alvo: null }) // ids das perguntas no arrastar
  const [salvando, setSalvando] = useState(false) // true enquanto a API grava (bloqueia os botões)
  const [aviso, setAviso] = useState({ aberto: false, tipo: 'sucesso', mensagem: '' })
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
    setAviso({ aberto: true, tipo: 'sucesso', mensagem: 'Pergunta excluída.' })
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
  // Grava na API (criando ou editando) e volta para a lista com o aviso de sucesso.
  // Se a API recusar, o erro vira um toast e a tela continua aberta com tudo o que foi preenchido.
  async function gravar(rascunho) {
    setSalvando(true)
    const corpo = {
      titulo: dados.titulo,
      instrucoes: dados.instrucoes,
      arquivo: dados.arquivoFile,
      anexoUrl: dados.anexoUrl,
      pacientes: dados.pacientes.map((p) => ({ id: p.id, prazo: p.comPrazo ? p.prazo : '' })),
      perguntas,
      rascunho,
    }
    try {
      if (editando) await editarTarefa(token, inicial.original.tarefa.id, corpo, inicial.original)
      else await criarTarefa(token, corpo)

      let mensagem = 'Questionário enviado ao(s) paciente(s)!'
      if (rascunho) {
        mensagem = !editando && dados.pacientes.length > 0
          ? 'Rascunho salvo! Escolha os pacientes quando for enviar.'
          : 'Rascunho salvo com sucesso!'
      }
      navigate(ROTA_LISTA, { state: { aviso: mensagem } })
    } catch (e) {
      setConfirmando(false)
      setAviso({ aberto: true, tipo: 'erro', mensagem: e.message })
      setSalvando(false)
    }
  }

  // rascunho só exige o nome da tarefa
  function salvarRascunho() {
    if (!dados.titulo.trim()) {
      setErros({ titulo: 'Informe o nome da tarefa para salvar o rascunho.' })
      rolarAteErro()
      return
    }
    gravar(true)
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
    gravar(false)
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

            <DadosGerais
              dados={dados}
              erros={erros}
              onMudar={mudarDado}
              pacientes={lista.pacientes}
              carregandoPacientes={lista.carregando}
              erroPacientes={lista.erro}
            />

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
            <div className={`grid gap-3 sm:flex ${permiteRascunho ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {permiteRascunho && (
                <button type="button" className={`${BOTAO_CLARO} ${BOTAO_DESATIVADO} h-12 px-3 sm:h-11 sm:px-5`} onClick={salvarRascunho} disabled={salvando}>
                  <IconeSalvar tamanho={16} />
                  {salvando ? 'Salvando...' : 'Salvar rascunho'}
                </button>
              )}
              <button type="button" className={`${BOTAO_PRIMARIO} ${BOTAO_DESATIVADO} h-12 px-3 sm:h-11 sm:px-5`} onClick={aoEnviar} disabled={salvando}>
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
        totalPacientes={lista.pacientes.length + dados.pacientes.filter((s) => !lista.pacientes.some((p) => p.id === s.id)).length}
        enviando={salvando}
        onCancelar={() => setConfirmando(false)}
        onConfirmar={confirmarEnvio}
      />
      <Toast aberto={aviso.aberto} tipo={aviso.tipo} mensagem={aviso.mensagem} onFechar={fecharAviso} />
    </div>
  )
}

export default NovaTarefa
