// ============================================================
// Anotações privadas do profissional sobre cada paciente (mock, sem API).
// Ficam guardadas aqui, na memória do navegador, enquanto a aba estiver aberta:
// uma nota criada na lista de Pacientes também aparece no perfil do paciente.
// Ao recarregar a página, volta tudo aos dados abaixo (os do Figma, da Ana).
// Cada anotação: { id, titulo, conteudo, data ('AAAA-MM-DD') }
// TODO: na integração, trocar por GET/POST /pacientes/:id/anotacoes e PUT/DELETE /anotacoes/:id.
// ============================================================
const ANOTACOES = {
  1: [
    {
      id: 1,
      titulo: 'Primeira sessão',
      conteudo:
        'Paciente relatou episódios de ansiedade há 2 anos, piora após demissão em jan/2025. Iniciamos técnicas de respiração e TCC.',
      data: '2025-03-15',
    },
    {
      id: 2,
      titulo: 'Progresso — 3 meses',
      conteudo:
        'Melhora significativa no controle da ansiedade. Paciente relatou melhora no sono e nas relações interpessoais. Mantendo prática de mindfulness.',
      data: '2025-06-20',
    },
  ],
}

let proximoId = 100 // ids das notas novas (não se repetem com as do mock)

// data de hoje em 'AAAA-MM-DD' (pelo relógio do navegador, sem converter para UTC)
function hoje() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// anotações de um paciente, da mais antiga para a mais nova, como no Figma (devolve uma cópia)
export function listarAnotacoes(idPaciente) {
  return [...(ANOTACOES[idPaciente] ?? [])].sort((a, b) => a.data.localeCompare(b.data) || a.id - b.id)
}

// cria ({ titulo, conteudo }) ou edita ({ id, titulo, conteudo })
export function salvarAnotacao(idPaciente, { id, titulo, conteudo }) {
  const lista = ANOTACOES[idPaciente] ?? (ANOTACOES[idPaciente] = [])
  const existente = id != null ? lista.find((a) => a.id === id) : null
  if (existente) {
    Object.assign(existente, { titulo, conteudo })
  } else {
    lista.push({ id: proximoId++, titulo, conteudo, data: hoje() })
  }
}

// remove a anotação do paciente
export function excluirAnotacao(idPaciente, idAnotacao) {
  ANOTACOES[idPaciente] = (ANOTACOES[idPaciente] ?? []).filter((a) => a.id !== idAnotacao)
}
