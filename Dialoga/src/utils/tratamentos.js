// ============================================================
// utils/tratamentos.js
// Constantes, validação e conferência dos tratamentos, sem dados de exemplo.
// ============================================================
// Opções já utilizadas no formulário e nos cartões.
export const FREQUENCIAS = [
  { rotulo: 'Uma vez ao dia', vezes: 1 },
  { rotulo: 'Duas vezes ao dia', vezes: 2 },
  { rotulo: 'Três vezes ao dia', vezes: 3 },
  { rotulo: 'Quatro vezes ao dia', vezes: 4 },
]

// Frequência gravada no banco -> uma das opções da lista (FREQUENCIAS).
// Registros antigos usam "1x ao dia", "2 vezes ao dia" ou textos livres ("à noite"):
// pega o número do texto; sem número, usa a quantidade de horários do tratamento.
const VEZES_POR_EXTENSO = { uma: 1, duas: 2, tres: 3, quatro: 4 }

export function frequenciaDoRegistro(texto, quantidadeHorarios = 1) {
  const exata = FREQUENCIAS.find((item) => item.rotulo === texto)
  if (exata) return exata.rotulo

  const normalizado = String(texto ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const numero = normalizado.match(/(\d+)\s*(x|vez|vezes)/)?.[1]
  const porExtenso = Object.entries(VEZES_POR_EXTENSO).find(([palavra]) => normalizado.startsWith(palavra))?.[1]
  const vezes = Number(numero) || porExtenso || quantidadeHorarios || 1

  return (FREQUENCIAS.find((item) => item.vezes === vezes) ?? FREQUENCIAS[0]).rotulo
}

export const TRATAMENTO_VAZIO = {
  nome: '',
  dosagem: '',
  frequencia: 'Uma vez ao dia',
  horarios: [''],
  lembrete: true,
}

// Informa quantos campos de horário a frequência conhecida utiliza.
export const vezesDe = (frequencia) =>
  FREQUENCIAS.find((item) => item.rotulo === frequencia)?.vezes ?? 1

// Monta o texto da contagem após uma listagem concluída.
export function textoContagem(total) {
  if (total === 0) return 'Nenhum tratamento cadastrado'
  return total === 1
    ? '1 tratamento cadastrado'
    : `${total} tratamentos cadastrados`
}

// Aceita horário de formulário ou TIME da API, sem descartar segundos.
export function normalizarHorario(valor) {
  if (typeof valor !== 'string') return ''
  const hora = valor.trim()
  if (!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(hora)) {
    return ''
  }

  return hora.length === 8 && hora.endsWith(':00')
    ? hora.slice(0, 5)
    : hora
}

// Confere os campos antes de montar o corpo enviado à API.
// A obrigatoriedade de todos os horários deve ser validada na especificação.
export function validarTratamento(campos) {
  const erros = {}
  const nome = campos.nome?.trim() ?? ''
  const dosagem = campos.dosagem?.trim() ?? ''

  if (!nome) erros.nome = 'Informe o nome do medicamento ou tratamento.'
  else if (nome.length > 150) erros.nome = 'Use no máximo 150 caracteres.'

  if (!dosagem) erros.dosagem = 'Informe a dosagem.'
  else if (dosagem.length > 150) erros.dosagem = 'Use no máximo 150 caracteres.'

  const frequencia = FREQUENCIAS.find(
    (item) => item.rotulo === campos.frequencia,
  )

  if (!frequencia) erros.frequencia = 'Selecione uma frequência válida.'

  const horarios = Array.isArray(campos.horarios)
    ? campos.horarios.map(normalizarHorario)
    : []

  const horariosComSegundos = horarios.map((hora) =>
    hora.length === 5 ? `${hora}:00` : hora,
  )

  if (
    !frequencia ||
    horarios.length !== frequencia.vezes ||
    horarios.some((hora) => !hora)
  ) {
    erros.horarios = 'Preencha um horário válido para cada dose.'
  } else if (
    new Set(horariosComSegundos).size !== horariosComSegundos.length
  ) {
    erros.horarios = 'Informe horários diferentes.'
  }

  if (typeof campos.lembrete !== 'boolean') {
    erros.lembrete = 'Revise a opção de lembrete.'
  }

  return erros
}

// Adapta os nomes usados pela tela ao contrato do backend.
export function montarPayloadTratamento(campos) {
  const erros = validarTratamento(campos)

  if (Object.keys(erros).length > 0) {
    const erro = new Error('Revise os campos do tratamento.')
    erro.campos = erros
    throw erro
  }

  return {
    nome_medicamento: campos.nome.trim(),
    dosagem: campos.dosagem.trim(),
    frequencia: campos.frequencia,
    lembrete_ativo: campos.lembrete ? 1 : 0,
    horarios: campos.horarios.map((valor) => {
      const hora = normalizarHorario(valor)
      return { horario: hora.length === 5 ? `${hora}:00` : hora }
    }),
  }
}

// Normaliza a resposta preservando o formato esperado pelos cartões.
export function normalizarTratamento(registro) {
  const id = Number(registro?.id)

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error('A API retornou um tratamento sem identificação válida.')
  }

  return {
    id,
    nome: registro.nome_medicamento ?? '',
    dosagem: registro.dosagem ?? '',
    frequencia: registro.frequencia ?? '',
    lembrete:
      registro.lembrete_ativo === true ||
      Number(registro.lembrete_ativo) === 1,
    horarios: Array.isArray(registro.horarios)
      ? registro.horarios.map((item) => {
          const horario = normalizarHorario(item?.horario)
          if (!horario) {
            throw new Error('A API retornou um horário inválido.')
          }
          return horario
        })
      : [],
  }
}

