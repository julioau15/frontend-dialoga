// ============================================================
// utils/datasAgendaPaciente.js
// Funções de data extras da Agenda do paciente (visões Mês, Semana e Dia).
// As datas viajam como texto 'AAAA-MM-DD' e são lidas em UTC, para não
// "andar um dia" por causa do fuso horário.
// ============================================================

const NOMES_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const paraData = (iso) => {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d))
}

const paraIso = (data) =>
  `${data.getUTCFullYear()}-${String(data.getUTCMonth() + 1).padStart(2, '0')}-${String(data.getUTCDate()).padStart(2, '0')}`

const maiusculaPorPalavra = (texto) => texto.replace(/(^|[\s-])(\p{L})/gu, (_, sep, letra) => sep + letra.toUpperCase())

export const NOMES_DIAS_SEMANA = NOMES_SEMANA

// '2026-09-08' + 7 -> '2026-09-15'
export function somarDias(iso, quantidade) {
  const data = paraData(iso)
  data.setUTCDate(data.getUTCDate() + quantidade)
  return paraIso(data)
}

// Primeiro dia do mês seguinte/anterior: ('2026-09-08', 1) -> '2026-10-01'
export function primeiroDiaDoMes(iso, deslocamentoEmMeses = 0) {
  const data = paraData(iso)
  return paraIso(new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth() + deslocamentoEmMeses, 1)))
}

// { ano, mes (0-11) } de uma data
export function anoEMes(iso) {
  const data = paraData(iso)
  return { ano: data.getUTCFullYear(), mes: data.getUTCMonth() }
}

// Os 7 dias da semana (segunda a domingo) que contém a data
export function semanaDe(iso) {
  const diasDesdeSegunda = (paraData(iso).getUTCDay() + 6) % 7
  const segunda = somarDias(iso, -diasDesdeSegunda)
  return Array.from({ length: 7 }, (_, i) => somarDias(segunda, i))
}

export const nomeDiaCurto = (iso) => NOMES_SEMANA[paraData(iso).getUTCDay()]
export const numeroDoDia = (iso) => paraData(iso).getUTCDate()

// 7 dias -> '7/9 – 13/9/2026'
export function intervaloDaSemana(dias) {
  const [, m1, d1] = dias[0].split('-').map(Number)
  const [ano, m2, d2] = dias[6].split('-').map(Number)
  return `${d1}/${m1} – ${d2}/${m2}/${ano}`
}

// '2026-09-08' -> '8 de setembro de 2026'
export function dataCompacta(iso) {
  return new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(paraData(iso))
}

// '2026-09-08' -> 'Terça-Feira, 8 De Setembro De 2026'
export function dataTituloCompleta(iso) {
  const texto = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(paraData(iso))
  return maiusculaPorPalavra(texto)
}

// Rótulo das horas do dia: 7 -> '07:00'
export const rotuloHora = (hora) => `${String(hora).padStart(2, '0')}:00`
