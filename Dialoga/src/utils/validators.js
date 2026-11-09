// ============================================================
// utils/validators.js
// Funções de validação dos formulários (antes de chamar a API).
// ============================================================

// Formato básico de e-mail: texto@texto.texto
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Limites iguais aos do back-end (controller_auth.js)
const MAX_EMAIL = 150
const MIN_EMAIL_CADASTRO = 10 // RN31
const MAX_SENHA = 30 // mesmo limite do back (login e cadastro)
const MIN_SENHA_LOGIN = 6
const TEM_ESPACO = /\s/

// Recebe { email, senha } e devolve um objeto com as mensagens de erro
// de cada campo. Objeto vazio = tudo certo.
// Ex.: { email: 'E-mail inválido.' }
export function validarLogin({ email, senha }) {
  const erros = {}

  if (!email.trim()) erros.email = 'Informe seu e-mail.'
  else if (!REGEX_EMAIL.test(email.trim()) || email.length > MAX_EMAIL) erros.email = 'E-mail inválido.'

  if (!senha.trim()) erros.senha = 'Informe sua senha.'
  else if (TEM_ESPACO.test(senha)) erros.senha = 'A senha não pode conter espaços.'
  else if (senha.length < MIN_SENHA_LOGIN) erros.senha = `A senha deve ter pelo menos ${MIN_SENHA_LOGIN} caracteres.`
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

  if (/\d/.test(nome)) erros.nome = 'O nome não pode conter números.'
  else if (nome.trim().split(/\s+/).filter(Boolean).length < 2 || nome.length > MAX_NOME)
    erros.nome = 'Informe seu nome completo.'

  if (!email.trim()) erros.email = 'Informe seu e-mail.'
  else if (!REGEX_EMAIL.test(email.trim()) || email.length > MAX_EMAIL) erros.email = 'E-mail inválido.'
  else if (email.trim().length < MIN_EMAIL_CADASTRO) erros.email = `O e-mail deve ter pelo menos ${MIN_EMAIL_CADASTRO} caracteres.`

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

  if (TEM_ESPACO.test(senha)) erros.senha = 'A senha não pode conter espaços.'
  else if (senha.length < MIN_SENHA) erros.senha = `A senha deve ter pelo menos ${MIN_SENHA} caracteres.`
  else if (senha.length > MAX_SENHA) erros.senha = `A senha deve ter no máximo ${MAX_SENHA} caracteres.`

  if (!confirmarSenha) erros.confirmarSenha = 'Confirme sua senha.'
  else if (confirmarSenha !== senha) erros.confirmarSenha = 'As senhas não coincidem.'

  return erros
}

// ============================================================
// ---------- Personalizar experiência (primeiro acesso) ----------
// Limites tirados do banco (tbl_paciente e tbl_registro_humor) e do
// controller_registro_humor.js do back-end.
// ============================================================
export const LIMITES_PERSONALIZACAO = {
  APELIDO: 80, // tbl_paciente.apelido VARCHAR(80)
  RELATO: 1000, // tbl_registro_humor.relato é TEXT (sem limite no back); 1000 é um limite combinado no front
  HORAS_SONO_MAX: 24, // horas_sono DECIMAL(4,2): o banco aceita até 99.99, mas um dia tem 24h
  IDADE_MAXIMA: 120, // evita anos digitados errado (ex.: 1026)
}

