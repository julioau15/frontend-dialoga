// ============================================================
// utils/validarPerfil.js
// Validações das telas de Perfil. Cada função devolve { campo: 'mensagem' };
// objeto vazio = tudo certo.
// ============================================================
const MIN_SENHA = 6

export function validarPerfilBasico({ nome = '', celular = '', especialidade }) {
  const erros = {}
  if (!nome.trim()) erros.nome = 'Informe o nome.'
  if (celular.replace(/\D/g, '').length < 10) erros.celular = 'Informe um celular válido.'
  // só o profissional tem especialidade (undefined = campo não existe na tela)
  if (especialidade !== undefined && !especialidade.trim()) erros.especialidade = 'Informe a especialidade.'
  return erros
}

// Troca de senha (admin): é opcional, mas se preencher um campo, preenche todos.
export function validarTrocaSenha({ senhaAtual = '', novaSenha = '', confirmarSenha = '' }) {
  const erros = {}
  if (!senhaAtual && !novaSenha && !confirmarSenha) return erros

  if (!senhaAtual) erros.senhaAtual = 'Informe a senha atual.'
  if (novaSenha.length < MIN_SENHA) erros.novaSenha = `A senha deve ter pelo menos ${MIN_SENHA} caracteres.`
  if (!confirmarSenha) erros.confirmarSenha = 'Confirme a nova senha.'
  else if (confirmarSenha !== novaSenha) erros.confirmarSenha = 'As senhas não coincidem.'
  return erros
}
