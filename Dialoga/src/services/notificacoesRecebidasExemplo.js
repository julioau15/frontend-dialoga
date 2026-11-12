// ============================================================
// services/notificacoesRecebidasExemplo.js
// Dados fixos das notificações recebidas pelo paciente e pelo profissional
// (sem integração). Cada item tem { id, categoria, titulo, descricao, data, lida };
// a data já vem formatada como texto.
// ============================================================

// Aparência e destino de cada categoria de notificação:
//   rotulo -> texto do chip | emoji -> ícone do cartão
//   fundo  -> fundo claro do ícone e do chip | rota -> tela aberta pelo "Ver →"
export const CATEGORIAS_NOTIFICACAO = {
  tarefa: { rotulo: 'Tarefa', emoji: '✅', fundo: 'bg-fundo-suave', rota: 'tarefas' },
  agenda: { rotulo: 'Agenda', emoji: '📅', fundo: 'bg-info-fundo', rota: 'agenda' },
  paciente: { rotulo: 'Paciente', emoji: '👤', fundo: 'bg-sucesso-fundo', rota: 'pacientes' },
  tratamento: { rotulo: 'Tratamento', emoji: '💊', fundo: 'bg-alerta-fundo', rota: 'tratamentos' },
  profissional: { rotulo: 'Profissional', emoji: '🩺', fundo: 'bg-sucesso-fundo', rota: 'profissionais' },
}

// Notificações recebidas pelo paciente, da mais nova para a mais antiga
export const NOTIFICACOES_PACIENTE = [
  {
    id: 'p1',
    categoria: 'tarefa',
    titulo: 'Nova tarefa recebida',
    descricao: 'Carlos Eduardo Mendes enviou uma nova tarefa: "Diário de Humor Semanal". Prazo: 07/09/2026.',
    data: '02/09/2026 às 09:15',
    lida: false,
  },
  {
    id: 'p2',
    categoria: 'agenda',
    titulo: 'Consulta amanhã',
    descricao: 'Lembrete: você tem consulta com Carlos Eduardo Mendes amanhã às 14:00.',
    data: '01/09/2026 às 18:00',
    lida: false,
  },
  {
    id: 'p3',
    categoria: 'tratamento',
    titulo: 'Hora do medicamento',
    descricao: 'Está na hora de tomar Sertralina 50mg.',
    data: '01/09/2026 às 08:00',
    lida: true,
  },
  {
    id: 'p4',
    categoria: 'tarefa',
    titulo: 'Tarefa em atraso',
    descricao: '"Questionário de Qualidade de Sono" venceu em 01/09. Você ainda pode respondê-la.',
    data: '01/09/2026 às 07:00',
    lida: true,
  },
  {
    id: 'p5',
    categoria: 'profissional',
    titulo: 'Profissional confirmado',
    descricao: 'Carlos Eduardo Mendes aceitou seu vínculo no Dialoga. Agora vocês estão conectados!',
    data: '28/08/2026 às 14:30',
    lida: true,
  },
  {
    id: 'p6',
    categoria: 'tarefa',
    titulo: 'Tarefa concluída',
    descricao: 'Parabéns! Você concluiu "Registro de Pensamentos Automáticos". Continue assim! 🎉',
    data: '28/08/2026 às 11:00',
    lida: true,
  },
]

// Notificações recebidas pelo profissional, da mais nova para a mais antiga
export const NOTIFICACOES_PROFISSIONAL = [
  {
    id: 'r1',
    categoria: 'tarefa',
    titulo: 'Tarefa respondida',
    descricao: 'Ana Beatriz Ferreira respondeu o questionário "Diário de Humor Semanal".',
    data: '02/09/2026 às 10:30',
    lida: false,
  },
  {
    id: 'r2',
    categoria: 'agenda',
    titulo: 'Consulta hoje às 14:00',
    descricao: 'Lembrete: atendimento com João Pedro Alves em 30 minutos.',
    data: '02/09/2026 às 13:30',
    lida: false,
  },
  {
    id: 'r3',
    categoria: 'paciente',
    titulo: 'Novo vínculo aceito',
    descricao: 'Ricardo Sousa aceitou seu convite de acompanhamento no Dialoga.',
    data: '01/09/2026 às 09:00',
    lida: false,
  },
  {
    id: 'r4',
    categoria: 'tarefa',
    titulo: 'Tarefa em atraso',
    descricao: '"Escala de Ansiedade" de Fernanda Gomes venceu ontem sem resposta.',
    data: '01/09/2026 às 08:00',
    lida: true,
  },
  {
    id: 'r5',
    categoria: 'agenda',
    titulo: 'Consulta cancelada',
    descricao: 'Ana Beatriz Ferreira cancelou a consulta do dia 03/09 às 10:00.',
    data: '31/08/2026 às 22:15',
    lida: true,
  },
  {
    id: 'r6',
    categoria: 'paciente',
    titulo: 'Paciente inativo',
    descricao: 'Mariana Costa está sem atividade há mais de 30 dias.',
    data: '28/08/2026 às 07:00',
    lida: true,
  },
]