// Máscara de data: "01022000" -> "01/02/2000"
export function mascararData(valor) {
  const n = soNumeros(valor).slice(0, 8)
  if (n.length <= 2) return n
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`
}

// "dd/mm/aaaa" -> "aaaa-mm-dd" (formato DATE que a API espera).
// Devolve null se o texto não for uma data que existe no calendário
// (ex.: 31/02/2000 ou 15/13/2000).
export function dataBRparaISO(texto) {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto ?? '')
  if (!partes) return null

  const [, dia, mes, ano] = partes.map(Number)

  // O Date "corrige" datas impossíveis (31/02 vira 03/03). Se depois de criar
  // a data o dia, o mês ou o ano mudaram, é porque a data não existe.
  const data = new Date(ano, mes - 1, dia)
  const existe = data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia
  if (!existe) return null

  return `${partes[3]}-${partes[2]}-${partes[1]}`
}

// Etapa 1: apelido e data de nascimento (os dois são opcionais).
// Devolve { campo: 'mensagem' }; objeto vazio = tudo certo.
export function validarDadosPessoais({ apelido, dataNascimento }) {
  const erros = {}

  if (apelido.trim().length > LIMITES_PERSONALIZACAO.APELIDO)
    erros.apelido = `Use no máximo ${LIMITES_PERSONALIZACAO.APELIDO} caracteres.`

  // Vazio é permitido (campo opcional); só valida se algo foi digitado
  if (dataNascimento.trim() !== '') {
    const iso = dataBRparaISO(dataNascimento)

    if (dataNascimento.length < 10) {
      erros.dataNascimento = 'Informe a data completa (dd/mm/aaaa).'
    } else if (!iso) {
      erros.dataNascimento = 'Data inválida.'
    } else {
      // Compara só texto "aaaa-mm-dd" (evita problemas de fuso horário)
      const hoje = new Date()
      const hojeISO = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
      const anoMinimo = hoje.getFullYear() - LIMITES_PERSONALIZACAO.IDADE_MAXIMA

      if (iso > hojeISO) erros.dataNascimento = 'A data de nascimento não pode estar no futuro.'
      else if (Number(iso.slice(0, 4)) < anoMinimo) erros.dataNascimento = 'Confira o ano de nascimento.'
    }
  }

  return erros
}

// Máscara do campo "horas de sono": só números e um separador decimal,
// até 2 dígitos antes e 2 depois. Vírgula vira ponto ("7,5" -> "7.5").
export function mascararHorasSono(valor) {
  const texto = String(valor).replace(',', '.').replace(/[^\d.]/g, '')
  const [inteiro = '', ...resto] = texto.split('.')

  // Sem ponto: só a parte inteira (máx. 2 dígitos)
  if (resto.length === 0) return inteiro.slice(0, 2)

  // Com ponto: junta o que veio depois (ignora pontos extras) e corta em 2 casas
  return `${inteiro.slice(0, 2)}.${resto.join('').slice(0, 2)}`
}

// Etapa 3: registro de humor. Campos obrigatórios iguais aos do back
// (sentimento, energia, humor, padrao_pensamentos, horas_sono); relato é opcional.
export function validarHumor({ sentimento, energia, humorDia, horasSono, pensamento, relato }) {
  const erros = {}

  if (!sentimento) erros.sentimento = 'Escolha como você está se sentindo.'
  if (!energia) erros.energia = 'Escolha seu nível de energia.'
  if (!humorDia) erros.humorDia = 'Escolha como está seu humor.'
  if (!pensamento) erros.pensamento = 'Escolha o tipo de pensamento do dia.'

  const horas = horasSono.trim()
  if (horas === '') {
    erros.horasSono = 'Informe quantas horas você dormiu.'
  } else if (!/^\d{1,2}(\.\d{1,2})?$/.test(horas)) {
    erros.horasSono = 'Use apenas números, com até 2 casas decimais (ex: 7.5).'
  } else if (Number(horas) > LIMITES_PERSONALIZACAO.HORAS_SONO_MAX) {
    erros.horasSono = `Informe um valor entre 0 e ${LIMITES_PERSONALIZACAO.HORAS_SONO_MAX} horas.`
  }

  if (relato.length > LIMITES_PERSONALIZACAO.RELATO)
    erros.relato = `Use no máximo ${LIMITES_PERSONALIZACAO.RELATO} caracteres.`

  return erros
}


// ---------- Administradores ----------
// Limites do pop-up "Novo administrador".
// Nome e e-mail seguem os mesmos limites do cadastro e do back-end.
// A senha provisória segue o Figma (mínimo 4). O cadastro usa 6:
// esse valor está nos pontos a alinhar com o back-end.
export const LIMITES_ADMINISTRADOR = {
  NOME: MAX_NOME,
  EMAIL: MAX_EMAIL,
  SENHA_MIN: 4,
  SENHA_MAX: MAX_SENHA,
}

// Valido o pop-up "Novo administrador".
// emailsExistentes: e-mails que já estão na lista, para eu não deixar repetir.
// Devolvo { campo: 'mensagem' }; objeto vazio = tudo certo.
export function validarNovoAdministrador({ nome, email, senha }, emailsExistentes = []) {
  const erros = {}
  const nomeLimpo = nome.trim()
  const emailLimpo = email.trim().toLowerCase()

  // Mesma regra do cadastro: preciso de pelo menos nome e sobrenome
  if (!nomeLimpo) erros.nome = 'Informe o nome completo.'
  else if (nomeLimpo.split(/\s+/).length < 2) erros.nome = 'Informe nome e sobrenome.'
  else if (nomeLimpo.length > LIMITES_ADMINISTRADOR.NOME)
    erros.nome = `Use no máximo ${LIMITES_ADMINISTRADOR.NOME} caracteres.`

  if (!emailLimpo) erros.email = 'Informe o e-mail.'
  else if (!REGEX_EMAIL.test(emailLimpo) || emailLimpo.length > LIMITES_ADMINISTRADOR.EMAIL)
    erros.email = 'E-mail inválido.'
  else if (emailsExistentes.some((e) => e.trim().toLowerCase() === emailLimpo))
    erros.email = 'Já existe um administrador com este e-mail.'

  if (!senha) erros.senha = 'Informe a senha provisória.'
  else if (senha.length < LIMITES_ADMINISTRADOR.SENHA_MIN)
    erros.senha = `A senha deve ter pelo menos ${LIMITES_ADMINISTRADOR.SENHA_MIN} caracteres.`
  else if (senha.length > LIMITES_ADMINISTRADOR.SENHA_MAX)
    erros.senha = `A senha deve ter no máximo ${LIMITES_ADMINISTRADOR.SENHA_MAX} caracteres.`

  return erros
}