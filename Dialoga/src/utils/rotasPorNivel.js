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

// Tela de primeiro acesso de cada nível (admin não tem)
const ROTAS_PRIMEIRO_ACESSO = {
  [NIVEL.ADMIN]: '/primeiro-acesso',
  [NIVEL.PROFISSIONAL]: '/boas-vindas-profissional',
  [NIVEL.PACIENTE]: '/personalizar-experiencia',
}

// Mantida para quem já importava: é a tela de primeiro acesso do paciente
export const ROTA_PRIMEIRO_ACESSO = ROTAS_PRIMEIRO_ACESSO[NIVEL.PACIENTE]

// Devolve a rota inicial do nível, ou null se o nível for desconhecido.
export function rotaInicialPorNivel(nivel) {
  return ROTAS[nivel] ?? null
}

// Devolve a tela de primeiro acesso do nível, ou null se o nível não tem primeiro acesso.
export function rotaPrimeiroAcesso(nivel) {
  return ROTAS_PRIMEIRO_ACESSO[nivel] ?? null
}

// true se esse usuário ainda precisa passar pelo primeiro acesso.
// sessão antiga não tem o campo: consulta o que ficou salvo no navegador.
export function precisaPrimeiroAcesso({ nivel, id, primeiroAcessoConcluido: concluido, senhaProvisoria }) {
  if (!rotaPrimeiroAcesso(nivel)) return false
  // Administrador: pendente enquanto a senha for provisória (sessão sem o campo entra normalmente)
  if (nivel === NIVEL.ADMIN) return senhaProvisoria === 1
  return !(concluido ?? primeiroAcessoConcluido(id))
}

// Rota logo após o login: paciente e profissional no primeiro acesso vão para a
// tela de boas-vindas deles; os demais vão direto para a própria área.
export function rotaAposLogin(auth) {
  if (precisaPrimeiroAcesso(auth)) return rotaPrimeiroAcesso(auth.nivel)
  return rotaInicialPorNivel(auth.nivel)
}
