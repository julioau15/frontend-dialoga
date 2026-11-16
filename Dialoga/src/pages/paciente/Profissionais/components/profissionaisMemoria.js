// ============================================================
// profissionaisMemoria
// Lista de profissionais do paciente guardada na memória do navegador (mock, sem API),
// compartilhada pela tela Profissionais e pela tela do profissional (/paciente/profissionais/:id):
//   - um profissional adicionado na lista abre no perfil;
//   - um profissional excluído aparece no perfil já como Inativo.
// Ao recarregar a página, volta tudo ao PROFISSIONAIS_MOCK.
// TODO: na integração, trocar por GET/POST/DELETE /v1/dialoga/paciente/me/profissionais.
// ============================================================
import { PROFISSIONAIS_MOCK } from './profissionaisMock'

let profissionais = [...PROFISSIONAIS_MOCK]

// cópia da lista atual (na ordem da tela)
export function listarProfissionais() {
  return [...profissionais]
}

// profissional pelo id da URL (texto ou número); undefined se não existe
export function buscarProfissional(id) {
  return profissionais.find((p) => String(p.id) === String(id))
}

// coloca o profissional novo no fim da lista (fim do acompanhamento atual)
export function guardarProfissional(profissional) {
  profissionais = [...profissionais, profissional]
}

// RF327: não apaga; o profissional vai para o fim da lista como "Inativo" e sem próxima consulta
export function inativarProfissional(id) {
  const removido = buscarProfissional(id)
  if (!removido) return
  profissionais = [...profissionais.filter((p) => p.id !== removido.id), { ...removido, status: 'inativo', proximaConsulta: null }]
}
