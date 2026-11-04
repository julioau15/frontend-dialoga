// ============================================================
// services/pacienteService.js
// Consulta os dados do paciente autenticado na API.
// Só faz requisições (sem tela e sem controle de estado).
//   buscarMeuPaciente -> GET /pacientes/me
// O token é enviado no header x-access-token.
// O back identifica o paciente pelo token, sem receber seu ID.
// Como a consulta não envia corpo, não usamos FormData.
// O parâmetro signal permite cancelar a requisição.
// ============================================================

import { API_URL } from '../config/api'

// Busca os dados do paciente associado à sessão atual.
// token: credencial recebida no login, usada pelo back para identificar o usuário.
// signal: permite que o código que chamou esta função cancele a requisição,
// por exemplo, quando o usuário sair da página antes de ela terminar.
export async function buscarMeuPaciente(token, signal) {
    // Sem token, não é possível realizar uma consulta autenticada.
    // Interrompe a função antes de enviar uma requisição desnecessária à API.
    if (!token) {
        throw new Error('Sua sessão não está disponível. Faça login novamente.')
    }

    // Aguarda a resposta da API para a consulta do paciente autenticado.
    // API_URL deve estar importada da configuração da aplicação.
    // A rota /pacientes/me identifica o paciente pelo token;
    // por isso, não enviamos um ID no endereço nem no corpo da requisição.
    const resposta = await fetch(`${API_URL}/pacientes/me`, {
        // GET consulta os dados, sem solicitar sua alteração.
        method: 'GET',

        // Envia o token no header esperado pelo back.
        // Não definimos Content-Type porque esta requisição não envia um corpo.
        headers: {
            'x-access-token': token,
        },

        // Vincula a requisição ao AbortSignal recebido como argumento.
        // Se o cancelamento for acionado, o fetch pode rejeitar com AbortError.
        // Quem chamou esta função deve tratar esse cancelamento.
        signal,
    }).catch((erro) => {
        // Cancelamento não é falha de conexão: repassa como veio, para o hook ignorar.
        if (signal?.aborted) throw erro
        throw new Error(ERRO_CONEXAO, { cause: erro })
    })

    // Tenta interpretar o corpo da resposta como JSON.
    // O fetch não rejeita automaticamente quando a API responde com 400 ou 500;
    // portanto, precisamos ler a resposta e verificar seu resultado abaixo.
    // Se a leitura ou a conversão falhar, usamos null como retorno alternativo.
    // Evita quebrar a leitura caso o servidor devolva uma resposta sem JSON.
    const dados = await resposta.json().catch(() => null)


    // Verifica duas condições:
    // 1. resposta.ok: o status HTTP está entre 200 e 299.
    // 2. dados.status: o JSON possui um valor verdadeiro nesse campo,
    //    conforme a condição de sucesso adotada neste serviço.
    // Se qualquer condição falhar, a consulta é tratada como erro.
    if (!resposta.ok || !dados?.status) {

        // O status HTTP 401 indica que a requisição não foi autenticada.
        // Isso pode acontecer, por exemplo, quando o token expirou ou é inválido.
        if (resposta.status === 401) {
            throw new Error('Sua sessão expirou. Faça login novamente.')
        }

        // As mensagens 500 do back são técnicas: não mostramos ao paciente.
        if (resposta.status >= 500) {
            throw new Error('Não foi possível carregar seus dados.')
        }

        throw new Error(
            dados?.message || 'Não foi possível carregar seus dados.'
        )
    }


    // Acessa o primeiro paciente no formato de resposta esperado:
    // { response: { paciente: [ { ...dadosDoPaciente } ] } }
    // O operador ?. evita um erro de acesso se response ou paciente
    // estiverem ausentes; nesse caso, o resultado será undefined.
    // O controller atual retorna o paciente neste array.
    const paciente = dados.response?.paciente?.[0]

    // Mesmo com uma resposta de sucesso, precisamos verificar se existe
    // um cadastro no local esperado antes de devolvê-lo para a página.
    if (!paciente) {
        throw new Error('O servidor não retornou o cadastro do paciente.')
    }

    // Devolve somente o objeto do paciente.
    // O hook poderá usá-lo para preencher nome, apelido e nascimento,
    // mantendo o controle do formulário separado das requisições à API.
    return paciente
}

