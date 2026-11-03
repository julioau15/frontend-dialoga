// ============================================================
// services/aprovacoesExemplo.js
// Dados de exemplo (mesmos nomes do Figma) para as telas funcionarem
// sem o back-end. Têm o MESMO formato que normalizarAprovacao() devolve.
// Usados enquanto USAR_DADOS_DE_EXEMPLO = true em hooks/useAprovacoes.js
// ============================================================
export const SOLICITACOES_EXEMPLO = [
  {
    id: 1, idProfissional: 1, nome: 'Dra. Fernanda Alencar', especialidade: 'Psicologia Clínica', clinica: 'Clínica Mente Sã',
    email: 'fernanda@clinica.com.br', telefone: '(11) 98000-1122', crp: '06/234567', cpf: '23456789011',
    status: 'pendente', enviadoEm: '2026-09-02T12:00:00',
  },
  {
    id: 2, idProfissional: 2, nome: 'Dr. Rodrigo Faria', especialidade: 'Neuropsicologia', clinica: 'Hospital Albert Einstein',
    email: 'rodrigo.faria@einstein.br', telefone: '(11) 97000-2233', crp: '06/345678', cpf: '34567890122',
    status: 'pendente', enviadoEm: '2026-09-01T12:00:00',
  },
  {
    id: 3, idProfissional: 3, nome: 'Dra. Tatiana Mello', especialidade: 'Psiquiatria', clinica: '',
    email: 'tatiana.mello@email.com', telefone: '(11) 96000-3344', crp: '06/456789', cpf: '45678901233',
    status: 'pendente', enviadoEm: '2026-08-30T12:00:00',
  },
  {
    id: 4, idProfissional: 4, nome: 'Dr. Lucas Brandão', especialidade: 'Terapia Cognitivo-Comportamental', clinica: 'Consultório Particular',
    email: 'lucas.brandao@email.com', telefone: '(11) 95000-4455', crp: '06/567890', cpf: '56789012344',
    status: 'aprovado', enviadoEm: '2026-08-29T12:00:00',
  },
  {
    id: 5, idProfissional: 5, nome: 'Dra. Carla Nunes', especialidade: 'Psicologia Infantil', clinica: '',
    email: 'carla.nunes@email.com', telefone: '(11) 94000-5566', crp: '06/678901', cpf: '67890123455',
    status: 'recusado', enviadoEm: '2026-08-28T12:00:00',
  },
]
