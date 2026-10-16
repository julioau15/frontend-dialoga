// Modelos de domínio do Dialoga (JSDoc — o editor usa para autocompletar e checar tipos)

export const PERFIS = Object.freeze({
  PACIENTE: 'paciente',
  PROFISSIONAL: 'profissional',
  ADMIN: 'admin',
})

/** @typedef {'paciente' | 'profissional' | 'admin'} Perfil */

/** @typedef {'ativo' | 'inativo' | 'pendente'} StatusUsuario */

/**
 * @typedef {Object} Usuario
 * @property {string} id
 * @property {string} nome
 * @property {string} email
 * @property {Perfil} perfil
 * @property {StatusUsuario} status
 * @property {string} [avatarUrl]
 * @property {string} [telefone]
 * @property {boolean} [primeiroAcesso] true enquanto o usuário não definiu a própria senha
 */

/**
 * @typedef {Usuario & { dataNascimento: string, profissionalIds: string[] }} Paciente
 */

/**
 * @typedef {Usuario & { especialidade: string, registro: string }} Profissional
 * `registro` é o número no conselho de classe (ex.: CRP, CRFa)
 */

/** @typedef {'agendada' | 'confirmada' | 'concluida' | 'cancelada'} StatusConsulta */

/**
 * @typedef {Object} Consulta
 * @property {string} id
 * @property {string} pacienteId
 * @property {string} profissionalId
 * @property {string} dataHora ISO 8601
 * @property {number} duracaoMin
 * @property {StatusConsulta} status
 * @property {string} [observacoes]
 */

/** @typedef {'pendente' | 'em_andamento' | 'concluida' | 'atrasada'} StatusTarefa */

/**
 * @typedef {Object} Tarefa
 * @property {string} id
 * @property {string} pacienteId
 * @property {string} profissionalId
 * @property {string} titulo
 * @property {string} [descricao]
 * @property {string} prazo ISO 8601 (data)
 * @property {StatusTarefa} status
 */

/**
 * @typedef {Object} Tratamento
 * @property {string} id
 * @property {string} pacienteId
 * @property {string} profissionalId
 * @property {string} titulo
 * @property {string} inicio ISO 8601 (data)
 * @property {string} [fim] ISO 8601 (data)
 * @property {number} progresso 0–100
 * @property {'ativo' | 'inativo' | 'concluida'} status
 */

/**
 * @typedef {Object} Notificacao
 * @property {string} id
 * @property {string} usuarioId
 * @property {string} titulo
 * @property {string} mensagem
 * @property {string} criadaEm ISO 8601
 * @property {boolean} lida
 */

/** @typedef {'pendente' | 'aprovada' | 'recusada'} StatusAprovacao */

/**
 * Solicitação de cadastro de profissional aguardando análise do admin
 * @typedef {Object} Aprovacao
 * @property {string} id
 * @property {string} profissionalId
 * @property {string} solicitadaEm ISO 8601
 * @property {StatusAprovacao} status
 * @property {string} [analisadaPor] id do admin
 * @property {string} [motivoRecusa]
 */
