// ============================================================
// utils/relatorios.js
// Regras e textos da tela Relatórios do paciente (funções puras, sem API e sem tela).
// Um registro do relatório (um por dia em que o paciente preencheu o "humor do dia"):
//   { id, data: 'AAAA-MM-DD', sentimento, energia, humor, pensamentos, sono, anotacao }
// com os mesmos rótulos do formulário "Como você está hoje?":
//   sentimento  -> 'Feliz' | 'Triste' | 'Ansioso' | 'Irritado' | 'Calmo' | 'Cansado'
//   energia     -> 'Baixa' | 'Média' | 'Alta'
//   humor       -> 'Muito bem' | 'Bem' | 'Neutro' | 'Mal' | 'Muito mal'
//   pensamentos -> 'Positivos' | 'Negativos' | 'Neutros' | 'Acelerados'
//   (valor que não se encaixa em nenhuma opção vira null e fica fora das médias)
// ============================================================

// indicadores do gráfico (RF194), na ordem do Figma, com a nota de cada opção
// (quanto maior, melhor; a nota máxima é a escala mostrada: "1.9/3", "2.9/4"...)
export const INDICADORES = [
  { id: 'energia', rotulo: 'Energia', emoji: '⚡', notas: { Baixa: 1, Média: 2, Alta: 3 } },
  {
    id: 'sentimento', rotulo: 'Sentimento', emoji: '💭',
    notas: { Triste: 1, Irritado: 1, Ansioso: 2, Cansado: 2, Calmo: 3, Feliz: 4 },
  },
  { id: 'humor', rotulo: 'Humor', emoji: '😊', notas: { 'Muito mal': 1, Mal: 2, Neutro: 3, Bem: 4, 'Muito bem': 5 } },
  { id: 'pensamentos', rotulo: 'Pensamentos', emoji: '🧠', notas: { Negativos: 1, Acelerados: 2, Neutros: 3, Positivos: 4 } },
]

// nota máxima de um indicador (3, 4 ou 5)
export const notaMaxima = (indicador) => Math.max(...Object.values(indicador.notas))

// sono recomendado (RN75): de 7 a 9 horas
export const SONO_MINIMO = 7
export const SONO_MAXIMO = 9

// registros dentro do período (datas 'AAAA-MM-DD' comparam como texto)
export const registrosDoPeriodo = (registros, { inicio, fim }) =>
  registros.filter((r) => r.data >= inicio && r.data <= (fim ?? inicio))

// média com 1 casa decimal; ignora valores ausentes (lista sem números = 0)
export const media = (valores) => {
  const numeros = valores.filter((v) => typeof v === 'number' && Number.isFinite(v))
  return numeros.length ? Math.round((numeros.reduce((s, v) => s + v, 0) / numeros.length) * 10) / 10 : 0
}

// faixa da nota (RF197) pela proporção da escala: verde Positivo (70% ou mais),
// roxo Moderado (50% a 69%) e vermelho Atenção (menos de 50%)
export function faixaDe(valor, maximo) {
  const proporcao = maximo ? valor / maximo : 0
  if (proporcao >= 0.7) return 'positivo'
  if (proporcao >= 0.5) return 'moderado'
  return 'atencao'
}

// "2026-08-30" -> "30/08"
export const diaMes = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

// 'AAAA-MM-DD' somando n dias (em UTC, para o dia não "andar")
function somarDias(iso, n) {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10)
}

// período que a tela abre selecionado: os últimos 7 dias até hoje
export const periodoInicial = (hoje) => ({ inicio: somarDias(hoje, -6), fim: hoje })

// ---------- registros de humor da API ----------

