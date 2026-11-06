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
export const ROTA_PRIMEIRO_ACESSO_PROFISSIONAL = '/boas-vindas-profissional'

// Tela de primeiro acesso de cada nível (administrador não tem).
const ROTAS_PRIMEIRO_ACESSO = {
  [NIVEL.PROFISSIONAL]: ROTA_PRIMEIRO_ACESSO_PROFISSIONAL,
  [NIVEL.PACIENTE]: ROTA_PRIMEIRO_ACESSO,
}

// Devolve a rota inicial do nível, ou null se o nível for desconhecido.
export function rotaInicialPorNivel(nivel) {
  return ROTAS[nivel] ?? null
}

// Devolve a tela de primeiro acesso do nível, ou null se o nível não tem uma.
export function rotaPrimeiroAcessoPorNivel(nivel) {
  return ROTAS_PRIMEIRO_ACESSO[nivel] ?? null
}

// true se o usuário (paciente ou profissional) ainda não concluiu o primeiro acesso.
export function primeiroAcessoPendente({ nivel, id, primeiroAcessoConcluido: concluido }) {
  if (rotaPrimeiroAcessoPorNivel(nivel) === null) return false
  // sessão antiga não tem o campo: consulta o que ficou salvo no navegador
  return !(concluido ?? primeiroAcessoConcluido(id))
}

// Rota logo após o login: paciente e profissional no primeiro acesso vão para a
// tela de primeiro acesso; os demais vão direto para a própria área.
export function rotaAposLogin(auth) {
  if (primeiroAcessoPendente(auth)) return rotaPrimeiroAcessoPorNivel(auth.nivel)
  return rotaInicialPorNivel(auth.nivel)
}
