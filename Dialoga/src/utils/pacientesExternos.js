// ============================================================
// utils/pacientesExternos.js
// Pacientes externos do profissional (RF304): quem não tem conta no Dialoga
// e foi cadastrado só pelo nome, "para organização interna e uso na agenda".
// O back não tem tabela para eles, então ficam guardados neste navegador
// (localStorage), separados por profissional (id do usuário da sessão).
// Mesmo padrão de profissionaisMemoria (externos do lado do paciente).
//   ehPacienteExterno(id)                     -> true para ids "ext-..." (os da API são números)
//   lerPacientesExternos(idUsuario)           -> pacientes no formato da lista de Pacientes
//   buscarPacienteExterno(idUsuario, id)      -> um paciente externo (ou undefined)
//   validarNomeExterno(nome)                  -> '' se o nome é válido, senão a mensagem de erro
//   adicionarPacienteExterno(idUsuario, nome) -> grava e devolve o paciente novo
//   removerPacienteExterno(idUsuario, id)     -> apaga o paciente (e as anotações dele)
//   listarAnotacoesExterno(idUsuario, idPaciente)          -> anotações privadas do externo
//   salvarAnotacaoExterno(idUsuario, idPaciente, dados)    -> cria ({ titulo, conteudo }) ou edita ({ id, ... })
//   excluirAnotacaoExterno(idUsuario, idPaciente, idNota)  -> apaga a anotação
// (o back só aceita anotação de paciente com vínculo aceito, então as do externo ficam aqui também)
// Lança Error com .message pronta para a tela quando não dá para gravar.
// ============================================================
import { dataLocalISO, textoParaBusca } from './formatadores.js'

const PREFIXO_ID = 'ext-'
const MIN_NOME = 3
const MAX_NOME = 100
// letras (com acento), espaço, apóstrofo e hífen
const REGEX_NOME = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/

const chavePacientes = (idUsuario) => `dialoga:pacientes-externos:${idUsuario}`
const chaveAnotacoes = (idUsuario, idPaciente) => `dialoga:anotacoes-externos:${idUsuario}:${idPaciente}`

// tira espaços das pontas e espaços repetidos do meio
const limparNome = (nome) => String(nome ?? '').trim().replace(/\s+/g, ' ')

// paciente guardado -> mesmo formato que paraPaciente (pacientesProfissionalService) devolve
const paraPaciente = (p) => ({
  id: p.id,
  idVinculo: null,
  nome: p.nome,
  email: null,
  telefone: null,
  origem: 'externo',
  pedidoPor: 'profissional',
  desde: p.desde, // 'AAAA-MM'
  proximaConsulta: null,
  status: 'ativo',
})

// id dos externos começa com "ext-"; os pacientes da API têm id numérico
export const ehPacienteExterno = (id) => String(id ?? '').startsWith(PREFIXO_ID)

// lê a lista guardada; dado corrompido ou armazenamento bloqueado vira lista vazia (não quebra a tela)
function lerGuardados(idUsuario) {
  if (idUsuario == null) return []
  try {
    const lista = JSON.parse(localStorage.getItem(chavePacientes(idUsuario)) ?? '[]')
    return Array.isArray(lista)
      ? lista.filter((p) => p && ehPacienteExterno(p.id) && typeof p.nome === 'string')
      : []
  } catch {
    return []
  }
}

// grava a lista inteira de volta no navegador
function gravarGuardados(idUsuario, lista) {
  try {
    localStorage.setItem(chavePacientes(idUsuario), JSON.stringify(lista))
  } catch {
    throw new Error('Não foi possível salvar o paciente neste navegador.')
  }
}

// pacientes externos do profissional, na ordem em que foram cadastrados
export function lerPacientesExternos(idUsuario) {
  return lerGuardados(idUsuario).map(paraPaciente)
}

// um paciente externo pelo id da URL
export function buscarPacienteExterno(idUsuario, id) {
  return lerPacientesExternos(idUsuario).find((p) => String(p.id) === String(id))
}

