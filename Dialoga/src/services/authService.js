// ============================================================
// services/authService.js
// Comunicação com a API de autenticação. Só faz requisições:
// não mexe em tela nem em estado.
// ============================================================
import { API_URL } from '../config/api'
import { GOOGLE_CLIENT_ID } from '../config/google'

const NIVEL_PACIENTE = 2
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

  return montarSessao(data)
}

// Lê o conteúdo (payload) do ID token do Google. Só decodifica, não valida a assinatura.
function lerCredentialGoogle(credential) {
  try {
    const base64 = credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

// POST /auth/login/google/:id_google
// Recebe o "credential" (ID token) do Google, tira dele o id da conta (sub) e o e-mail
// e chama a rota que já existe no back: id na URL e { email } no body.
// Mesmo formato de retorno do loginRequest. Se a conta Google ainda não tiver cadastro,
// lança Error com erro.codigo = 'USUARIO_NAO_ENCONTRADO'.
export async function loginGoogleRequest(credential) {
  const google = lerCredentialGoogle(credential)
  if (!google?.sub || google.aud !== GOOGLE_CLIENT_ID || google.email_verified === false) {
    throw new Error('Não foi possível validar sua conta Google. Tente novamente.')
  }

  let res
  try {
    res = await fetch(`${API_URL}/auth/login/google/${encodeURIComponent(google.sub)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: google.email }),
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique se a API está rodando.')
  }

  const data = await res.json().catch(() => null)

  if (!data?.status) {
    const erro = new Error(
      data?.codigo === 'USUARIO_NAO_ENCONTRADO'
        ? 'Esta conta Google ainda não está cadastrada. Cadastre-se primeiro.'
        : data?.message ?? 'Erro ao entrar com Google. Tente novamente.'
    )
    erro.codigo = data?.codigo ?? null
    throw erro
  }

  return montarSessao(data)
}

// Transforma a resposta de sucesso do back (login por senha ou Google) na sessão do front.
async function montarSessao(data) {
  // Pegamos só o necessário (a resposta do back também traz senha_hash,
  // que não deve ser guardada no front)
    const { token, nivel, id, email: emailUsuario, primeiro_acesso_concluido, senha_provisoria } = data.response.auth[0]

  // O login só informa o primeiro acesso do paciente. Para o profissional
  // (nivel 1), pergunta ao back em GET /profissionais/me.
  const concluido = primeiro_acesso_concluido ?? (nivel === NIVEL_PROFISSIONAL ? await concluiuPrimeiroAcesso(token, 'profissionais/me', 'profissional') : nivel === NIVEL_PACIENTE ? await concluiuPrimeiroAcesso(token, 'pacientes/me', 'paciente') : undefined)

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

// Confere se o usuário já concluiu o primeiro acesso (rota "me" do profissional ou do paciente).
// Se a consulta falhar, considera que concluiu: é melhor deixar o usuário entrar no painel
// do que prendê-lo na tela de boas-vindas por causa de um erro de rede.
async function concluiuPrimeiroAcesso(token, rota, chave) {
  try {
    const res = await fetch(`${API_URL}/${rota}`, { headers: { 'x-access-token': token } })
    const dados = await res.json().catch(() => null)
    const registro = dados?.response?.[chave]?.[0]
    if (!res.ok || !registro) return true
    return Boolean(Number(registro.primeiro_acesso_concluido))
  } catch {
    return true
  }
}
