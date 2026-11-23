// ============================================================
// utils/tarefasProfissional.js
// Converte os dados da API de tarefas para o formato das telas do profissional
// (Tarefas, Nova/Editar tarefa, Acompanhamento e Resposta) e o contrário.
// Só funções puras: sem requisição e sem estado.
//
// Vocabulário da tela (pergunta.tipo): 'multipla' | 'unica' | 'paragrafo' | 'emocoes' | 'escala'.
// Esses mesmos nomes são gravados em tbl_pergunta.tipo, e a tela de Tarefas do paciente
// (tarefasUtils.js) já reconhece todos eles.
// Status do destinatário no banco: 'pendente' | 'andamento' | 'concluida'.
// ============================================================
import { dataLocalISO } from './formatadores.js'

const TIPOS_COM_OPCOES = ['multipla', 'unica']

// ---------- valores soltos ----------

// tinyint do MySQL pode chegar como 0/1, true/false ou Buffer ({ data: [1] })
export function paraBooleano(valor) {
  if (valor && typeof valor === 'object' && Array.isArray(valor.data)) return valor.data[0] === 1
  return valor === true || Number(valor) === 1
}

// "2026-09-07T23:59:00.000Z" -> "2026-09-07" (só o texto, sem converter fuso: o dia do prazo não pode "andar")
export const prazoParaIso = (valor) => (valor ? String(valor).slice(0, 10) : null)

// momento exato (envio, conclusão) -> dia no fuso do navegador, 'AAAA-MM-DD'
export function dataDeMomento(valor) {
  if (!valor) return null
  const data = new Date(valor)
  return Number.isNaN(data.getTime()) ? String(valor).slice(0, 10) : dataLocalISO(data)
}

// "AAAA-MM-DD" -> "AAAA-MM-DD 23:59:00" (formato que o back grava no DATETIME); sem data = null
export const prazoParaApi = (iso) => (iso ? `${iso} 23:59:00` : null)

// "https://.../1700-arquivo.pdf?x=1" -> "arquivo.pdf"
export function nomeDoArquivo(url) {
  if (!url) return ''
  const ultimo = String(url).split('?')[0].split('/').pop() ?? ''
  const semData = ultimo.replace(/^\d{10,}-/, '')
  try {
    return decodeURIComponent(semData)
  } catch {
    return semData
  }
}

// ---------- tipo da pergunta ----------

