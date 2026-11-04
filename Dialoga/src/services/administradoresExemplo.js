// ============================================================
// services/administradoresExemplo.js
// Dados fixos que eu uso enquanto a tela de Administradores é só layout
// (ainda sem back-end). Mantive os nomes do Figma.
// Coloco T12:00 nas datas para o fuso horário não trocar o dia ao formatar.
// ============================================================
export const ADMINISTRADORES_EXEMPLO = [
    {
      id: 1,
      nome: 'Rafaela Souto',
      email: 'admin@dialoga.com.br',
      criadoPor: 'Sistema',
      criadoEm: '2025-01-01T12:00:00',
      idUsuario: 1, // id de tbl_usuario; o admin@dialoga.com do banco de teste tem id 1, então o selo "Você" aparece para ele
    },
    {
      id: 2,
      nome: 'Bruno Lacerda',
      email: 'bruno.lacerda@dialoga.com.br',
      criadoPor: 'Rafaela Souto',
      criadoEm: '2026-09-02T12:00:00',
      idUsuario: 99,
    },
  ]

// O selo "Você" é calculado no hook, comparando idUsuario com o usuário da sessão.s