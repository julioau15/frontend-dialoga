// ============================================================
// utils/graficoSono.js
// Contas do gráfico de linha das horas de sono. Usadas pelo gráfico da tela (Dashboard e
// Relatórios: pages/paciente/Dashboard/components/SonoSemana) e pelo PDF de Relatórios
// (utils/exportarRelatorio), para os dois desenhos saírem iguais.
//   escalaSono(horas, ideal)   -> { yMin, yMax, guias } do eixo Y
//   segmentosSuaves(pontos)    -> curva suave que passa por todos os pontos (Bézier)
// ============================================================

// escala padrão 4h–10h; se algum dia passar disso, a escala aumenta (nenhum ponto fica fora do gráfico)
export const Y_MIN = 4
export const Y_MAX = 10
export const PASSO_GUIAS = 2
export const MAX_ROTULOS = 7 // com mais dias, os rótulos de baixo pulam e os valores somem

export function escalaSono(horas, ideal) {
  const validas = horas.filter((h) => Number.isFinite(h))
  const yMin = Math.min(Y_MIN, Math.floor(Math.min(...validas, ideal) / PASSO_GUIAS) * PASSO_GUIAS)
  const yMax = Math.max(Y_MAX, Math.ceil(Math.max(...validas, ideal) / PASSO_GUIAS) * PASSO_GUIAS)
  const guias = Array.from({ length: (yMax - yMin) / PASSO_GUIAS + 1 }, (_, i) => yMin + i * PASSO_GUIAS)
  return { yMin, yMax, guias }
}

// Catmull-Rom -> Bézier: para cada trecho entre dois pontos, os dois pontos de controle e o destino
//   pontos -> [{ x, y }]; devolve [{ c1x, c1y, c2x, c2y, x, y }] (vazio com menos de 2 pontos)
export function segmentosSuaves(pontos) {
  const segmentos = []
  for (let i = 0; i < pontos.length - 1; i++) {
    const p0 = pontos[i - 1] ?? pontos[i]
    const p1 = pontos[i]
    const p2 = pontos[i + 1]
    const p3 = pontos[i + 2] ?? p2
    segmentos.push({
      c1x: p1.x + (p2.x - p0.x) / 6,
      c1y: p1.y + (p2.y - p0.y) / 6,
      c2x: p2.x - (p3.x - p1.x) / 6,
      c2y: p2.y - (p3.y - p1.y) / 6,
      x: p2.x,
      y: p2.y,
    })
  }
  return segmentos
}
