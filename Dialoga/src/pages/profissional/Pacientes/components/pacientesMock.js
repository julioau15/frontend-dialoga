// ============================================================
// Dados fixos (mock) da tela Pacientes do profissional.
// PACIENTES_MOCK -> pacientes vinculados ao profissional logado, na ordem e com
//   os dados do Figma ("Pacientes - Profissional"):
//   id              -> número (paciente da plataforma) ou 'ext-N' (cadastro externo)
//   nome, email     -> email é null no cadastro externo (só o nome é informado)
//   origem          -> 'plataforma' (tem conta no Dialoga, mostra o selo "Plataforma")
//                      | 'externo' (cadastrado só pelo nome, sem selo)
//   desde           -> 'AAAA-MM' (mês/ano do início do vínculo)
//   proximaConsulta -> 'AAAA-MM-DD' ou null (sem consulta marcada)
//   status          -> 'ativo' | 'inativo'
// PACIENTES_PLATAFORMA_MOCK -> pacientes com conta no Dialoga, usados na busca do
//   pop-up "Adicionar paciente" (os já vinculados não aparecem no resultado).
//   O Figma não mostra e-mails nem os pacientes ainda não vinculados: esses dados
//   existem só para a busca por nome/e-mail funcionar nesta etapa.
// TODO: trocar pelos dados da API (GET /profissionais/me/pacientes e a busca de
//       pacientes da plataforma) quando houver integração.
// ============================================================
export const PACIENTES_PLATAFORMA_MOCK = [
  { id: 1, nome: 'Ana Beatriz Ferreira', email: 'ana.ferreira@email.com' },
  { id: 2, nome: 'Mariana Costa', email: 'mariana.costa@email.com' },
  { id: 3, nome: 'João Pedro Alves', email: 'joao.alves@email.com' },
  { id: 4, nome: 'Camila Rocha', email: 'camila.rocha@email.com' },
  { id: 5, nome: 'Lucas Martins', email: 'lucas.martins@email.com' },
  { id: 6, nome: 'Beatriz Nogueira', email: 'beatriz.nogueira@email.com' },
]

// pega um paciente da plataforma pelo id (para não repetir nome e e-mail)
const daPlataforma = (id) => PACIENTES_PLATAFORMA_MOCK.find((p) => p.id === id)

// na ordem do Figma
export const PACIENTES_MOCK = [
  { ...daPlataforma(1), origem: 'plataforma', desde: '2025-03', proximaConsulta: '2026-09-10', status: 'ativo' },
  { id: 'ext-1', nome: 'Ricardo Sousa', email: null, origem: 'externo', desde: '2025-07', proximaConsulta: '2026-09-12', status: 'ativo' },
  { ...daPlataforma(2), origem: 'plataforma', desde: '2024-11', proximaConsulta: null, status: 'inativo' },
  { ...daPlataforma(3), origem: 'plataforma', desde: '2026-01', proximaConsulta: '2026-09-18', status: 'ativo' },
  { id: 'ext-2', nome: 'Fernanda Gomes', email: null, origem: 'externo', desde: '2026-04', proximaConsulta: '2026-09-25', status: 'ativo' },
]
