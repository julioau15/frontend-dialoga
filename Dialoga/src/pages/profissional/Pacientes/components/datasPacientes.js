// ============================================================
// datasPacientes
// Datas do cartão do paciente (RF306), no formato do Figma:
// "Desde mar. de 2025" e a próxima consulta "10/09/2026"
// (esta última usa o formatarDataBR de utils/formatadores).
// Fica aqui (e não em utils/formatadores.js) para não mexer em arquivos
// compartilhados; se outra tela precisar, dá para mover depois.
// ============================================================
const MESES = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.']

// '2025-03' -> 'mar. de 2025' (usado em "Desde mar. de 2025"); valor inválido -> ''
export function formatarDesde(anoMes = '') {
  const [ano, mes] = String(anoMes).split('-')
  const nomeMes = MESES[Number(mes) - 1]
  return ano && nomeMes ? `${nomeMes} de ${ano}` : ''
}

// mês atual em 'AAAA-MM' (o "Desde" de um paciente recém-adicionado)
export function mesAtual() {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
}
