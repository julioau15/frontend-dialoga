// ============================================================
// filtros (Acompanhamento de respostas)
// Regras do filtro "Filtrar por período" (Todos | Dia | Mês | Ano) e a máscara do mês.
// Formato do período:
//   { tipo: 'todos' | 'dia' | 'mes' | 'ano', dia: 'AAAA-MM-DD' | '', mes: 'mm/aaaa' (texto digitado), ano: 'AAAA' | '' }
// Enquanto o campo do período estiver vazio ou incompleto, nada é filtrado (como no Figma).
// ============================================================

export const PERIODO_INICIAL = { tipo: 'todos', dia: '', mes: '', ano: '' }

// "092026" -> "09/2026" (só números, no máximo 6, com a barra depois do mês)
export function mascaraMes(texto) {
  const numeros = String(texto).replace(/\D/g, '').slice(0, 6)
  return numeros.length > 2 ? `${numeros.slice(0, 2)}/${numeros.slice(2)}` : numeros
}

// "09/2026" -> "2026-09"; null quando incompleto ou com mês fora de 01 a 12
export function mesParaIso(texto) {
  const partes = /^(\d{2})\/(\d{4})$/.exec(texto)
  if (!partes) return null
  const mes = Number(partes[1])
  return mes >= 1 && mes <= 12 ? `${partes[2]}-${partes[1]}` : null
}

// true quando a data ('AAAA-MM-DD') está dentro do período escolhido
export function noPeriodo(data, periodo) {
  if (periodo.tipo === 'dia' && periodo.dia) return data === periodo.dia
  if (periodo.tipo === 'mes') {
    const mes = mesParaIso(periodo.mes)
    return mes ? data.startsWith(mes) : true
  }
  if (periodo.tipo === 'ano' && periodo.ano) return data.startsWith(`${periodo.ano}-`)
  return true
}
