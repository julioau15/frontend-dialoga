// ============================================================
// services/notificacoesExemplo.js
// Catálogo das preferências de notificação do paciente e do profissional.
// Define as categorias e os tipos exibidos na tela e o valor padrão
// (ligado/desligado) usado enquanto o usuário não salvou nenhuma preferência.
// Cada categoria tem id, chave, título, emoji e a lista de tipos.
//   id    -> usado pela tela (estado, abrir/fechar)
//   chave -> valor gravado na API (colunas categoria e tipo_especifico
//            de tbl_preferencia_notificacao; máx. 30 e 50 caracteres)
// As preferências salvas são carregadas e gravadas pelo
// services/preferenciasNotificacaoService.js.
// ============================================================

// Preferências de notificação do paciente (RF362, RF366)
export const CATEGORIAS_PACIENTE = [
  {
    id: 'tarefas',
    chave: 'tarefa',
    titulo: 'Tarefas',
    emoji: '✅',
    tipos: [
      { id: 'novas-tarefas', chave: 'nova_tarefa', nome: 'Novas tarefas', descricao: 'Quando seu profissional enviar uma nova atividade', ativo: true },
      { id: 'lembretes-prazo', chave: 'lembrete_prazo', nome: 'Lembretes de prazo', descricao: 'Alertas 24h antes do vencimento', ativo: true },
      { id: 'alertas-atraso', chave: 'tarefa_atrasada', nome: 'Alertas de atraso', descricao: 'Notificação quando uma tarefa vencer sem resposta', ativo: true },
    ],
  },
  {
    id: 'tratamentos',
    chave: 'medicacao',
    titulo: 'Tratamentos',
    emoji: '💊',
    tipos: [
      { id: 'lembrete-dose', chave: 'hora_da_dose', nome: 'Lembrete de dose', descricao: 'Notificação no horário de cada medicamento', ativo: true },
      { id: 'dose-nao-confirmada', chave: 'dose_nao_confirmada', nome: 'Dose não confirmada', descricao: 'Aviso quando uma dose não for registrada', ativo: true },
    ],
  },
  {
    id: 'agenda',
    chave: 'agenda',
    titulo: 'Agenda',
    emoji: '📅',
    tipos: [
      { id: 'lembrete-consulta', chave: 'lembrete_consulta', nome: 'Lembrete de consulta', descricao: 'Notificação 1h antes da consulta', ativo: true },
      { id: 'lembrete-dia-anterior', chave: 'lembrete_vespera', nome: 'Lembrete no dia anterior', descricao: 'Aviso na véspera da consulta', ativo: true },
    ],
  },
]

// Preferências de notificação do profissional (RF367, RF371)
export const CATEGORIAS_PROFISSIONAL = [
  {
    id: 'agenda',
    chave: 'agenda',
    titulo: 'Agenda',
    emoji: '📅',
    tipos: [
      { id: 'nova-consulta', chave: 'nova_consulta', nome: 'Nova consulta agendada', descricao: 'Quando um paciente confirmar ou solicitar agendamento', ativo: true },
      { id: 'cancelamento-consulta', chave: 'consulta_cancelada', nome: 'Cancelamento de consulta', descricao: 'Alerta de consulta cancelada pelo paciente', ativo: true },
      { id: 'lembrete-atendimento', chave: 'lembrete_atendimento', nome: 'Lembrete de atendimento', descricao: 'Notificação 30 min antes da próxima consulta', ativo: true },
      { id: 'alteracoes-agenda', chave: 'alteracao_agenda', nome: 'Alterações na agenda', descricao: 'Quando houver qualquer mudança nos agendamentos', ativo: false },
    ],
  },
  {
    id: 'tarefas',
    chave: 'tarefa',
    titulo: 'Tarefas',
    emoji: '✅',
    tipos: [
      { id: 'tarefa-respondida', chave: 'tarefa_respondida', nome: 'Tarefa respondida', descricao: 'Quando um paciente enviar um questionário preenchido', ativo: true },
      { id: 'tarefas-atraso', chave: 'tarefa_atrasada', nome: 'Tarefas em atraso', descricao: 'Alerta quando uma tarefa vencer sem resposta', ativo: true },
      { id: 'atividade-andamento', chave: 'tarefa_em_andamento', nome: 'Atividade em andamento', descricao: 'Quando um paciente começar a preencher uma tarefa', ativo: false },
    ],
  },
  {
    id: 'pacientes',
    chave: 'paciente',
    titulo: 'Pacientes',
    emoji: '👥',
    tipos: [
      { id: 'novo-vinculo', chave: 'vinculo_aceito', nome: 'Novo vínculo', descricao: 'Quando um paciente aceitar o convite de acompanhamento', ativo: true },
      { id: 'atualizacao-perfil', chave: 'perfil_atualizado', nome: 'Atualização de perfil', descricao: 'Quando um paciente atualizar seus dados', ativo: false },
      { id: 'paciente-inativo', chave: 'paciente_inativo', nome: 'Paciente inativo', descricao: 'Alerta de pacientes sem atividade há mais de 30 dias', ativo: true },
    ],
  },
]
