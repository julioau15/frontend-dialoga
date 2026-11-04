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
      voce: true, // marco o administrador logado: ganha a etiqueta "Você" e não tem lixeira
    },
    {
      id: 2,
      nome: 'Bruno Lacerda',
      email: 'bruno.lacerda@dialoga.com.br',
      criadoPor: 'Rafaela Souto',
      criadoEm: '2026-09-02T12:00:00',
      voce: false,
    },
  ]