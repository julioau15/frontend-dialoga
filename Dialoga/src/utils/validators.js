// ============================================================
// utils/validators.js
// Funções de validação dos formulários (antes de chamar a API).
// ============================================================

// Formato básico de e-mail: texto@texto.texto
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Limites iguais aos do back-end (controller_auth.js)
const MAX_EMAIL = 150
const MAX_SENHA = 30

// Recebe { email, senha } e devolve um objeto com as mensagens de erro
// de cada campo. Objeto vazio = tudo certo.
// Ex.: { email: 'E-mail inválido.' }
export function validarLogin({ email, senha }) {
  const erros = {}

  if (!email.trim()) erros.email = 'Informe seu e-mail.'
  else if (!REGEX_EMAIL.test(email.trim()) || email.length > MAX_EMAIL) erros.email = 'E-mail inválido.'

  if (!senha.trim()) erros.senha = 'Informe sua senha.'
  else if (senha.length > MAX_SENHA) erros.senha = `A senha deve ter no máximo ${MAX_SENHA} caracteres.`

  return erros
}

// ---------- Cadastro ----------
const MAX_NOME = 150
const MIN_SENHA = 6

// Deixa só os números de um texto
const soNumeros = (texto) => texto.replace(/\D/g, '')

// Máscara de celular: (11) 99999-9999
export function mascararCelular(valor) {
  const n = soNumeros(valor).slice(0, 11)
  if (n.length <= 2) return n
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
}

// Máscara de CPF: 000.000.000-00
export function mascararCpf(valor) {
  const n = soNumeros(valor).slice(0, 11)
  return n
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

export const limparCpf = soNumeros

// CPF válido = 11 números (não todos iguais) + 2 dígitos verificadores (mesma regra do back-end)
export function cpfValido(valor) {
  const cpf = soNumeros(valor)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

  const digito = (base) => {
    let soma = 0
    for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (base.length + 1 - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }

  return digito(cpf.slice(0, 9)) === Number(cpf[9]) && digito(cpf.slice(0, 10)) === Number(cpf[10])
}

// Passo 1 do cadastro: tipo, nome, e-mail, celular (+ CPF, CRP e especialidades se for profissional)
export function validarCadastroDados({ tipo, nome, email, celular, cpf, crp, especialidades = [] }) {
  const erros = {}

  if (nome.trim().split(/\s+/).filter(Boolean).length < 2 || nome.length > MAX_NOME)
    erros.nome = 'Informe seu nome completo.'

  if (!email.trim()) erros.email = 'Informe seu e-mail.'
  else if (!REGEX_EMAIL.test(email.trim()) || email.length > MAX_EMAIL) erros.email = 'E-mail inválido.'

  const digitos = soNumeros(celular).length
  if (digitos < 10 || digitos > 11) erros.celular = 'Informe um celular válido com DDD.'

  if (tipo === 'profissional') {
    if (soNumeros(cpf).length !== 11) erros.cpf = 'CPF deve ter 11 números.'
    else if (!cpfValido(cpf)) erros.cpf = 'CPF inválido.'

    if (!crp.trim() || crp.length > 20) erros.crp = 'Informe seu CRP.'

    if (especialidades.length === 0) erros.especialidades = 'Selecione ao menos uma especialidade.'
  }

  return erros
}

// Passo 2 do cadastro: senha e confirmação
export function validarCadastroSenha({ senha, confirmarSenha }) {
  const erros = {}

  if (senha.length < MIN_SENHA) erros.senha = `A senha deve ter pelo menos ${MIN_SENHA} caracteres.`
  else if (senha.length > MAX_SENHA) erros.senha = `A senha deve ter no máximo ${MAX_SENHA} caracteres.`

  if (!confirmarSenha) erros.confirmarSenha = 'Confirme sua senha.'
  else if (confirmarSenha !== senha) erros.confirmarSenha = 'As senhas não coincidem.'

  return erros
}
