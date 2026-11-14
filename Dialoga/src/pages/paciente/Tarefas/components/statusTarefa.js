// ============================================================
// statusTarefa
// Configuração de cada status da tarefa: texto da etiqueta, tom do Selo,
// texto do botão e se mostra a barra de progresso.
// Usado pelo CartaoTarefa e pelo FormularioTarefa.
// ============================================================
export const STATUS = {
  pendente: { rotulo: 'Pendente', tom: 'primaria', acao: 'Abrir tarefa', barra: true },
  andamento: { rotulo: 'Em andamento', tom: 'info', acao: 'Continuar', barra: true },
  atrasada: { rotulo: 'Em atraso', tom: 'erro', acao: 'Abrir tarefa', barra: true },
  concluida: { rotulo: 'Concluída', tom: 'sucesso', acao: 'Ver respostas', barra: false },
}
