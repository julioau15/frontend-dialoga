// ============================================================
// utils/notificacoesRecebidas.js
// Converte as notificações da API (tbl_notificacao) para o formato da tela.
//   API  -> { id, titulo_mensagem, lida: 0 | 1, data_criacao, id_categoria }
//   Tela -> { id, categoria, titulo, descricao, data, lida }
// A categoria vem de tbl_categoria ({ id, categoria, tipo_especifico }):
//   categoria       -> chave de CATEGORIAS_NOTIFICACAO (ícone, chip e "Ver →")
//   tipo_especifico -> título do cartão, pelo nome do tipo no catálogo
//                      de preferências (ex.: hora_da_dose -> "Lembrete de dose")
// O texto gravado no back (titulo_mensagem) vira a descrição; sem nome
// no catálogo, ele vira o título.
// ============================================================
import { CATEGORIAS_PACIENTE, CATEGORIAS_PROFISSIONAL } from '../services/notificacoesExemplo'
import { formatarDataHora } from './formatadores'

// Nome da categoria no back -> categoria exibida no cartão
function categoriaDaTela(categoria, perfil) {
  switch (String(categoria ?? '').toLowerCase()) {
    case 'tarefa':
      return 'tarefa'
    case 'agenda':
      return 'agenda'
    case 'medicacao':
    case 'tratamento':
      return 'tratamento'
    case 'paciente':
      return 'paciente'
    // vínculo leva para a lista de quem está do outro lado
    case 'vinculo':
      return perfil === 'paciente' ? 'profissional' : 'paciente'
    default:
      return 'sistema'
  }
}

// A solicitação de acesso aos indicadores só é aprovada em Relatórios (card "Solicitações de acesso").
// Detecta pelo texto da mensagem, sem acento e sem diferenciar maiúsculas.
function ehSolicitacaoAcesso(mensagem) {
  const texto = String(mensagem ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  return texto.includes('solicitacao de acesso')
}

// Índice "categoria|tipo" -> nome do tipo, com o catálogo do próprio perfil por último (tem prioridade)
function indexarNomes(perfil) {
  const catalogos = perfil === 'paciente'
    ? [CATEGORIAS_PROFISSIONAL, CATEGORIAS_PACIENTE]
    : [CATEGORIAS_PACIENTE, CATEGORIAS_PROFISSIONAL]
  const nomes = new Map()
  catalogos.forEach((categorias) => {
    categorias.forEach((categoria) => {
      categoria.tipos.forEach((tipo) => nomes.set(`${categoria.chave}|${tipo.chave}`, tipo.nome))
    })
  })
  return nomes
}

// Converte a lista da API, usando as categorias para chip, ícone e título.
// perfil -> 'paciente' | 'profissional'
export function converterNotificacoes(linhas, categorias, perfil) {
  const categoriasPorId = new Map(categorias.map((categoria) => [Number(categoria.id), categoria]))
  const nomes = indexarNomes(perfil)

  return linhas.map((linha) => {
    const categoria = categoriasPorId.get(Number(linha.id_categoria))
    const nome = categoria && nomes.get(`${categoria.categoria}|${categoria.tipo_especifico}`)
    const mensagem = linha.titulo_mensagem ?? ''

    return {
      id: linha.id,
      categoria: categoriaDaTela(categoria?.categoria, perfil),
      titulo: nome || mensagem,
      descricao: nome ? mensagem : '',
      data: formatarDataHora(linha.data_criacao),
      lida: Number(linha.lida) === 1 || linha.lida === true,
      // destino do "Ver →" quando difere da categoria (paciente: solicitação de acesso -> Relatórios)
      ...(perfil === 'paciente' && ehSolicitacaoAcesso(mensagem) ? { rota: 'relatorios' } : {}),
    }
  })
}