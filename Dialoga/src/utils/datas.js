// ============================================================
// utils/datas.js
// Funções de data usadas nas telas (tudo em pt-BR).
// ============================================================

// "terça-feira, 8 de setembro"
export function dataPorExtenso(data = new Date()) {
  return data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

// "terça-feira, 8 de setembro" -> "Terça-Feira, 8 De Setembro"
export function capitalizarPalavras(texto) {
  return texto.replace(/(^|[\s-])(\p{L})/gu, (_, separador, letra) => separador + letra.toUpperCase())
}

// Devolve a data atual no fuso de São Paulo no formato "AAAA-MM-DD"
export function dataHojeSaoPaulo(agora = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(agora)
}
