// ============================================================
// relatoriosMock
// Dados fixos da tela Relatórios do paciente (sem API por enquanto).
// Um registro por dia em que o paciente preencheu o "humor do dia" (mesmas opções do
// formulário "Como você está hoje?" do Figma):
//   data        -> 'AAAA-MM-DD'
//   sentimento  -> 'Feliz' | 'Triste' | 'Ansioso' | 'Irritado' | 'Calmo' | 'Cansado'
//   energia     -> 'Baixa' | 'Média' | 'Alta'
//   humor       -> 'Muito bem' | 'Bem' | 'Neutro' | 'Mal' | 'Muito mal'
//   pensamentos -> 'Positivos' | 'Negativos' | 'Neutros' | 'Acelerados'
//   sono        -> horas dormidas (ex.: 7.5)
//   anotacao    -> texto livre do dia (ou null)
// Os valores do período inicial (26/08 a 01/09) dão as médias do Figma:
// Energia 1.9/3, Sentimento 2.9/4, Humor 3.7/5, Pensamentos 2.6/4 e sono 6.9h (5h a 8.5h).
// TODO: trocar por GET /v1/dialoga/paciente/me/registros-humor na integração.
// ============================================================

// período que a tela abre selecionado (igual ao Figma)
export const PERIODO_INICIAL = { inicio: '2026-08-26', fim: '2026-09-01' }

export const REGISTROS_MOCK = [
  { data: '2026-08-23', sentimento: 'Cansado', energia: 'Baixa', humor: 'Neutro', pensamentos: 'Neutros', sono: 6, anotacao: null },
  { data: '2026-08-24', sentimento: 'Calmo', energia: 'Média', humor: 'Bem', pensamentos: 'Positivos', sono: 7.5, anotacao: null },
  { data: '2026-08-25', sentimento: 'Ansioso', energia: 'Média', humor: 'Neutro', pensamentos: 'Acelerados', sono: 6.5, anotacao: null },
  { data: '2026-08-26', sentimento: 'Calmo', energia: 'Média', humor: 'Bem', pensamentos: 'Acelerados', sono: 8.5, anotacao: null },
  { data: '2026-08-27', sentimento: 'Calmo', energia: 'Média', humor: 'Bem', pensamentos: 'Acelerados', sono: 6.5, anotacao: null },
  { data: '2026-08-28', sentimento: 'Calmo', energia: 'Média', humor: 'Neutro', pensamentos: 'Acelerados', sono: 7, anotacao: null },
  { data: '2026-08-29', sentimento: 'Ansioso', energia: 'Baixa', humor: 'Neutro', pensamentos: 'Acelerados', sono: 5, anotacao: null },
  {
    data: '2026-08-30', sentimento: 'Feliz', energia: 'Alta', humor: 'Muito bem', pensamentos: 'Positivos', sono: 8,
    anotacao: 'Fim de semana ótimo. Exercício e leitura durante a tarde.',
  },
  {
    data: '2026-08-31', sentimento: 'Ansioso', energia: 'Baixa', humor: 'Neutro', pensamentos: 'Acelerados', sono: 6,
    anotacao: 'Reunião de trabalho complicada. Dificuldade de concentração.',
  },
  {
    data: '2026-09-01', sentimento: 'Calmo', energia: 'Média', humor: 'Bem', pensamentos: 'Positivos', sono: 7.5,
    anotacao: 'Consulta com o Dr. Carlos. Boa conversa sobre metas da semana.',
  },
  {
    data: '2026-09-02', sentimento: 'Ansioso', energia: 'Baixa', humor: 'Neutro', pensamentos: 'Acelerados', sono: 5.5,
    anotacao: 'Preocupações com o trabalho. Dificuldade de concentração.',
  },
  {
    data: '2026-09-04', sentimento: 'Feliz', energia: 'Alta', humor: 'Muito bem', pensamentos: 'Positivos', sono: 8.5,
    anotacao: 'Passeio com a família. Dia muito agradável.',
  },
]

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

// média com 1 casa decimal (lista vazia = 0)
export const media = (valores) =>
  valores.length ? Math.round((valores.reduce((s, v) => s + v, 0) / valores.length) * 10) / 10 : 0

// faixa da nota (RF197) pela proporção da escala: verde Positivo (70% ou mais),
// roxo Moderado (50% a 69%) e vermelho Atenção (menos de 50%)
export function faixaDe(valor, maximo) {
  const proporcao = maximo ? valor / maximo : 0
  if (proporcao >= 0.7) return 'positivo'
  if (proporcao >= 0.5) return 'moderado'
  return 'atencao'
}

// ---------- Solicitações de acesso ----------
// Profissionais pedindo para ver os indicadores do paciente (frames "Relatorios - Mobile").
//   status      -> 'pendente' | 'aprovado' | 'recusado'
//   indicadores -> ids marcados no pop-up (o que o profissional pediu para ver)
// TODO: trocar por GET /v1/dialoga/paciente/me/solicitacoes-acesso na integração.
export const SOLICITACOES_MOCK = [
  {
    id: 1, nome: 'Carlos Eduardo Mendes', especialidade: 'Psicologia Clínica', status: 'pendente',
    indicadores: ['sentimento', 'energia', 'humor', 'sono'],
  },
  {
    id: 2, nome: 'Dra. Patrícia Lima', especialidade: 'Psiquiatria', status: 'pendente',
    indicadores: ['sentimento', 'energia', 'humor', 'sono'],
  },
]

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

// opções do pop-up "Solicitação de acesso", na ordem do Figma
export const INDICADORES_ACESSO = [
  { id: 'sentimento', rotulo: 'Sentimento' },
  { id: 'energia', rotulo: 'Energia' },
  { id: 'humor', rotulo: 'Humor' },
  { id: 'sono', rotulo: 'Horas de sono' },
  { id: 'acontecimentos', rotulo: 'Acontecimentos' },
]

// "2026-08-30" -> "30/08"
export const diaMes = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`
