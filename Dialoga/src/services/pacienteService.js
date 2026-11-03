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