// obrigatoriedade, tamanho e formato do nome (RF304)
export function validarNomeExterno(nome) {
  const limpo = limparNome(nome)
  if (limpo.length < MIN_NOME) return 'Informe o nome completo do paciente.'
  if (limpo.length > MAX_NOME) return `O nome pode ter no máximo ${MAX_NOME} caracteres.`
  if (!REGEX_NOME.test(limpo)) return 'O nome deve conter apenas letras.'
  return ''
}

// cadastra o paciente externo e devolve no formato da lista
export function adicionarPacienteExterno(idUsuario, nome) {
  if (idUsuario == null) throw new Error('Não foi possível identificar o profissional. Faça login novamente.')

  const erro = validarNomeExterno(nome)
  if (erro) throw new Error(erro)

  const limpo = limparNome(nome)
  const guardados = lerGuardados(idUsuario)
  // mesmo nome (sem diferenciar maiúsculas/acentos) não entra duas vezes
  if (guardados.some((p) => textoParaBusca(p.nome) === textoParaBusca(limpo))) {
    throw new Error('Já existe um paciente externo com esse nome.')
  }

  const novo = { id: `${PREFIXO_ID}${Date.now().toString(36)}`, nome: limpo, desde: dataLocalISO().slice(0, 7) }
  gravarGuardados(idUsuario, [...guardados, novo])
  return paraPaciente(novo)
}

// apaga o paciente externo e as anotações dele
export function removerPacienteExterno(idUsuario, id) {
  gravarGuardados(idUsuario, lerGuardados(idUsuario).filter((p) => String(p.id) !== String(id)))
  try {
    localStorage.removeItem(chaveAnotacoes(idUsuario, id))
  } catch {
    // armazenamento bloqueado: o paciente já saiu da lista, as notas ficam órfãs e não aparecem
  }
}

// ---------- Anotações dos pacientes externos ----------
// Cada anotação: { id, titulo, conteudo, data ('AAAA-MM-DD') } — mesmo formato das notas da API.

// lê as notas guardadas; dado corrompido vira lista vazia
function lerAnotacoes(idUsuario, idPaciente) {
  try {
    const lista = JSON.parse(localStorage.getItem(chaveAnotacoes(idUsuario, idPaciente)) ?? '[]')
    return Array.isArray(lista) ? lista.filter((a) => a && a.id != null && typeof a.titulo === 'string') : []
  } catch {
    return []
  }
}

// grava as notas de volta no navegador
function gravarAnotacoes(idUsuario, idPaciente, lista) {
  try {
    localStorage.setItem(chaveAnotacoes(idUsuario, idPaciente), JSON.stringify(lista))
  } catch {
    throw new Error('Não foi possível salvar a anotação neste navegador.')
  }
}

// notas da mais antiga para a mais nova, como no Figma
export function listarAnotacoesExterno(idUsuario, idPaciente) {
  return lerAnotacoes(idUsuario, idPaciente).sort((a, b) => a.data.localeCompare(b.data) || String(a.id).localeCompare(String(b.id)))
}

// cria ({ titulo, conteudo }) ou edita ({ id, titulo, conteudo })
export function salvarAnotacaoExterno(idUsuario, idPaciente, { id, titulo, conteudo }) {
  const lista = lerAnotacoes(idUsuario, idPaciente)
  const nova =
    id != null
      ? lista.map((a) => (String(a.id) === String(id) ? { ...a, titulo, conteudo } : a))
      : [...lista, { id: `nota-${Date.now().toString(36)}`, titulo, conteudo, data: dataLocalISO() }]
  gravarAnotacoes(idUsuario, idPaciente, nova)
}

// apaga uma nota do externo
export function excluirAnotacaoExterno(idUsuario, idPaciente, idAnotacao) {
  const lista = lerAnotacoes(idUsuario, idPaciente).filter((a) => String(a.id) !== String(idAnotacao))
  gravarAnotacoes(idUsuario, idPaciente, lista)
}