// Compara os dados relidos com o que foi enviado, incluindo os horários.
export function tratamentoConfere(registro, campos) {
  if (!registro) return false

  const horariosCanonicos = (horarios) =>
    horarios
      .map(normalizarHorario)
      .map((hora) => (hora.length === 5 ? `${hora}:00` : hora))
      .sort()

  return (
    registro.nome === campos.nome.trim() &&
    registro.dosagem === campos.dosagem.trim() &&
    registro.frequencia === campos.frequencia &&
    registro.lembrete === campos.lembrete &&
    JSON.stringify(horariosCanonicos(registro.horarios)) ===
      JSON.stringify(horariosCanonicos(campos.horarios))
  )
}

// Situações da dose de hoje devolvidas pela API (GET /pacientes/me/doses).
export const SITUACOES_DOSE = ['tomada', 'pendente', 'atrasada', 'futura']

// Chave que liga a dose ao chip de horário do cartão (id do tratamento + horário 'HH:mm').
export const chaveDose = (idTratamento, horario) =>
  `${idTratamento}|${normalizarHorario(horario).slice(0, 5)}`

// Normaliza uma dose da API para o formato usado nos cartões.
export function normalizarDose(registro) {
  const idHorario = Number(registro?.id_horario_tratamento)
  const idTratamento = Number(registro?.id_tratamento)
  const horario = normalizarHorario(registro?.horario)

  if (
    !Number.isSafeInteger(idHorario) || idHorario <= 0 ||
    !Number.isSafeInteger(idTratamento) || idTratamento <= 0 ||
    !horario
  ) {
    throw new Error('A API retornou uma dose inválida.')
  }

  const status = SITUACOES_DOSE.includes(registro.status) ? registro.status : 'futura'
  const confirmacao = typeof registro.data_hora_confirmacao === 'string'
    ? registro.data_hora_confirmacao
    : ''

  return {
    idHorario,
    idTratamento,
    horario: horario.slice(0, 5),
    status,
    podeConfirmar: registro.pode_confirmar === true && status !== 'tomada',
    // 'YYYY-MM-DD HH:mm:ss' -> 'HH:mm'
    horaConfirmacao: confirmacao.slice(11, 16),
  }
}

// Monta o índice chave -> dose para cada cartão encontrar a dose de cada horário.
export function indexarDoses(doses) {
  return new Map(doses.map((dose) => [chaveDose(dose.idTratamento, dose.horario), dose]))
}
