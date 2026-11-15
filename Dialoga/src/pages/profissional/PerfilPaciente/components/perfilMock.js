// ============================================================
// Dados fixos (mock) do perfil do paciente na visão do profissional.
// Os dados básicos (nome, e-mail, status, origem, desde, próxima consulta) vêm da
// lista de Pacientes (pacientesMemoria); aqui ficam só os dados extras do perfil:
//   telefone    -> null quando não há
//   acesso      -> 'aprovado' (paciente liberou os dados) | 'nao_solicitado' | 'pendente'
//                  | 'externo' (sem conta no Dialoga, não há dados para compartilhar)
//   resumo      -> { sessoes, tarefasEnviadas, taxaResposta (0 a 100) } (RF218, RF308)
//   indicadores -> por período ('7d' | '14d' | '30d'), ver INDICADORES_ANA
//   historico   -> tarefas enviadas: { id, idEnvio, titulo, enviadaEm, prazo, status, respondidas, perguntas }
// Quem é quem (combinado com a equipe): Ana = acesso aprovado (dados do Figma),
// Mariana = sem acesso, João = solicitação enviada, Ricardo e Fernanda = externos.
// Paciente recém-adicionado: valores do frame "Novo perfil" do Figma.
// Os dados de 14d e 30d e os resumos de Mariana, João e externos não estão no Figma:
// são exemplos no mesmo formato.
// TODO: trocar pelos dados da API quando houver integração.
// ============================================================
import { buscarPaciente } from '../../Pacientes/components/pacientesMemoria'

// ---------- Indicadores da Ana ----------

// horas de sono dos últimos 30 dias (o último é 05/09); o Figma mostra só os 7 últimos
const SONO_30D = [
  [7, 7.5], [8, 7], [9, 6.5], [10, 7], [11, 8], [12, 6], [13, 5.5], [14, 6.5], [15, 7], [16, 7.5],
  [17, 8], [18, 6.5], [19, 6], [20, 7], [21, 7.5], [22, 8], [23, 6], [24, 5], [25, 6.5], [26, 7],
  [27, 7.5], [28, 7], [29, 6.5],
].map(([dia, horas]) => ({ data: `${String(dia).padStart(2, '0')}/08`, horas }))
  .concat([
    { data: '30/08', horas: 8 },
    { data: '31/08', horas: 6 },
    { data: '01/09', horas: 7.5 },
    { data: '02/09', horas: 5.5 },
    { data: '03/09', horas: 7.5 },
    { data: '04/09', horas: 8.5 },
    { data: '05/09', horas: 8 },
  ])

// média de horas com 1 casa decimal (ex.: 7.3)
const media = (dias) => Math.round((dias.reduce((s, d) => s + d.horas, 0) / dias.length) * 10) / 10

// sono de um período: os N dias mais recentes e a média
function sono(qtdDias) {
  const dias = SONO_30D.slice(-qtdDias)
  return { dias, media: media(dias) }
}

// anotações do próprio paciente (registros do app), iguais às do Figma
const ANOTACOES_PACIENTE = [
  { id: 1, data: '30/08', humor: 'positivo', etiquetas: ['Feliz', 'Alta', 'Muito bem', 'Positivos'], sono: 8, texto: 'Fim de semana ótimo. Exercício e leitura durante a tarde.' },
  { id: 2, data: '31/08', humor: 'moderado', etiquetas: ['Ansioso', 'Baixa', 'Neutro', 'Acelerados'], sono: 6, texto: 'Reunião de trabalho complicada. Dificuldade de concentração.' },
  { id: 3, data: '01/09', humor: 'positivo', etiquetas: ['Calmo', 'Média', 'Bem', 'Positivos'], sono: 7.5, texto: 'Consulta com o Dr. Carlos. Boa conversa sobre metas da semana.' },
  { id: 4, data: '02/09', humor: 'moderado', etiquetas: ['Ansioso', 'Baixa', 'Neutro', 'Acelerados'], sono: 5.5, texto: 'Preocupações com o trabalho. Dificuldade de concentração.' },
  { id: 5, data: '04/09', humor: 'positivo', etiquetas: ['Feliz', 'Alta', 'Muito bem', 'Positivos'], sono: 8.5, texto: 'Passeio com a família. Dia muito agradável.' },
]

