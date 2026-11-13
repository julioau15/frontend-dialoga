// ============================================================
// Perguntas e respostas fixas (mock) das tarefas do paciente.
// tipo: 'escolha' (uma opção) | 'multipla' (várias) | 'texto' | 'escala'
// obrigatoria: true mostra o asterisco vermelho e bloqueia o envio em branco.
// As perguntas do "Diário de Humor Semanal" vêm do frame "Preencher tarefa".
// TODO: trocar por dados da API (as perguntas virão da tarefa do profissional).
// ============================================================
export const PERGUNTAS = [
  {
    id: 'humor',
    tipo: 'escolha',
    titulo: 'Como você avalia seu humor nos últimos 7 dias?',
    obrigatoria: true,
    opcoes: [
      { valor: 'mal', rotulo: 'Mal', emoji: '😔' },
      { valor: 'neutro', rotulo: 'Neutro', emoji: '😐' },
      { valor: 'bem', rotulo: 'Bem', emoji: '😊' },
    ],
  },
  {
    id: 'atividades',
    tipo: 'multipla',
    titulo: 'Quais atividades realizou durante a semana?',
    obrigatoria: false,
    opcoes: ['Exercício físico', 'Leitura', 'Meditação', 'Socialização', 'Hobbies', 'Descanso'],
  },
  {
    id: 'descricao',
    tipo: 'texto',
    titulo: 'Descreva como se sentiu predominantemente esta semana:',
    obrigatoria: true,
    placeholder: 'Escreva sua resposta aqui...',
  },
  {
    id: 'ansiedade',
    tipo: 'escala',
    titulo: 'Em uma escala de 0 a 10, qual foi seu nível de ansiedade?',
    obrigatoria: true,
    min: 0,
    max: 10,
    rotuloMin: 'Nenhum',
    rotuloMax: 'Máximo',
  },
]

// Respostas de exemplo (frame "Ver Resposta"), usadas quando uma tarefa já
// concluída ainda não tem respostas guardadas.
export const RESPOSTAS_EXEMPLO = {
  humor: 'neutro',
  atividades: ['Exercício físico'],
  descricao: 'Muito estressado',
  ansiedade: 5,
}

export const RESPOSTAS_VAZIAS = { humor: null, atividades: [], descricao: '', ansiedade: null }

// Uma pergunta está respondida quando tem valor (texto sem só espaços, lista não vazia...)
export function respondida(pergunta, respostas) {
  const valor = respostas?.[pergunta.id]
  if (pergunta.tipo === 'multipla') return Array.isArray(valor) && valor.length > 0
  if (pergunta.tipo === 'texto') return typeof valor === 'string' && valor.trim() !== ''
  return valor !== null && valor !== undefined
}

// Porcentagem de perguntas respondidas (0 a 100), usada na barra de progresso do rascunho
export function calcularProgresso(respostas) {
  const feitas = PERGUNTAS.filter((p) => respondida(p, respostas)).length
  return Math.round((feitas / PERGUNTAS.length) * 100)
}
