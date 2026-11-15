// ============================================================
// datasPerfil
// Datas do perfil do paciente por extenso, como no Figma:
//   "Desde março de 2025" (cabeçalho) e "15 de março de 2025" (anotações).
// Trocam o texto, sem criar Date, para o dia não mudar por fuso horário.
// ============================================================
const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

// '2025-03' -> 'março de 2025'; valor inválido -> ''
export function formatarMesAnoExtenso(anoMes = '') {
  const [ano, mes] = String(anoMes).split('-')
  const nomeMes = MESES[Number(mes) - 1]
  return ano && nomeMes ? `${nomeMes} de ${ano}` : ''
}

// '2025-03-15' -> '15 de março de 2025'; valor inválido -> ''
export function formatarDataExtenso(iso = '') {
  const [ano, mes, dia] = String(iso).slice(0, 10).split('-')
  const nomeMes = MESES[Number(mes) - 1]
  return ano && nomeMes && dia ? `${Number(dia)} de ${nomeMes} de ${ano}` : ''
}
