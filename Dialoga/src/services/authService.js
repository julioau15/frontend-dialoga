// ============================================================
// services/authService.js
// Comunicação com a API de autenticação. Só faz requisições:
// não mexe em tela nem em estado.
// ============================================================
import { API_URL } from '../config/api'

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
  const { token, nivel, id, email: emailUsuario } = data.response.auth[0]
  return { token, nivel, id, email: emailUsuario }
}
