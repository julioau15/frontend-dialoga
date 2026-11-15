// ============================================================
// Dados fixos (mock) do Acompanhamento de respostas do profissional (iguais ao Figma).
// Cada item é uma tarefa enviada a um paciente (uma linha de tbl_tarefa_destinatario):
//   tarefa             -> { id, titulo, descricao } (id igual ao da lista de Tarefas)
//   paciente           -> { id, idPerfil, nome, email, telefone }
//                         id: define a cor do avatar (Figma do Acompanhamento);
//                         idPerfil: id do paciente na lista de Pacientes ("Ver perfil do paciente")
//   status             -> 'respondida' | 'em_andamento' | 'nao_preenchido'
//   ultimaModificacao  -> 'AAAA-MM-DD' (último envio ou resposta)
//   respostas          -> [{ pergunta, tipo, resposta }]
//     tipo: 'multipla' (lista) | 'unica' | 'paragrafo' (texto) | 'emocoes' ('mal'|'neutro'|'bem') | 'escala' (0 a 10)
//     resposta: null = pergunta ainda não respondida
// As tarefas da Ana combinam com o "Histórico de tarefas" do perfil dela (Figma do perfil):
// Diário de Humor em andamento (3 de 4) e a Escala de Ansiedade de Beck respondida (envio 6).
// TODO: trocar pelos dados da API (tarefas enviadas + respostas) quando houver integração.
// ============================================================
const PACIENTES = {
  ana: { id: 1, idPerfil: 1, nome: 'Ana Beatriz Ferreira', email: 'ana.ferreira@email.com', telefone: '(11) 98765-4321' },
  fernanda: { id: 3, idPerfil: 'ext-2', nome: 'Fernanda Gomes', email: 'fernanda.gomes@email.com', telefone: '(11) 99876-5432' },
  joao: { id: 4, idPerfil: 3, nome: 'João Pedro Alves', email: 'joao.alves@email.com', telefone: '(11) 96543-2109' },
  ricardo: { id: 5, idPerfil: 'ext-1', nome: 'Ricardo Sousa', email: 'ricardo.sousa@email.com', telefone: '(11) 95432-1098' },
}

const HUMOR = { id: 1, titulo: 'Diário de Humor Semanal', descricao: 'Acompanhamento semanal do estado emocional e atividades realizadas.' }
const PENSAMENTOS = { id: 3, titulo: 'Registro de Pensamentos Automáticos', descricao: 'Registro de uma situação marcante e dos pensamentos que surgiram.' }
const QUALIDADE_VIDA = { id: 5, titulo: 'Avaliação de Qualidade de Vida', descricao: 'Avaliação geral de bem-estar, sono e rotina.' }
// id 2: o mesmo da "Escala de Ansiedade de Beck" na lista de Tarefas
const BECK = { id: 2, titulo: 'Escala de Ansiedade de Beck', descricao: 'Avaliação dos sintomas de ansiedade nas últimas semanas.' }

// perguntas do Diário de Humor Semanal (as mesmas para todos os pacientes)
const PERGUNTAS_HUMOR = [
  { pergunta: 'Como você avalia seu humor nos últimos 7 dias?', tipo: 'emocoes' },
  { pergunta: 'Quais atividades realizou durante a semana?', tipo: 'multipla' },
  { pergunta: 'Descreva como se sentiu predominantemente esta semana:', tipo: 'paragrafo' },
  { pergunta: 'Em uma escala de 0 a 10, qual foi seu nível de ansiedade?', tipo: 'escala' },
]

// junta as perguntas com as respostas do paciente (na mesma ordem)
const responder = (perguntas, respostas) => perguntas.map((p, i) => ({ ...p, resposta: respostas[i] ?? null }))

