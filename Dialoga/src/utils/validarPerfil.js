// ============================================================
// utils/validarPerfil.js
// Validações das telas de Perfil. Cada função devolve { campo: 'mensagem' };
// objeto vazio = tudo certo.
// ============================================================
const MIN_SENHA = 6
const MAX_SENHA = 30 // mesmo limite do back

export function validarPerfilBasico({ nome = '', celular = '', especialidades }) {
  const erros = {}
  if (!nome.trim()) erros.nome = 'Informe o nome.'
  if (celular.replace(/\D/g, '').length < 10) erros.celular = 'Informe um celular válido.'
  if (nome.length > 150) erros.nome = 'O nome deve ter no máximo 150 caracteres.'
  // só o profissional tem especialidades (undefined = campo não existe na tela)
  if (especialidades !== undefined && especialidades.length === 0) erros.especialidades = 'Selecione ao menos uma especialidade.'
  return erros
}

// Troca de senha (admin): é opcional, mas se preencher um campo, preenche todos.
export function validarTrocaSenha({ senhaAtual = '', novaSenha = '', confirmarSenha = '' }) {
  const erros = {}
  if (!senhaAtual && !novaSenha && !confirmarSenha) return erros

  if (!senhaAtual) erros.senhaAtual = 'Informe a senha atual.'
  if (novaSenha.length < MIN_SENHA || novaSenha.length > MAX_SENHA) {
    erros.novaSenha = `A senha deve ter de ${MIN_SENHA} a ${MAX_SENHA} caracteres.`
  }
  if (!confirmarSenha) erros.confirmarSenha = 'Confirme a nova senha.'
  else if (confirmarSenha !== novaSenha) erros.confirmarSenha = 'As senhas não coincidem.'
  return erros
}
