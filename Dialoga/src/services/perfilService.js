// ============================================================
// services/perfilService.js
// Requisições das telas de Perfil (paciente, profissional e administrador).
// Só faz requisições: sem tela e sem controle de estado.
//   carregarPerfil(auth, signal) -> GET  /pacientes/me | /profissionais/me | /administradores
//   salvarPerfil(auth, dados)    -> PUT  /pacientes/me | /profissionais/me | /administradores/me
//                                   (+ PUT /administradores/me/senha, se o admin trocar a senha)
// O token vai no header x-access-token.
// Os PUT são multipart/form-data (o back usa multer para a foto), então
// enviamos FormData e NÃO definimos o Content-Type (o navegador coloca o boundary).
// Em caso de erro lançam um Error com .message (texto para a tela),
// .status (HTTP) e .field (campo informado pelo back, ex.: "[SENHA_ATUAL] INCORRETA").
// ============================================================
import { API_URL } from '../config/api'
import { NIVEL } from '../utils/rotasPorNivel'
import { definirSenhaAdministrador } from './administradorService'
import { listarEspecialidadesRequest } from './cadastroService'

const ERRO_CONEXAO = 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'
const ERRO_SESSAO = 'Sua sessão expirou. Faça login novamente.'
const ERRO_SERVIDOR = 'Tivemos um problema no servidor. Tente novamente em instantes.'

// Faz a requisição e devolve o JSON da API quando der certo.
async function chamar(caminho, { token, method = 'GET', body, signal, mensagemErro }) {
  if (!token) {
    const erro = new Error(ERRO_SESSAO)
    erro.status = 401
    throw erro
  }

  let resposta
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method,
      headers: { 'x-access-token': token },
      body,
      signal,
    })
  } catch (erro) {
    if (signal?.aborted) throw erro // cancelamento: quem chamou ignora
    throw new Error(ERRO_CONEXAO, { cause: erro })
  }

  const dados = await resposta.json().catch(() => null)

  if (!resposta.ok || !dados?.status) {
    let mensagem = dados?.message || mensagemErro || 'Não foi possível concluir a ação.'
    if (resposta.status === 401) mensagem = ERRO_SESSAO
    // mensagens 500 do back são técnicas: troca por uma amigável
    if (resposta.status >= 500) mensagem = mensagemErro || ERRO_SERVIDOR

    const erro = new Error(mensagem)
    erro.status = resposta.status
    erro.field = dados?.field ?? null
    throw erro
  }

  return dados
}

// ------------------------------------------------------------
// Leitura
// ------------------------------------------------------------

// Devolve { dados, extras }.
//   dados  -> campos da tela, no mesmo formato para os três níveis
//   extras -> o que só a tela precisa para montar o formulário (profissional: opcoesEspecialidades)
export async function carregarPerfil(auth, signal) {
  const { token, nivel, id, email } = auth

  if (nivel === NIVEL.PACIENTE) {
    const resp = await chamar('/pacientes/me', {
      token,
      signal,
      mensagemErro: 'Não foi possível carregar seu perfil.',
    })
    const p = resp.response?.paciente?.[0]
    if (!p) throw new Error('O servidor não retornou o cadastro do paciente.')

    return {
      dados: {
        nome: p.nome_completo ?? '',
        apelido: p.apelido ?? '',
        email: p.email ?? email ?? '',
        celular: p.celular ?? '',
        fotoUrl: p.foto_avatar ?? null,
      },
      extras: {},
    }
  }

  if (nivel === NIVEL.PROFISSIONAL) {
    // perfil e lista de especialidades (pública) ao mesmo tempo
    const [resp, opcoes] = await Promise.all([
      chamar('/profissionais/me', { token, signal, mensagemErro: 'Não foi possível carregar seu perfil.' }),
      listarEspecialidadesRequest(),
    ])
    const p = resp.response?.profissional?.[0]
    if (!p) throw new Error('O servidor não retornou o cadastro do profissional.')

    // p.especialidade = [{ id, especialidade }] (some quando não há nenhuma)
    const minhas = Array.isArray(p.especialidade) ? p.especialidade : []

    return {
      dados: {
        nome: p.nome_completo ?? '',
        email: p.email ?? email ?? '',
        celular: p.celular ?? '',
        crp: p.crp ?? '',
        cpf: p.cpf ?? '',
        especialidades: minhas.map((e) => e.id), // ids (é o que o back recebe ao salvar)
        fotoUrl: p.foto_avatar ?? null,
      },
      extras: {
        opcoesEspecialidades: opcoes.map((e) => ({ id: e.id, texto: e.especialidade })),
      },
    }
  }

  if (nivel === NIVEL.ADMIN) {
    // O back não tem uma rota confiável de "administrador logado" (GET /administradores/me
    // usa o id do usuário como id do administrador). Igual ao AuthContext, buscamos a
    // lista e ficamos com o registro do usuário da sessão.
    const resp = await chamar('/administradores', {
      token,
      signal,
      mensagemErro: 'Não foi possível carregar seu perfil.',
    })
    const lista = resp.response?.administrador ?? []
    const a = lista.find((item) => Number(item.id_usuario) === Number(id))
    if (!a) throw new Error('O servidor não retornou o cadastro do administrador.')

    return {
      dados: {
        nome: a.nome_completo ?? '',
        email: a.email ?? email ?? '',
        celular: a.celular ?? '',
        fotoUrl: a.foto_avatar ?? null,
      },
      extras: {},
    }
  }

  throw new Error('Tipo de usuário desconhecido.')
}