// tbl_pergunta.tipo não tem vocabulário fixo no back (o seed usa 'texto' e 'multipla_escolha'):
// reconhece os nomes prováveis e cai em 'unica'/'paragrafo' conforme a pergunta tenha opções.
export function tipoDaPergunta(tipoApi, opcoes = []) {
  const t = String(tipoApi ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (t.includes('emoc')) return 'emocoes'
  if (t.includes('escala') || t.includes('numer')) return 'escala'
  if (t.includes('multipla')) return 'multipla'
  if (t.includes('unica') || t.includes('escolha')) return 'unica'
  if (t.includes('texto') || t.includes('paragrafo')) return 'paragrafo'
  return opcoes.length > 0 ? 'unica' : 'paragrafo'
}

const porOrdem = (a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)

// ---------- status ----------

const statusEm = (status) => String(status ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const concluida = (status) => statusEm(status) === 'concluida'
const emAndamento = (status) => statusEm(status).includes('andamento')

// status do banco -> status do Acompanhamento de respostas
export function statusAcompanhamentoDe(statusApi) {
  if (concluida(statusApi)) return 'respondida'
  if (emAndamento(statusApi)) return 'em_andamento'
  return 'nao_preenchido'
}

// Resume os destinatários de uma tarefa em um único status e prazo para a lista de Tarefas:
//   respondida   -> todos concluíram
//   atrasada     -> alguém que não concluiu passou do prazo
//   pendente     -> ninguém concluiu nem começou
//   em_andamento -> tarefa de UM destinatário que já começou e ainda não concluiu
//   parcial      -> vários destinatários e só parte respondeu (a tela mostra "x/y respondidas")
// Também devolve respondidas e total (quantos concluíram / quantos receberam).
// O prazo mostrado é o mais próximo entre quem ainda não concluiu.
export function resumirDestinatarios(destinatarios, hoje = dataLocalISO()) {
  if (destinatarios.length === 0) return { status: 'pendente', prazo: null, respondidas: 0, total: 0 }

  const abertos = destinatarios.filter((d) => !concluida(d.status))
  const prazos = (abertos.length > 0 ? abertos : destinatarios)
    .map((d) => prazoParaIso(d.prazo))
    .filter(Boolean)
    .sort()

  const total = destinatarios.length
  const respondidas = total - abertos.length
  const alguemComecou = respondidas > 0 || abertos.some((d) => emAndamento(d.status))

  let status = 'pendente'
  if (abertos.length === 0) status = 'respondida'
  else if (abertos.some((d) => (prazoParaIso(d.prazo) ?? '9999') < hoje)) status = 'atrasada'
  else if (alguemComecou) status = total > 1 ? 'parcial' : 'em_andamento'

  return { status, prazo: prazos[0] ?? null, respondidas, total }
}

// ---------- lista de Tarefas ----------

// Linha de GET /tarefas (+ destinatários dela) -> item da lista de Tarefas do profissional.
// idEnvio = destinatário que o ícone de respostas abre (a conclusão mais recente; senão o último enviado).
export function tarefaApiParaLista(tarefa, destinatarios = []) {
  const rascunho = paraBooleano(tarefa.is_rascunho)
  const { status, prazo, respondidas, total } = rascunho
    ? { status: null, prazo: null, respondidas: 0, total: 0 }
    : resumirDestinatarios(destinatarios)

  const concluidas = destinatarios
    .filter((d) => concluida(d.status) && d.data_conclusao)
    .sort((a, b) => String(b.data_conclusao).localeCompare(String(a.data_conclusao)))
  const idEnvio = (concluidas[0] ?? destinatarios[0])?.id ?? null

  return {
    id: tarefa.id,
    titulo: tarefa.titulo,
    total_perguntas: tarefa.perguntas?.length ?? 0,
    prazo,
    status,
    respondidas,
    total,
    is_rascunho: rascunho ? 1 : 0,
    idEnvio,
  }
}

// ---------- Acompanhamento de respostas ----------

// Paciente no formato das telas do Acompanhamento e da Resposta.
// id também define a cor do avatar; idPerfil é o id usado na rota /profissional/pacientes/:id.
export function pacienteParaAcompanhamento(paciente, nomeFallback = 'Paciente') {
  return {
    id: paciente?.id ?? 0,
    idPerfil: paciente?.id ?? null,
    nome: paciente?.nome ?? nomeFallback,
    email: paciente?.email ?? '',
    telefone: paciente?.telefone ?? '',
  }
}

// Destinatário (linha de GET /tarefas-destinatarios) + tarefa + paciente -> item da lista do Acompanhamento.
// ultimaModificacao: a conclusão; senão a última resposta salva; senão o envio da tarefa.
export function destinatarioParaItem(destinatario, tarefa, paciente, ultimaResposta = null) {
  return {
    id: destinatario.id,
    tarefa: { id: tarefa.id, titulo: tarefa.titulo, descricao: tarefa.instrucoes ?? '' },
    paciente,
    status: statusAcompanhamentoDe(destinatario.status),
    ultimaModificacao:
      dataDeMomento(destinatario.data_conclusao) ??
      dataDeMomento(ultimaResposta) ??
      dataDeMomento(tarefa.data_envio) ??
      dataDeMomento(tarefa.data_criacao) ??
      dataLocalISO(),
  }
}

// ---------- tela de Resposta ----------

// Texto de uma opção marcada: o da opção cadastrada; se ela foi apagada, o valor gravado na resposta
function textoDaOpcao(pergunta, linha) {
  return pergunta.opcoes?.find((o) => o.id === linha.id_opcao_pergunta)?.texto ?? linha.valor ?? null
}

// Perguntas da tarefa + linhas de tbl_resposta -> [{ pergunta, tipo, resposta }] (resposta null = não respondida)
export function montarRespostas(perguntas = [], linhas = []) {
  return [...perguntas].sort(porOrdem).map((p) => {
    const tipo = tipoDaPergunta(p.tipo, p.opcoes)
    const dela = linhas.filter((l) => l.id_pergunta === p.id)
    let resposta = null

    if (dela.length > 0) {
      if (tipo === 'multipla') resposta = dela.map((l) => textoDaOpcao(p, l)).filter(Boolean)
      else if (tipo === 'unica') resposta = textoDaOpcao(p, dela[0])
      else if (tipo === 'escala') {
        const numero = Number(dela[0].valor)
        resposta = dela[0].valor === null || dela[0].valor === '' || Number.isNaN(numero) ? null : numero
      } else resposta = dela[0].valor ?? null
    }
    return { pergunta: p.texto, tipo, resposta }
  })
}

// data mais recente entre as respostas salvas (ou null)
export function ultimaRespostaEm(linhas = []) {
  const datas = linhas.map((l) => l.data_envio).filter(Boolean).sort()
  return datas.at(-1) ?? null
}

// ---------- formulário (Nova / Editar tarefa) ----------

// Pergunta da API -> pergunta do formulário. idApi guarda o id do banco (para editar/excluir na edição).
export function perguntaApiParaForm(p) {
  const opcoes = [...(p.opcoes ?? [])].sort(porOrdem)
  const tipo = tipoDaPergunta(p.tipo, opcoes)
  const textos = TIPOS_COM_OPCOES.includes(tipo) ? opcoes.map((o) => o.texto) : []
  while (TIPOS_COM_OPCOES.includes(tipo) && textos.length < 2) textos.push('')

  return {
    id: `api-${p.id}`,
    idApi: p.id,
    tipo,
    enunciado: p.texto ?? '',
    imagem: p.imagem ? { nome: nomeDoArquivo(p.imagem), url: p.imagem } : null,
    obrigatoria: paraBooleano(p.obrigatoria),
    opcoes: textos,
  }
}

// Pergunta do formulário -> corpo de POST /tarefas/:id/perguntas (e PUT /perguntas/:id).
// O back sempre percorre "opcoes", então vai uma lista vazia nos tipos sem opções.
// A imagem só vai quando já é uma URL (o back não tem upload de imagem de pergunta;
// o endereço temporário "blob:" da pré-visualização não serve fora do navegador).
export function perguntaFormParaApi(pergunta, ordem) {
  const imagem = pergunta.imagem?.url
  const imagemPublica = typeof imagem === 'string' && /^https?:\/\//i.test(imagem) && imagem.length <= 255

  return {
    tipo: pergunta.tipo,
    texto: pergunta.enunciado.trim(),
    imagem: imagemPublica ? imagem : null,
    obrigatoria: pergunta.obrigatoria ? 1 : 0,
    ordem,
    opcoes: TIPOS_COM_OPCOES.includes(pergunta.tipo)
      ? pergunta.opcoes
          .map((texto) => texto.trim())
          .filter(Boolean)
          .map((texto, i) => ({ texto, ordem: i + 1 }))
      : [],
  }
}
