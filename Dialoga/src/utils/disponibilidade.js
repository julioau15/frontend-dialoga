// ============================================================
// utils/disponibilidade.js
// Regras da aba "Disponibilidade" da Agenda do profissional.
// Cada item da lista é UM dia da semana + horário:
//   { id, dia, inicio, fim, tipo, data }
//   dia    -> 0 a 6 (0 = domingo), igual ao Date.getUTCDay()
//   tipo   -> 'semanal' (repete toda semana) | 'unica' (uma data só)
//   data   -> 'AAAA-MM-DD' (só no tipo 'unica')
// Ligação com o back (tbl_dias_da_semana: 1 = Dom ... 7 = Sáb): id_dias_da_semana = dia + 1,
// tipo_repeticao = 'semanal' | 'unica' e, na data única, data_inicial = data_final = data.
// ============================================================
import { montarIso } from './datasAgenda'

// Ordem em que aparecem na tela (semana começa na segunda, como no Figma)
export const DIAS = [
  { id: 1, sigla: 'Seg', nome: 'Segunda-feira' },
  { id: 2, sigla: 'Ter', nome: 'Terça-feira' },
  { id: 3, sigla: 'Qua', nome: 'Quarta-feira' },
  { id: 4, sigla: 'Qui', nome: 'Quinta-feira' },
  { id: 5, sigla: 'Sex', nome: 'Sexta-feira' },
  { id: 6, sigla: 'Sáb', nome: 'Sábado' },
  { id: 0, sigla: 'Dom', nome: 'Domingo' },
]

export const siglaDoDia = (dia) => DIAS.find((d) => d.id === dia)?.sigla ?? ''

// '08:00' + '12:00' -> '08:00 – 12:00'
export const faixaDeHorario = (d) => `${d.inicio} – ${d.fim}`

const diaDaSemana = (iso) => {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay()
}

// Segunda = 0 ... domingo = 6 (para ordenar a lista)
const posicaoNaSemana = (dia) => (dia + 6) % 7

export const ordenarDisponibilidades = (lista) =>
  [...lista].sort((a, b) => posicaoNaSemana(a.dia) - posicaoNaSemana(b.dia) || a.inicio.localeCompare(b.inicio))

// Próxima data (hoje inclusive) que cai no dia da semana pedido. Usada na "única vez".
export function proximaData(dia, aPartirDe) {
  const [a, m, d] = aPartirDe.split('-').map(Number)
  const falta = (dia - diaDaSemana(aPartirDe) + 7) % 7
  const data = new Date(Date.UTC(a, m - 1, d + falta))
  return montarIso(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate())
}

// Dias do mês (como 'AAAA-MM-DD') que têm disponibilidade, para pintar o calendário
export function diasComDisponibilidade(lista, ano, mes) {
  const total = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate()
  const dias = new Set()
  for (let dia = 1; dia <= total; dia++) {
    const iso = montarIso(ano, mes, dia)
    const semana = diaDaSemana(iso)
    if (lista.some((d) => (d.tipo === 'unica' ? d.data === iso : d.dia === semana))) dias.add(iso)
  }
  return dias
}

// Erros do formulário do pop-up: { campo: 'mensagem' } (vazio = tudo certo)
export function validarDisponibilidade({ dias, inicio, fim }) {
  const erros = {}
  if (dias.length === 0) erros.dias = 'Selecione ao menos um dia da semana.'
  if (!inicio) erros.inicio = 'Informe o início.'
  if (!fim) erros.fim = 'Informe o fim.'
  if (inicio && fim && fim <= inicio) erros.fim = 'O fim deve ser depois do início.'
  return erros
}

const sobrepoe = (a, b) => a.inicio < b.fim && b.inicio < a.fim

// Duas disponibilidades se chocam quando são no mesmo dia, os horários se cruzam
// e valem na mesma data (semanal vale sempre; única vez só na própria data).
export const seChocam = (a, b) =>
  a.dia === b.dia && sobrepoe(a, b) && (a.tipo === 'semanal' || b.tipo === 'semanal' || a.data === b.data)

// Primeira disponibilidade já cadastrada que conflita com alguma das novas (ou undefined)
export const acharConflito = (novas, existentes) =>
  novas.map((n) => existentes.find((e) => seChocam(n, e))).find(Boolean)
