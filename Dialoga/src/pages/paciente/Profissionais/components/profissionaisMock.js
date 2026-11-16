// ============================================================
// profissionaisMock
// Constantes e funções de texto da tela Profissionais do paciente.
// Os profissionais vêm da API (services/profissionaisPacienteService.js); aqui ficam só:
//   PROFISSIONAL_VAZIO  -> formulário vazio do pop-up "Novo profissional"
//   STATUS_PROFISSIONAL -> texto e tom do selo de cada status (Ativo, Pendente, Inativo)
//   mascararCpf, formatarDesde, mesAtual -> formatações usadas nos cartões e no pop-up
// ============================================================

// formulário vazio do pop-up "Novo profissional"
export const PROFISSIONAL_VAZIO = { cpf: '', nome: '', email: '', especialidade: '' }

// status do cartão (tom do componente Selo)
// pendente: o paciente pediu o vínculo e o profissional ainda não confirmou (RN100)
export const STATUS_PROFISSIONAL = {
  ativo: { rotulo: 'Ativo', tom: 'sucesso' },
  pendente: { rotulo: 'Pendente', tom: 'alerta' },
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
