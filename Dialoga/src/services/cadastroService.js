// ============================================================
// services/cadastroService.js
// Cria a conta na API. Só faz requisições (sem tela e sem estado).
//   paciente     -> POST /pacientes
//   profissional -> POST /profissionais
//   especialidades (lista para o formulário) -> GET /especialidades (pública)
// O back recebe os dois cadastros como multipart/form-data (usa multer para
// a foto), por isso enviamos FormData e NÃO definimos o Content-Type
// (o navegador coloca o correto, com o boundary).
// ============================================================
import { API_URL } from '../config/api'

const ENDPOINTS = {
  paciente: '/pacientes',
  profissional: '/profissionais',
}

const ERRO_CONEXAO = 'Não foi possível conectar ao servidor. Verifique se a API está rodando.'

// O back diz qual campo deu problema em "field", ex.: "[CPF] INVÁLIDO" ou "[EMAIL] JÁ CADASTRADO".
// Aqui convertemos para o nome do campo do formulário (ou null se não for um campo conhecido).
const CAMPO_DA_API = {
  nome_completo: 'nome',
  email: 'email',
  celular: 'celular',
  cpf: 'cpf',
  crp: 'crp',
  senha: 'senha',
  id_especialidade: 'especialidades',
}

function campoDoErro(field) {
  const nome = /\[(\w+)\]/.exec(field ?? '')?.[1]?.toLowerCase()
  return CAMPO_DA_API[nome] ?? null
}

// Cria a conta. Dados da especialidade: dados.id_especialidade = [1, 3] (lista de ids).
// Em caso de erro lança um Error com .message (texto para mostrar) e .campo (campo do formulário, se souber).
export async function cadastrarRequest(tipo, dados) {
  const form = new FormData()
  Object.entries(dados).forEach(([chave, valor]) => {
    // listas viajam como JSON dentro do FormData: [1,3] -> "[1,3]"
    form.append(chave, Array.isArray(valor) ? JSON.stringify(valor) : valor)
  })

  let res
  try {
    res = await fetch(`${API_URL}${ENDPOINTS[tipo]}`, { method: 'POST', body: form })
  } catch {
    throw new Error(ERRO_CONEXAO)
  }

  const data = await res.json().catch(() => null)

  if (!data?.status) {
    if (res.status === 401 || res.status === 403)
      throw new Error('O servidor bloqueou o cadastro. Tente novamente mais tarde.')

    // 400 (campo inválido) e 409 (e-mail/CPF/CRP já cadastrado): o back manda a mensagem e o campo
    const erro = new Error(data?.message ?? 'Erro ao criar a conta. Tente novamente.')
    erro.campo = campoDoErro(data?.field)
    throw erro
  }

  return data
}

// GET /auth/verificar-cadastro?email=&celular=&cpf=&crp=
// Usada no passo 1: confere se e-mail e celular (e CPF/CRP, no profissional) já estão cadastrados,
// para avisar logo, antes de pedir a senha. Se já existir, lança um Error com .message e .campo.
// Se não conseguir falar com a API, deixa passar (o envio final trata o erro de novo).
export async function verificarCadastroRequest({ email, celular, cpf, crp }) {
  const params = new URLSearchParams({ email })
  if (celular) params.set('celular', celular)
  if (cpf) params.set('cpf', cpf)
  if (crp) params.set('crp', crp)

  let res
  try {
    res = await fetch(`${API_URL}/auth/verificar-cadastro?${params}`)
  } catch {
    return
  }

  const data = await res.json().catch(() => null)

  if (res.status === 409 && data && !data.status) {
    const erro = new Error(data.message ?? 'Dados já cadastrados.')
    erro.campo = campoDoErro(data.field)
    throw erro
  }
}

// GET /especialidades -> [{ id, especialidade }]
// Lista pública (não precisa de login), usada no formulário de cadastro do profissional.
export async function listarEspecialidadesRequest() {
  let res
  try {
    res = await fetch(`${API_URL}/especialidades`)
  } catch {
    throw new Error(ERRO_CONEXAO)
  }

  const data = await res.json().catch(() => null)

  if (!data?.status) throw new Error('Não foi possível carregar as especialidades.')

  return data.response.especialidade
}
