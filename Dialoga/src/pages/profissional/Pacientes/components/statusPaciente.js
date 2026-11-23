// ============================================================
// statusPaciente
// Texto e tom do Selo de cada status do paciente (como no Figma:
// "Ativo" verde e "Inativo" cinza) e as opções do filtro da lista
// (Todos, Ativos e Inativos - RF301).
// "Pendente" (amarelo) não existe no Figma: é o vínculo que o paciente ainda não aceitou
// (ou que ele pediu e o profissional ainda não aceitou). Só aparece em "Todos".
// O serviço pacientesProfissionalService já converte o status do vínculo para estas chaves.
// ============================================================
export const STATUS_PACIENTE = {
  ativo: { rotulo: 'Ativo', tom: 'sucesso' },
  inativo: { rotulo: 'Inativo', tom: 'neutro' },
  pendente: { rotulo: 'Pendente', tom: 'alerta' },
}

// status desconhecido aparece como "Inativo"
export const statusDe = (status) => STATUS_PACIENTE[status] ?? STATUS_PACIENTE.inativo

// pílulas do filtro ("todos" mostra a lista inteira)
export const FILTROS_STATUS = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'ativo', rotulo: 'Ativos' },
  { id: 'inativo', rotulo: 'Inativos' },
]

// solicitação recebida: o paciente pediu o vínculo e o profissional ainda não respondeu
// (mesmo conceito da tela Profissionais do paciente)
export const ROTULO_RECEBIDA = { rotulo: 'Solicitação recebida', tom: 'alerta' }
export const pedidoRecebido = (paciente) => paciente.status === 'pendente' && paciente.pedidoPor === 'paciente'

// solicitações recebidas primeiro; o resto mantém a ordem da API
export const ordenarPacientes = (lista) => [...lista.filter(pedidoRecebido), ...lista.filter((p) => !pedidoRecebido(p))]
