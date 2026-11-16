// ============================================================
// profissionaisMock
// Dados fixos da tela Profissionais do paciente (sem API por enquanto), iguais ao Figma
// ("Profissionais - Paciente"). Os campos seguem o que o back-end já devolve em
// GET /v1/dialoga/paciente/me/profissionais, para facilitar a integração:
//   nome, especialidade, status ('ativo' | 'inativo'), naPlataforma (true = tem conta no Dialoga),
//   desde ('AAAA-MM', início do acompanhamento), proximaConsulta ('AAAA-MM-DD' ou null)
// PROFISSIONAIS_PLATAFORMA_MOCK: profissionais com conta no Dialoga, achados pelo CPF no
// pop-up "Novo profissional" (frame "Novo profissional - Paciente-1": CPF 123.456.789-10).
// TODO: trocar por GET/POST/DELETE /v1/dialoga/paciente/me/profissionais e pela busca por CPF na integração.
// ============================================================

export const PROFISSIONAIS_MOCK = [
  { id: 1, nome: 'Carlos Eduardo Mendes', especialidade: 'Psicologia Clínica', status: 'ativo', naPlataforma: true, desde: '2025-03', proximaConsulta: '2026-09-10' },
  { id: 2, nome: 'Patrícia Lima', especialidade: 'Psiquiatria', status: 'ativo', naPlataforma: false, desde: '2025-01', proximaConsulta: '2026-10-05' },
  { id: 3, nome: 'Roberto Alves', especialidade: 'Neurologia', status: 'inativo', naPlataforma: false, desde: '2024-06', proximaConsulta: null },
]

// profissionais com conta no Dialoga (CPF só com números).
// especialidades -> as cadastradas por ele (tbl_profissional_especialidade): viram as opções do
// dropdown "Especialidade" quando o CPF é encontrado; a primeira já vem escolhida (como no Figma)
export const PROFISSIONAIS_PLATAFORMA_MOCK = [
  {
    cpf: '12345678910',
    nome: 'Carlos Eduardo Mendes',
    email: 'carlos@gmail.com',
    especialidade: 'Psicologia Clínica',
    especialidades: ['Psicologia Clínica', 'Ansiedade', 'Depressão', 'Autoconhecimento', 'Terapia Familiar'],
  },
]

// formulário vazio do pop-up "Novo profissional"
export const PROFISSIONAL_VAZIO = { cpf: '', nome: '', email: '', especialidade: '' }

// status do cartão (tom do componente Selo)
export const STATUS_PROFISSIONAL = {
  ativo: { rotulo: 'Ativo', tom: 'sucesso' },
  inativo: { rotulo: 'Inativo', tom: 'neutro' },
}

// "12345678910" -> "123.456.789-10" (máscara enquanto digita, só números)
export function mascararCpf(valor) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11)
  return numeros
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

// profissional da plataforma pelo CPF (só procura com os 11 números); undefined se não achar
export function buscarPorCpf(cpf) {
  const numeros = cpf.replace(/\D/g, '')
  if (numeros.length !== 11) return undefined
  return PROFISSIONAIS_PLATAFORMA_MOCK.find((p) => p.cpf === numeros)
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

// '2025-03' -> 'março de 2025' (usado em "Desde março de 2025"); troca o texto, sem criar Date
export function formatarDesde(anoMes = '') {
  const [ano, mes] = String(anoMes).split('-')
  const nomeMes = MESES[Number(mes) - 1]
  return ano && nomeMes ? `${nomeMes} de ${ano}` : ''
}

// mês atual em 'AAAA-MM' (o "Desde" de um profissional recém-adicionado)
export function mesAtual() {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
}
