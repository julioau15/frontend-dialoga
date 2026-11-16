// ============================================================
// perfilProfissionalMock
// Dados fixos da tela do profissional (frame "Profissional histórico - Paciente"), sem API.
// Os dados básicos (nome, especialidade, status) vêm da lista da tela Profissionais
// (profissionaisMemoria); aqui ficam só os extras do perfil:
//   nomeExibicao  -> nome com o título ("Dr. Carlos Eduardo Mendes")
//   registro      -> conselho profissional ("CRP 06/142830") ou null
//   modalidades   -> selos verdes ("Atendimento Online", "Consultório")
//   especialidades -> etiquetas lilás da seção "Especialidade"
//   proximaDisponivel -> texto de "Próxima consulta disponível" ou null
//   tarefas, tratamentos -> [{ id, titulo, status, descricao, rotulo ('Prazo' | 'Frequência'), valor }]
// O Carlos é igual ao Figma. Patrícia e Roberto não têm frame: são dados de exemplo no mesmo
// formato (combinado com a equipe). Quem está no Histórico (Inativo) não mostra a próxima consulta
// e as listas aparecem vazias.
// TODO: trocar pelos dados da API (perfil do profissional, tarefas e tratamentos) na integração.
// ============================================================
import { buscarProfissional } from '../../Profissionais/components/profissionaisMemoria'

const EXTRAS = {
  1: {
    nomeExibicao: 'Dr. Carlos Eduardo Mendes',
    registro: 'CRP 06/142830',
    modalidades: ['Atendimento Online', 'Consultório'],
    especialidades: ['Ansiedade', 'Depressão', 'Autoconhecimento', 'Terapia Familiar'],
    proximaDisponivel: 'Amanhã, dia 11/09 às 14:00 (Online)',
    tarefas: [
      { id: 1, titulo: 'Diário de humor', status: 'Em andamento', descricao: 'Atualize 3x por semana para acompanhar o progresso da sessão.', rotulo: 'Prazo', valor: '15/09' },
      { id: 2, titulo: 'Exercícios de respiração', status: 'Em andamento', descricao: 'Pratique 10 min antes de dormir para reduzir a ansiedade noturna.', rotulo: 'Frequência', valor: 'Diária' },
    ],
    tratamentos: [
      { id: 1, titulo: 'Acompanhamento de humor', status: 'Em andamento', descricao: 'Monitoramento semanal para ajustar intervenções e manter o equilíbrio emocional.', rotulo: 'Frequência', valor: 'Semanal' },
      { id: 2, titulo: 'Terapia cognitivo-comportamental', status: 'Em andamento', descricao: 'Foco em reestruturação cognitiva e controle de sintomas de ansiedade.', rotulo: 'Prazo', valor: '12 sessões' },
    ],
  },
  2: {
    nomeExibicao: 'Dra. Patrícia Lima',
    registro: 'CRM 123456/SP',
    modalidades: ['Consultório'],
    especialidades: ['Transtornos de humor', 'Ansiedade', 'Sono'],
    proximaDisponivel: 'Dia 05/10 às 09:30 (Consultório)',
    tarefas: [
      { id: 1, titulo: 'Registro do sono', status: 'Em andamento', descricao: 'Anote o horário em que dormiu e acordou todos os dias.', rotulo: 'Frequência', valor: 'Diária' },
    ],
    tratamentos: [
      { id: 1, titulo: 'Acompanhamento psiquiátrico', status: 'Em andamento', descricao: 'Consultas mensais para avaliar e ajustar a medicação.', rotulo: 'Frequência', valor: 'Mensal' },
    ],
  },
  3: {
    nomeExibicao: 'Dr. Roberto Alves',
    registro: 'CRM 654321/SP',
    modalidades: ['Consultório'],
    especialidades: ['Cefaleia', 'Distúrbios do sono'],
    proximaDisponivel: null,
    tarefas: [],
    tratamentos: [],
  },
}

// perfil completo pelo id da URL; undefined se o profissional não existe na lista
export function buscarPerfilProfissional(id) {
  const basico = buscarProfissional(id)
  if (!basico) return undefined
  // profissional adicionado na tela (sem dados extras): só o que o paciente informou
  const extras = EXTRAS[basico.id] ?? {
    nomeExibicao: basico.nome,
    registro: null,
    modalidades: [],
    especialidades: [basico.especialidade],
    proximaDisponivel: null,
    tarefas: [],
    tratamentos: [],
  }
  const inativo = basico.status === 'inativo'
  return {
    ...basico,
    ...extras,
    // no Histórico (Inativo) não há próxima consulta nem tarefas/tratamentos ativos
    proximaDisponivel: inativo ? null : extras.proximaDisponivel,
    tarefas: inativo ? [] : extras.tarefas,
    tratamentos: inativo ? [] : extras.tratamentos,
  }
}