// ------------------------------------------------------------
// Escrita
// ------------------------------------------------------------

// Monta o FormData. Sempre envia todos os campos de texto: o back converte
// campo ausente no texto "undefined".
function montarFormulario(campos, foto) {
  const form = new FormData()
  Object.entries(campos).forEach(([chave, valor]) => form.append(chave, valor))
  if (foto) form.append('foto_avatar', foto)
  return form
}

// Salva o perfil. `rascunho` é o que a tela está editando (inclui `fotoArquivo`
// quando a pessoa escolheu uma foto nova). Depois do PUT, busca o perfil de novo
// e devolve os novos "valores" da tela (assim a URL da foto nova vem do servidor).
export async function salvarPerfil(auth, rascunho) {
  const { token, nivel } = auth
  const foto = rascunho.fotoArquivo ?? null
  const mensagemErro = 'Não foi possível salvar seu perfil. Tente novamente.'

  if (nivel === NIVEL.PACIENTE) {
    await chamar('/pacientes/me', {
      token,
      method: 'PUT',
      body: montarFormulario(
        {
          nome_completo: rascunho.nome.trim(),
          apelido: (rascunho.apelido ?? '').trim(), // vazio vira NULL no back
          celular: rascunho.celular,
        },
        foto,
      ),
      mensagemErro,
    })
    return (await carregarPerfil(auth)).dados
  }

  if (nivel === NIVEL.PROFISSIONAL) {
    await chamar('/profissionais/me', {
      token,
      method: 'PUT',
      body: montarFormulario(
        {
          nome_completo: rascunho.nome.trim(),
          celular: rascunho.celular,
          // o back apaga e regrava as especialidades: sempre mandar a lista inteira
          id_especialidade: JSON.stringify(rascunho.especialidades),
        },
        foto,
      ),
      mensagemErro,
    })
    return (await carregarPerfil(auth)).dados
  }

  if (nivel === NIVEL.ADMIN) {
    // A troca de senha vem primeiro: se a senha atual estiver errada, nada é salvo.
    const querTrocarSenha = Boolean(rascunho.senhaAtual || rascunho.novaSenha || rascunho.confirmarSenha)
    if (querTrocarSenha) {
      await definirSenhaAdministrador(token, { senhaAtual: rascunho.senhaAtual, novaSenha: rascunho.novaSenha })
    }

    try {
      await chamar('/administradores/me', {
        token,
        method: 'PUT',
        body: montarFormulario({ nome_completo: rascunho.nome.trim(), celular: rascunho.celular }, foto),
        mensagemErro,
      })
    } catch (erro) {
      // Só a foto falhou: o back já gravou nome e celular. Recarrega o perfil e devolve um
      // aviso (o hook mostra no toast) em vez de tratar tudo como erro.
      if (String(erro.field ?? '').startsWith('[FOTO_AVATAR]')) {
        const dados = await carregarPerfil(auth)
        const salvo = querTrocarSenha ? 'Senha e dados salvos' : 'Dados salvos'
        return { ...dados, aviso: `${salvo}, mas não foi possível enviar a foto. Confira a configuração do Azure no servidor.` }
      }

      // A senha já foi trocada no passo anterior e não volta atrás. Se só avisássemos o erro,
      // a tela manteria a senha ANTIGA digitada, e uma nova tentativa falharia com
      // "Senha atual incorreta". Por isso avisamos e pedimos para limpar os campos de senha.
      if (querTrocarSenha && !erro.senhaAlterada) {
        erro.senhaAlterada = true
        erro.limparCampos = { senhaAtual: '', novaSenha: '', confirmarSenha: '' }
        erro.message = `Sua senha foi alterada, mas o restante do perfil não foi salvo. ${erro.message}`
      }
      throw erro
    }
    return (await carregarPerfil(auth)).dados
  }

  throw new Error('Tipo de usuário desconhecido.')
}