// na ordem do Figma
export const ACOMPANHAMENTO_MOCK = [
  {
    // em andamento: 3 das 4 perguntas respondidas (como no Histórico de tarefas do perfil da Ana)
    id: 1, tarefa: HUMOR, paciente: PACIENTES.ana, status: 'em_andamento', ultimaModificacao: '2026-09-01',
    respostas: responder(PERGUNTAS_HUMOR, [
      'bem',
      ['Exercício físico', 'Leitura', 'Meditação'],
      'Me senti bastante bem esta semana. Consegui me exercitar três vezes e dormi melhor.',
    ]),
  },
  {
    id: 2, tarefa: HUMOR, paciente: PACIENTES.ricardo, status: 'nao_preenchido', ultimaModificacao: '2026-08-29',
    respostas: responder(PERGUNTAS_HUMOR, []),
  },
  {
    // 2 perguntas, como na lista de Tarefas e no Histórico de tarefas do perfil da Ana (2/2)
    id: 3, tarefa: PENSAMENTOS, paciente: PACIENTES.ana, status: 'respondida', ultimaModificacao: '2026-08-28',
    respostas: [
      { pergunta: 'Descreva a situação que mais te incomodou.', tipo: 'paragrafo', resposta: 'Uma discussão no trabalho sobre um prazo atrasado.' },
      { pergunta: 'Qual pensamento passou pela sua cabeça?', tipo: 'paragrafo', resposta: 'Pensei que todos iam achar que eu não sou capaz.' },
    ],
  },
  {
    id: 4, tarefa: PENSAMENTOS, paciente: PACIENTES.joao, status: 'em_andamento', ultimaModificacao: '2026-08-25',
    respostas: [
      { pergunta: 'Descreva a situação que mais te incomodou.', tipo: 'paragrafo', resposta: 'Fiquei nervoso antes de uma apresentação na faculdade.' },
      { pergunta: 'Qual pensamento passou pela sua cabeça?', tipo: 'paragrafo', resposta: null },
    ],
  },
  {
    id: 5, tarefa: QUALIDADE_VIDA, paciente: PACIENTES.fernanda, status: 'em_andamento', ultimaModificacao: '2026-09-03',
    respostas: [
      { pergunta: 'Como você avalia sua qualidade de vida hoje?', tipo: 'unica', resposta: 'Boa' },
      { pergunta: 'De 0 a 10, quanto você descansou bem nesta semana?', tipo: 'escala', resposta: 6 },
      { pergunta: 'O que mais atrapalhou sua rotina?', tipo: 'paragrafo', resposta: null },
    ],
  },
  {
    // Escala de Beck da Ana (respondida, 4 de 4), aberta pelo Histórico de tarefas do perfil
    id: 6, tarefa: BECK, paciente: PACIENTES.ana, status: 'respondida', ultimaModificacao: '2026-08-20',
    respostas: [
      { pergunta: 'Com que frequência você se sentiu nervosa ou tensa nas últimas semanas?', tipo: 'unica', resposta: 'Às vezes' },
      { pergunta: 'De 0 a 10, quanto a ansiedade atrapalhou o seu dia a dia?', tipo: 'escala', resposta: 5 },
      { pergunta: 'Você teve dificuldade para relaxar?', tipo: 'unica', resposta: 'Um pouco' },
      { pergunta: 'Descreva um momento em que se sentiu ansiosa:', tipo: 'paragrafo', resposta: 'Antes da reunião com a equipe, senti o coração acelerado e as mãos suando.' },
    ],
  },
]

// item pelo id (texto da URL ou número); undefined quando não existe
export const buscarAcompanhamento = (id) => ACOMPANHAMENTO_MOCK.find((item) => String(item.id) === String(id))

// envio mais recente de uma tarefa (usado pelo ícone de respostas na lista de Tarefas); undefined se não houver
export function respostaMaisRecente(idTarefa) {
  return ACOMPANHAMENTO_MOCK.filter((item) => item.tarefa.id === idTarefa).sort((a, b) => b.ultimaModificacao.localeCompare(a.ultimaModificacao))[0]
}
