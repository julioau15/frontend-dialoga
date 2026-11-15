// ============================================================
// Dados fixos (mock) das tarefas para a tela Editar tarefa.
// Um item por tarefa da lista (mesmo id de Tarefas/components/tarefasMock.js).
// O "Diário de Humor Semanal" é igual ao frame "Editar tarefa - Profissional" do Figma.
// Formato devolvido (o mesmo da Nova tarefa):
//   dados     -> { titulo, instrucoes, arquivo, pacientes: [{ id, nome, comPrazo, prazo }] }
//   perguntas -> [{ id, tipo, enunciado, imagem, obrigatoria, opcoes }]
// TODO: trocar pela tarefa da API (tbl_tarefa + perguntas + destinatários) na integração.
// ============================================================
import { novoId } from '../../NovaTarefa/components/perguntas'
import { PACIENTES_MOCK } from '../../NovaTarefa/components/pacientesMock'

// paciente do mock com o prazo da tarefa ('AAAA-MM-DD')
const paciente = (id, prazo) => ({ ...PACIENTES_MOCK.find((p) => p.id === id), comPrazo: Boolean(prazo), prazo })

// pergunta no formato da Nova tarefa
const pergunta = (tipo, enunciado, obrigatoria, opcoes = []) => ({ tipo, enunciado, obrigatoria, opcoes, imagem: null })

const TAREFAS = {
  1: {
    titulo: 'Diário de Humor Semanal',
    pacientes: [paciente(1, '2026-09-07')],
    perguntas: [
      pergunta('emocoes', 'Como você avalia seu humor nos últimos 7 dias?', false),
      pergunta('multipla', 'Quais atividades realizou durante a semana?', false, ['Exercício físico', 'Leitura', 'Meditação', 'Socialização', 'Hobbies', 'Descanso']),
      pergunta('paragrafo', 'Descreva como se sentiu predominantemente esta semana:', true),
      pergunta('escala', 'Em uma escala de 0 a 10, qual foi seu nível de ansiedade?', true),
    ],
  },
  2: {
    titulo: 'Escala de Ansiedade de Beck',
    pacientes: [paciente(4, '2026-09-15')],
    perguntas: [
      pergunta('unica', 'Com que frequência se sentiu nervoso(a)?', true, ['Nunca', 'Às vezes', 'Frequentemente', 'Sempre']),
      pergunta('escala', 'De 0 a 10, quanto a ansiedade atrapalhou sua rotina?', true),
      pergunta('multipla', 'Quais sintomas você percebeu?', false, ['Tremores', 'Falta de ar', 'Coração acelerado', 'Insônia']),
    ],
  },
  3: {
    titulo: 'Registro de Pensamentos Automáticos',
    pacientes: [paciente(1, '2026-08-30')],
    perguntas: [
      pergunta('paragrafo', 'Descreva a situação que mais te incomodou.', true),
      pergunta('emocoes', 'Como você se sentiu na hora?', true),
    ],
  },
  4: {
    titulo: 'Questionário de Qualidade de Sono',
    pacientes: [paciente(5, '2026-09-01')],
    perguntas: [
      pergunta('unica', 'Quantas horas você dormiu por noite, em média?', true, ['Menos de 5 horas', 'De 5 a 6 horas', 'De 7 a 8 horas', 'Mais de 8 horas']),
      pergunta('escala', 'De 0 a 10, como avalia a qualidade do seu sono?', true),
      pergunta('paragrafo', 'O que atrapalhou o seu sono?', false),
    ],
  },
}

// tarefa pronta para a tela de edição (cópia nova, com ids novos); null quando o id não existe
export function tarefaParaEdicao(id) {
  const tarefa = TAREFAS[id]
  if (!tarefa) return null
  return {
    dados: { titulo: tarefa.titulo, instrucoes: '', arquivo: null, pacientes: tarefa.pacientes.map((p) => ({ ...p })) },
    perguntas: tarefa.perguntas.map((p) => ({ ...p, id: novoId(), opcoes: [...p.opcoes] })),
  }
}
