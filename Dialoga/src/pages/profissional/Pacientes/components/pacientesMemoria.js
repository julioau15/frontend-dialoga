// ============================================================
// pacientesMemoria
// Cópia da lista de pacientes do profissional guardada na memória do navegador.
// Quem preenche é a tela Pacientes (hook usePacientesProfissional), depois de ler a API.
// O perfil do paciente, que ainda não usa a API, lê daqui:
//   - buscarPaciente(id)  -> dados básicos do paciente aberto pelo cartão da lista;
//   - removerPaciente(id) -> tira o paciente da cópia ao removê-lo no perfil.
// Ao recarregar a página a cópia fica vazia até a lista de Pacientes ser aberta de novo.
// TODO: quando o perfil for integrado, ele busca direto na API e este arquivo deixa de existir.
// ============================================================
let pacientes = []

// guarda a lista que veio da API (na ordem da tela)
export function definirPacientes(lista) {
  pacientes = [...lista]
}

// paciente pelo id da URL (texto ou número); undefined se não existe
export function buscarPaciente(id) {
  return pacientes.find((p) => String(p.id) === String(id))
}

// tira o paciente da lista
export function removerPaciente(id) {
  pacientes = pacientes.filter((p) => String(p.id) !== String(id))
}
