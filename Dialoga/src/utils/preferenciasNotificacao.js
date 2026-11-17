// ============================================================
// utils/preferenciasNotificacao.js
// Converte as preferências de notificação entre o formato da tela
// e o formato da API (tbl_preferencia_notificacao).
//   Tela -> { desligarTodas, ativos: { idDoTipo: true | false } }
//   API  -> [{ categoria, tipo_especifico, ativo: 0 | 1 }]
// O "Desligar todas" é gravado como a linha
// { categoria: 'todas', tipo_especifico: null, ativo } (ativo 0 = tudo desligado).
// ============================================================

// Categoria usada para gravar o "Desligar todas"
export const CATEGORIA_TODAS = 'todas'

// Monta a chave de busca "categoria|tipo" de uma linha da API
function chaveLinha(categoria, tipo) {
  return `${categoria}|${tipo ?? ''}`
}

// Monta o estado padrão da tela a partir do catálogo (antes de existir algo salvo)
export function criarEstadoPadrao(categorias) {
  const ativos = {}
  categorias.forEach((categoria) => {
    categoria.tipos.forEach((tipo) => {
      ativos[tipo.id] = tipo.ativo
    })
  })
  return { desligarTodas: false, ativos }
}

// Aplica as linhas salvas na API sobre o estado padrão.
// Prioridade: linha do tipo > linha da categoria (tipo nulo) > padrão do catálogo.
export function aplicarPreferenciasSalvas(categorias, linhas) {
  const estado = criarEstadoPadrao(categorias)
  if (!Array.isArray(linhas) || linhas.length === 0) return estado

  // Índice "categoria|tipo" -> ligado (true) ou desligado (false)
  const salvas = new Map(linhas.map((linha) => [chaveLinha(linha.categoria, linha.tipo_especifico), Number(linha.ativo) === 1]))

  // "Desligar todas": a linha guarda se as notificações estão ligadas
  const todasLigadas = salvas.get(chaveLinha(CATEGORIA_TODAS, null))
  if (todasLigadas !== undefined) estado.desligarTodas = !todasLigadas

  categorias.forEach((categoria) => {
    const daCategoria = salvas.get(chaveLinha(categoria.chave, null))
    categoria.tipos.forEach((tipo) => {
      const doTipo = salvas.get(chaveLinha(categoria.chave, tipo.chave))
      if (doTipo !== undefined) estado.ativos[tipo.id] = doTipo
      else if (daCategoria !== undefined) estado.ativos[tipo.id] = daCategoria
    })
  })

  return estado
}

// Monta a lista enviada no PUT: a linha do "Desligar todas" + uma linha por tipo
export function montarPreferencias(categorias, estado) {
  const preferencias = [{ categoria: CATEGORIA_TODAS, tipo_especifico: null, ativo: estado.desligarTodas ? 0 : 1 }]

  categorias.forEach((categoria) => {
    categoria.tipos.forEach((tipo) => {
      preferencias.push({
        categoria: categoria.chave,
        tipo_especifico: tipo.chave,
        ativo: estado.ativos[tipo.id] ? 1 : 0,
      })
    })
  })

  return preferencias
}
