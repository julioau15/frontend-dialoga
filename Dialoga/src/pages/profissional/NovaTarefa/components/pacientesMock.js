// ============================================================
// Dados fixos (mock) dos pacientes vinculados ao profissional,
// usados no campo "Paciente" da Nova tarefa.
//   origem -> 'plataforma' (tem conta no Dialoga) | 'externo' (cadastrado só pelo nome)
// Paciente externo não tem conta no app, então não pode receber nem responder tarefas:
// o campo "Paciente" usa PACIENTES_TAREFA (só os da plataforma).
// PACIENTES_MOCK continua com todos (a Edição de tarefa busca os destinatários já salvos).
// TODO: trocar pela lista de pacientes vinculados da API quando houver integração.
// ============================================================
export const PACIENTES_MOCK = [
  { id: 1, nome: 'Ana Beatriz Ferreira', origem: 'plataforma' },
  { id: 2, nome: 'Camila Rocha', origem: 'plataforma' },
  { id: 3, nome: 'Fernanda Gomes', origem: 'externo' },
  { id: 4, nome: 'João Pedro Alves', origem: 'plataforma' },
  { id: 5, nome: 'Ricardo Sousa', origem: 'externo' },
]

// pacientes que podem receber tarefas (sem os externos)
export const PACIENTES_TAREFA = PACIENTES_MOCK.filter((p) => p.origem !== 'externo')