// ============================================================
// Requisições usadas nas etapas 2 e 3 do "Personalizar experiência":
//   buscarProfissionais   -> GET  /profissionais/busca?q=texto
//   vincularProfissional  -> POST /pacientes/me/profissionais/:id
//   salvarRegistroHumor   -> POST /pacientes/me/registros-humor
//   salvarPrimeiroAcesso  -> POST /pacientes/me/primeiro-acesso
// Em caso de erro, todas lançam um Error com .message pronta para a tela
// e .status com o código HTTP (quando houver resposta).
// ============================================================

const ERRO_CONEXAO = 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'
const ERRO_SESSAO = 'Sua sessão expirou. Faça login novamente.'
const ERRO_SERVIDOR = 'Tivemos um problema no servidor. Tente novamente em instantes.'

// Faz a requisição autenticada e devolve o JSON da API quando der certo.
//   caminho -> ex.: '/profissionais/busca?q=ana'
//   opcoes  -> { token, method, body, signal, mensagemErro }
// body (objeto) é enviado como JSON.
async function requisicao(caminho, { token, method = 'GET', body, signal, mensagemErro }) {
    // Sem token não adianta chamar a API: ela responderia 401
    if (!token) {
        const erro = new Error(ERRO_SESSAO)
        erro.status = 401
        throw erro
    }

    const headers = { 'x-access-token': token }

    // IMPORTANTE: o back compara o Content-Type exatamente com "application/json".
    // Não acrescente "; charset=utf-8", senão a API responde 415.
    if (body !== undefined) headers['Content-Type'] = 'application/json'

    let resposta
    try {
        resposta = await fetch(`${API_URL}${caminho}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal,
        })
    } catch (erro) {
        // Cancelamento (AbortController) não é falha de conexão: repassa como veio,
        // para quem chamou reconhecer e ignorar.
        if (signal?.aborted) throw erro
        throw new Error(ERRO_CONEXAO, { cause: erro })
    }

    // Mesmo cuidado do buscarMeuPaciente: o fetch não rejeita em 400/500
    const dados = await resposta.json().catch(() => null)

    if (!resposta.ok || !dados?.status) {
        let mensagem = dados?.message || mensagemErro || 'Não foi possível concluir a ação.'

        if (resposta.status === 401) mensagem = ERRO_SESSAO
        // As mensagens 500 do back são técnicas ("[ERRO NA CONTROLLER]"): trocamos por uma amigável
        if (resposta.status >= 500) mensagem = mensagemErro || ERRO_SERVIDOR

        const erro = new Error(mensagem)
        erro.status = resposta.status
        erro.campo = dados?.field // ex.: "[HORAS_SONO] INVÁLIDO" (útil para depurar)
        throw erro
    }

    return dados
}

// GET /profissionais/busca?q=texto
// Devolve até 8 profissionais APROVADOS que tenham o texto no nome ou no começo do e-mail:
//   [{ id, nome_completo, foto_avatar, especialidades: "Psicologia Clínica, ..." }]
// O back devolve lista vazia se o texto tiver menos de 2 ou mais de 100 caracteres.
export async function buscarProfissionais(token, termo, signal) {
    const params = new URLSearchParams({ q: termo })

    const dados = await requisicao(`/profissionais/busca?${params}`, {
        token,
        signal,
        mensagemErro: 'Não foi possível buscar os profissionais.',
    })

    return dados.response?.profissional ?? []
}

// POST /pacientes/me/profissionais/:id (sem corpo)
// Cria o vínculo paciente-profissional; o profissional ainda precisa aceitar.
export async function vincularProfissional(token, idProfissional) {
    return requisicao(`/pacientes/me/profissionais/${encodeURIComponent(idProfissional)}`, {
        token,
        method: 'POST',
        mensagemErro: 'Não foi possível enviar a solicitação ao profissional.',
    })
}

// POST /pacientes/me/registros-humor
// registro = { sentimento, energia, humor, padrao_pensamentos, horas_sono, relato }
export async function salvarRegistroHumor(token, registro) {
    return requisicao('/pacientes/me/registros-humor', {
        token,
        method: 'POST',
        body: registro,
        mensagemErro: 'Não foi possível salvar seu registro de humor.',
    })
}

// POST /pacientes/me/primeiro-acesso
// dados = { apelido, data_nascimento } (os dois podem ser null)
// O back salva os dados e marca primeiro_acesso_concluido = 1.
export async function salvarPrimeiroAcesso(token, dados) {
    return requisicao('/pacientes/me/primeiro-acesso', {
        token,
        method: 'POST',
        body: dados,
        mensagemErro: 'Não foi possível salvar suas informações.',
    })
}