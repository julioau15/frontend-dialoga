// ============================================================
// pacientesMemoria
// Lista de pacientes do profissional guardada na memória do navegador
// (mock, sem API), compartilhada pela lista de Pacientes e pelo perfil:
//   - um paciente adicionado na lista abre no perfil;
//   - um paciente removido no perfil sai da lista.
// Ao recarregar a página, volta tudo ao PACIENTES_MOCK.
// TODO: na integração, trocar por GET /profissionais/me/pacientes,
//       POST e DELETE /profissionais/me/pacientes/:id.
// ============================================================
import { PACIENTES_MOCK } from './pacientesMock'

let pacientes = [...PACIENTES_MOCK]

// cópia da lista atual (na ordem da tela)
export function listarPacientes() {
  return [...pacientes]
}

// paciente pelo id da URL (texto ou número); undefined se não existe
export function buscarPaciente(id) {
  return pacientes.find((p) => String(p.id) === String(id))
}

// coloca o paciente novo no topo da lista
export function guardarPaciente(paciente) {
  pacientes = [paciente, ...pacientes]
}

// tira o paciente da lista
export function removerPaciente(id) {
  pacientes = pacientes.filter((p) => String(p.id) !== String(id))
}
