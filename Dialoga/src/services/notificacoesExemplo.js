// ============================================================
// services/notificacoesExemplo.js
// Dados fixos das preferências de notificação (sem integração).
// Cada categoria tem um id, título, emoji e a lista de tipos de
// notificação com o estado inicial ligado (true) ou desligado (false).
// ============================================================

// Preferências de notificação do paciente (RF362, RF366)
export const CATEGORIAS_PACIENTE = [
  {
    id: 'tarefas',
    titulo: 'Tarefas',
    emoji: '✅',
    tipos: [
      { id: 'novas-tarefas', nome: 'Novas tarefas', descricao: 'Quando seu profissional enviar uma nova atividade', ativo: true },
      { id: 'lembretes-prazo', nome: 'Lembretes de prazo', descricao: 'Alertas 24h antes do vencimento', ativo: true },
      { id: 'alertas-atraso', nome: 'Alertas de atraso', descricao: 'Notificação quando uma tarefa vencer sem resposta', ativo: true },
    ],
  },
  {
    id: 'tratamentos',
    titulo: 'Tratamentos',
    emoji: '💊',
    tipos: [
      { id: 'lembrete-dose', nome: 'Lembrete de dose', descricao: 'Notificação no horário de cada medicamento', ativo: true },
      { id: 'dose-nao-confirmada', nome: 'Dose não confirmada', descricao: 'Aviso quando uma dose não for registrada', ativo: true },
    ],
  },
  {
    id: 'agenda',
    titulo: 'Agenda',
    emoji: '📅',
    tipos: [
      { id: 'lembrete-consulta', nome: 'Lembrete de consulta', descricao: 'Notificação 1h antes da consulta', ativo: true },
      { id: 'lembrete-dia-anterior', nome: 'Lembrete no dia anterior', descricao: 'Aviso na véspera da consulta', ativo: true },
    ],
  },
]

// Preferências de notificação do profissional (RF367, RF371)
export const CATEGORIAS_PROFISSIONAL = [
  {
    id: 'agenda',
    titulo: 'Agenda',
    emoji: '📅',
    tipos: [
      { id: 'nova-consulta', nome: 'Nova consulta agendada', descricao: 'Quando um paciente confirmar ou solicitar agendamento', ativo: true },
      { id: 'cancelamento-consulta', nome: 'Cancelamento de consulta', descricao: 'Alerta de consulta cancelada pelo paciente', ativo: true },
      { id: 'lembrete-atendimento', nome: 'Lembrete de atendimento', descricao: 'Notificação 30 min antes da próxima consulta', ativo: true },
      { id: 'alteracoes-agenda', nome: 'Alterações na agenda', descricao: 'Quando houver qualquer mudança nos agendamentos', ativo: false },
    ],
  },
  {
    id: 'tarefas',
    titulo: 'Tarefas',
    emoji: '✅',
    tipos: [
      { id: 'tarefa-respondida', nome: 'Tarefa respondida', descricao: 'Quando um paciente enviar um questionário preenchido', ativo: true },
      { id: 'tarefas-atraso', nome: 'Tarefas em atraso', descricao: 'Alerta quando uma tarefa vencer sem resposta', ativo: true },
      { id: 'atividade-andamento', nome: 'Atividade em andamento', descricao: 'Quando um paciente começar a preencher uma tarefa', ativo: false },
    ],
  },
  {
    id: 'pacientes',
    titulo: 'Pacientes',
    emoji: '👥',
    tipos: [
      { id: 'novo-vinculo', nome: 'Novo vínculo', descricao: 'Quando um paciente aceitar o convite de acompanhamento', ativo: true },
      { id: 'atualizacao-perfil', nome: 'Atualização de perfil', descricao: 'Quando um paciente atualizar seus dados', ativo: false },
      { id: 'paciente-inativo', nome: 'Paciente inativo', descricao: 'Alerta de pacientes sem atividade há mais de 30 dias', ativo: true },
    ],
  },
]