// registros mais antigos (aparecem só em 14d e 30d)
const ANOTACOES_ANTIGAS = [
  { id: 6, data: '27/08', humor: 'atencao', etiquetas: ['Triste', 'Baixa', 'Mal', 'Negativos'], sono: 5, texto: 'Dia difícil, briga em casa. Chorei à noite.' },
  { id: 7, data: '24/08', humor: 'moderado', etiquetas: ['Cansado', 'Média', 'Neutro', 'Acelerados'], sono: 6, texto: 'Semana pesada no trabalho.' },
  { id: 8, data: '15/08', humor: 'positivo', etiquetas: ['Calmo', 'Alta', 'Bem', 'Positivos'], sono: 7, texto: 'Comecei a caminhar de manhã.' },
]

// barras de "Indicadores emocionais": valor / máximo, faixa e a etiqueta em cima da barra
function emocionais(registros, [energia, sentimento, humor, pensamentos]) {
  return {
    registros,
    itens: [
      { id: 'energia', rotulo: 'Energia', emoji: '⚡', maximo: 3, ...energia },
      { id: 'sentimento', rotulo: 'Sentimento', emoji: '💭', maximo: 4, ...sentimento },
      { id: 'humor', rotulo: 'Humor', emoji: '😊', maximo: 5, ...humor },
      { id: 'pensamentos', rotulo: 'Pensamentos', emoji: '🧠', maximo: 4, ...pensamentos },
    ],
  }
}

const INDICADORES_ANA = {
  '7d': {
    emocionais: emocionais(7, [
      { valor: 2.1, faixa: 'positivo', etiqueta: 'Alta' },
      { valor: 3.2, faixa: 'positivo', etiqueta: 'Calmo' },
      { valor: 4.0, faixa: 'positivo', etiqueta: 'Bem' },
      { valor: 3.1, faixa: 'positivo', etiqueta: 'Positivos' },
    ]),
    sono: sono(7),
    anotacoesPaciente: ANOTACOES_PACIENTE,
    conclusao: { total: 3, respondidas: 2, emAndamento: 1 },
    aderencia: [
      { id: 1, nome: 'Sertralina 50mg', percentual: 95 },
      { id: 2, nome: 'Clonazepam 0,5mg', percentual: 88 },
      { id: 3, nome: 'Melatonina 5mg', percentual: 72 },
    ],
  },
  '14d': {
    emocionais: emocionais(13, [
      { valor: 1.9, faixa: 'moderado', etiqueta: 'Média' },
      { valor: 2.9, faixa: 'moderado', etiqueta: 'Neutro' },
      { valor: 3.6, faixa: 'positivo', etiqueta: 'Bem' },
      { valor: 2.8, faixa: 'moderado', etiqueta: 'Acelerados' },
    ]),
    sono: sono(14),
    anotacoesPaciente: [...ANOTACOES_PACIENTE, ...ANOTACOES_ANTIGAS.slice(0, 2)],
    conclusao: { total: 3, respondidas: 2, emAndamento: 1 },
    aderencia: [
      { id: 1, nome: 'Sertralina 50mg', percentual: 93 },
      { id: 2, nome: 'Clonazepam 0,5mg', percentual: 85 },
      { id: 3, nome: 'Melatonina 5mg', percentual: 70 },
    ],
  },
  '30d': {
    emocionais: emocionais(27, [
      { valor: 1.6, faixa: 'moderado', etiqueta: 'Média' },
      { valor: 2.4, faixa: 'moderado', etiqueta: 'Neutro' },
      { valor: 2.2, faixa: 'atencao', etiqueta: 'Mal' },
      { valor: 2.5, faixa: 'moderado', etiqueta: 'Acelerados' },
    ]),
    sono: sono(30),
    anotacoesPaciente: [...ANOTACOES_PACIENTE, ...ANOTACOES_ANTIGAS],
    conclusao: { total: 3, respondidas: 2, emAndamento: 1 },
    aderencia: [
      { id: 1, nome: 'Sertralina 50mg', percentual: 90 },
      { id: 2, nome: 'Clonazepam 0,5mg', percentual: 80 },
      { id: 3, nome: 'Melatonina 5mg', percentual: 65 },
    ],
  },
}

