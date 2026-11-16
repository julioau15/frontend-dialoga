// A identidade da pessoa é id; a identidade do acompanhamento é idVinculo.
export const chaveProfissional = (p) => p.naPlataforma ? `vinculo-${p.idVinculo}` : `externo-${p.id}`

export function selecionarProfissional(lista, id, idVinculo) {
  const candidatos = lista.filter((p) => String(p.id) === String(id))
  if (idVinculo != null) {
    return candidatos.find((p) => p.naPlataforma && String(p.idVinculo) === String(idVinculo))
  }
  // URLs antigas continuam válidas e preferem o acompanhamento atual.
  return candidatos.find((p) => p.status !== 'inativo') ?? candidatos[0]
}

const chaveExternos = (idUsuario) => `dialoga:profissionais-externos:${idUsuario}`

export function lerExternos(idUsuario) {
  if (idUsuario == null) throw new Error('Não foi possível identificar o paciente.')
  const lista = JSON.parse(localStorage.getItem(chaveExternos(idUsuario)) ?? '[]')
  if (!Array.isArray(lista)) throw new Error('Não foi possível carregar os profissionais deste navegador.')
  return lista
}

export function salvarExternos(idUsuario, lista) {
  if (idUsuario == null) throw new Error('Não foi possível identificar o paciente.')
  try {
    localStorage.setItem(chaveExternos(idUsuario), JSON.stringify(lista))
  } catch {
    throw new Error('Não foi possível salvar o profissional neste navegador.')
  }
}
