import { PERFIS } from '../types'

// Para onde cada perfil vai após o login ou ao acessar uma área que não é dele
export const ROTA_INICIAL_POR_PERFIL = {
  [PERFIS.PACIENTE]: '/paciente',
  [PERFIS.PROFISSIONAL]: '/profissional',
  [PERFIS.ADMIN]: '/admin',
}

export const ROTA_LOGIN = '/login'
