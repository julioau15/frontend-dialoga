// Adapta somente os dados reais do acompanhamento; outras integrações são de outra task.
export function buscarPerfilProfissional(basico) {
  if (!basico) return undefined
  return {
    ...basico,
    nomeExibicao: basico.nome,
    registro: null,
    modalidades: [],
    especialidades: basico.especialidades?.length ? basico.especialidades : [basico.especialidade],
    proximaDisponivel: null,
    tarefas: [],
    tratamentos: [],
  }
}
