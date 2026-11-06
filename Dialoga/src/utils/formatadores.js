// ============================================================
// utils/formatadores.js
// Funções pequenas para formatar nomes e datas nas telas.
// ============================================================

const PARTICULAS = ['de', 'da', 'do', 'das', 'dos', 'e']

export function doisPrimeirosNomes(nome = '') {
  return nome
    .trim()
    .split(/\s+/)
    .filter((p) => p && !PARTICULAS.includes(p.toLowerCase()))
    .slice(0, 2)
}

// "Carlos Eduardo Mendes" -> "CM" (primeira e última palavra).
// Ignora títulos: "Dra. Fernanda Alencar" -> "FA"
export function iniciais(nome = '') {
  const partes = nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((parte) => !/^(dr|dra)\.?$/i.test(parte))
  if (partes.length === 0) return ''
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

// Primeiro nome, ignorando títulos: "Dr. Carlos Henrique Lima" -> "Carlos"
export function primeiroNome(nome = '') {
  const partes = nome
    .trim()
    .split(/\s+/)
    .filter((parte) => parte && !/^(dr|dra|prof|profa)\.?$/i.test(parte))
  return partes[0] ?? ''
}

// Data e hora locais (do navegador) no formato "YYYY-MM-DD HH:MM:SS", que é o que a API de
// notificações aceita (o formato ISO com "Z" dá erro 500 no back).
export function dataHoraSQL(data = new Date()) {
  const dois = (n) => String(n).padStart(2, '0')
  return `${dataLocalISO(data)} ${dois(data.getHours())}:${dois(data.getMinutes())}:${dois(data.getSeconds())}`
}

// Data local (do navegador) no formato YYYY-MM-DD, que é o que a API espera.
// Não usa toISOString() de propósito: ele converte para UTC e, à noite no
// Brasil, devolveria o dia seguinte.
export function dataLocalISO(data = new Date()) {
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mes}-${dia}`
}

// Date -> "sábado, 5 de setembro"
export function formatarDataExtenso(data = new Date()) {
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(data)
}

// "2026-09-10" -> "10/09/2026" (troca o texto, sem criar Date, para não mudar o dia por fuso)
export function formatarDataBR(iso) {
  if (!iso) return ''
  const [ano, mes, dia] = String(iso).slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

// Frase do banner: "Você tem 3 atendimentos hoje."
export function textoAtendimentosHoje(qtd) {
  if (!qtd) return 'Você não tem atendimentos hoje.'
  if (qtd === 1) return 'Você tem 1 atendimento hoje.'
  return `Você tem ${qtd} atendimentos hoje.`
}

// "2026-09-02T10:00:00.000Z" (ou Date) -> "02/09/2026"
export function formatarData(valor) {
  if (!valor) return ''
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return ''
  return data.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

// "23456789011" -> "234.567.890-11" (se já vier formatado, devolve igual)
export function formatarCpf(cpf = '') {
  const numeros = String(cpf).replace(/\D/g, '')
  if (numeros.length !== 11) return String(cpf)
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

// Tira acentos e deixa minúsculo, para a busca ignorar "Á" x "a"
export function textoParaBusca(texto = '') {
  return String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}
