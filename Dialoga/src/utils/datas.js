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
