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

// "Carlos Eduardo Mendes" -> "CM" (primeira e última palavra)
export function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return ''
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
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
