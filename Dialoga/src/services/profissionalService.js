// ============================================================
// services/profissionalService.js
// Requisições do profissional autenticado (primeiro acesso).
// Só faz requisições: sem tela e sem controle de estado.
//   buscarMeuProfissional      -> GET  /profissionais/me
//   buscarPacientes            -> GET  /pacientes/busca?busca=texto
//   vincularPaciente           -> POST /profissionais/me/pacientes/:id
//   concluirPrimeiroAcesso     -> POST /profissionais/me/primeiro-acesso
// Em caso de erro, todas lançam um Error com .message pronta para a tela
// e .status com o código HTTP (quando houver resposta).
// O token vai no header x-access-token (a lógica está em "requisicao",
// a mesma usada pelo pacienteService).
// ============================================================
import { requisicao } from './pacienteService'

// GET /profissionais/me
// Devolve o cadastro do profissional da sessão (inclui primeiro_acesso_concluido: 0 | 1).
export async function buscarMeuProfissional(token, signal) {
    const dados = await requisicao('/profissionais/me', {
        token,
        signal,
        mensagemErro: 'Não foi possível carregar seus dados.',
    })

    const profissional = dados.response?.profissional?.[0]
    if (!profissional) throw new Error('O servidor não retornou o cadastro do profissional.')

    return profissional
}

// GET /pacientes/busca?busca=texto
// Devolve os pacientes que tenham o texto no nome ou no e-mail:
//   [{ id, nome_completo, apelido, foto_avatar, email, ... }]
// O back responde 404 quando nada é encontrado: aqui isso vira lista vazia.
export async function buscarPacientes(token, termo, signal) {
    const params = new URLSearchParams({ busca: termo })

    try {
        const dados = await requisicao(`/pacientes/busca?${params}`, {
            token,
            signal,
            mensagemErro: 'Não foi possível buscar os pacientes.',
        })

        return dados.response?.paciente ?? []
    } catch (erro) {
        if (erro.status === 404) return []
        throw erro
    }
}

// POST /profissionais/me/pacientes/:id (sem corpo)
// Cria o vínculo profissional-paciente; o paciente ainda precisa aceitar.
// idPaciente = id do PACIENTE (campo "id" devolvido pela busca).
export async function vincularPaciente(token, idPaciente) {
    return requisicao(`/profissionais/me/pacientes/${encodeURIComponent(idPaciente)}`, {
        token,
        method: 'POST',
        mensagemErro: 'Não foi possível enviar a solicitação ao paciente.',
    })
}

// POST /profissionais/me/primeiro-acesso (sem corpo)
// O back marca primeiro_acesso_concluido = 1 para o profissional da sessão.
export async function concluirPrimeiroAcesso(token) {
    return requisicao('/profissionais/me/primeiro-acesso', {
        token,
        method: 'POST',
        mensagemErro: 'Não foi possível concluir o primeiro acesso.',
    })
}
