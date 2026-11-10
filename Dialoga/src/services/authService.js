// ============================================================
// services/authService.js
// Comunicação com a API de autenticação. Só faz requisições:
// não mexe em tela nem em estado.
// ============================================================
import { API_URL } from '../config/api'

const NIVEL_PROFISSIONAL = 1 // mesmo número de NIVEL.PROFISSIONAL em utils/rotasPorNivel.js

// POST /auth/login
// Envia e-mail e senha. Se der certo, devolve { token, nivel, id, email }.
// Se der errado, lança um Error com a mensagem para mostrar ao usuário
// (e, quando o back informar, o motivo em erro.codigo).
export async function loginRequest(email, senha) {
  let res
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    })
  } catch {
    // fetch só falha aqui quando não consegue falar com o servidor
    throw new Error('Não foi possível conectar ao servidor. Verifique se a API está rodando.')
  }

  const data = await res.json().catch(() => null)

  // O back responde { status: true/false, ... }
  if (!data?.status) {
    if (res.status === 401) throw new Error('E-mail ou senha incorretos.')

    // 403 = profissional ainda não liberado. O back manda um "codigo":
    //   PROFISSIONAL_EM_ANALISE | PROFISSIONAL_RECUSADO
    // e a tela de login decide o que fazer com ele (erro.codigo).
    const erro = new Error(data?.message ?? 'Erro ao fazer login. Tente novamente.')
    erro.codigo = data?.codigo ?? null
    throw erro
  }

  // Pegamos só o necessário (a resposta do back também traz senha_hash,
  // que não deve ser guardada no front)
    const { token, nivel, id, email: emailUsuario, primeiro_acesso_concluido, senha_provisoria } = data.response.auth[0]

  // O login só informa o primeiro acesso do paciente. Para o profissional
  // (nivel 1), pergunta ao back em GET /profissionais/me.
  const concluido = primeiro_acesso_concluido ?? (nivel === NIVEL_PROFISSIONAL ? await profissionalConcluiuPrimeiroAcesso(token) : undefined)

  return {
    token,
    nivel,
    id,
    email: emailUsuario,
    primeiroAcessoConcluido: Boolean(concluido), // o back manda 0/1
    // Só vem para administrador: 1 = precisa definir a senha, 0 = senha definida
    senhaProvisoria: senha_provisoria === undefined ? undefined : Number(senha_provisoria),
  }
}

// Confere se o profissional já concluiu o primeiro acesso.
// Se a consulta falhar, considera que concluiu: é melhor deixar o profissional
// entrar no painel do que prendê-lo na tela de boas-vindas por causa de um erro de rede.
async function profissionalConcluiuPrimeiroAcesso(token) {
  try {
    const res = await fetch(`${API_URL}/profissionais/me`, { headers: { 'x-access-token': token } })
    const dados = await res.json().catch(() => null)
    const profissional = dados?.response?.profissional?.[0]
    if (!res.ok || !profissional) return true
    return Boolean(Number(profissional.primeiro_acesso_concluido))
  } catch {
    return true
  }
}
