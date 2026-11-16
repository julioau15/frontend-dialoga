// ============================================================
// profissionaisMemoria
// Última lista de profissionais do paciente carregada da API, guardada na memória do navegador
// e compartilhada pela tela Profissionais e pela tela do profissional (/paciente/profissionais/:id):
// quem clica no cartão abre o perfil com os dados que já estavam na lista.
// Quem preenche a lista é o hook useProfissionaisPaciente (a cada carregamento).
// Ao recarregar a página, a lista começa vazia até a tela Profissionais carregar de novo.
// ============================================================

let profissionais = []

// cópia da lista atual (na ordem da tela)
export function listarProfissionais() {
  return [...profissionais]
}

// troca a lista inteira pela que veio da API (mais os profissionais fora da plataforma)
export function definirProfissionais(lista) {
  profissionais = [...lista]
}

// profissional pelo id da URL (texto ou número); undefined se não existe
export function buscarProfissional(id) {
  return profissionais.find((p) => String(p.id) === String(id))
}
