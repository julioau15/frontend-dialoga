// ============================================================
// utils/datasAgenda.js
// Funções de data usadas na Agenda. As datas viajam como texto
// 'AAAA-MM-DD' (ex.: '2026-09-02') e são lidas sempre em UTC para não
// "andar um dia" por causa do fuso horário.
// ============================================================

const maiusculaPorPalavra = (texto) => texto.replace(/(^|[\s-])(\p{L})/gu, (_, sep, letra) => sep + letra.toUpperCase())

const paraData = (iso) => {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d))
}

// 'AAAA-MM-DD' a partir de ano, mês (0-11) e dia
export function montarIso(ano, mes, dia) {
  return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

// '2026-09-02' -> 'quarta-feira, 2 de setembro'
export function dataPorExtenso(iso) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(paraData(iso))
}

// '2026-09-02' -> 'Quarta-Feira, 2 De Setembro' (como aparece no pop-up de detalhes)
export const dataPorExtensoTitulo = (iso) => maiusculaPorPalavra(dataPorExtenso(iso))

// '2026-09-02' -> '02/09/2026'
export function dataCurta(iso) {
  const [a, m, d] = iso.split('-')
  return `${d}/${m}/${a}`
}

// '2026-09-02' -> { dia: '2', mes: 'Set.' }
export function diaEMesAbreviado(iso) {
  const data = paraData(iso)
  const mes = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(data)
  return { dia: String(data.getUTCDate()), mes: maiusculaPorPalavra(mes) }
}

// (2026, 8) -> 'Setembro 2026'
export function tituloDoMes(ano, mes) {
  const nome = new Intl.DateTimeFormat('pt-BR', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(ano, mes, 1)))
  return `${maiusculaPorPalavra(nome)} ${ano}`
}

// Células do calendário do mês: vazios no começo (semana começa no domingo) + dias 1..N
export function celulasDoMes(ano, mes) {
  const primeiroDiaSemana = new Date(Date.UTC(ano, mes, 1)).getUTCDay()
  const totalDias = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate()
  return [
    ...Array.from({ length: primeiroDiaSemana }, () => null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ]
}

// Tira acentos e deixa minúsculo (busca por nome sem se importar com acentos)
export const normalizar = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