// histórico de tarefas da Ana (igual ao Figma; o "Registro de Pensamentos" usa o nome completo
// da tarefa, o mesmo da lista de Tarefas e da tela de resposta)
// idEnvio -> id do envio no Acompanhamento de respostas (acompanhamentoMock):
//            clicar na tarefa abre /profissional/tarefas/acompanhamento/:idEnvio
const HISTORICO_ANA = [
  { id: 1, idEnvio: 1, titulo: 'Diário de Humor Semanal', enviadaEm: '2026-08-26', prazo: '2026-09-07', status: 'em_andamento', respondidas: 3, perguntas: 4 },
  { id: 2, idEnvio: 6, titulo: 'Escala de Ansiedade de Beck', enviadaEm: '2026-08-15', prazo: '2026-08-22', status: 'respondida', respondidas: 4, perguntas: 4 },
  { id: 3, idEnvio: 3, titulo: 'Registro de Pensamentos Automáticos', enviadaEm: '2026-08-01', prazo: '2026-08-08', status: 'respondida', respondidas: 2, perguntas: 2 },
]

// ---------- Extras de cada paciente ----------

const EXTRAS = {
  1: {
    telefone: '(11) 98765-4321',
    acesso: 'aprovado',
    resumo: { sessoes: 12, tarefasEnviadas: 3, taxaResposta: 67 },
    indicadores: INDICADORES_ANA,
    historico: HISTORICO_ANA,
  },
  2: {
    telefone: '(11) 99876-5432',
    acesso: 'nao_solicitado',
    resumo: { sessoes: 8, tarefasEnviadas: 2, taxaResposta: 50 },
  },
  3: {
    telefone: '(11) 96543-2109',
    acesso: 'pendente',
    resumo: { sessoes: 5, tarefasEnviadas: 1, taxaResposta: 0 },
  },
}

// paciente da plataforma recém-adicionado (frame "Novo perfil" do Figma)
const EXTRAS_NOVO = { telefone: null, acesso: 'nao_solicitado', resumo: { sessoes: 12, tarefasEnviadas: 0, taxaResposta: 0 } }

// paciente externo: só o nome foi cadastrado
const EXTRAS_EXTERNO = { telefone: null, acesso: 'externo', resumo: { sessoes: 6, tarefasEnviadas: 0, taxaResposta: 0 } }

// pedidos de acesso enviados nesta aba do navegador (id -> 'pendente')
const ACESSOS_PEDIDOS = {}

// perfil completo pelo id da URL; undefined se o paciente não existe
export function buscarPerfil(id) {
  const basico = buscarPaciente(id)
  if (!basico) return undefined
  const extras = basico.origem === 'externo' ? EXTRAS_EXTERNO : (EXTRAS[basico.id] ?? EXTRAS_NOVO)
  return {
    indicadores: null,
    historico: [],
    ...basico,
    ...extras,
    acesso: ACESSOS_PEDIDOS[basico.id] ?? extras.acesso,
  }
}

// RF225: guarda o pedido de acesso (só na tela) para o perfil continuar "Solicitação enviada"
export function pedirAcesso(id) {
  ACESSOS_PEDIDOS[id] = 'pendente'
}
