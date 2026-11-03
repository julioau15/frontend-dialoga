// ============================================================
// utils/rotasPorNivel.js
// Define para qual tela o usuário vai depois do login.
// O "nivel" vem do back-end: 0 = administrador, 1 = profissional, 2 = paciente.
// ============================================================
import { primeiroAcessoConcluido } from './primeiroAcesso'

export const NIVEL = { ADMIN: 0, PROFISSIONAL: 1, PACIENTE: 2 }

const ROTAS = {
  [NIVEL.ADMIN]: '/admin/dashboard',
  [NIVEL.PROFISSIONAL]: '/profissional/dashboard',
  [NIVEL.PACIENTE]: '/paciente/dashboard',
}

export const ROTA_PRIMEIRO_ACESSO = '/personalizar-experiencia'

// Devolve a rota inicial do nível, ou null se o nível for desconhecido.
export function rotaInicialPorNivel(nivel) {
  return ROTAS[nivel] ?? null
}

// Rota logo após o login: paciente no primeiro acesso vai para as perguntas
// de personalização; os demais vão direto para a própria área.
export function rotaAposLogin({ nivel, id, primeiroAcessoConcluido: concluido }) {
  // sessão antiga não tem o campo: consulta o que ficou salvo no navegador
  if (nivel === NIVEL.PACIENTE && !(concluido ?? primeiroAcessoConcluido(id))) return ROTA_PRIMEIRO_ACESSO
  return rotaInicialPorNivel(nivel)
}