// texto sem acento, minúsculo e sem espaços nas pontas
const normalizar = (valor) =>
  String(valor ?? '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

// sinônimos aceitos (rótulos do formulário e valores antigos do banco) -> rótulo do relatório
const SENTIMENTOS = {
  feliz: 'Feliz', animado: 'Feliz', alegre: 'Feliz',
  triste: 'Triste', irritado: 'Irritado', ansioso: 'Ansioso', calmo: 'Calmo', cansado: 'Cansado',
}
const ENERGIAS = { baixa: 'Baixa', media: 'Média', alta: 'Alta' }
const HUMORES = {
  'muito mal': 'Muito mal', 'muito ruim': 'Muito mal', pessimo: 'Muito mal',
  mal: 'Mal', ruim: 'Mal',
  neutro: 'Neutro',
  bem: 'Bem', bom: 'Bem',
  'muito bem': 'Muito bem', 'muito bom': 'Muito bem', otimo: 'Muito bem',
}

// pensamentos podem vir como texto livre ("pensamentos positivos", "preocupação excessiva...")
function pensamentosDe(valor) {
  const texto = normalizar(valor)
  if (!texto) return null
  if (texto.includes('positiv')) return 'Positivos'
  if (texto.includes('aceler')) return 'Acelerados'
  if (texto.includes('negativ') || texto.includes('preocup') || texto.includes('catastrof')) return 'Negativos'
  if (texto.includes('neutr')) return 'Neutros'
  return null
}

const numeroOuNulo = (valor) => {
  if (valor === null || valor === undefined || valor === '') return null
  const n = Number(valor)
  return Number.isFinite(n) ? n : null
}

// linha de GET /pacientes/me/registros-humor -> registro do relatório
export function registroApiParaRelatorio(r) {
  return {
    id: r.id,
    data: String(r.data ?? '').slice(0, 10),
    sentimento: SENTIMENTOS[normalizar(r.sentimento)] ?? null,
    energia: ENERGIAS[normalizar(r.energia)] ?? null,
    humor: HUMORES[normalizar(r.humor)] ?? null,
    pensamentos: pensamentosDe(r.padrao_pensamentos),
    sono: numeroOuNulo(r.horas_sono),
    anotacao: r.relato ? String(r.relato) : null,
  }
}

// ---------- solicitações de acesso ----------

// opções do pop-up "Solicitação de acesso", na ordem do Figma, com o nome da categoria na API.
// 'tratamentos' é o consentimento para o profissional ver os tratamentos (medicação).
export const INDICADORES_ACESSO = [
  { id: 'sentimento', rotulo: 'Sentimento', categoria: 'Sentimento' },
  { id: 'energia', rotulo: 'Energia', categoria: 'Energia' },
  { id: 'humor', rotulo: 'Humor', categoria: 'Humor' },
  { id: 'sono', rotulo: 'Horas de sono', categoria: 'Horas de sono' },
  { id: 'pensamentos', rotulo: 'Pensamentos', categoria: 'Pensamentos' },
  { id: 'acontecimentos', rotulo: 'Acontecimentos', categoria: 'Acontecimentos' },
  { id: 'tratamentos', rotulo: 'Tratamentos', categoria: 'Tratamentos' },
]

// marcados ao abrir uma solicitação pendente (tratamentos só se o paciente marcar)
const INDICADORES_PADRAO = ['sentimento', 'energia', 'humor', 'sono']

// ids da tela -> nomes de categoria da API (ids desconhecidos são ignorados)
export const categoriasParaApi = (ids) =>
  INDICADORES_ACESSO.filter((i) => ids.includes(i.id)).map((i) => i.categoria)

const STATUS_SOLICITACAO = { pendente: 'pendente', aprovada: 'aprovado', parcial: 'aprovado', reprovada: 'recusado', recusada: 'recusado' }

// linha de GET /solicitacoes-acesso + profissionais vinculados -> solicitação da tela
//   { id, idProfissional, nome, especialidade, status: 'pendente'|'aprovado'|'recusado', indicadores }
export function solicitacaoApiParaTela(s, profissionais = []) {
  const profissional = profissionais.find((p) => Number(p.id) === Number(s.id_profissional))
  const status = STATUS_SOLICITACAO[normalizar(s.status)] ?? 'pendente'
  const autorizadas = INDICADORES_ACESSO.filter((i) => (s.categorias ?? []).includes(i.categoria)).map((i) => i.id)

  return {
    id: s.id,
    idProfissional: s.id_profissional,
    nome: profissional?.nome_completo ?? 'Profissional',
    especialidade: String(profissional?.especialidades ?? '').split(',')[0].trim(),
    status,
    indicadores: status === 'pendente' ? INDICADORES_PADRAO : autorizadas,
  }
}

// iniciais do avatar das solicitações, como no Figma: primeira letra das duas primeiras
// palavras, contando o título ("Carlos Eduardo Mendes" -> "CE", "Dra. Patrícia Lima" -> "DP")
export const iniciaisSolicitacao = (nome) =>
  nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()

// nome que vai para o AvatarIniciais compartilhado. Ele junta a 1ª e a última palavra e
// ignora "Dra."; passando as duas letras separadas ("D P"), ele mostra "DP", como no Figma
export const nomeAvatarSolicitacao = (nome) => iniciaisSolicitacao(nome).split('').join(' ')
