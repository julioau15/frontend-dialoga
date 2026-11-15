// ============================================================
// perguntas (Nova tarefa)
// Tipos de pergunta do questionário e funções para criar, copiar e validar perguntas.
// Formato de uma pergunta:
//   { id, tipo, enunciado, imagem: { nome, url } | null, obrigatoria, opcoes: [] }
// tipo: 'multipla' | 'unica' | 'paragrafo' | 'emocoes' | 'escala'
// Nomes e emojis dos tipos iguais à lista do Figma ("Nova tarefa dropdown").
// TODO: na integração, converter "tipo" para os valores de tbl_pergunta.tipo
//       e "opcoes" para tbl_opcao_pergunta.
// ============================================================
export const TIPOS_PERGUNTA = [
  { id: 'multipla', rotulo: 'Múltipla escolha', emoji: '☑️' },
  { id: 'unica', rotulo: 'Escolha única', emoji: '🔘' },
  { id: 'paragrafo', rotulo: 'Resposta em parágrafo', emoji: '📝' },
  { id: 'emocoes', rotulo: 'Escala de emoções', emoji: '😊' },
  { id: 'escala', rotulo: 'Escala numérica (0–10)', emoji: '🔢' },
]

// emojis da escala de emoções (os mesmos da tela de tarefas do paciente)
export const EMOCOES = [
  { valor: 'mal', rotulo: 'Mal', emoji: '😔' },
  { valor: 'neutro', rotulo: 'Neutro', emoji: '😐' },
  { valor: 'bem', rotulo: 'Bem', emoji: '😊' },
]

// números da escala de 0 a 10
export const NUMEROS_ESCALA = Array.from({ length: 11 }, (_, i) => i)

// true nos tipos em que o profissional escreve as opções de resposta
export const temOpcoes = (tipo) => tipo === 'multipla' || tipo === 'unica'

// id simples e único para as listas da tela (não depende de crypto.randomUUID)
export function novoId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// pergunta em branco (padrão do Figma: resposta em parágrafo, não obrigatória)
export function criarPergunta(tipo = 'paragrafo') {
  return { id: novoId(), tipo, enunciado: '', imagem: null, obrigatoria: false, opcoes: temOpcoes(tipo) ? ['', ''] : [] }
}

// cópia da pergunta com um id novo (ação "Duplicar")
export function duplicarPergunta(pergunta) {
  return { ...pergunta, id: novoId(), opcoes: [...pergunta.opcoes] }
}

// mensagem de erro da pergunta para o envio, ou '' quando está completa
export function erroDaPergunta(pergunta) {
  if (!pergunta.enunciado.trim()) return 'Escreva o enunciado da pergunta.'
  if (temOpcoes(pergunta.tipo) && pergunta.opcoes.filter((o) => o.trim()).length < 2) {
    return 'Preencha pelo menos duas opções de resposta.'
  }
  return ''
}
