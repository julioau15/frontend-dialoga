// ============================================================
// tarefasUtils
// Converte os dados da API para o formato da tela (e o contrário).
//
// TAREFA (tela): { id, idDestinatario, titulo, profissional, autotarefa, prazo,
//                  prazoIso, status, progresso, anexo, perguntas }
// PERGUNTA (tela): { id, tipo, titulo, obrigatoria, opcoes, min, max, ... }
//   tipo: 'emocoes' | 'unica' | 'multipla' | 'texto' | 'escala'
// RESPOSTAS (tela), por id da pergunta:
//   emocoes -> 'mal' | 'neutro' | 'bem' | null     unica    -> id da opção | null
//   multipla -> [ids das opções]                   texto    -> string
//   escala  -> número | null
// ============================================================

// Emojis da escala de emoções (iguais aos do profissional e do Figma)
export const EMOCOES = [
  { valor: 'mal', rotulo: 'Mal', emoji: '😔' },
  { valor: 'neutro', rotulo: 'Neutro', emoji: '😐' },
  { valor: 'bem', rotulo: 'Bem', emoji: '😊' },
]

// tbl_pergunta.tipo não tem vocabulário fixo no back (o seed usa 'texto' e 'multipla_escolha'),
// então reconhecemos os nomes mais prováveis. Se o profissional passar a gravar outro nome, ajuste aqui.
function tipoDaPergunta(pergunta) {
  const t = String(pergunta.tipo ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (t.includes('emoc')) return 'emocoes'
  if (t.includes('escala') || t.includes('numer')) return 'escala'
  if (t.includes('multipla')) return 'multipla'
  if (t.includes('unica') || t.includes('escolha')) return 'unica'
  if (t.includes('texto') || t.includes('paragrafo')) return 'texto'
  return pergunta.opcoes?.length > 0 ? 'unica' : 'texto'
}

export function perguntaApiParaTela(p) {
  const tipo = tipoDaPergunta(p)
  const base = { id: p.id, tipo, titulo: p.texto, obrigatoria: !!p.obrigatoria, ordem: p.ordem ?? 0 }
  if (tipo === 'emocoes') return { ...base, opcoes: EMOCOES }
  if (tipo === 'escala') return { ...base, min: 0, max: 10, rotuloMin: 'Nenhum', rotuloMax: 'Máximo' }
  if (tipo === 'texto') return { ...base, placeholder: 'Escreva sua resposta aqui...' }
  const opcoes = [...(p.opcoes ?? [])]
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
    .map((o) => ({ id: o.id, rotulo: o.texto }))
  return { ...base, opcoes }
}

// Respostas em branco para as perguntas (formato da tela)
export function respostasVazias(perguntas) {
  return Object.fromEntries(
    perguntas.map((p) => [p.id, p.tipo === 'multipla' ? [] : p.tipo === 'texto' ? '' : null]),
  )
}

// Linhas de tbl_resposta -> respostas da tela
export function respostasApiParaTela(perguntas, linhas) {
  const respostas = respostasVazias(perguntas)
  for (const p of perguntas) {
    const dela = linhas.filter((l) => l.id_pergunta === p.id)
    if (dela.length === 0) continue
    if (p.tipo === 'multipla') respostas[p.id] = dela.map((l) => l.id_opcao_pergunta).filter((id) => id != null)
    else if (p.tipo === 'unica') respostas[p.id] = dela[0].id_opcao_pergunta ?? null
    else if (p.tipo === 'escala') respostas[p.id] = dela[0].valor === null || dela[0].valor === '' ? null : Number(dela[0].valor)
    else respostas[p.id] = dela[0].valor ?? (p.tipo === 'texto' ? '' : null)
  }
  return respostas
}

// Respostas da tela -> linhas para POST /tarefas-destinatarios/:id/respostas
// (pergunta sem resposta não gera linha; múltipla escolha gera uma linha por opção marcada)
export function respostasTelaParaApi(perguntas, respostas) {
  const linhas = []
  for (const p of perguntas) {
    const v = respostas[p.id]
    if (!respondida(p, respostas)) continue
    if (p.tipo === 'multipla') {
      for (const idOpcao of v) {
        const opcao = p.opcoes.find((o) => o.id === idOpcao)
        linhas.push({ valor: opcao?.rotulo ?? null, id_pergunta: p.id, id_opcao_pergunta: idOpcao })
      }
    } else if (p.tipo === 'unica') {
      const opcao = p.opcoes.find((o) => o.id === v)
      linhas.push({ valor: opcao?.rotulo ?? null, id_pergunta: p.id, id_opcao_pergunta: v })
    } else {
      linhas.push({ valor: String(v).trim(), id_pergunta: p.id, id_opcao_pergunta: null })
    }
  }
  return linhas
}

// Uma pergunta está respondida quando tem valor (texto sem só espaços, lista não vazia...)
export function respondida(pergunta, respostas) {
  const valor = respostas?.[pergunta.id]
  if (pergunta.tipo === 'multipla') return Array.isArray(valor) && valor.length > 0
  if (pergunta.tipo === 'texto') return typeof valor === 'string' && valor.trim() !== ''
  return valor !== null && valor !== undefined
}

// Porcentagem de perguntas respondidas (0 a 100), usada na barra de progresso
export function calcularProgresso(perguntas, respostas) {
  if (!perguntas.length) return 0
  const feitas = perguntas.filter((p) => respondida(p, respostas)).length
  return Math.round((feitas / perguntas.length) * 100)
}

// ---------- datas ----------
// O prazo vem do banco como DATETIME (ex.: "2026-09-07T23:59:00.000Z"). Usamos só a parte da data
// do próprio texto (AAAA-MM-DD), sem converter fuso, para o dia não "andar" para trás.
export const prazoParaIso = (prazo) => (prazo ? String(prazo).slice(0, 10) : null)

export function formatarPrazo(iso) {
  if (!iso) return 'Sem prazo'
  const [ano, mes, dia] = iso.split('-')
  return `${dia}/${mes}/${ano}`
}

// "13/11/2026" -> "2026-11-13" (formato que o back espera)
export function dataBrParaIso(texto) {
  const [dia, mes, ano] = texto.split('/')
  return `${ano}-${mes}-${dia}`
}

function hojeIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// O banco só guarda 'pendente' / 'andamento' / 'concluida'.
// "Em atraso" é calculado aqui: prazo já passou e a tarefa não foi concluída.
export function statusDaTarefa(statusApi, prazoIso) {
  const s = String(statusApi ?? '').toLowerCase()
  if (s === 'concluida' || s === 'concluída') return 'concluida'
  if (prazoIso && prazoIso < hojeIso()) return 'atrasada'
  if (s.includes('andamento')) return 'andamento'
  return 'pendente'
}

// Linha de GET /tarefas -> tarefa da tela.
//   profissionais: [{ id, nome_completo }] para descobrir quem enviou
export function tarefaApiParaTela(t, profissionais = []) {
  const prazoIso = prazoParaIso(t.prazo)
  const perguntas = [...(t.perguntas ?? [])]
    .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
    .map(perguntaApiParaTela)
  const autotarefa = !t.id_profissional_criador && !!t.id_paciente_criador
  const prof = profissionais.find((p) => p.id === t.id_profissional_criador)

  return {
    id: t.id,
    idDestinatario: t.id_tarefa_destinatario,
    titulo: t.titulo,
    instrucoes: t.instrucoes ?? '',
    anexo: t.anexo_arquivo ?? null,
    profissional: prof?.nome_completo ?? 'Seu profissional',
    autotarefa,
    prazo: formatarPrazo(prazoIso),
    prazoIso,
    statusApi: t.status,
    status: statusDaTarefa(t.status, prazoIso),
    progresso: t.status === 'concluida' ? 100 : 0,
    perguntas,
  }
}
